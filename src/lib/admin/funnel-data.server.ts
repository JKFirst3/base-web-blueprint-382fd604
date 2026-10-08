import type { SupabaseClient } from "@supabase/supabase-js";
import { PREORDER_SOURCES } from "@/lib/campaign";
import { calculateCpql, type SourceSummary } from "./funnel-attribution.server.ts";
import { generateAudits } from "./funnel-audit.server.ts";
import { readMetaInsights, readPostHogEvents, readPostHogExperiments, reportingPeriod } from "./funnel-connectors.server.ts";

export function safePeriod(value:unknown):7|30|90 {
  return value==="7"||value===7?7:value==="90"||value===90?90:30;
}
export async function getFunnelDashboard(days:7|30|90){
  const meta=await readMetaInsights(days);
  const period=meta.period??reportingPeriod(days);
  const posthogPromise=readPostHogEvents(days,fetch,period);
  const experimentsPromise=readPostHogExperiments();
  const database:{
    status:"ok"|"error"; leads:number|null; interviews:number|null;
    preorders:number|null;doiConfirmed:number|null; qualified:number|null;
    bySource:Array<{source:string;count:number}>;sourceStats:SourceSummary[];
    recent:Array<{id:string;date:string;product:string;source:string;doi:string;qualified:boolean}>;
  }={status:"error",leads:null,interviews:null,preorders:null,doiConfirmed:null,qualified:null,bySource:[],sourceStats:[],recent:[]};
  try{
    const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
    const db=supabaseAdmin as unknown as SupabaseClient;
    const count=async (table:string,column?:string,value?:string)=>{
      let q=db.from(table).select("*",{count:"exact",head:true}).gte("created_at",period.from).lt("created_at",period.to);
      if(column&&value!==undefined)q=q.eq(column,value);
      const result=await q;
      if(result.error)throw Error("count failed");
      return result.count??0;
    };
    const [leads,interviews,statsResult]=await Promise.all([
      count("leads"),count("leads","request_type","interview"),
      db.rpc("admin_funnel_source_stats",{from_ts:period.from,to_ts:period.to}),
    ]);
    if(statsResult.error||!Array.isArray(statsResult.data))throw Error("missing aggregate RPC");
    const sourceStats:SourceSummary[]=statsResult.data.map((x:Record<string,unknown>)=>({
      source:String(x.source),product:String(x.product),
      requests:Number(x.requests),confirmed:Number(x.confirmed),qualified:Number(x.qualified),
    })).filter(x=>[x.requests,x.confirmed,x.qualified].every(v=>Number.isFinite(v)&&v>=0));
    if(sourceStats.length!==statsResult.data.length)throw Error("invalid aggregate RPC data");
    const {data:recent,error:recError}=await db.from("preorders")
      .select("id,created_at,solution_id,source,doi_status")
      .gte("created_at",period.from).lt("created_at",period.to)
      .order("created_at",{ascending:false}).limit(50);
    if(recError)throw Error("recent query failed");
    const ids=(recent??[]).map((x:Record<string,unknown>)=>String(x.id));
    let qualifiedIds=new Set<string>();
    if(ids.length){
      const {data:quals,error:qualError}=await db.from("lead_qualifications").select("preorder_id")
        .eq("qualified",true).in("preorder_id",ids);
      if(qualError)throw Error("qualification lookup failed");
      qualifiedIds=new Set((quals??[]).map((x:Record<string,unknown>)=>String(x.preorder_id)));
    }
    database.status="ok";
    database.leads=leads;
    database.interviews=interviews;
    database.sourceStats=sourceStats;
    database.preorders=sourceStats.reduce((a,x)=>a+x.requests,0);
    database.doiConfirmed=sourceStats.reduce((a,x)=>a+x.confirmed,0);
    database.qualified=sourceStats.reduce((a,x)=>a+x.qualified,0);
    database.bySource=PREORDER_SOURCES.map(source=>({
      source,count:sourceStats.filter(x=>x.source===source).reduce((a,x)=>a+x.requests,0),
    }));
    database.recent=(recent??[]).map((x:Record<string,unknown>)=>({
      id:String(x.id),date:String(x.created_at),product:String(x.solution_id),
      source:String(x.source),doi:String(x.doi_status??"pending"),qualified:qualifiedIds.has(String(x.id)),
    }));
  }catch{
    // Suppress operational/internal errors in user-facing API; visible status=error.
  }
  const [posthog,experiments]=await Promise.all([posthogPromise,experimentsPromise]);
  const calculation=meta.metrics&&database.status==="ok"
    ?calculateCpql(meta.ads,database.sourceStats,meta.metrics.currency,true)
    :{value:null,spend:0,qualified:0,coveredSpend:0,coverage:0,
      reason:"Meta oder Supabase noch nicht erfolgreich verbunden."};
  const audits=generateAudits(meta.ads,posthog,database.status==="ok");
  return {
    days,generatedAt:new Date().toISOString(),period,meta,posthog,experiments,database,
    cpql:calculation.value,cpqlReason:calculation.reason,
    attribution:calculation,audits,
    notes:[
      "Meta-, PostHog- und Supabase-Zeitfenster nutzen die Account-Kalendertage; heute ist noch unvollständig.",
      "PostHog-Ereignisse sind consent-basiert; Besucher, Sessions und Events haben unterschiedliche Nenner.",
      "Supabase-Qualifizierung wird auf die Anfrage-Kohorte nach created_at bezogen, nicht auf den Qualifizierungszeitpunkt.",
      "Newsletter-Einträge request_type=termin sind keine qualifizierten Kaufinteressenten.",
      "Ein CPQL wird nur bei eindeutiger vollständiger Meta-Zuordnung in EUR und qualifizierten Leads ausgewiesen.",
    ],
  };
}
export async function setPreorderQualification(id:string,qualified:boolean){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return false;
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
  const db=supabaseAdmin as unknown as SupabaseClient;
  const {data:existing,error:lookupError}=await db.from("preorders").select("id").eq("id",id).maybeSingle();
  if(lookupError||!existing)return false;
  const {error}=await db.from("lead_qualifications").upsert({
    preorder_id:id,qualified,qualified_at:qualified?new Date().toISOString():null,
    updated_at:new Date().toISOString(),
  },{onConflict:"preorder_id"});
  return !error;
}

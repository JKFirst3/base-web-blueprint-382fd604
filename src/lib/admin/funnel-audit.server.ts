import type { CreativeAudit } from "./funnel-attribution.server.ts";
import type { PostHogStage, DataStatus } from "./funnel-connectors.server.ts";

export type AuditFinding = {
  id:string; severity:"high"|"medium"|"info";
  title:string; evidence:string; recommendation:string; adId:string|null; source:string|null;
};
const safeNumber=(n:number)=>n.toLocaleString("de-DE",{maximumFractionDigits:2});
export function generateAudits(ads:CreativeAudit[],posthog: {status:DataStatus;breakdown:PostHogStage[]},hasDb:boolean):AuditFinding[]{
  const out:AuditFinding[]=[];
  const active=ads.filter(a=>a.spend>0);
  const unmatched=active.filter(x=>x.mapping!=="matched");
  if(unmatched.length){
    const sum=unmatched.reduce((a,x)=>a+x.spend,0);
    out.push({id:"missing-attribution",severity:"high",title:"Meta-Ausgaben ohne eindeutige Kampagnenzuordnung",
      evidence:`${unmatched.length} Ads mit ${safeNumber(sum)} Werbekosten ohne gültigen lv_campaign in einer auslesbaren LAVIDRO-Ziel-URL.`,
      recommendation:"Meta Ads Manager: Ziel-URLs/URL-Parameter prüfen; bestehende smoke_google_*-Werte unverändert weiterverwenden.",adId:null,source:null});
  }
  for(const a of unmatched.slice(0,30)){
    out.push({id:`ad-${a.id}`,severity:"medium",title:`Zuordnung fehlt: ${a.name||a.id}`,
      evidence:`Ad-ID ${a.id}; ${safeNumber(a.spend)} ausgegeben; Creative-Zuordnung: ${a.mapping}.`,
      recommendation:"Creative-Link, URL-Parameter und dynamische Ziel-URLs im Ads Manager kontrollieren.",adId:a.id,source:null});
  }
  for(const a of active.filter(x=>x.mapping==="matched")){
    if(a.product && a.landingUrl && !a.landingUrl.includes("/Konfigurator") && a.landingUrl.endsWith("/")){
      out.push({id:`page-${a.id}`,severity:"info",title:`Produkt-Ad führt zur allgemeinen Startseite: ${a.name||a.id}`,
      evidence:`Ad-ID ${a.id}; Ziel ${a.landingUrl}.`,
      recommendation:"Prüfen, ob die Ad wie geplant zur zugehörigen Produktlandingpage führt; nicht automatisch umleiten.",adId:a.id,source:a.source});
    }
  }
  if(posthog.status==="ok"){
    const total=posthog.breakdown.filter(x=>x.event==="landing_page_viewed").reduce((a,x)=>a+x.events,0);
    if(total===0)out.push({id:"posthog-no-landing",severity:"medium",title:"Keine consent-gemessenen Landingpage-Events",
      evidence:"PostHog liefert für den ausgewählten Zeitraum keine production landing_page_viewed-Ereignisse.",
      recommendation:"Consent, PostHog-Transport und Event-Namen in einem Staging- und Live-Smoke-Test verifizieren.",adId:null,source:null});
  }
  if(!hasDb)out.push({id:"db-not-ready",severity:"high",title:"Supabase-Kohortenstatistik nicht verfügbar",
    evidence:"Datenbankstatus ist nicht erfolgreich. Migrations- oder Berechtigungsproblem möglich.",
    recommendation:"SQL-Migrationen, Service-Role und RPC admin_funnel_source_stats kontrollieren.",adId:null,source:null});
  if(!out.length)out.push({id:"manual-ux",severity:"info",title:"Automatischer Datencheck ohne Auffälligkeit",
    evidence:"Keine der deterministischen Regeln hat einen Fehler gefunden. Das ist kein UX- oder Conversion-Nachweis.",
    recommendation:"Mobile Browser-Journey, Ad-Copy/Produktseite und qualitative Nutzerperspektive weiterhin prüfen.",adId:null,source:null});
  return out;
}

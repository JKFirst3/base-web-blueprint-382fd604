// Real Chromium mobile/desktop audit. Read-only: never submits public forms or fires real conversions.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base=process.env.FUNNEL_BROWSER_URL || "http://127.0.0.1:8080";
const folder="funnel-browser-artifacts";
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const failures=[];
const checks=[];
async function run(label,fn) {
  try {await fn();checks.push({name:label,status:"pass"});}
  catch(e){const msg=e instanceof Error?e.message:String(e);failures.push({name:label,message:msg});checks.push({name:label,status:"fail",message:msg});}
}
async function capture(name,url,device) {
  const context=await browser.newContext({viewport:device==="mobile"?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:1,isMobile:device==="mobile",hasTouch:device==="mobile"});
  const page=await context.newPage();
  const runtime=[];
  page.on("pageerror",e=>runtime.push(String(e.message).slice(0,240)));
  const res=await page.goto(base+url,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(res?.status(),200,url+" must return 200");
  await page.waitForTimeout(1300);
  const info=await page.evaluate(()=>{
    const images=[...document.images];
    const broken=images.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.getAttribute("src"));
    const scrollWidth=document.documentElement.scrollWidth, viewport=document.documentElement.clientWidth;
    return {title:document.title,broken,scrollWidth,viewport,h1:document.querySelectorAll("h1").length,links:document.querySelectorAll("a[href]").length,forms:document.querySelectorAll("form").length};
  });
  await page.screenshot({path:`${folder}/${name}-${device}.png`,fullPage:false});
  assert.ok(info.title.length>0,"Page must have a title");
  assert.deepEqual(info.broken,[],"Broken loaded images");
  assert.ok(info.scrollWidth<=info.viewport+4,`Horizontal overflow ${info.scrollWidth} > ${info.viewport}`);
  assert.equal(runtime.length,0,"Browser JavaScript uncaught errors: "+runtime.join("|"));
  checks.push({name:url+" "+device,status:"pass",...info});
  return {page,context};
}
try {
  for(const device of ["mobile","desktop"]){
    for(const product of ["mobile","cabinet","one"]){
      await run(`product ${product} ${device}`,async()=>{
        const {context}=await capture(`product-${product}`,`/Konfigurator?product=${product}`,device);
        await context.close();
      });
    }
    await run("homepage "+device,async()=>{
      const {page,context}=await capture("homepage","/",device);
      const footer=page.locator('a.footer-brand[href="/admin/funnel"]');
      assert.ok(await footer.count(),"footer should lead to admin");
      await footer.click({timeout:8000});
      await page.waitForURL(/\/admin\/funnel/);
      assert.ok((await page.locator('input[type="password"]').count())>0,"Admin form should be visible");
      await page.screenshot({path:`${folder}/admin-login-${device}.png`,fullPage:false});
      await context.close();
    });
  }
}finally {await browser.close();}
await writeFile(`${folder}/results.json`,JSON.stringify({checkedAt:new Date().toISOString(),checks,failures},null,2));
const report=["# Funnel Browser QA","",`Checked pages: ${checks.length}. Failures: ${failures.length}`,"",...checks.map(c=>`- ${c.status.toUpperCase()}: ${c.name}`),...failures.map(f=>`- ${f.name}: ${f.message}`)].join("\n");
await writeFile(`${folder}/report.md`,report);
console.log(`Browser QA: ${checks.length} passed/checks, ${failures.length} failures`);
if(failures.length)process.exitCode=1;

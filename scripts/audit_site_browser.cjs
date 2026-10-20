"use strict";
/**
 * Auditoría del sitio REAL generado (dist/site) desde Chromium.
 * Prueba diseño, controles, errores JS/HTTP y accesibilidad básica de la portada.
 * También intenta abrir GitHub Pages publicado y registra su resultado,
 * sin confundir una URL pública inaccesible con la versión local compilada.
 */
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const {chromium}=require("playwright");
const ROOT=path.resolve(__dirname,".."),SITE=path.join(ROOT,"dist/site"),OUT=path.join(ROOT,"dist/site-audit");
fs.mkdirSync(OUT,{recursive:true});
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".json":"application/json",".webmanifest":"application/manifest+json"};
const server=http.createServer((req,res)=>{
 const parsed=new URL(req.url,"http://localhost/");
 let name;
 try{name=decodeURIComponent(parsed.pathname);}catch{res.writeHead(400).end();return;}
 if(name==="/")name="/index.html";
 const file=path.resolve(SITE,"."+name);
 if(!file.startsWith(SITE+path.sep)){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const stat=fs.statSync(file);
 res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Content-Length":stat.size,"Cache-Control":"no-cache"});
 fs.createReadStream(file).pipe(res);
});
const PUBLIC="https://kankwj5-eng.github.io/Nagua-City/";
async function launch(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const report={site:"Nagua City",chromium:null,local:[],published:null};
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
 report.chromium=await browser.version();
 let failed=false;
 try{
  for(const [width,height] of [[390,844],[844,390],[1280,720]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:width<900,hasTouch:width<900});
   const errors=[],httpFailures=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("requestfailed",r=>httpFailures.push(r.url()+": "+(r.failure()?.errorText||"unknown")));
   page.on("response",r=>{if(r.url().startsWith("http://127.0.0.1:")&&r.status()>=400)httpFailures.push(r.status()+" "+r.url());});
   const entry={viewport:width+"x"+height};
   try{
    const response=await page.goto("http://127.0.0.1:"+server.address().port+"/",{waitUntil:"load",timeout:30000});
    entry.status=response.status();
    entry.title=await page.title();
    entry.imageLoaded=await page.locator(".art-frame img").evaluate(img=>img.complete&&img.naturalWidth>0);
    entry.overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth-innerWidth,body:document.body.scrollWidth-innerWidth}));
    entry.artBounds=await page.locator(".art-frame").evaluate(el=>{const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom)};});
    entry.playHref=await page.locator("#play").getAttribute("href");
    assert.equal(entry.status,200);
    assert(entry.imageLoaded,"No carga el arte original de Managua");
    assert.equal(entry.playHref,"./Managua.html");
    assert(entry.overflow.document<=2,"La portada se desborda horizontalmente");
    if(width===844)assert(entry.artBounds.top>=0&&entry.artBounds.bottom<=height,"La ilustración queda fuera de la pantalla horizontal");
    await page.locator("#guide-trigger").click();
    assert(await page.locator("#guide").isVisible(),"La guía no se abre");
    await page.locator("#guide-tab-conducir").click();
    assert.equal(await page.locator("#guide-tab-conducir").getAttribute("aria-selected"),"true");
    assert.match(await page.locator("#guide-description").innerText(),/vehículo|automóviles/);
    await page.locator("#guide-tab-ajustes").click();
    assert.match(await page.locator("#guide-description").innerText(),/Ajustes/);
    await page.locator("#guide-trigger").click();
    assert(await page.locator("#guide").isHidden(),"La guía no se cierra");
    await page.locator("#install").click();
    entry.installDialog=await page.locator("#instructions").isVisible();
    assert(entry.installDialog,"El botón instalar no explica instalación alternativa");
    await page.locator("#close-instructions").click();
    assert(await page.locator("#instructions").isHidden());
    await page.screenshot({path:path.join(OUT,"local-"+width+"x"+height+".png"),fullPage:true});
    entry.errors=errors;
    entry.httpFailures=httpFailures;
    assert.deepEqual(errors,[],"Error JavaScript en portada");
    assert.deepEqual(httpFailures,[],"Fallo de petición en portada");
    entry.passed=true;
   }catch(e){
    failed=true;entry.passed=false;entry.failure=String(e?.stack||e);
    entry.errors=errors;entry.httpFailures=httpFailures;
    await page.screenshot({path:path.join(OUT,"local-error-"+width+"x"+height+".png"),fullPage:true}).catch(()=>{});
   }
   report.local.push(entry);
   console.log("AUDIT_LOCAL "+JSON.stringify(entry));
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const browserErrors=[],networkErrors=[];
  page.on("pageerror",e=>browserErrors.push(e.message));
  page.on("requestfailed",r=>networkErrors.push(r.url()+": "+(r.failure()?.errorText||"unknown")));
  const published={url:PUBLIC};
  try{
   const response=await page.goto(PUBLIC,{waitUntil:"domcontentloaded",timeout:30000});
   published.httpStatus=response?.status()||null;
   published.title=await page.title();
   published.playHref=await page.locator("#play").getAttribute("href").catch(()=>null);
   published.artLoaded=await page.locator(".art-frame img").evaluate(img=>img.complete&&img.naturalWidth>0).catch(()=>false);
   published.consoleErrors=browserErrors;
   published.requestFailures=networkErrors;
   published.reachable=!!response&&response.ok()&&!!published.playHref;
   await page.screenshot({path:path.join(OUT,"github-pages-390x844.png"),fullPage:true});
  }catch(e){
   published.reachable=false;published.error=String(e?.message||e);
   published.consoleErrors=browserErrors;published.requestFailures=networkErrors;
  }
  report.published=published;
  console.log("AUDIT_PUBLISHED "+JSON.stringify(published));
  await page.close();
 }finally{
  fs.writeFileSync(path.join(OUT,"report.json"),JSON.stringify(report,null,2));
  await browser.close();await new Promise(resolve=>server.close(resolve));
 }
 if(failed)process.exitCode=1;
}
launch().catch(e=>{console.error(e);server.close();process.exitCode=1;});

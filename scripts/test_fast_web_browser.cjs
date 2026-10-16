"use strict";
// End-to-end check of the actual split PWA, served over HTTP instead of file://.
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const {chromium}=require("playwright");
const site=path.resolve(__dirname,"../dist/site");
const mime={".html":"text/html; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gz":"application/gzip",".txt":"text/plain; charset=utf-8",".css":"text/css",".js":"text/javascript"};
let requests=0,bytesServed=0,assetRequests=0;
const server=http.createServer((req,res)=>{
 if(req.method!=="GET"){res.writeHead(405).end();return;}
 const url=new URL(req.url,"http://127.0.0.1/");
 const file=path.resolve(site,"."+decodeURIComponent(url.pathname));
 if(file!==site&&!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
 let stat;try{stat=fs.statSync(file);}catch{res.writeHead(404).end();return;}
 if(!stat.isFile()){res.writeHead(404).end();return;}
 requests++;bytesServed+=stat.size;if(url.pathname.startsWith("/assets/stream/"))assetRequests++;
 res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Content-Length":stat.size,"Cache-Control":url.pathname.startsWith("/assets/stream/")?"public,max-age=31536000,immutable":"no-cache"});
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const port=server.address().port,errors=[],failures=[];
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
 try{
  const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  page.on("pageerror",err=>errors.push(String(err)));
  page.on("requestfailed",req=>failures.push(req.url()+": "+req.failure()?.errorText));
  const t=Date.now();
  await page.goto("http://127.0.0.1:"+port+"/Managua.html",{waitUntil:"domcontentloaded",timeout:180000});
  await page.waitForFunction(()=>window.Nicaragua?.ready||document.getElementById("status")?.classList.contains("error"),null,{timeout:210000,polling:200});
  const status=await page.locator("#status").innerText();
  assert(await page.evaluate(()=>window.Nicaragua?.ready),"Boot error: "+status);
  await page.waitForFunction(()=>Nicaragua.playing,null,{timeout:10000});
  const first=await page.evaluate(()=>({startup:Nicaragua.startup48,boot:Nicaragua.boot45,playing:Nicaragua.playing,zones:Nicaragua.zones.size}));
  assert(first.playing,"Game did not auto-enter");
  assert(first.startup.remoteRequests>0,"Expected remote downloads for split resources");
  assert(first.startup.zoneReadsAtEntry<=4,"Too many world zones loaded at entry");
  assert(assetRequests>0,"No on-demand assets requested");
  assert.deepEqual(errors,[],"Unexpected JavaScript errors");
  assert.deepEqual(failures,[],"Network failures");
  const report={navigationToPlayableMs:Date.now()-t,htmlBytes:fs.statSync(path.join(site,"Managua.html")).size,assetRequests,requests,bytesServed,firstPlayableMs:first.startup.firstPlayableMs,bootStages:first.boot.stages,remoteRequests:first.startup.remoteRequests,remoteBytes:first.startup.remoteBytes,zonesAtEntry:first.startup.zonesAtEntry,errors,failures,passed:true};
  fs.writeFileSync(path.join(__dirname,"../dist/fast-web-browser.json"),JSON.stringify(report,null,2));
  console.log("FAST_WEB_BROWSER_OK "+JSON.stringify({...report,bootStages:undefined}));
  await page.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());

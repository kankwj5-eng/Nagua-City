// Attach only to the explicitly forwarded Chrome debug port on a user's test device.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.NAGUA_CDP||'http://127.0.0.1:9222');
 try{
  const matches=[];for(const context of browser.contexts())for(const page of context.pages())if(await page.evaluate(()=>!!window.Nicaragua?.ready).catch(()=>false))matches.push(page);
  assert.equal(matches.length,1,'Debe haber exactamente una pestaña del juego lista.');const page=matches[0];
  const info=await page.evaluate(()=>({userAgent:navigator.userAgent,url:location.href}));assert(/Android/.test(info.userAgent),'La pestaña debe ser Chrome para Android.');
  assert(await page.evaluate(()=>!!Nicaragua.diagnostics09),'Construí la versión con diagnóstico 09.');
  const out=path.resolve('dist/android');fs.mkdirSync(out,{recursive:true});const cdp=await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  await page.evaluate(()=>Nicaragua.diagnostics09.start(15));console.log('Jugá normalmente durante 15 segundos.');
  await new Promise(r=>setTimeout(r,15500));const {profile}=await cdp.send('Profiler.stop');
  const report=await page.evaluate(()=>Nicaragua.diagnostics09.stop('remote-capture'));fs.writeFileSync(path.join(out,'cpu.cpuprofile'),JSON.stringify(profile));fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({info,report},null,2));console.log('Informes guardados en dist/android.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const results={};
  for(const [label,file] of [['baseline','Managua-baseline.html'],['progressive','Managua.html']]){
   const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));const start=Date.now();
   await page.goto('file://'+path.join(root,'dist',file),{timeout:240000,waitUntil:'load'});
   await page.waitForFunction(()=>window.Nicaragua?.ready||window.Nicaragua?.boot45.failed||document.getElementById('status')?.classList.contains('error'),null,{timeout:240000,polling:100});assert(await page.evaluate(()=>window.Nicaragua?.ready),'boot '+label+': '+await page.locator('#status').innerText());
   if(label==='progressive'){
    await page.waitForFunction(()=>Nicaragua.playing&&document.getElementById('home').hidden,null,{timeout:15000});
    const navigationToPlayableMs=Date.now()-start;const first=await page.evaluate(()=>({startup:Nicaragua.startup48,boot:Nicaragua.boot45,playing:Nicaragua.playing,homeHidden:document.getElementById('home').hidden,quality:document.getElementById('quality').value,adaptive:document.getElementById('adaptive35').value}));
    assert(first.playing&&first.homeHidden);assert(first.startup.zonesAtEntry<=4);assert(first.startup.catalogBytes<100000);assert.equal(first.quality,'medium');assert.equal(first.adaptive,'auto');
    await page.waitForFunction(()=>Nicaragua.zones.size>4,null,{timeout:60000});
    await page.evaluate(()=>document.getElementById('pause').click());assert(await page.locator('#settings').isVisible());await page.locator('#resume').click();assert(await page.evaluate(()=>Nicaragua.playing));
    await page.evaluate(()=>document.getElementById('pause').click());await page.locator('#backHome').click();assert(await page.locator('#home').isVisible());await page.locator('#start').click();assert(await page.evaluate(()=>Nicaragua.playing));
    await page.screenshot({path:path.join(root,'dist/startup-playing.png')});results[label]={navigationToPlayableMs,first,...await page.evaluate(()=>({startup:Nicaragua.startup48,zones:Nicaragua.zones.size})),errors};
   }else{const navigationToReadyMs=Date.now()-start;await page.evaluate(()=>document.getElementById('start').click());await page.waitForFunction(()=>Nicaragua.playing);results[label]={navigationToReadyMs,navigationToPlayableMs:Date.now()-start,...await page.evaluate(()=>({boot:Nicaragua.boot45,zones:Nicaragua.zones.size})),errors};}
   assert.deepEqual(errors,[]);await page.close();
  }
  fs.writeFileSync(path.join(root,'dist/startup-browser.json'),JSON.stringify(results,null,2));console.log('STARTUP_RESULT '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

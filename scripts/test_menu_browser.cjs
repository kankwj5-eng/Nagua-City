const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright'),script=require('../tests/html-script.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const full=path.join(root,'dist/Managua.html'),fixture=path.join(root,'dist/menu-layout.html'),pres=await script(full,'presentation46');new Function(pres);
 const fd=fs.openSync(full,'r'),prefix=Buffer.alloc(65000);const size=fs.readSync(fd,prefix,0,prefix.length,0);fs.closeSync(fd);const head=prefix.subarray(0,size).toString(),end=head.indexOf('<script id="appSource"');assert(end>0);
 fs.writeFileSync(fixture,head.slice(0,end)+'<script>'+pres+'</script><script>Presentation46.readyLayout();</script></body></html>');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:640,height:360}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+fixture);await page.locator('#menu-art47 img').evaluate(img=>img.decode());
  assert(await page.locator('#garageOpen').isDisabled());assert(await page.locator('#homeSettings').isDisabled());
  await page.evaluate(()=>{const statusEl=document.getElementById('status');statusEl.textContent='Preparando vehículos…';document.querySelector('#loadbar span').style.width='58%';});
  await page.waitForFunction(()=>document.getElementById('percent47').textContent==='58%');await page.screenshot({path:path.join(root,'dist/menu-loading.png')});
  await page.evaluate(()=>document.querySelector('#loadbar span').style.width='50%');await page.waitForFunction(()=>document.querySelector('#loadbar span').style.width==='58%');
  await page.evaluate(()=>{document.getElementById('status').textContent='Todo listo. Entrá a la ciudad.';document.getElementById('start').disabled=false;});await page.waitForFunction(()=>!document.getElementById('homeSettings').disabled);
  await page.waitForFunction(()=>{const track=document.getElementById('loadbar'),style=getComputedStyle(track),inner=track.getBoundingClientRect().width-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth);return Math.abs(document.querySelector('#loadbar span').getBoundingClientRect().width-inner)<.5;});
  await page.setViewportSize({width:1536,height:867});await page.mouse.move(1535,0);
  const referenceShot=await page.screenshot({path:path.join(root,'dist/menu-reference-1536x867.png')});
  const pixelMatch=await page.evaluate(async b64=>{
   const image=document.querySelector('#menu-art47 img'),canvas=document.createElement('canvas');canvas.width=1536;canvas.height=867;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const expected=ctx.getImageData(0,0,1536,867).data;
   const shot=new Image();shot.src='data:image/png;base64,'+b64;await shot.decode();ctx.clearRect(0,0,1536,867);ctx.drawImage(shot,0,0);const actual=ctx.getImageData(0,0,1536,867).data;let maxDelta=0,totalDelta=0,changedPixels=0;
   for(let i=0;i<expected.length;i+=4){let changed=false;for(let c=0;c<3;c++){const d=Math.abs(actual[i+c]-expected[i+c]);maxDelta=Math.max(maxDelta,d);totalDelta+=d;changed||=d>0;}if(changed)changedPixels++;}
   return {width:1536,height:867,maxDelta,meanDelta:totalDelta/(1536*867*3),changedPixels};
  },referenceShot.toString('base64'));console.log('REFERENCE_PIXELS '+JSON.stringify(pixelMatch));assert(pixelMatch.maxDelta<=1,'reference pixels match within one 8-bit level of browser JPEG/canvas rounding');
  const layouts=[];
  async function check(label,selector){
   const data=await page.evaluate(selector=>{const outer=document.querySelector(selector),b=outer.getBoundingClientRect();const controls=[...outer.querySelectorAll('button,input,select')].filter(el=>el.getClientRects().length&&!el.hidden);return {width:innerWidth,height:innerHeight,outer:{x:b.x,y:b.y,right:b.right,bottom:b.bottom},controls:controls.map(el=>{const r=el.getBoundingClientRect();return {id:el.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}),titleSource:'uploaded reference image'};},selector);
   assert(data.outer.x>=-1&&data.outer.y>=-1&&data.outer.right<=data.width+1&&data.outer.bottom<=data.height+1,label+' outer bounds');
   for(const c of data.controls)assert(c.x>=-1&&c.right<=data.width+1,label+' horizontal control '+c.id);
   layouts.push({label,...data});await page.screenshot({path:path.join(root,'dist/menu-'+label+'.png')});
  }
  for(const [w,h] of [[640,360],[844,390],[1280,720],[390,844],[320,568]]){await page.setViewportSize({width:w,height:h});await check('home-'+w+'x'+h,'#home');const boxes=await page.locator('.menu-actions47 button').evaluateAll(list=>list.map(b=>{const r=b.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));for(const b of boxes)assert(b.top>=0&&b.bottom<h,'menu action visible');}
  await page.setViewportSize({width:640,height:360});
  await page.evaluate(()=>{document.getElementById('settings').hidden=false;});await page.waitForFunction(()=>document.querySelector('[data-panel="optionsPanel"]').getAttribute('aria-selected')==='true');await check('settings-640x360','#settings .sheet');
  await page.locator('[data-panel="controlsPanel"]').click();assert(await page.locator('#controlsPanel').isVisible());assert(await page.locator('#optionsPanel').isHidden());
  await page.locator('[data-panel="controlsPanel"]').press('ArrowLeft');assert(await page.locator('#optionsPanel').isVisible());
  await page.setViewportSize({width:390,height:844});await check('settings-390x844','#settings .sheet');
  await page.setViewportSize({width:320,height:568});await check('settings-320x568','#settings .sheet');
  assert.deepEqual(errors,[]);
  // Full packaged game: actual startup, controls and settings handlers.
  await page.setViewportSize({width:640,height:360});await page.goto('file://'+full,{timeout:240000,waitUntil:'load'});await page.waitForFunction(()=>window.Nicaragua?.ready||window.Nicaragua?.boot45.failed,null,{timeout:240000,polling:1000});assert(await page.evaluate(()=>Nicaragua.ready));await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  assert(await page.locator('#homeSettings').isEnabled());assert(await page.locator('#start').isEnabled());await page.locator('#homeSettings').click();assert(await page.locator('#settings').isVisible());assert(await page.locator('#optionsPanel').isVisible());assert.equal(await page.locator('#resume').innerText(),'Volver al inicio');await page.locator('#resume').click();assert(await page.locator('#settings').isHidden());
  await page.locator('#garageOpen').click();assert(await page.locator('.garagecard').isVisible());await page.locator('#garageSearch').fill('Pulsar');assert.equal(await page.locator('#modelchoices button:visible').count(),1);await page.locator('#garageClose').click();
  await page.locator('#start').click();assert(await page.evaluate(()=>Nicaragua.playing));assert(await page.locator('#home').isHidden());await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  await page.evaluate(()=>document.getElementById('pause').click());assert(await page.locator('#settings').isVisible());assert.equal(await page.locator('#resume').innerText(),'Continuar');await page.locator('#resume').click();assert(await page.evaluate(()=>Nicaragua.playing));
  assert.deepEqual(errors,[]);const report={passed:true,browser:await browser.version(),layouts,pixelMatch,monotonicProgress:true,disabledUntilReady:true,keyboardTabs:true,fullGame:{ready:true,homeSettings:true,garageSearch:true,entry:true,pauseAndResume:true,errors},artBytes:354211,referenceSHA256:"55100b6c97eca0ef8830583735dd301ab2758957537ad8c633ea15e77b5c9854",scope:'Layout and functional browser checks; not Android frame-rate measurement'};
  fs.writeFileSync(path.join(root,'dist/menu-browser.json'),JSON.stringify(report,null,2));console.log('MENU_RESULT '+JSON.stringify(report));
 }finally{await browser.close();fs.unlinkSync(fixture);}
})().catch(e=>{console.error(e);process.exitCode=1});

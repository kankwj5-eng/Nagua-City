// Full HTML integration, Chromium software renderer. No physical-device FPS claim.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const source=path.join(root,'dist/Managua.html'),output=path.join(root,'dist/handling-test.html'),data=fs.readFileSync(source),open=Buffer.from('<script id="appSource" type="text/plain">'),a=data.indexOf(open)+open.length,b=data.indexOf('</script>',a);
 assert(a>=open.length&&b>a);let app=data.subarray(a,b).toString();const marker='engine.runRenderLoop(()=>{';assert.equal(app.split(marker).length,2);app=app.replace(marker,fs.readFileSync(path.join(__dirname,'profiling/handling-hook.js'),'utf8')+'\n'+marker);
 const fd=fs.openSync(output,'w');for(const p of [data.subarray(0,a),Buffer.from(app),data.subarray(b)])fs.writeSync(fd,p);fs.closeSync(fd);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:640,height:360}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR '+e.message);});
  await page.goto('file://'+output,{timeout:240000,waitUntil:'load'});await page.waitForFunction(()=>window.Nicaragua?.ready||window.Nicaragua?.boot45.failed,null,{timeout:240000,polling:1000});
  assert(await page.evaluate(()=>Nicaragua.ready),JSON.stringify(await page.evaluate(()=>Nicaragua.boot45)));console.log('Driving test: full game ready');
  await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  // Si el arranque progresivo ya abrió el juego, no pulsar el botón oculto.
  if(!await page.evaluate(()=>Nicaragua.playing)) await page.locator('#start').click({force:true});
  await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  const traffic=await page.evaluate(()=>__handling13.trafficProbe());assert(traffic.before.length>0);assert(Math.abs(traffic.elapsed-.25)<1e-8,'traffic advances full elapsed time');assert(traffic.after.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)));assert(traffic.after.some((p,i)=>Math.hypot(p.x-traffic.before[i].x,p.z-traffic.before[i].z)>0),'some traffic moves');
  const cases=[];
  for(const name of ['sedan','pulsar','caponera','bus']){
   await page.evaluate(name=>__handling13.prepare(name),name);
   const initial=await page.evaluate(()=>__handling13.snapshot());assert(initial.driving);assert(initial.playing);
   const accelerate=await page.evaluate(()=>{__handling13.input(1,0,false);__handling13.simulate(150);__handling13.frame();return __handling13.snapshot();});
   assert(accelerate.state.speed>2,name+' acceleration');assert(accelerate.state.z<initial.state.z-2);assert(accelerate.spin<0);assert.equal(accelerate.contacts,initial.contacts,name+' straight road clear');
   const steer=await page.evaluate(()=>{__handling13.input(.25,.18,false);__handling13.simulate(24);__handling13.frame();return __handling13.snapshot();});assert(steer.state.heading<0,name+' right turn');
   if(name==='sedan')assert(Math.abs(steer.parts.wheel_front_R[1])>Math.abs(steer.parts.wheel_front_L[1]));
   if(name==='pulsar'){assert(steer.rotation[2]<0,'bike leans inward');assert(steer.parts.steering[1]<0);}
   if(name==='sedan'||name==='pulsar')await page.screenshot({path:path.join(root,'dist/handling-'+name+'.png')});
   const brake=await page.evaluate(()=>{__handling13.input(0,0,true);__handling13.simulate(240);__handling13.frame();return __handling13.snapshot();});assert.equal(brake.state.speed,0,name+' stop');assert.equal(brake.contacts,initial.contacts,name+' maneuver clear');
   const paused=await page.evaluate(()=>{__handling13.pause(true);const before={...Nicaragua.state};__handling13.frame(1/30);const after={...Nicaragua.state};__handling13.pause(false);return {before,after};});assert.deepEqual(paused.after,paused.before,name+' pause freezes state');
   const reverse=await page.evaluate(()=>{__handling13.input(-1,0,false);__handling13.simulate(120);__handling13.frame();return __handling13.snapshot();});assert(reverse.state.speed<0,name+' reverse');if(name==='pulsar')assert(reverse.state.speed>=-1.2);
   cases.push({name,initial,accelerate,steer,brake,reverse,pauseFrozen:true});console.log('Driving case passed: '+name);
  }
  await page.evaluate(()=>__handling13.prepare('sedan'));
  const wall=await page.evaluate(()=>__handling13.wallProbe());assert(wall.contacts>0,'actual map collision');assert.equal(wall.penetrating,false);assert(wall.condition<100);assert(Math.abs(wall.speed)<12);assert(wall.z>wall.start.wall[3]);
  assert.deepEqual(errors,[]);const result={passed:true,environment:{browser:await browser.version(),renderer:'Chromium SwiftShader, 640x360',physicalAndroid:false},scope:'Full packaged city, player entry, straight acceleration, right turn, braking, pause and reverse; controlled road with other fleet moved away',cases,traffic,wall,errors};
  fs.writeFileSync(path.join(root,'dist/vehicle-handling-browser.json'),JSON.stringify(result,null,2));console.log('DRIVE_RESULT '+JSON.stringify(result));
 }finally{await browser.close();fs.unlinkSync(output);}
})().catch(e=>{console.error(e);process.exitCode=1;});

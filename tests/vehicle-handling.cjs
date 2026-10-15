const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib'),script=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const close=(a,b,t=1e-8)=>assert(Math.abs(a-b)<=t,`${a} != ${b}`);
(async()=>{
 const app=await script(path.join(root,'dist/Managua.html'),'appSource'),original=await script(path.join(root,'Managua_Del_taller_al_lago(1).html'),'appSource');
 const prefix=original.slice(0,original.indexOf("'use strict';"));
 const {Physics40,FixedStepClock,Driving:legacy}=new Function(prefix+';return {Physics40,FixedStepClock,Driving};')();
 const Driving=new Function('Physics40',read('physics/driving-model.js')+';return Driving;')(Physics40);
 const contact=new Function(read('physics/vehicle-contact.js')+';return VehicleContact13;')();
 const profiles=JSON.parse(original.match(/const VEHICLE_PROFILES=(.*);\n/)[1]);Object.assign(profiles,JSON.parse(original.match(/Object.assign\(VEHICLE_PROFILES,(.*)\);/)[1]));
 const assets=JSON.parse(zlib.gunzipSync(Buffer.from(await script(path.join(root,'Managua_Del_taller_al_lago(1).html'),'asset-vehicles'),'base64')));
 const vehicles=Object.keys(profiles).map(name=>{const extra=assets.variants?.[name],meta={...(assets.models[name]||assets.models[extra.base]).meta,...extra?.meta};return {name,profile:profiles[name],meta,...meta,bike:['pulsar','boxer','discover','trail','delivery','yamaha','taypan','urban125','enduro','bicycle'].includes(name),bicycle:name==='bicycle',bus:['bus','truck'].includes(name),maxSpeed:profiles[name].maxSpeed};});
 function state(speed=0){return {x:0,z:0,heading:0,speed,steer:0,lean:0,throttle:0};}
 function run(v,input,seconds,s=state(),model=Driving){for(let i=0;i<Math.round(seconds*60);i++)model.advance(s,typeof input==='function'?input(i/60):input,v,1/60);return s;}
 const maneuvers=[];
 for(const v of vehicles){
  const s=run(v,{throttle:1},8);assert(s.speed>1&&s.speed<=v.maxSpeed,v.name+' accelerates');assert(s.z<0);close(s.x,0);
  const top=s.speed;run(v,{brake:1},10,s);close(s.speed,0);assert(s.z<0);
  const reverse=run(v,{throttle:-1},15);assert(reverse.speed<0&&reverse.speed>=-(v.bike?1.2:v.bus?3:4.5));if(v.bike)assert(reverse.rpm<=1250);
  const swapped=run(v,{throttle:-1},15,state(10));assert(swapped.speed<0,'direction change '+v.name);
  const l=run(v,{throttle:.4,steer:-.6},5,state(8)),r=run(v,{throttle:.4,steer:.6},5,state(8));close(l.x,-r.x);close(l.z,r.z);close(l.heading,-r.heading);assert(r.heading<0&&r.lean>0);
  const corner=run(v,{throttle:.3,steer:.75},2,state(12));let maxYawDrop=0;
  for(let i=0;i<120;i++){const old=Math.abs(corner.yawRate);Driving.advance(corner,{brake:1,steer:.75},v,1/60);if(old>.05&&corner.speed>2)maxYawDrop=Math.max(maxYawDrop,1-Math.abs(corner.yawRate)/old);const lateral=Math.abs(corner.speed*corner.yawRate),combined=Math.hypot(lateral,corner.acceleration);assert(combined<=corner.gripAcceleration13+1e-7,'grip budget '+v.name);}
  assert(maxYawDrop<.12,'gradual yaw under braking '+v.name+' '+maxYawDrop);
  for(const s2 of [s,reverse,swapped,l,r,corner])for(const [k,n] of Object.entries(s2))assert(Number.isFinite(n),v.name+' '+k);
  maneuvers.push({name:v.name,speedAfter8sMps:top,reverseMps:reverse.speed,maxBrakingYawDrop:maxYawDrop});
 }
 // Real render rates drive the same fixed simulation steps and final state.
 const sedan=vehicles.find(v=>v.name==='sedan'),bike=vehicles.find(v=>v.name==='pulsar'),replays=[];
 for(const fps of [10,15,30,60,90,120]){const s=state(),clock=new FixedStepClock();let time=0,ticks=0;for(let frame=0;frame<fps*12;frame++)clock.advance(1/fps,dt=>{Driving.advance(s,time<6?{throttle:.8,steer:Math.sin(time)*.3}:{brake:1,steer:.2},sedan,dt);time+=dt;ticks++;});assert.equal(ticks,720);replays.push({fps,state:s,ticks});}for(const r of replays)assert.deepEqual(r.state,replays[0].state);
 // Reproduce the old brake snap with the same state and compare the new response.
 const turning=run(sedan,{throttle:.3,steer:.8},2,state(12)),old=structuredClone(turning),improved=structuredClone(turning);
 legacy.advance(old,{brake:1,steer:.8},sedan,1/60);Driving.advance(improved,{brake:1,steer:.8},sedan,1/60);
 const beforeAfter={beforeYaw:turning.yawRate,legacyYawAfterBrake:old.yawRate,newYawAfterBrake:improved.yawRate};assert(Math.abs(improved.yawRate)>Math.abs(old.yawRate));
 // OBB contacts: corner ignored by the legacy three-circle approximation,
 // separation response, rotated clearance, containment and circle normals.
 const body={x:0,z:0,heading:0,halfWidth:.9,halfLength:2.3},cornerWall={x:.87,z:-2.26,heading:0,halfWidth:.08,halfLength:.08};assert(contact.box(body,cornerWall));
 for(const z of [-1.35,0,1.35])assert(Math.hypot(.87,cornerWall.z-z)>.82+Math.hypot(.08,.08));
 let contacts=0;for(let i=0;i<200;i++){const angle=i*.17,a={...body,x:Math.sin(i)*.5,z:Math.cos(i)*.5,heading:angle},b={x:.5,z:.2,heading:-angle*.3,halfWidth:.4,halfLength:.8},hit=contact.box(a,b);if(hit){contacts++;close(Math.hypot(hit.nx,hit.nz),1);assert(!contact.box({...a,x:a.x+hit.nx*(hit.depth+1e-8),z:a.z+hit.nz*(hit.depth+1e-8)},b));}}
 assert(contacts>150);assert(!contact.box({...body,x:10,heading:1},body));
 for(const angle of [0,.4,Math.PI/2]){const a={...body,heading:angle},b={x:.1,z:.1,radius:.2},hit=contact.circle(a,b);assert(hit);assert(!contact.circle({...a,x:a.x+hit.nx*(hit.depth+1e-8),z:a.z+hit.nz*(hit.depth+1e-8)},b));}
 const wall={x:0,z:-5,heading:0,halfWidth:20,halfLength:.025};let sweep={x:0,z:0,vx:0,vz:-48};for(let i=0;i<60;i++){sweep=Physics40.sweep(sweep.x,sweep.z,sweep.vx,sweep.vz,1/60,(x,z)=>contact.box({...body,x,z},wall));assert(!contact.box({...body,x:sweep.x,z:sweep.z},wall));assert(sweep.z>-5);}
 const impact=Physics40.impact(10,-20,0,1);close(impact.vx,10);assert(Math.hypot(impact.vx,impact.vz)<Math.hypot(10,20));
 // Integration of the new full footprint query with a grid cell crossed by a long body.
 const grid=new Map([['0,-1',[[.82,-5,.98,-4.8]]]]),v={width:1.8,length:10,wheelbase:7};
 const worldContact=new Function('state','VehicleContact13','colliderGrid','city24','fleet','current','inWorld',read('physics/world-vehicle-contact.js')+';return vehicleContact40;')({heading:0},contact,grid,{},[],v,()=>true);assert(worldContact(0,0,v,.82));
 // Real Babylon transforms check rotation interpolation and exact physics restore.
 const m={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(path.join(root,'Managua_Del_taller_al_lago(1).html'),'asset-babylon'),'base64')).toString())(m,m.exports);const B=m.exports,engine=new B.NullEngine(),scene=new B.Scene(engine);
 const pres=new Function('B',read('physics/vehicle-presentation.js')+';return {wheelAngles13,applyPlayerWheels13,beginVehiclePoses13,endVehiclePoses13,restoreVehiclePoses13,presentVehiclePoses13};')(B);
 function fixture(spec){const root=new B.TransformNode(spec.name,scene),parts={};for(const k of ['body',...(spec.bike?['steering','wheel_front','wheel_rear']:['wheel_front_L','wheel_front_R','wheel_rear_L','wheel_rear_R'])]){parts[k]=new B.TransformNode(k,scene);parts[k].parent=root;}return {...spec,root,parts,spin:0,traffic:true,contact:{}};}
 const car=fixture(sedan),moto=fixture(bike),fleet=[car,moto];
 pres.beginVehiclePoses13(fleet,car);pres.applyPlayerWheels13(car,{speed:10,steer:.3},1/60);pres.applyPlayerWheels13(moto,{speed:8,steer:.3},1/60);car.root.position.z=-.16;moto.root.position.z=-.13;car.parts.body.rotation.z=.02;pres.endVehiclePoses13(fleet,car);
 const spin=car.spin;assert(spin<0);assert(Math.abs(car.parts.wheel_front_R.rotation.y)>Math.abs(car.parts.wheel_front_L.rotation.y));const left=pres.wheelAngles13(car,-.3);assert(left.left>left.right&&left.right>0);
 const trueWheel=car.parts.wheel_front_L.rotation.x;pres.presentVehiclePoses13(fleet,car,.5,()=>{});close(car.parts.wheel_front_L.rotation.x,trueWheel*.5);close(car.parts.body.rotation.z,.01);close(car.root.position.z,-.16);close(moto.root.position.z,-.065);
 pres.restoreVehiclePoses13(fleet,car);close(car.parts.wheel_front_L.rotation.x,trueWheel);close(moto.root.position.z,-.13);close(car.spin,spin);
 pres.beginVehiclePoses13(fleet,car);moto.root.position.x=100;pres.endVehiclePoses13(fleet,car);pres.presentVehiclePoses13(fleet,car,.1,()=>{});close(moto.root.position.x,100);engine.dispose();
 assert(app.includes('body.rotation.z=v.bodyRest40.z+state.lean'));assert(app.includes('stepFleet13((playing||homeMode)?step:0)'));assert(app.includes("wrap('trafficSimulation',stepFleet13)"));assert(!app.includes('v.spin+='));new (Object.getPrototypeOf(async function(){}).constructor)(app);
 const report={passed:true,vehicles:maneuvers.length,maneuvers,replayFrameRates:replays.map(r=>r.fps),identicalStateAt720Steps:true,brakingComparison:beforeAfter,contactSeparations:contacts,sweepSpeedMps:48,realBabylonPresentation:true,scope:'Numerical and transform regressions; not human handling assessment or Android FPS'};
 fs.writeFileSync(path.join(root,'dist/vehicle-handling.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;});

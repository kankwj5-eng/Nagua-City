"use strict";
// Pruebas sin WebGL de orientación, anclaje de conductores y reciclaje V4.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const ROOT=path.resolve(__dirname,"..");
const source=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const vec=(x=0,y=0,z=0)=>({x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c;}});
const node=(x=0,z=0)=>({position:vec(x,0,z),rotation:vec(),enabled:true,
  setEnabled(v){this.enabled=v;},isEnabled(){return this.enabled;}});
{
 // El GLB no contiene clip sentado: nunca usar el Crouch de combate.
 const ctx={};
 vm.createContext(ctx);
 vm.runInContext(source("game/src/vehicles/0295-human-ride.js"),ctx);
 const profiles=vm.runInContext("rideProfilesV4",ctx);
 for(const id of ["pulsar","taypan","mototaxi-roja","canonera-abierta"]){
  const p=profiles[id];
  assert(p&&p.seat.length===3&&p.hand.length===3&&p.foot.length===3);
  assert(p.seat[1]>.7&&p.seat[1]<1.1,"Seat height V4 derived from actual GLB");
 }
 assert(profiles.pulsar.seat[2]>.3,"Pulsar seat behind fuel tank");
 assert(profiles["canonera-abierta"].seat[2]>.7,"Open caponera driver's seat is toward rear");
 assert(!/setClip\([^)]*['"]Crouch/.test(source("game/src/vehicles/0295-human-ride.js")),"Do not bend knees with combat crouch");
 assert.equal(ctx.humanRide(null,null),false);
}
{
 const classes=["hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
 const fleet=Array.from({length:18},(_,i)=>({name:classes[i%6],id:i,
   streamV4:true,streamV4NeedsPlace:true,root:node(1800+i,1800),width:1.5,length:2.2,
   traffic:false,route:null}));
 const ctx={fleet,player:{root:node(-37,111)},current:null,driving:false,
   traffic23:{cars:[]},inWorld:(x,z)=>Math.abs(x)<530&&Math.abs(z)<530,
   blocked:()=>false,roadSurface50:()=>0,updateTrafficSignals23(){},
   pedestrians:[],originalV4:{animateWheels(){}},clamp:(x,a,b)=>Math.max(a,Math.min(b,x))};
 vm.createContext(ctx);vm.runInContext(source("game/src/vehicles/0369-step-fleet13.js"),ctx);
 ctx.streamTrafficV4(1.1);
 const active=fleet.filter(v=>v.traffic);
 assert(active.length>=6,"Deben circular varias clases reales cerca del jugador");
 assert(new Set(active.map(v=>v.name)).size>=3,"No todas las calles pueden poblarse del mismo modelo");
 for(const car of active){
  const d=Math.hypot(car.root.position.x+37,car.root.position.z-111);
  assert(d>=56&&d<=130,"Tráfico debe estar cerca pero sin teletransporte delante del héroe: "+d);
 }
 const initial=active.map(v=>({v,x:v.root.position.x,z:v.root.position.z}));
 ctx.player.root.position.set(37,0,-110);
 ctx.streamTrafficV4(1.1);
 assert(fleet.some(v=>v.traffic&&Math.hypot(v.root.position.x-37,v.root.position.z+110)<130),"Reciclaje de tráfico no siguió al héroe");
 assert.equal(fleet.length,18,"No generar modelos GLB nuevos en cada barrio");
}
{
 const pedestrians=Array.from({length:24},(_,i)=>({
  index:i+1,root:node(1700+i*2,1700),contact:{setEnabled(){}},
  path:{x:0,z:0,min:-20,max:20},direction:1,brain25:{lane:0,goal:0},speed:0
 }));
 const ctx={pedestrians,player:{root:node(-37,111)},current:null,driving:false,
   inWorld:(x,z)=>Math.abs(x)<530&&Math.abs(z)<530,groundAt:()=>0,blocked:()=>false,
   quality:"high",gameplayTime:5};
 vm.createContext(ctx);vm.runInContext(source("game/src/characters/0126-update-people25.js"),ctx);
 ctx.streamPeopleV4(1.2);
 const active=pedestrians.filter(p=>p.lifeV4Active);
 assert(active.length>=7,"Debe haber peatones locales visibles");
 assert(active.every(p=>Math.hypot(p.root.position.x+37,p.root.position.z-111)<130));
 assert(pedestrians.slice(18).every(p=>!p.root.isEnabled()),"Limitar NPC de escena lejanos");
 ctx.player.root.position.set(37,0,-110);
 ctx.streamPeopleV4(1.2);
 assert(pedestrians.some(p=>p.lifeV4Active&&Math.hypot(p.root.position.x-37,p.root.position.z+110)<125));
}
const human=source("game/src/vehicles/0286a-original-v4-runtime.js");
assert(human.includes("visual.rotation.y=Math.PI"),"Rigs V4 deben mirar en la dirección de marcha");
const drive=source("game/src/vehicles/0347-change-drive.js");
assert(drive.includes("current.bike||current.caponera"),"Conductor de caponera debe mostrarse");
const boot=source("game/src/core/0464-trystatement.js");
assert(boot.includes("installPeople();installRiders26();"),"El juego debe crear motoristas");
console.log("V4_CITY_LIFE_OK",JSON.stringify({vehicleModels:6,trafficPool:18,pedestrianPool:18,bikeAndCaponeraRiders:true}));

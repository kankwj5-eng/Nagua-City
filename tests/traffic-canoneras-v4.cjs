"use strict";
const assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs");
const text=fs.readFileSync("game/v4/traffic-canoneras.js","utf8");
const carIds=["hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
class Node{
 constructor(name){this.name=name;this.position={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}};this.rotation={y:0};}
 getChildMeshes(){return [];}isEnabled(){return true;}
}
const cars=carIds.map((id,i)=>{
 const wheels=i<2?["Delantera_Der","Delantera_Izq","Trasera_Der","Trasera_Izq"]:i<4?["Rueda_Delantera","Rueda_Trasera"]:i===4?["Rueda_Delantera","Rueda_Trasera_Der","Rueda_Trasera_Izq"]:["Rueda_Frontal_Der","Rueda_Frontal_Izq","Rueda_Trasera"];
 const names=["Direccion_Derecha","Direccion_Izquierda",...wheels.map(w=>"Rodar_"+w)];
 const container={rootNodes:[{parent:new Node("original")}],instantiateModelsToScene(rename){
  return {rootNodes:[{parent:null}],animationGroups:names.map(name=>({
   name:rename(name),from:0,to:30,start(){return this;},pause(){},stop(){},goToFrame(f){this.frame=f;}
  }))};
 }};
 return {id,container,info:{type:i<2?"camioneta":i<4?"moto":"caponera",radius:.3,wheels},width:i<2?2:1.3,wheelbase:2,max:25};
});
const state={cars,traffic:[],scene:{},driving:null,
 player:{root:{position:{x:999,z:999},isEnabled(){return true;}}},
 people:[],officialCity:{findSpace(x,z){return [x,z]},blocked(){return false},groundAt(){return 0}}};
const B=()=>({TransformNode:Node});
const anim=(car,name,phase)=>{const g=car.groups.get(name);assert(g,car.id+" missing "+name);g.frame=phase;g._prepared=true;};
const ctx={state,B,anim,console,Math,Number,Map,Set};
vm.createContext(ctx);
vm.runInContext(text+";this.api={initTrafficV4,updateTrafficV4,updatePedestriansV4,cloneTrafficV4}",ctx);
ctx.api.initTrafficV4();
assert.equal(state.traffic.length,6);
assert.deepEqual(Array.from(state.traffic,x=>x.id),carIds);
assert(state.traffic.every(c=>c.groups.has("Direccion_Derecha")));
const before=state.traffic.map(x=>x.root.position.z);
for(let i=0;i<480;i++)ctx.api.updateTrafficV4(1/60);
assert(state.traffic.some((c,i)=>Math.abs(c.root.position.z-before[i])>1));
for(const t of state.traffic)for(const wheel of t.info.wheels)assert(t.groups.has("Rodar_"+wheel));
const p={id:"02_ernesto",root:new Node("npc"),walkTimer:3,walkDirection:1,speed:1.0,active:null,
 play(name){this.active=name;}};
p.root.position.set(100,0,109);state.people=[p];
ctx.api.updatePedestriansV4(.1);assert.equal(p.active,"Walk");
console.log("TRAFICO_V4_SEIS_MODELOS_OK",JSON.stringify({models:6,traffic:6,pedestrians:1}));

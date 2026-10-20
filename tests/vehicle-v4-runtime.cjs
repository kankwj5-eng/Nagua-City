"use strict";
const assert=require("node:assert/strict"),lib=require("../game/vehicles-v4/vehicle-runtime.js");
const ids=Object.keys(lib.FILES);
assert.equal(ids.length,4);
const manifest={vehicleModels:4,oldVehicleModels:0,vehicles:ids.map(id=>{
 const wheels=id==="hilux"||id==="landcruiser"?["Delantera_Der","Delantera_Izq","Trasera_Der","Trasera_Izq"]:["Rueda_Delantera","Rueda_Trasera"];
 return {id,file:lib.FILES[id],radius:.3,wheels,steering:wheels.length===4?["Direccion_Delantera_Der","Direccion_Delantera_Izq"]:["Direccion"],animations:["Direccion_Izquierda","Direccion_Derecha",...wheels.map(w=>"Rodar_"+w)]};
})};
lib.validate(manifest);assert.throws(()=>lib.validate({...manifest,vehicleModels:20}));
assert.throws(()=>lib.validate({...manifest,oldVehicleModels:1}));
class Node{constructor(name){this.name=name;this.rotation={y:0};}dispose(){}}
let loads=0,starts=0,seeks=0,pauses=0;
const group=name=>({name,from:0,to:60,start(){starts++;return this;},pause(){pauses++;},goToFrame(f){seeks++;this.frame=f;},stop(){},dispose(){}});
const B={TransformNode:Node,SceneLoader:{async LoadAssetContainerAsync(){
 const names=manifest.vehicles[loads++].animations;
 return {animationGroups:names.map(group),instantiateModelsToScene(){return {rootNodes:[new Node("model")],animationGroups:names.map(group)};},dispose(){}};
}}};
const glb=new Uint8Array(20);glb.set([103,108,84,70]);new DataView(glb.buffer).setUint32(8,20,true);
(async()=>{
 const loader=await lib.load(B,{},manifest,async()=>glb);
 assert.equal(loads,4);const moto=loader.create("pulsar",1),hilux=loader.create("hilux",2);
 assert.equal(moto.visual.rotation.y,-Math.PI/2);
 moto.update(3,.8,1/60);
 assert(Math.abs(moto.animations.get("Direccion_Derecha").frame-24)<1e-8);
 moto.update(-3,-.5,1/60);
 assert(Math.abs(moto.animations.get("Direccion_Izquierda").frame-15)<1e-8);
 hilux.update(12,1,1/60);
 assert.equal(hilux.spec.wheels.length,4);
 assert.throws(()=>loader.create("sedan",99));
 assert(starts>0&&pauses>0&&seeks>0);
 loader.dispose();assert.equal(loader.inspect().instancias,0);
 console.log("VEHICULOS_V4_OK",JSON.stringify({models:loads,instances:2,starts,seeks}));
})().catch(e=>{console.error(e);process.exitCode=1;});

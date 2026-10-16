"use strict";
/* Run the actual bike46 function with pre-created source meshes. Validate that
 * nine bikes keep the same mesh count, wheel radii, steering and physics pivots. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0440-bike46.js"),"utf8");
let created=0;
function mesh(name){
 return {name,scaling:{x:1,y:1,z:1,set(x,y,z){this.x=x;this.y=y;this.z=z;},setAll(x){this.x=this.y=this.z=x;}},
 setEnabled(state){this.enabled=state;},clone(n){created++;return mesh(n);},createInstance(n){created++;return mesh(n);}};
}
const proto=()=>({body:[mesh("bike46_body_paint_"),mesh("bike46_body_detail_")],steering:[mesh("bike46_optics_paint_")],wheel:[mesh("bike46_wheel_detail_")]});
const sources=new Map([["sport",proto()],["work",proto()]]);
const ctx={bikePrototypes46:sources,art46:{bikes:0}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const names=["pulsar","boxer","discover","trail","delivery","yamaha","taypan","urban125","enduro"];
const signatures=new Set();
for(const name of names){
 const parts=Object.fromEntries(["body","steering","wheel_front","wheel_rear"].map(n=>{
  const p={name:n,position:{x:0,y:n==="steering"?.9:0,z:0},getChildMeshes(){return this.children||[];},children:[]};
  return [n,p];
 }));
 const before=created, v={name,bike:true,bicycle:false,art46:false,id:names.indexOf(name),radius:.31,wheelbase:1.35,width:.76,parts};
 // Source templates are instantiated; fake meshes still record the parent.
 ctx.bike46(v);
 assert(v.art46,name+" should get its visual finish");
 assert.equal(created-before,5,name+" added an unexpected mesh/draw call");
 for(const part of Object.values(parts))part.children=[...[]];
 const main=Object.values(parts).map(p=>p);
 // Collect the five created objects from the recording hook below.
 const dims=Array.from(ctx.bikeSilhouette46(name));
 assert.equal(dims.length,3);
 for(const s of dims)assert(s>=.88&&s<=1.10,"Non-moving proportions must remain restrained");
 signatures.add(dims.join("/"));
 assert.equal(v.wheelbase,1.35);
 assert.equal(v.width,.76);
 assert.equal(parts.steering.position.y,.9);
 assert.equal(v.radius,.31);
 const firstCount=created;ctx.bike46(v);assert.equal(created,firstCount,"Finishing a bike twice duplicates meshes");
}
assert.equal(signatures.size,names.length,"Each bike needs a distinct silhouette");
assert.equal(ctx.art46.bikes,names.length);
assert.equal(sources.size,2,"Original source prototypes must remain shared");
assert.equal(created,5*names.length);
console.log("MOTORCYCLE_SILHOUETTES_OK "+JSON.stringify({models:names.length,sourceFamilies:sources.size,instancesPerBike:5,extraInstances:0,steeringPivotsPreserved:true,wheelGeometryUnchanged:true,distinctSilhouettes:signatures.size}));

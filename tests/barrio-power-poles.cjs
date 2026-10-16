"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.resolve(__dirname,"../game/src/world/0203-install-district31.js"),"utf8");
const start=source.indexOf(" for(const [corridorX,shoePair] of [[-383.8,true],[-291.2,false]])"),end=source.indexOf(" // Fictitious hostile sector",start);
assert(start>=0&&end>start,"Real barrio electrical network must be present");
const snippet=source.slice(start,end);
function setup(blockedSite=false){
 const groups=[],collisions=[];
 const objects=[],sites=[];
 const x0={toolWood:"wood",steel:"steel",white:"white",lamp:"lamp",roofMetal:"roofMetal",rubber:"rubber"};
 const ctx={a:x0,V:(x,y,z)=>({x,y,z}),groundAt:()=>0,blocked:()=>blockedSite,
 makeDetailGroup(name,build){const built=[];
  const add=(type,name,args)=>built.push({type,name,args});
  build({box:(...args)=>add("box",args[0],args),cylinder:(...args)=>add("cylinder",args[0],args),tube:(...args)=>add("tube",args[0],args)});
  groups.push({name,built});return {name,built};
 },registerDetail31:(root,x,z,r)=>{assert.equal(r,105);objects.push(root);return root;},addWorldBox:(...args)=>collisions.push(args)};
 vm.createContext(ctx);vm.runInContext(snippet,ctx);
 return{groups,collisions,objects};
}
const {groups,collisions}=setup();
assert.equal(groups.length,2,"Only two merged neighborhood groups");
assert.equal(collisions.length,6,"Pole collisions do not intrude into dirt roads");
let all=groups.flatMap(g=>g.built);
const named=term=>all.filter(o=>o.name.includes(term));
assert.equal(named("Poste de madera").length,6);
assert.equal(named("Cable aéreo").length,12);
assert.equal(named("Luminaria protegida").length,6);
assert.equal(named("Transformador residencial").length,1);
assert.equal(named("Zapato atado").length,2);
assert.equal(named("Cordón anudado").length,2);
for(const box of collisions){
 const [x,z,w,d]=box;
 assert(w<=.35&&d<=.35);
 assert(Math.min(Math.abs(x+391),Math.abs(x+284))>=6,"Postes fuera de la calzada");
 assert(z>=44&&z<=86);
}
for(const wire of named("Cable aéreo")){
 const points=wire.args[1];
 assert.equal(points.length,5);
 assert(points[2].y<points[0].y&&points[2].y<points[4].y,"Cable con flecha visible");
 assert(points[0].y>6.5&&points[4].y>6.5,"Sin cables a la altura de peatones");
}
assert.equal(setup(true).groups.length,0,"Skip poles when collision site occupied");
assert(!source.includes("new B.PointLight"),"Do not add dynamic lights on low-end Android");
console.log("BARRIO_POWER_POLES_OK "+JSON.stringify({groups:2,poles:6,cables:12,lamps:6,transformers:1,hangingShoes:2,newDynamicLights:0}));

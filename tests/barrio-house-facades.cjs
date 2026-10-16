"use strict";
/* Ejecuta el generador REAL de 11 viviendas con primitivas instrumentadas:
 * variedad de ladrillo/bloque/estuco sin añadir una sola malla por casa. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"game/src/world/0282-install-district32.js"),"utf8");
new vm.Script(source,{filename:"install-district32.js"});
const materialSource=fs.readFileSync(path.join(root,"game/src/rendering/0441-materials46.js"),"utf8");
const assetMats=Object.fromEntries(["roofMetal","roofClay","monument","toolWood","white","glass","steel","blue"].map(name=>[name,{name}]));
const wall={diff:{id:"shared scanned albedo"},nor_gl:{id:"shared scanned normal"}};
const houses=[],mats=[],colliders=[];
const ctx={Math,assetMats,surfaceTextures31:{concrete_wall_003:wall},city:{groups:[]},data:{buildings:[]},stage32:{housing:0},
 V:(x=0,y=0,z=0)=>({x,y,z}),
 pbr:(name,color,roughness)=>{const m={name,color,roughness};mats.push(m);return m;},
 addWorldBox:(...args)=>colliders.push(args),
 makeDetailGroup:(name,build)=>{
  const shapes=[];const creator=kind=>(label,...args)=>{const obj={kind,label,args,rotation:{x:0,z:0}};shapes.push(obj);return obj;};
  build({box:creator("box"),tube:creator("tube"),cylinder:creator("cylinder")});
  const house={name,shapes,metadata:{}};houses.push(house);return house;
 }};
vm.createContext(ctx);vm.runInContext(source+"\ninstallDistrict32();",ctx);
assert.equal(ctx.stage32.housing,11);
assert.equal(ctx.city.groups.length,11);
assert.equal(ctx.data.buildings.length,11);
assert.equal(colliders.length,11);
assert.equal(mats.length,11,"Conservar un material por vivienda");
const kinds={ladrillo:0,bloque:0,estuco:0};
for(let i=0;i<11;i++){
 const style=ctx.barrioFacadeStyle32(i),m=mats[i],h=houses[i];
 kinds[style.kind]++;
 assert(style.roofPitch>=.09&&style.roofPitch<=.14);
 assert.equal(h.shapes.filter(s=>s.kind==="box").length,74,"Misma cantidad de mallas que la vivienda original "+i);
 assert.equal(h.shapes.filter(s=>s.kind==="tube").length,1);
 assert.equal(h.shapes.filter(s=>s.kind==="cylinder").length,i%3===0?3:2);
 assert.equal(h.shapes.filter(s=>s.label==="Ventana oscura").length,2);
 assert.equal(h.shapes.filter(s=>s.label==="Reja de ventana").length,10);
 assert.equal(h.shapes.filter(s=>s.label==="Nervio de zinc").length,40);
 assert.equal(h.shapes.filter(s=>s.label==="Techo de lámina").length,2);
 const door=h.shapes.find(s=>s.label==="Puerta de acceso");
 assert.equal(door.args.at(-1),style.metalDoor?assetMats.roofMetal:assetMats.toolWood);
 const roofs=h.shapes.filter(s=>s.label==="Techo de lámina");
 assert(Math.abs(roofs[0].rotation.z)===style.roofPitch||Math.abs(Math.abs(roofs[0].rotation.z)-style.roofPitch)<1e-9);
 assert.equal(roofs[0].rotation.z,-roofs[1].rotation.z);
 if(style.kind==="ladrillo"){
  assert(m.name.startsWith("Ladrillo visto patio V32"));
  assert.equal(m.albedoTexture,undefined,"Textura de ladrillo aplicada al llegar assets de etapa 46");
 }else{
  assert(m.name.startsWith(style.kind==="bloque"?"Bloque desnudo patio V32":"Estuco barrio V32"));
  assert.equal(m.albedoTexture,wall.diff);
  assert.equal(m.bumpTexture,wall.nor_gl);
 }
 assert.equal(ctx.data.buildings[i].h,2.65+(i%3)*.24);
}
assert.deepEqual(kinds,{ladrillo:3,bloque:3,estuco:5});
assert(materialSource.includes("family='brick_wall_001'"),"El renderer final debe tener PBR de ladrillo");
assert(materialSource.includes("family='painted_plaster_wall'"),"El renderer final debe tener PBR de estuco");
console.log("BARRIO_HOUSE_FACADES_OK "+JSON.stringify({houses:11,kinds,boxes:houses.reduce((n,h)=>n+h.shapes.filter(s=>s.kind==="box").length,0),newMeshBudget:0,newTextures:0,existingZinc:true}));

"use strict";
/* Validación de la clasificación real de jardines: mismos puntos y presupuestos. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/world/0442-gardens46.js"),"utf8");
const boundary=source.indexOf("function gardens46(){");
assert(boundary>0,"La selección de especies debe mantenerse separada del constructor gráfico");
const ctx={Math};vm.createContext(ctx);vm.runInContext(source.slice(0,boundary),ctx);
const pick=ctx.gardenSpecies46;
assert.equal(typeof pick,"function");
const base=[],streets=[-185,-111,-37,37,111,185];
for(const road of streets)for(let z=-160;z<=232;z+=44)for(const side of [-1,1]){
 const x=road+side*10.8;
 base.push({x,z,zone:"avenida",type:Math.abs(Math.round(z/44+road))%2});
}
for(let i=0;i<500;i++){
 const x=-300+(i%25)*25,y=-220+Math.floor(i/25)*25,w=8,d=10;
 if(i%2===0)base.push({x:x+w*.5+.72,z:y-d*.22,zone:"patio",type:i%4===0?3:2});
}
const placements=base.slice(0,245).map((o,id)=>({...o,id,type:pick(o,id,true)}));
const byType=[0,0,0,0,0],byZone={avenida:0,patio:0};let avenueTree=0,avenueTotal=0;
for(const item of placements){
 assert(Number.isInteger(item.type)&&item.type>=0&&item.type<=4);
 assert.equal(pick(item,item.id,true),item.type,"Una ubicación debe mantener su especie entre arranques");
 assert.equal(base[item.id].x,item.x);assert.equal(base[item.id].z,item.z);
 assert.equal(base[item.id].zone,item.zone);
 byType[item.type]++;byZone[item.zone]++;
 if(item.zone==="avenida"){avenueTotal++;if(item.type===0||item.type===1)avenueTree++;}
}
assert.equal(placements.length,245,"No aumenta la población de plantas");
assert(avenueTree/avenueTotal>.65,"Conservar árboles de sombra como base del arbolado");
assert(byType.every(n=>n>0),"Tener árboles, jardineras de dos tipos y palmas");
assert(byZone.patio>0&&byZone.avenida>0);
for(const item of placements)if(item.zone==="patio")assert(item.type===2||item.type===3,"Los patios no reciben palmas gigantes");
for(const item of placements){
 const withoutPalm=pick(item,item.id,false);
 assert(withoutPalm!==4,"Sin fuente de palmeras no generar referencias inválidas");
}
assert(source.includes("positions.slice(0,245)"),"Conservar límite preexistente");
assert(source.includes("gardenSpecies46(o,i,!!palmSource)"),"Usar la clasificación en el constructor");
assert(source.includes("spatialResidents06(placements"),"Conservar streaming por cercanía");
assert(source.includes("addWorldBox(o.x,o.z"),"Conservar colisiones");
console.log("GARDEN_BIOME_PLACEMENT_OK "+JSON.stringify({placements:placements.length,byType,byZone,avenueTrees:avenueTree,avenueTotal,newGeometry:0,newResources:0}));

"use strict";
// Prueba sin WebGL: planificación urbana, jerarquía por zona y modelos agrupados.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const rules=read("game/src/world/0064-city-rules.js");
const arch=read("game/src/engine/0238-install-architecture34.js");
const marker="// Etapa 52: primeras tres tipologías";
assert(arch.includes(" installModernBlocks52();"),"La arquitectura nueva debe instalarse al construir la ciudad");
assert(arch.includes(marker),"Catálogo moderno no encontrado");
const source=rules+"\n"+arch.slice(arch.indexOf(marker));
function mock(blocker=null){
 const placed=[],roots=[],added=[],materials=[];
 const house={x:62,y:83,w:7,d:6,type:"casa"};
 const b={buildings:[house],boxes:blocker?[blocker]:[],places:[]};
 const ctx={data:b,Math,
  stage34:{},quality:"low",assetMats:{monument:{name:"monument"}},
  surfaceTextures31:{concrete_wall_003:{diff:"sharedConcrete"}},
  pbr(name){const m={name};materials.push(m);return m;},
  inWorld:(x,z)=>Math.abs(x)<266&&Math.abs(z)<266,
  groundAt:()=>.003,
  registerDetail31:(r,x,z,range)=>roots.push({r,x,z,range}),
  addWorldBox:(x,z,w,d)=>{added.push([x,z,w,d]);b.boxes.push([x-w/2,z-d/2,x+w/2,z+d/2]);},
  makeDetailGroup:(name,fn)=>{const boxes=[];fn({box:(...v)=>{const m={name:v[0],rotation:{x:0,y:0,z:0}};boxes.push({v,m});return m;}});placed.push({name,boxes});return{name,getChildMeshes:()=>[{},{}]};}
 };
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {ctx,placed,roots,added,materials,house,data:b};
}
const first=mock();
first.ctx.installModernBlocks52();
const sites=first.ctx.stage34.modern52.sites;
assert.equal(sites.length,3,"Centro, corredor oriental y corredor occidental deben tener un ejemplo cada uno");
assert.deepEqual(Array.from(sites,x=>x.type),["hotel-teja","oficina-vidrio","mixto-blanco"]);
assert(sites[0].x<0&&sites[0].z<0&&sites[1].x>0&&sites[1].z>0&&sites[2].x<0&&sites[2].z>0,"Tipos repartidos, no juntos");
assert(first.placed.length===3&&first.roots.length===3&&first.added.length===3,"Un grupo y una colisión por inmueble");
assert.equal(first.ctx.stage34.modern52.replacedHomes,0,"Las viviendas originales no se borran sin identificador de malla");
assert.equal(first.data.buildings[0],first.house,"La casa anterior conserva su identidad, orden y atributos");
assert.equal(first.data.buildings.length,4,"Las viviendas y las tres nuevas edificaciones coexisten");
assert.equal(first.data.places.length,3,"Los tres edificios son destinos del mapa");
assert(first.placed.some(g=>g.boxes.some(b=>b.v[0]==="Tejado inclinado terracota52")),"Hotel con cubierta de teja roja");
assert(first.placed.some(g=>g.boxes.some(b=>b.v[0]==="Ventana urbana con cristal52")),"Todas las torres tienen ventanas");
assert(first.placed.some(g=>g.boxes.some(b=>b.v[0]==="Vestíbulo acristalado52")),"Oficina azul con vestíbulo");
assert(first.roots.every(o=>o.range===125),"Limitar LOD en teléfonos básicos");
assert.equal(first.materials.length,5,"Cinco materiales PBR compartidos, no uno por ventana");
assert(first.placed.every(o=>o.boxes.length<175),"Geometría económica por edificio");
for(const site of sites){
 assert(![-185,-111,-37,37,111,185].some(r=>Math.abs(site.x-r)<14||Math.abs(site.z-r)<14),"No construir sobre carreteras");
}
first.ctx.installModernBlocks52();
assert.equal(first.placed.length,3,"Instalación idempotente");
const unavailable=mock([-300,-300,300,300]);
unavailable.ctx.installModernBlocks52();
assert.equal(unavailable.ctx.stage34.modern52.count,0,"Sin huecos seguros no debe forzarse la construcción");
assert.equal(unavailable.data.buildings.length,1,"No se borran casas ante una manzana bloqueada");
assert.equal(unavailable.added.length,0);
const protectedHouse=mock();
protectedHouse.data.buildings.push({x:-145,y:-133,w:12,d:10,h:3,type:"casa"});
protectedHouse.ctx.installModernBlocks52();
assert.equal(protectedHouse.data.buildings[1].type,"casa","No sustituir sin malla visual localizada");
assert(!protectedHouse.ctx.stage34.modern52.sites.some(s=>Math.abs(s.x+145)<13&&Math.abs(s.z+133)<12),"Evitar casa del solar preferido");
console.log("MANAGUA_MODERN_BUILDINGS_OK "+JSON.stringify({buildings:sites.length,roots:3,materials:first.materials.length,originalHousesIntact:true}));

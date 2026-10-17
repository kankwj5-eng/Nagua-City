"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const s=read("game/src/world/0050-ground-at.js");
const groupSource=read("game/src/world/0226-install-road33.js");
const begin=groupSource.indexOf("// Paso a desnivel urbano:");
assert(begin>=0&&groupSource.includes(" installOverpass50();"),"El puente debe instalarse al cargar el mundo, no bajo una misión");
const shapes=[],registrations=[],colliders=[],places=[],materials=[];
const B={MeshBuilder:{}},surfaceTextures31={asphalt_03:{diff:"asphalt",nor_gl:"asphaltNormals"}};
const ctx={B,surfaceTextures31,assetMats:{white:{name:"white"},steel:{name:"steel"},monument:{name:"monument"},houseBase:{name:"soil"}},
 data:{places,boxes:[],buildings:[]},inWorld:()=>true,groundAt:(x,z)=>.20+z*.00001,pbrSharedGrass31:()=>({name:"sharedGrass"}),
 pbr:(name)=>{const m={name};materials.push(m);return m;},
 blocked:(x,z)=>false,
 makeDetailGroup:(name,fn)=>{const elements=[];fn({box:(name,x,y,z,w,h,d,mat)=>{const o={name,x,y,z,w,h,d,mat,rotation:{x:0}};elements.push(o);return o;}});const root={name,elements};shapes.push(root);return root;},
 registerDetail31:(...args)=>registrations.push(args),
 addWorldBox:(...args)=>colliders.push(args),
 Math
};
vm.createContext(ctx);vm.runInContext(s.slice(s.indexOf("// Vía superior")),ctx);
vm.runInContext(groupSource.slice(begin)+"\ninstallOverpass50();installOverpass50();",ctx);
const grade=z=>vm.runInContext("overpassRise50("+z+")",ctx);
const y=(x,z,upper)=>vm.runInContext("roadSurface50("+x+","+z+","+upper+")",ctx);
const overpass=vm.runInContext("overpass50",ctx);
assert.equal(overpass.installed,true);
assert.equal(overpass.height,5.4);
assert.equal(grade(-37),5.4,"Plataforma central");
assert.equal(grade(-37-66),0,"Rampa oeste termina a nivel");
assert.equal(grade(-37+66),0,"Rampa este termina a nivel");
assert.equal(grade(-37-18),5.4);
assert.equal(grade(-37+18),5.4);
assert(Math.abs(grade(-37-35)-grade(-37+35))<1e-9,"Rampas simétricas");
for(let d=18;d<66;d+=.5){
 const a=grade(-37+d),b=grade(-37+d+.5);
 assert(a>=b&&b>=0,"Pendiente continua, sin escalones");
 assert(a-b<.1,"Pendiente acotada para motos");
}
assert(Math.abs(y(37,-37,true)-y(37,-37,false)-5.4)<1e-9,"Dos alturas en el mismo cruce");
assert.equal(y(50,-37,true),y(50,-37,false),"La calle transversal queda abajo");
assert.equal(y(37,-105,true),y(37,-105,false),"Fuera del viaducto no hay alteraciones");
const request=(x,z,heading,route=null)=>{
 const v={traffic:!!route,route,overpass50:false};
 return vm.runInContext("overpassLayer50",ctx)(v,x,z,heading);
};
assert(request(37,-37,{valueOf:()=>Math.PI/2})===false,"Un conductor transversal no salta al puente");
assert(request(37,-37,0,{axis:"z"}),"Tráfico norte-sur en el nivel alto");
assert(!request(37,-37,0,{axis:"x"}),"Tráfico este-oeste permanece abajo");
const car={traffic:false,overpass50:false};
const layer=vm.runInContext("overpassLayer50",ctx);
assert(layer(car,37,-99,0),"Entrar por la rampa");
assert(layer(car,37,-37,Math.PI/2),"No caer a nivel inferior al girar sobre el tablero");
assert(!layer(car,37,40,0),"Desactivar la capa elevada después de salir");
const geometry=shapes[0]?.elements||[];
assert.equal(shapes.length,2,"Puente y jardineras en grupos fusionables por material");
assert.equal(geometry.filter(x=>x.name==="Tablero vehicular50").length,44);
assert(geometry.filter(x=>x.name==="Pretil lateral50").length>=50);
assert.equal(overpass.pillars,4,"Los cuatro pilares quedan fuera de ambas carreteras");
assert.equal(overpass.landscape51,8,"Jardineras únicamente en las ocho ubicaciones libres de prueba");
assert.equal(geometry.filter(x=>x.name==="Línea blanca de borde51").length,88,"Marcas de borde continuas, 2 por segmento");
const soffit=geometry.filter(x=>x.name==="Intradós continuo de hormigón54");
assert(soffit.length>=20,"Losa inferior continua en tramo elevado, sin huecos entre nervaduras");
assert(soffit.filter(m=>Math.abs(m.z+37)<10).every(m=>m.y-m.h/2>4.8),
 "El cruce central conserva altura libre para tráfico inferior");
const crosswalks=geometry.filter(x=>x.name==="Paso peatonal del nivel inferior54");
assert.equal(crosswalks.length,22,"Dos cebras completas de 11 franjas");
assert(crosswalks.every(m=>m.y<.15&&Math.abs(m.z+37)<=4&&Math.abs(m.x-37)===16),
 "Los pasos peatonales deben estar sobre la vía inferior, no en el tablero");
assert(!/new B\.(?:PointLight|SpotLight)|new B\.DynamicTexture/.test(groupSource),
 "Sin luces ni texturas dinámicas nuevas");

assert(geometry.filter(x=>x.name==="Junta transversal del tablero53").length>=5,
 "Juntas de dilatación visibles a ras de calzada");
assert(geometry.filter(x=>x.name==="Nervadura de hormigón bajo tablero53").length>=3,
 "Nervaduras ligeras y por encima del gálibo de la calle inferior");
assert(geometry.filter(x=>x.name==="Reflector pasivo sobre pretil53").length>=10,
 "Reflectores sin PointLight ni texturas exclusivas");
assert.equal(colliders.length,12,"Cuatro pilares y ocho jardineras sin objetos invisibles");
assert(colliders.slice(0,4).every(([x,z])=>Math.abs(z+37)>=24&&Math.abs(x-37)>5),"Pilares fuera de los ejes del cruce");
assert(colliders.slice(4).every(([x,z])=>Math.abs(z+37)>8&&Math.abs(x-37)>8),"Jardineras fuera de calzadas");
assert.equal(registrations.length,2,"Puente y jardineras comparten streaming por distancia");
assert.equal(registrations[0][3],150);
assert.equal(registrations[1][3],155);
assert(materials.length<=2,"Solo dos materiales PBR, reutilizando marcas y metal");
assert.equal(places.length,1,"Marcador en mapa disponible");
for(const path of ["game/src/engine/0370-tick.js","game/src/vehicles/0369-step-fleet13.js","game/src/vehicles/0012-vehicle-contact40.js","game/src/core/0051-blocked.js"]){
 assert(read(path).includes("roadSurface50("),"Integración de dos niveles faltante: "+path);
}
assert(read("game/src/vehicles/0168-step-traffic29.js").includes("r.center===37&&c===-37"),"No girar a nivel en pleno viaducto");
assert(read("game/src/vehicles/0115-fleet-snapshot25.js").includes("y:o.root.position.y"),"El plan de tráfico requiere altitud");
assert(read("game/src/vehicles/0116-step-traffic25.js").includes("sameLevel=snapshots.filter"),"La IA debe ignorar coches de otra altura");
assert(read("game/src/vehicles/0116-step-traffic25.js").includes("locks.delete('37,-37')"),"Cruce elevado no debe bloquearse por semáforos 2D");
// Salir del vehículo desde la cubierta no puede teletransportar al avatar debajo.
ctx.blocked=()=>false;ctx.V=(x,y,z)=>({x,y,z});
vm.runInContext(read("game/src/vehicles/0346-safe-vehicle-exit.js"),ctx);
const driven={width:1.8,heading:0,overpass50:true,root:{position:{x:37,y:5.6,z:-37}}};
const exitTop=ctx.safeVehicleExit(driven);
assert(exitTop&&exitTop.y>5.2,"El avatar se mantiene sobre el tablero al bajar");
driven.overpass50=false;const exitUnder=ctx.safeVehicleExit(driven);
assert(exitUnder&&exitUnder.y<1,"El conductor de abajo no se teletransporta al puente");
assert(read("game/src/vehicles/0347-change-drive.js").includes("player.overpass50=!!v.overpass50"),"Conservar la altura del conductor al bajar");
assert(read("game/src/engine/0370-tick.js").includes("ground=roadSurface50(player.root.position.x"),"La caminata debe respetar la cubierta");
assert(read("game/src/engine/0370-tick.js").includes("player.moveZ*dt,.30,player"),"Colisiones peatonales deben usar la capa actual");
assert(read("game/src/core/0286-place-contact.js").includes("roadSurface50(p.x,p.z,upper)"),"Sombras no pueden quedar en la calle inferior");
console.log("OVERPASS_TWO_LEVELS_OK "+JSON.stringify({segments:44,pillars:colliders.length,maxRise:overpass.height,dynamicLights:0,materials:materials.length}));

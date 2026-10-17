"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const land=read("game/src/world/0050-ground-at.js");
const collision=read("game/src/core/0051-blocked.js");
const contact=read("game/src/vehicles/0012-vehicle-contact40.js");
const world={
 Math,
 city24:{},colliderGrid:new Map(),fleet:[],current:null,driving:false,
 state:{heading:0},
 surfaceGrid:new Map(),inWorld:()=>true,clamp:(x,a,b)=>Math.min(b,Math.max(a,x))
};
vm.createContext(world);
vm.runInContext(land,world);vm.runInContext(read("physics/vehicle-contact.js"),world);
vm.runInContext(collision+"\n"+contact,world);
vm.runInContext("overpass50.installed=true",world);
const y=(z,upper)=>vm.runInContext("roadSurface50(37,"+z+","+upper+")",world);
const guard=(x,z,upper,r=.1)=>vm.runInContext("overpassGuardrails53("+x+","+z+","+upper+","+r+")",world);
const wallX=41.71,z=-37,topY=y(z,true),lowY=y(z,false);
assert(topY-lowY>5.3,"Debe haber gálibo real de más de cinco unidades en el centro");
assert(guard(wallX,z,true),"El pretil está presente en el tablero");
assert(!guard(wallX,z,false),"La calzada inferior no tiene pretil 2D invisible");
assert(!guard(39.45,z,true,.1),"Los carriles no colisionan con las barreras");
assert(!guard(wallX,-104,true),"No agregar colisión en el extremo de rampa que ya es calle común");
const blocked=(x,z,r,ignore,vehicles=false)=>world.blocked(x,z,r,ignore,vehicles);
const topWalker={overpass50:true},lowerWalker={overpass50:false};
assert(blocked(wallX,z,.3,topWalker),"El peatón que camina por arriba no atraviesa la baranda");
assert(!blocked(wallX,z,.3,lowerWalker),"El peatón bajo el puente no encuentra baranda invisible");
assert(!blocked(39.45,z,.3,topWalker),"El pasillo sobre el viaducto no se bloquea");
const v={width:1.8,length:4.2,overpass50:true};
const hit=(x,z,upper)=>{v.overpass50=upper;return world.vehicleContact40(x,z,v,.82)};
const above=hit(40.78,z,true);
assert(above&&above.depth>0,"La carrocería elevada debe encontrar el pretil antes de caer");
assert(Math.hypot(above.nx,above.nz)>.999,"Normal física debe estar normalizada");
assert(!hit(40.78,z,false),"El automóvil inferior en la misma coordenada no choca contra pretil alto");
assert(!hit(39.45,z,true),"El carril normal del puente está despejado");
assert(!hit(40.78,-104,true),"Las barreras terminan antes de volver a la calle a nivel");
assert(!read("game/src/world/0226-install-road33.js").includes("addWorldBox(x+side*(halfWidth"),
 "Los pretiles no deben acabar como barreras globales 2D");
const makeSnapshot=()=>JSON.stringify({dataBoxes:[...world.colliderGrid.entries()],fleet:world.fleet});
const previous=makeSnapshot();for(let n=0;n<200;n++){const x=39.45+Math.sin(n*.11)*.45;hit(x,z,true);blocked(x,z,.30,topWalker);}
assert.equal(makeSnapshot(),previous,"La consulta repetida no crea colisionadores ni memoria adicional");
console.log("VIADUCTO_GUARDRAILS_LEVELS_OK "+JSON.stringify({height:topY-lowY,upperHitDepth:above.depth,lowerContact:false,samples:200,global2DColliders:0}));

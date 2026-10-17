"use strict";
// Las defensas del puente son físicas para el nivel superior y transparentes
// para todos los vehículos del cruce inferior. Usa el SAT real del proyecto.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ctx={Math,groundAt:()=>0,city24:{roundabout:null},colliderGrid:new Map(),fleet:[],current:null,driving:false,
 state:{heading:0},inWorld:()=>true,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),VehicleContact13:null};
vm.createContext(ctx);
vm.runInContext(read("game/src/vehicles/0006-vehicle-contact13.js"),ctx);
vm.runInContext(read("game/src/world/0050-ground-at.js").split("// Vía superior")[1].replace(/^/,"// Vía superior"),ctx);
vm.runInContext(read("game/src/vehicles/0012-vehicle-contact40.js"),ctx);
vm.runInContext(read("game/src/core/0051-blocked.js"),ctx);
ctx.overpass50=vm.runInContext("overpass50",ctx);
ctx.overpass50.installed=true;
const guard=ctx.overpassGuardrail53;
assert.equal(guard(41.71,-37,true,.1),true,"Borde derecho activo sobre el viaducto");
assert.equal(guard(32.29,-37,true,.1),true,"Borde izquierdo activo sobre el viaducto");
assert.equal(guard(41.71,-37,false,.3),false,"El nivel inferior debe quedar libre");
assert.equal(guard(41.71,-37+56,true,.3),false,"No crear pared invisible al final de la rampa");
assert.equal(guard(37,-37,true,.3),false,"Centro del tablero totalmente transitable");
const car={overpass50:true,width:1.8,length:4.1,traffic:false,garage:false,retired28:false};
const collide=(x,z)=>ctx.vehicleContact40(x,z,car,.82);
assert.equal(collide(37,-37),null,"Circular por el centro del puente no choca con la baranda");
const right=collide(41,-37);
assert(right&&right.depth>0&&right.nx<0,"La baranda derecha debe devolver el coche al tablero");
const left=collide(33,-37);
assert(left&&left.depth>0&&left.nx>0,"La baranda izquierda debe devolver el coche al tablero");
car.overpass50=false;
assert.equal(collide(41,-37),null,"El coche de la carretera inferior cruza sin tocar barandas superiores");
assert.equal(collide(33,-37),null,"También queda libre el otro lateral de la carretera inferior");
car.overpass50=true;
assert.equal(collide(41,22),null,"Fuera de la rampa no pueden existir barreras invisibles");
const pedestrian={root:{},overpass50:true};
assert.equal(ctx.blocked(41.55,-37,.30,pedestrian,false),true,"Peatón en puente detenido por defensa");
pedestrian.overpass50=false;
assert.equal(ctx.blocked(41.55,-37,.30,pedestrian,false),false,"Peatón en la vía inferior no ve la defensa");
assert.equal(ctx.blocked(37,-37,.30,pedestrian,false),false,"Calle inferior abierta");
assert.equal(ctx.colliderGrid.size,0,"Las defensas no deben introducirse en la grilla 2D del nivel inferior");
const source=read("game/src/world/0226-install-road33.js");
assert(source.includes("Pretil lateral50")&&source.includes("Intradós de hormigón del viaducto53"),
 "El viaducto físico debe tener barrera y cara inferior visibles");
console.log("OVERPASS_GUARDRAILS_OK "+JSON.stringify({physicalSideContacts:2,lowerLevelCollisions:0,centerLaneOpen:true,pedestriansProtected:true}));

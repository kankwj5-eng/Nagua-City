"use strict";
/* Ejecución del tick real de Nagua City, sin Babylon: dos apoyos ya medidos,
 * sin raycasts adicionales ni cambios en el solver de conducción. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/engine/0370-tick.js"),"utf8");
const driveSource=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0347-change-drive.js"),"utf8");
assert(driveSource.includes("current.slopePitch40=NaN"),"Debe reiniciar inclinación al volver a montar");
function fixture(bike=true){
 const rot={x:0,y:0,z:0};
 return {bike,bicycle:false,bus:false,radius:.3,wheelbase:1.4,root:{position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:rot}};
}
let slope=.10,groundSamples=0,stepCalls=0;
const state={x:0,z:0,heading:0,speed:0,lean:0,wheelie:0};
const ctx={Math,Number,time:0,playing:true,gameplayTime:0,driving:true,
 stick:{x:0,y:0},keys:{},buttons:{accelerate:0,reverse:0,brake:0,stunt:0},
 state,current:fixture(),city:{},yaw:0,lastLook:Infinity,
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 tickCity(){},Driving:{advance(){stepCalls++;}},
 resolveVehicle40(){},groundAt(x,z){groundSamples++;return -z*slope;},
 // Esta prueba aislada ejercita la moto sobre terreno normal, sin viaducto.
 overpassLayer50(){return false;},roadSurface50(x,z){return ctx.groundAt(x,z);},
 suspension40(){},applyPlayerWheels13(){},
};
vm.createContext(ctx);vm.runInContext(source,ctx);
const tick=()=>ctx.tick(1/60);
tick();
assert(Math.abs(ctx.current.root.rotation.x-Math.atan(.10))<1e-12,"Primer paso toma pendiente real");
assert.equal(groundSamples,2,"Debe reutilizar las muestras originales de las ruedas");
const before=ctx.current.root.rotation.x;slope=.5;tick();
const jump=ctx.current.root.rotation.x-before;
assert(jump>0&&jump<=1.5/60+1e-12,"Cambio abrupto de rasante limitado");
for(let i=0;i<118;i++)tick();
assert(Math.abs(ctx.current.root.rotation.x-Math.atan(.5))<1e-4,"Adaptación posterior a rasante");
assert.equal(groundSamples,240,"Sin consultas adicionales de terreno");
slope=0;for(let i=0;i<120;i++)tick();
assert(Math.abs(ctx.current.root.rotation.x)<1e-4,"Al volver al plano se nivela");
assert.equal(groundSamples,480);
assert.equal(stepCalls,240);
// Para coches, conservar la fórmula de cabeceo instantáneo preexistente.
const car=fixture(false);ctx.current=car;slope=.2;tick();
assert(Math.abs(car.root.rotation.x-Math.atan(.2))<1e-12,"Sin modificaciones para coches");
// Cuando se monta otra moto, el filtro comienza en la nueva pendiente.
const next=fixture(true);next.slopePitch40=NaN;ctx.current=next;slope=-.1;tick();
assert(Math.abs(next.root.rotation.x+Math.atan(.1))<1e-12,"Sin arrastre al montar otra moto");
assert.equal(groundSamples,484);
console.log("MOTORCYCLE_GROUND_GRADE_OK "+JSON.stringify({steps:242,groundSamples,ratio:2,bikeSmooth:true,noExtraTerrainSamples:true,carLegacy:true,remountReset:true}));

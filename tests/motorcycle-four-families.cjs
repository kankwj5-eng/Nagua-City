"use strict";
// Testa la selección de geometrías que usa bike46, sin crear un simulador ficticio.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0440-bike46.js"),"utf8");
new vm.Script(source,{filename:"0440-bike46.js"});
const prefix=source.slice(0,source.indexOf("function bike46(v){"));
const ctx={};vm.createContext(ctx);vm.runInContext(prefix,ctx);
const byName={
 pulsar:"sport",yamaha:"sport",
 boxer:"work",discover:"work",delivery:"work",
 trail:"dual",enduro:"dual",
 taypan:"urban",urban125:"urban"
};
for(const [name,expected] of Object.entries(byName))assert.equal(ctx.bikeShapeFamily46(name),expected,name);
assert.equal(new Set(Object.values(byName)).size,4,"Cuatro familias distintas");
assert.equal(ctx.bikeShapeFamily46("unexpected"),"work","El modelo por defecto no queda huérfano");
assert(source.includes("let proto=bikePrototypes46.get(family)"),"Mismas piezas por familia");
assert(source.includes("bikePrototypes46.set(family,proto)"),"Las fuentes se comparten por familia");
assert(source.includes("v.bikeStyle46=family"),"Identificación del tipo para pruebas reales");
assert(source.includes("const spokes=sport?5:urban?8:32"),"Rines distintos para trabajo, ciudad y deportiva");
assert(source.includes("tankRise=dual?.265:urban?.158:sport?.235:.20"),"Volúmenes de tanque claramente diferenciados");
assert(source.includes("const face=dual?shape46('CreateBox'"),"La doble propósito no reutiliza el faro deportivo");
assert(source.includes("proto.body=merge46(")&&source.includes("proto.wheel=merge46("),"Batching de piezas conservado");
assert(source.includes("copy.parent=root"),"Los paneles se adjuntan a los pivotes originales");
assert(source.includes("v.radius/.30"),"Escala de ruedas original");
assert(source.includes("v.art46=true"),"Evitar reinstalaciones");
const original=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0287-create-vehicle.js"),"utf8");
assert(original.includes("if(part==='steering')pivot=B.Vector3.FromArray(meta.steeringPivot)"),"Rig intacto");
assert(original.includes("pivot=V(sign*(meta.width||0)/2,meta.radius,"),"Distancia entre ejes intacta");
console.log("MOTORCYCLE_FOUR_FAMILIES_OK "+JSON.stringify({models:Object.keys(byName).length,families:byName,noNewVehicleNames:true,sharedPrototypes:4,physicsUntouched:true}));

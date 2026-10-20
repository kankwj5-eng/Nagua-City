"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const former=read("game/src/vehicles/0440-bike46.js");
const real=read("game/src/vehicles/0286a-original-v4-runtime.js");
const make=read("game/src/vehicles/0287-create-vehicle.js");
const animate=read("game/src/vehicles/0361-apply-player-wheels13.js");
const context={};vm.createContext(context);vm.runInContext(former+";this.retired={bike46,bikeSilhouette46}",context);
for(const oldName of ["boxer","discover","trail","delivery","yamaha","urban125","enduro"]){
 assert(!real.includes('"'+oldName+'"'),"No old motorcycle names in replacement fleet: "+oldName);
}
assert(real.includes('"pulsar"')&&real.includes('"taypan"'),"Exactly the two new motorcycle models");
assert(make.includes("originalV4.makeCar("),"Only actual GLB vehicles are instantiated");
assert(animate.includes("originalV4.animateWheels("),"Steering and wheel clips are driven by GLB");
assert(!/clone\(|createInstance\(|CreateCylinder\(|CreateSphere\(/.test(former),"Do not fabricate obsolete geometry");
const v={};context.retired.bike46(v);assert.equal(v.art46,undefined,"Old bike finisher must not alter V4");
assert.deepEqual(Array.from(context.retired.bikeSilhouette46("pulsar")),[1,1,1]);
console.log("MOTORCYCLE_V4_ONLY_OK "+JSON.stringify({models:["pulsar","taypan"],formerModels:0,formerExtraMeshes:0,wheels:"GLB animated"}));

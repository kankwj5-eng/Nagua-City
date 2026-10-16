"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const code=fs.readFileSync(path.resolve(__dirname,"../game/src/vehicles/0359-update-fleet.js"),"utf8");
const position=x=>({x,y:0,z:0});
const flags=[],part={setEnabled:v=>flags.push(v)},low={setEnabled(v){this.enabled=v;}};
const v={root:{position:position(0),setEnabled(v){this.enabled=v;}},traffic:true,garage:false,retired28:false,parts:{body:part,steering:part,wheel_front:part},low,heading:0,contact:{}};
const current={root:{position:position(300)}},player={root:{position:position(0)}};
const context={fleet:[v],current,player,homeMode:false,homeGarage:false,driving:false,quality:"medium",
 B:{Vector3:{DistanceSquared:(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2}},
 V:(x,y,z)=>({x,y,z}),visibleVehicle28:()=>true,placeContact(){}};
vm.createContext(context);vm.runInContext(code,context);
const frame=(d)=>{v.root.position.x=d;context.updateFleet(0);const state=v.detailLOD49;assert.equal(v.low.enabled,!state);return state;};
assert.equal(frame(44),true,"Initial detailed vehicle inside 45m");
for(const distance of [44.8,45.2,46.9,45.1,47.9,44.1])assert.equal(frame(distance),true,"Do not blink at LOD boundary");
assert.equal(frame(49.1),false,"Switch to distant representation above 49m");
for(const distance of [48,46,45,44,42])assert.equal(frame(distance),false,"Stay distant while approaching boundary");
assert.equal(frame(40.9),true,"Return to detailed below 41m");
for(const [quality,threshold] of [["low",30],["medium",45],["high",60]]){
 context.quality=quality;v.detailLOD49=undefined;
 assert.equal(frame(threshold-1),true);
 assert.equal(frame(threshold+3),true);
 assert.equal(frame(threshold+5),false);
 assert.equal(frame(threshold-3),false);
 assert.equal(frame(threshold-5),true);
}
context.current=v;context.quality="low";
assert.equal(frame(500),true,"Current motorcycle/car must never swap to distant mesh");
console.log("VEHICLE_LOD_HYSTERESIS_OK "+JSON.stringify({thresholds:[30,45,60],marginMeters:4,checks:26,preservedCurrentVehicle:true}));

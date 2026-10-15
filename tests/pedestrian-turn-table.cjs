"use strict";
/** 10,000 steering candidates: precomputed turn trigonometry vs original math. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../game/src/characters/0126-update-people25.js"),"utf8");
const ctx={};vm.createContext(ctx);
vm.runInContext(source+"\nthis.__turns={odd:pedestrianTurnOptions25Odd,even:pedestrianTurnOptions25Even};",ctx);
assert(!source.includes("Math.cos(angle)"),"Runtime recomputes each candidate trig");
assert(!source.includes("Math.sin(angle)"),"Runtime recomputes each candidate trig");
assert(source.includes("for(const turn of (p.index%2?pedestrianTurnOptions25Odd:pedestrianTurnOptions25Even))"),"NPC loop must consume cached table");
const turns=ctx.__turns;
for(const [parity,actual] of [["odd",turns.odd],["even",turns.even]]){
 const ordered=parity==="odd"?[0,.36,-.36,.75,-.75]:[0,-.36,.36,.75,-.75];
 assert.equal(actual.length,5);
 for(let j=0;j<5;j++){
  assert(Math.abs(actual[j][0]-Math.cos(ordered[j]))<2e-16);
  assert(Math.abs(actual[j][1]-Math.sin(ordered[j]))<2e-16);
 }
}
let n=0;
for(let i=0;i<1000;i++){
 const radians=i*.0171,dx=Math.cos(radians)*(i%7+1),dz=Math.sin(radians)*(i%5+1);
 for(const [parity,turnList] of [["odd",turns.odd],["even",turns.even]]){
  const angles=parity==="odd"?[0,.36,-.36,.75,-.75]:[0,-.36,.36,.75,-.75];
  for(let j=0;j<5;j++){
   const angle=angles[j],cached=turnList[j];
   const oldX=dx*Math.cos(angle)-dz*Math.sin(angle);
   const oldZ=dx*Math.sin(angle)+dz*Math.cos(angle);
   const x=dx*cached[0]-dz*cached[1],z=dx*cached[1]+dz*cached[0];
   assert(Math.abs(x-oldX)<1e-12&&Math.abs(z-oldZ)<1e-12,
    "Steering candidate changed at "+i+" "+parity+" "+j);
   n++;
  }
 }
}
console.log("PEDESTRIAN_TURN_TABLE_OK "+JSON.stringify({candidates:n,choicesPerPedestrian:5,anglesUnchanged:true,tableReuse:true,perFrameTrigCalls:0}));

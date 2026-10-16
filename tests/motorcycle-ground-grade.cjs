"use strict";
/* Verifica el código real del pitch del terreno y su costo de muestreo. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/engine/0445-install46.js"),"utf8");
let samples=0,baseCalls=0;
let terrain=(x,z)=>-z*.11;
const bike={bike:true,art46:true,wheelbase:1.4,parts:{body:{rotation:{x:0}}},root:{position:{x:0,z:0}}};
const ctx={Math,Number,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),groundAt(x,z){samples++;return terrain(x,z);},
 state:{motoPitch46:.012,heading:0,motoPitchVelocity46:0},gameplayTime:0,
 current:bike,driving:true,resetInertia30(){},suspension40(){baseCalls++;}};
vm.createContext(ctx);
vm.runInContext(source,ctx);
const f=ctx.bikeTerrainTarget46;
assert.equal(f(0,0,0,1.4,()=>.5),0,"Flat ground remains neutral");
assert(Math.abs(f(0,0,0,1.4,(x,z)=>-z*.08)-Math.atan(.08))<1e-12);
assert(Math.abs(f(0,0,Math.PI,1.4,(x,z)=>-z*.08)+Math.atan(.08))<1e-12);
assert(Math.abs(f(0,0,-Math.PI/2,1.4,(x,z)=>x*.07)-Math.atan(.07))<1e-12);
assert.equal(f(0,0,0,1.4,()=>NaN),0,"Invalid terrain must not deform a bike");
assert.equal(f(0,0,0,1.4,(x,z)=>-z*100),.085,"Steep slope must be bounded");
const start=source.indexOf("const resetInertia=resetInertia30;");
const wrap=source.indexOf("const suspend=suspension40;",start);
const end=source.indexOf("\n}",wrap);
assert(start>=0&&wrap>start&&end>wrap,"Production wrappers missing");
vm.runInContext(source.slice(start,end),ctx);
for(let i=0;i<120;i++){ctx.gameplayTime=i/60;ctx.suspension40(bike);}
assert.equal(baseCalls,120,"Prior suspension logic must still run");
assert(samples>0&&samples<=42,"Ground sampling should be throttled around 10 Hz");
assert(Number.isFinite(bike.parts.body.rotation.x));
assert(bike.slopePitch46>0&&bike.slopePitch46<=.085);
assert(Math.abs(bike.parts.body.rotation.x-(.012+bike.slopePitch46))<1e-12);
const uphill=bike.slopePitch46;
terrain=()=>0;
for(let i=120;i<240;i++){ctx.gameplayTime=i/60;ctx.suspension40(bike);}
assert(Math.abs(bike.slopePitch46)<.001,"Grade should relax toward flat ground");
assert(bike.slopePitch46<uphill);
ctx.resetInertia30();
assert.equal(bike.slopePitch46,0);
assert(Number.isNaN(bike.slopeAt46),"Remounting refreshes terrain grade");
assert.equal(bike.parts.body.rotation.x,0);
console.log("MOTORCYCLE_GROUND_GRADE_OK "+JSON.stringify({steps:240,groundSamples:samples,baseSuspensionCalls:baseCalls,clampRad:.085,gradeReset:true,noNewGeometry:true}));

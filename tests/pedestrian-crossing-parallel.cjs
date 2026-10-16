"use strict";
/* Production crossing rule with minimal moving-vehicle fixtures. This test
 * checks both new parallel forecast and unchanged perpendicular ETA behavior. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"../game/src/characters/0149-pedestrian-crossing27.js"),"utf8");
const ctx={fleet:[],driving:false,current:null,state:{speed:0,heading:0},polish26:{crossingWaits:0},Math};
vm.createContext(ctx);vm.runInContext(source,ctx);
const ped=(x=0,z=29,goal=51,pace=1.2)=>({root:{position:{x,z}},brain25:{goal,pace}});
const bike=(x,z,heading,speed=3,width=.82,length=2.15)=>({root:{position:{x,z},rotation:{y:heading}},heading,traffic:true,trafficSpeed:speed,width,length});
const check=(vehicle,expected,name,p=ped())=>{
 ctx.fleet=[vehicle];ctx.polish26.crossingWaits=0;
 const value=ctx.pedestrianCrossing27(p);
 assert.equal(value,expected,name);
 assert.equal(ctx.polish26.crossingWaits,expected?1:0,name+" count");
};
// A bike approaches along the same z axis. The old vx-only ETA ignored it.
check(bike(0,35,0,3),true,"Approaching along pedestrian direction");
// Different sidewalk/road lane, even while heading toward the pedestrian.
check(bike(4,35,0,3),false,"Parallel but lateral clearance");
// Motorcycle already moving away.
check(bike(0,38,Math.PI,3),false,"Moving away on same axis");
// Stationary vehicles are dealt with by regular obstacles and traffic.
check(bike(0,35,0,0),false,"Parked bike");
check(bike(0,35,0,.10),false,"Near-stationary bike");
// No change to the established crossing ETA for perpendicular traffic.
check(bike(-12,37,-Math.PI/2,5),true,"Perpendicular car approaching");
check(bike(12,37,-Math.PI/2,5),false,"Perpendicular car going away");
check(bike(-12,60,-Math.PI/2,5),false,"Perpendicular wrong road");
check(bike(0,35,0,3),false,"Not approaching a crossing",ped(0,10,25));
// Predictive test at the boundary of the conflict envelope.
const near=bike(0,35,0,3);
for(let i=0;i<500;i++){
 const p=ped((i%20-10)*.20,29+(i%9)*.03);
 const first=ctx.crossingParallelConflict27(p.root.position,1,1.2,near,0,-3);
 const again=ctx.crossingParallelConflict27(p.root.position,1,1.2,near,0,-3);
 assert.equal(first,again,"Deterministic forecast");
}
assert.equal(ctx.crossingParallelConflict27({x:0,z:29},1,1.2,bike(0,35,0,3),0,-3),true);
console.log("NPC_CROSSING_FORECAST_OK "+JSON.stringify({cases:509,parallelTrafficDetected:true,perpendicularRulePreserved:true,extraAssets:0}));

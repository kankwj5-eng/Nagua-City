"use strict";
/* Run the *actual* pedestrian update with a minimal predictable scene,
 * verifying braking animation and position remain consistent. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/characters/0126-update-people25.js"),"utf8");
const dt=1/60,position={x:0,y:0,z:0},rotation={y:-Math.PI};
const p={
 index:1,downUntil:0,fleeUntil:0,speed:1.5,direction:1,path:{min:-40,max:40},
 root:{position,rotation,setEnabled(v){this.enabled=v;},isEnabled(){return this.enabled;}},
 contact:{setEnabled(){}},nearMeshes:[],lodMeshes:[],
 brain25:{wait:0,lane:0,goal:20,pace:1.3,stuck:0,patience:3,animation:0}
};
function V(x,y,z){return {x,y,z,length(){return Math.hypot(this.x,this.y,this.z);},normalize(){const length=this.length();if(length){this.x/=length;this.y/=length;this.z/=length;}return this;},clone(){return V(this.x,this.y,this.z);}};}
let waits=true,animationCalls=0,updates=0;
const ctx={
 playing:true,driving:false,current:null,player:{root:{position:{x:40,y:0,z:40}}},
 pedestrians:[p],stage39:{pool:[]},simulation25:{spatial:{build(){return this;},near(){return [];}}},
 quality:"high",gameplayTime:0,B:{Vector3:{DistanceSquared(a,b){return (a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2;}}},
 V,Math,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),city:{actors:[]},
 pedestrianCrossing27(){return waits;},blocked(){return false;},
 slide(pos,dx,dz){pos.x+=dx;pos.z+=dz;},groundAt(){return 0;},
 walkPose(person,speed){assert.equal(person,p);assert(speed>=0);animationCalls++;},
 placeContact(){updates++;}
};
vm.createContext(ctx);vm.runInContext(source,ctx);
ctx.updatePeople25(dt);
const expected=1.5*Math.exp(-dt*7);
assert(Math.abs(p.speed-expected)<1e-12,"Immediate crossing stop must use the existing smooth deceleration");
assert(p.speed>0&&p.speed<1.5);
assert.equal(p.brain25.state,"crossing-wait");
for(let frame=1;frame<60;frame++)ctx.updatePeople25(dt);
assert(p.speed<.01,"Approaching traffic should bring the pedestrian to a halt");
assert(position.z<.3,"Braking distance before the crossing must stay short");
assert(position.z>0,"The pedestrian should not visibly snap in place");
const stopped=position.z;
waits=false;
for(let frame=0;frame<90;frame++)ctx.updatePeople25(dt);
assert(p.speed>1,"After traffic clears, pedestrian resumes walking");
assert(position.z>stopped,"Pedestrian starts moving again");
// At 56 m, this game intentionally samples animation about every .08 s.
assert(animationCalls>=25&&animationCalls<=31,"Distance LOD must remain enabled");
assert.equal(updates,150);
console.log("PEDESTRIAN_SMOOTH_STOP_OK "+JSON.stringify({frames:150,stopDistanceMeters:stopped,initialStepMps:expected,restarted:true,noVelocitySnap:true}));

"use strict";
/* Pedestrian movement: distance travelled must stay equivalent without
 * allocating one Babylon Vector3 clone per NPC on every simulation step. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const script=fs.readFileSync(path.resolve(__dirname,"../game/src/characters/0126-update-people25.js"),"utf8");
assert(script.includes("const beforeX=p.root.position.x,beforeY=p.root.position.y,beforeZ=p.root.position.z"),"position snapshot must be scalar");
assert(script.includes("Math.hypot(p.root.position.x-beforeX,p.root.position.y-beforeY,p.root.position.z-beforeZ)/dt"),"expected distance expression missing");
assert(!script.includes("const before=p.root.position.clone()"),"legacy per-frame position clone reappeared");
function check(before,after,dt) {
 const dx=after.x-before.x,dy=after.y-before.y,dz=after.z-before.z;
 const reference=Math.sqrt(dx*dx+dy*dy+dz*dz)/dt;
 const updated=Math.hypot(dx,dy,dz)/dt;
 assert(Number.isFinite(updated));
 assert(Math.abs(reference-updated)<=1e-12*Math.max(1,reference),"movement animation distance changed");
}
let count=0;
for(const delta of [0,1/60,1/30,.08,.2,10]){
 for(const scale of [.001,.1,1,20,100]){
  for(let i=0;i<200;i++){
   const x=-200+i*.071,z=200-i*.037,y=i%3*.003;
   const before={x,y,z},after={x:x+delta*scale*Math.sin(i*.87),y:y+delta*.01*Math.cos(i),z:z+delta*scale*Math.cos(i*.72)};
   check(before,after,1/60);count++;
  }
 }
}
console.log("PEDESTRIAN_DISTANCE_OK "+JSON.stringify({cases:count,temporaryVectorClone:false}));

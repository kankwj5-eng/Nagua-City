"use strict";
/* Real updateEquipmentPose source, mocked rig. Verifies cached references
 * produce the same poses and rebuild after a discarded skeleton bone. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/characters/0331-update-equipment-pose.js"),"utf8");
function check(equipment) {
 const rotations=[],names=["upperarm_l","upperarm_r","lowerarm_r"];
 let nodes=names.map(name=>({name,rotationQuaternion:{multiplyInPlace:q=>rotations.push([name,q.angle])},isDisposed(){return !!this.disposed;}}));
 let searches=0,alignments=0;
 const person={root:{getDescendants(){searches++;return nodes;}}};
 const context={equipped:equipment,ammo:{rifle:{},pistol:{}},actionTimer:0,city:{state:{block:false}},expansion29:{combat:{lastHand:"r"}},B:{Quaternion:{RotationAxis(_,angle){return {angle};}}},V(){return{};},updateReload(){},alignHeldWeapon(){alignments++;},Math};
 vm.createContext(context);vm.runInContext(source,context);
 const run=()=>context.updateEquipmentPose(person,1/60);
 run();const initial=searches;const angleCount=rotations.length;
 run();assert.equal(searches,initial,equipment+": second pose must not search the skeleton again");
 assert.equal(rotations.length,angleCount*2,equipment+": pose output must remain equivalent");
 assert.deepEqual(rotations.slice(0,angleCount),rotations.slice(angleCount),equipment+": same input must produce same rotations");
 assert.equal(alignments,equipment==="hands"?0:2);
 // After a rig rebuild, cached bones may be disposed; find fresh references.
 if(equipment!=="hands") {
   nodes.forEach(n=>n.disposed=true);
   const replacement=names.map(name=>({name,rotationQuaternion:{multiplyInPlace:q=>rotations.push(["new-"+name,q.angle])},isDisposed(){return false;}}));
   nodes=replacement;
   run();
   assert(searches>initial,equipment+": disposed bones must not remain cached");
   assert(rotations.some(x=>x[0]==="new-upperarm_r"),"new rig should receive pose");
 }
 return {equipment,initialSearches:initial,repeatedSearches:0,rotationOperations:angleCount};
}
const rifle=check("rifle"),hands=check("hands");
console.log("CHARACTER_POSE_CACHE_OK "+JSON.stringify({rifle,hands}));

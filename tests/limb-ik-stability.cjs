"use strict";
/* Verify production limb IK against normal cases and the coincident/parallel
 * targets that previously collapsed the elbow or produced non-finite joints. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"../game/src/core/0300-limb-ik.js"),"utf8");
class Vector {
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
 add(o){return new Vector(this.x+o.x,this.y+o.y,this.z+o.z);}
 subtract(o){return new Vector(this.x-o.x,this.y-o.y,this.z-o.z);}
 scale(a){return new Vector(this.x*a,this.y*a,this.z*a);}
 lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z;}
 length(){return Math.sqrt(this.lengthSquared());}
 normalize(){const n=this.length();if(n>0){this.x/=n;this.y/=n;this.z/=n;}return this;}
 static Dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z;}
}
const V=(x=0,y=0,z=0)=>new Vector(x,y,z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ctx={B:{Vector3:Vector},V,clamp,Math};vm.createContext(ctx);
vm.runInContext(source,ctx);
const solver=ctx.limbIK;
const original=(start,target,l1,l2,bend)=>{
 const d=target.subtract(start),len=clamp(d.length(),.06,l1+l2-.002),dir=d.normalize(),orth=bend.subtract(dir.scale(Vector.Dot(bend,dir))).normalize(),along=(l1*l1-l2*l2+len*len)/(2*len),height=Math.sqrt(Math.max(0,l1*l1-along*along));
 return start.add(dir.scale(along)).add(orth.scale(height));
};
const distance=(a,b)=>a.subtract(b).length(),finite=p=>[p.x,p.y,p.z].every(Number.isFinite);
const l1=.29,l2=.29;
let ordinary=0,degenerate=0;
for(let i=0;i<5000;i++){
 const theta=i*.171,alpha=i*.089;
 const start=V(Math.sin(theta)*.7,.12+Math.cos(theta)*.13,Math.sin(alpha)*.4);
 const target=start.add(V(.08+Math.cos(theta)*.18,.09+Math.sin(alpha)*.12,.14+Math.sin(theta)*.2));
 const bend=V(Math.sin(alpha)*.26,-.8,Math.cos(alpha)*.36);
 const prev=original(start,target,l1,l2,bend),now=solver(start,target,l1,l2,bend);
 assert(finite(now));
 assert(distance(prev,now)<1e-10,"Ordinary poses must stay unchanged");
 ordinary++;
}
const cases=[
 [V(),V(),V(0,1,0)],
 [V(),V(0,.18,0),V(0,1,0)],
 [V(),V(0,-.18,0),V(0,1,0)],
 [V(),V(.22,0,0),V(-1,0,0)],
 [V(),V(.22,0,0),V(1,0,0)],
 [V(1,1,1),V(1+1e-12,1,1),V(1,0,0)],
 [V(),V(0,.21,0),V(0,1+1e-12,0)]
];
for(const [start,target,bend] of cases){
 const joint=solver(start,target,l1,l2,bend);
 assert(finite(joint),"IK returned a non-finite joint");
 assert(Math.abs(distance(start,joint)-l1)<1e-7,"Upper limb length changed");
 const dir=target.subtract(start);
 if(dir.length()>.06){
  const perpendicular=joint.subtract(start).subtract(dir.scale(Vector.Dot(joint.subtract(start),dir)/(dir.lengthSquared())));
  assert(perpendicular.length()>.02,"Elbow must not collapse when bend axis is parallel to target");
 }
 degenerate++;
}
console.log("LIMB_IK_STABILITY_OK "+JSON.stringify({ordinary,degenerate,sameNormalPoses:true,nonFiniteJoints:0,collapsedElbows:0}));

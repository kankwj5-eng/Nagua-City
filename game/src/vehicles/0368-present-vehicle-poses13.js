function presentVehiclePoses13(fleet,current,alpha,placeContact){
 const t=Math.max(0,Math.min(1,alpha)),angle=(a,b)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
 for(const v of fleet)if(trackedVehicle13(v,current)&&v.motion13){const {before:a,after:b}=v.motion13;
  if(v!==current){B.Vector3.LerpToRef(a.p,b.p,t,v.root.position);v.root.rotation.set(angle(a.r.x,b.r.x),angle(a.r.y,b.r.y),angle(a.r.z,b.r.z));}
  for(let i=0;i<a.parts.length;i++){const first=a.parts[i],last=b.parts[i];first.node.rotation.set(first.r.x+(last.r.x-first.r.x)*t,angle(first.r.y,last.r.y),angle(first.r.z,last.r.z));}
  placeContact(v.contact,v.root.position,v.root.rotation.y,v.root.isEnabled(),!!v.overpass50);
 }
}

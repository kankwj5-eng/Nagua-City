// Ackermann geometry follows the existing wheel pivots. Steering input >0 means right.
function wheelAngles13(v,steer){
 const a=Math.abs(steer),sign=Math.sign(steer),length=v.wheelbase||2.65,track=v.width||1.7;
 if(a<1e-8)return {left:0,right:0};
 const radius=length/Math.tan(a),inner=Math.atan2(length,Math.max(.05,radius-track/2)),outer=Math.atan2(length,radius+track/2);
 return steer>0?{left:-outer,right:-inner}:{left:inner,right:outer};
}
function applyPlayerWheels13(v,s,dt){
 v.spin-=s.speed*dt/v.radius;const angles=wheelAngles13(v,s.steer);
 for(const [key,part] of Object.entries(v.parts))if(key.startsWith('wheel')){part.rotation.x=v.spin;if(!v.bike&&!v.name.startsWith('caponera')&&key.includes('front'))part.rotation.y=key.endsWith('_L')?angles.left:angles.right;}
 if(v.bike||v.name.startsWith('caponera'))v.parts.steering.rotation.y=-s.steer;
}
function vehicleSnapshot13(v){return {p:v.root.position.clone(),r:v.root.rotation.clone(),parts:Object.values(v.parts).map(node=>({node,r:node.rotation.clone()}))};}
function readSnapshot13(v,s){s.p.copyFrom(v.root.position);s.r.copyFrom(v.root.rotation);for(const part of s.parts)part.r.copyFrom(part.node.rotation);}
function trackedVehicle13(v,current){return v===current||v.traffic&&!v.retired28;}
function beginVehiclePoses13(fleet,current){for(const v of fleet)if(trackedVehicle13(v,current)){if(!v.motion13)v.motion13={before:vehicleSnapshot13(v),after:vehicleSnapshot13(v)};readSnapshot13(v,v.motion13.before);}}
function endVehiclePoses13(fleet,current){for(const v of fleet)if(trackedVehicle13(v,current)&&v.motion13){const h=v.motion13;readSnapshot13(v,h.after);if(B.Vector3.DistanceSquared(h.before.p,h.after.p)>16){h.before.p.copyFrom(h.after.p);h.before.r.copyFrom(h.after.r);for(let i=0;i<h.before.parts.length;i++)h.before.parts[i].r.copyFrom(h.after.parts[i].r);}}}
function restoreVehiclePoses13(fleet,current){for(const v of fleet)if(trackedVehicle13(v,current)&&v.motion13){const s=v.motion13.after;if(v!==current){v.root.position.copyFrom(s.p);v.root.rotation.copyFrom(s.r);}for(const part of s.parts)part.node.rotation.copyFrom(part.r);}}
function presentVehiclePoses13(fleet,current,alpha,placeContact){
 const t=Math.max(0,Math.min(1,alpha)),angle=(a,b)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
 for(const v of fleet)if(trackedVehicle13(v,current)&&v.motion13){const {before:a,after:b}=v.motion13;
  if(v!==current){B.Vector3.LerpToRef(a.p,b.p,t,v.root.position);v.root.rotation.set(angle(a.r.x,b.r.x),angle(a.r.y,b.r.y),angle(a.r.z,b.r.z));}
  for(let i=0;i<a.parts.length;i++){const first=a.parts[i],last=b.parts[i];first.node.rotation.set(first.r.x+(last.r.x-first.r.x)*t,angle(first.r.y,last.r.y),angle(first.r.z,last.r.z));}
  placeContact(v.contact,v.root.position,v.root.rotation.y,v.root.isEnabled());
 }
}
function stepFleet13(dt){
 manageTraffic28(dt);updateTrafficSignals23(dt);
 for(const v of fleet){if(v===current&&driving||v.retired28||v.garage&&v!==current)continue;if(v.traffic&&dt>0)stepTraffic29(v,dt);const ground10=groundAt(v.root.position.x,v.root.position.z);if(!Object.is(v.root.position.y,ground10))v.root.position.y=ground10;}
}

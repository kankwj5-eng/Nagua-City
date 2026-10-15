function samplePacked45(tr,frame,blend){
 const keys=tr.keys,q=tr.property==='rotationQuaternion';
 if(!tr.packedScratch45)tr.packedScratch45=q?[new B.Quaternion(),new B.Quaternion(),new B.Quaternion()]:[V(),V(),V()];
 const [a,b,value]=tr.packedScratch45,lo=clamp(Math.floor(frame),0,Math.max(0,keys.length-2)),hi=Math.min(lo+1,keys.length-1),t=hi===lo?0:clamp((frame-lo)/(hi-lo),0,1),d=keys.packed45,s=keys.stride,l=keys.constant45?0:lo*s,h=keys.constant45?0:hi*s;
 // Keep the engine's interpolation even for constant, slightly non-unit quaternions.
 if(q){a.set(d[l],d[l+1],d[l+2],d[l+3]);b.set(d[h],d[h+1],d[h+2],d[h+3]);B.Quaternion.SlerpToRef(a,b,t,value);if(blend<1&&tr.target.rotationQuaternion)B.Quaternion.SlerpToRef(tr.target.rotationQuaternion,value,blend,value);}
 else{a.set(d[l],d[l+1],d[l+2]);b.set(d[h],d[h+1],d[h+2]);B.Vector3.LerpToRef(a,b,t,value);if(blend<1)B.Vector3.LerpToRef(tr.target[tr.property],value,blend,value);}
 tr.target[tr.property].copyFrom(value);
}

// Block 05: intern immutable geometry by exact buffer bytes, never by shape alone.

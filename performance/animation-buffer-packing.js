// Block 01: retain every keyframe's timing and Float64 precision.
// The pool lives only while one animation library is being prepared.
function packKeys45(values,kind,pool){
 const stride=kind==='rotation'?4:3,length=values.length;
 let constant=length>0;
 for(let frame=1;constant&&frame<length;frame++)for(let axis=0;axis<stride;axis++)if(!Object.is(values[frame][axis],values[0][axis])){constant=false;break;}
 let data;
 if(constant){
  const first=new Float64Array(stride);for(let axis=0;axis<stride;axis++)first[axis]=values[0][axis];
  // Bitwise key preserves signed zero and never merges nearby float values.
  const key=kind+'|'+Array.from(new Uint32Array(first.buffer)).join(',');
  data=pool?.get(key)||first;if(pool&&!pool.has(key))pool.set(key,data);
 }else{
  data=new Float64Array(length*stride);
  for(let frame=0;frame<length;frame++)for(let axis=0;axis<stride;axis++)data[frame*stride+axis]=values[frame][axis];
 }
 return {length,stride,packed45:data,constant45:constant};
}
function samplePacked45(tr,frame,blend){
 const keys=tr.keys,q=tr.property==='rotationQuaternion';
 if(!tr.packedScratch45)tr.packedScratch45=q?[new B.Quaternion(),new B.Quaternion(),new B.Quaternion()]:[V(),V(),V()];
 const [a,b,value]=tr.packedScratch45,lo=clamp(Math.floor(frame),0,Math.max(0,keys.length-2)),hi=Math.min(lo+1,keys.length-1),t=hi===lo?0:clamp((frame-lo)/(hi-lo),0,1),d=keys.packed45,s=keys.stride,l=keys.constant45?0:lo*s,h=keys.constant45?0:hi*s;
 // Keep the engine's interpolation even for constant, slightly non-unit quaternions.
 if(q){a.set(d[l],d[l+1],d[l+2],d[l+3]);b.set(d[h],d[h+1],d[h+2],d[h+3]);B.Quaternion.SlerpToRef(a,b,t,value);if(blend<1&&tr.target.rotationQuaternion)B.Quaternion.SlerpToRef(tr.target.rotationQuaternion,value,blend,value);}
 else{a.set(d[l],d[l+1],d[l+2]);b.set(d[h],d[h+1],d[h+2]);B.Vector3.LerpToRef(a,b,t,value);if(blend<1)B.Vector3.LerpToRef(tr.target[tr.property],value,blend,value);}
 tr.target[tr.property].copyFrom(value);
}

function sampleHuman39(p,name,phase,blend=1){
 const clip=p.clips[name];if(!clip)return;const frame=clip.from+(clip.to-clip.from)*clamp(phase,0,1);
 for(const tr of clip.tracks){const keys=tr.keys;if(!keys.length)continue;if(keys.packed45){samplePacked45(tr,frame,blend);continue;}
  if(tr.fast39===undefined){tr.fast39=keys.length===clip.to-clip.from+1&&keys.every((k,i)=>k.frame===clip.from+i);tr.scratch39=tr.property==='rotationQuaternion'?new B.Quaternion():V();stage39.interpolation.scratchTracks++;if(tr.fast39)stage39.interpolation.directTracks++;}
  let lo=0,hi=keys.length-1;
  if(tr.fast39){lo=clamp(Math.floor(frame-clip.from),0,Math.max(0,keys.length-2));hi=Math.min(lo+1,keys.length-1);}else while(lo+1<hi){const mid=(lo+hi)>>1;if(keys[mid].frame<=frame)lo=mid;else hi=mid;}
  const a=keys[lo],b=keys[hi],t=b.frame===a.frame?0:clamp((frame-a.frame)/(b.frame-a.frame),0,1),val=tr.scratch39;
  if(tr.property==='rotationQuaternion'){B.Quaternion.SlerpToRef(a.value,b.value,t,val);if(blend<1&&tr.target.rotationQuaternion)B.Quaternion.SlerpToRef(tr.target.rotationQuaternion,val,blend,val);}else{B.Vector3.LerpToRef(a.value,b.value,t,val);if(blend<1)B.Vector3.LerpToRef(tr.target[tr.property],val,blend,val);}
  tr.target[tr.property].copyFrom(val);
 }
}

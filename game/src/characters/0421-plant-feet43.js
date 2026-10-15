function plantFeet43(p,walk,run){
 if(p.far||walk<.2||p.hero&&vertical!==0||!stage41.settings.feet)return;const g=p.graph43,rig=cacheRig41(p);g.feet=g.feet||[{},{}];
 const name=run>.5?'Run':'Walk',curve=p.foot43?.[name];if(!curve)return;const frame=p.phase*(curve.length-1),lo=Math.floor(frame),hi=Math.min(lo+1,curve.length-1),f=frame-lo;
 for(let side=0;side<2;side++){const suffix=side?'r':'l',upper=rig.nodes.get('thigh_'+suffix),lower=rig.nodes.get('calf_'+suffix),foot=rig.nodes.get('foot_'+suffix);if(!upper||!lower||!foot)continue;
  p.root.computeWorldMatrix(true);upper.computeWorldMatrix(true);lower.computeWorldMatrix(true);foot.computeWorldMatrix(true);const a=upper.getAbsolutePosition().clone(),b=lower.getAbsolutePosition().clone(),c=foot.getAbsolutePosition().clone(),restY=curve[lo][side][1]*(1-f)+curve[hi][side][1]*f,contact=restY-p.footMin43[name][side]<.038;
  const lock=g.feet[side];if(!contact||Math.abs(g.turn)>.85){lock.point=null;continue;}if(!lock.point||B.Vector3.Distance(lock.point,c)>.24)lock.point=c.clone();
  const target=c.clone(),dx=lock.point.x-c.x,dz=lock.point.z-c.z,len=Math.hypot(dx,dz),limit=.16,k=len>limit?limit/len:1;target.x+=dx*k*walk;target.z+=dz*k*walk;target.y+=clamp(groundAt(target.x,target.z)-groundAt(p.root.position.x,p.root.position.z),-.10,.14);
  if(B.Vector3.DistanceSquared(target,c)<.000004)continue;const scale=V(),q=new B.Quaternion(),position=V();foot.getWorldMatrix().decompose(scale,q,position);const forward=V(-Math.sin(p.root.rotation.y),0,-Math.cos(p.root.rotation.y));const knee=limbIK(a,target,B.Vector3.Distance(a,b),B.Vector3.Distance(b,c),forward.add(V(side?.025:-.025,-.15,0)));
  rotateWorld41(upper,b.subtract(a),knee.subtract(a));lower.computeWorldMatrix(true);foot.computeWorldMatrix(true);const d=lower.getAbsolutePosition().clone(),e=foot.getAbsolutePosition().clone();rotateWorld41(lower,e.subtract(d),target.subtract(d));lower.computeWorldMatrix(true);const parentQ=new B.Quaternion();lower.getWorldMatrix().decompose(scale,parentQ,position);foot.rotationQuaternion=parentQ.conjugate().multiply(q).normalize();actors43.footCorrections++;
 }
}


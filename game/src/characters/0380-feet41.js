function feet41(p,walk,run){
 if(!stage41.settings.feet||p.far||!walk||p.hero&&vertical!==0)return;
 const rig=cacheRig41(p),center=groundAt(p.root.position.x,p.root.position.z);
 for(const side of ['l','r']){
  const upper=rig.nodes.get('thigh_'+side),lower=rig.nodes.get('calf_'+side),foot=rig.nodes.get('foot_'+side);
  if(!upper||!lower||!foot)continue;
  p.root.computeWorldMatrix(true);upper.computeWorldMatrix(true);lower.computeWorldMatrix(true);foot.computeWorldMatrix(true);
  const a=upper.getAbsolutePosition().clone(),b=lower.getAbsolutePosition().clone(),c=foot.getAbsolutePosition().clone();
  const terrain=clamp(groundAt(c.x,c.z)-center,-.12,.16),phase=(p.phase+(side==='r'?.5:0))%1;
  const stance=1-smoothstep41(.42,.62,phase);const correction=terrain*stance*walk*(1-run*.6);
  if(Math.abs(correction)<.002)continue;
  const target=c.add(V(0,correction,0)),forward=V(-Math.sin(p.root.rotation.y),0,-Math.cos(p.root.rotation.y));
  const knee=limbIK(a,target,B.Vector3.Distance(a,b),B.Vector3.Distance(b,c),forward.scale(.7).add(V(0,-.2,0)));
  rotateWorld41(upper,b.subtract(a),knee.subtract(a));lower.computeWorldMatrix(true);foot.computeWorldMatrix(true);
  const d=lower.getAbsolutePosition().clone(),e=foot.getAbsolutePosition().clone();rotateWorld41(lower,e.subtract(d),target.subtract(d));stage41.footCorrections++;
 }
}

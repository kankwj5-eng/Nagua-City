function hands43(p,dt){
 updateReload();actionTimer=Math.max(0,actionTimer-dt);const gun=equipped==='pistol'||equipped==='rifle';
 if(equipped==='hands'){
  if(city.state.block){sampleLayer43(p,'Block',.4,1,true);return;}
  if(actionTimer>0){const phase=clamp(1-actionTimer/.5,0,1),name=expansion29.combat.lastHand==='l'?'PunchL':'PunchR';sampleLayer43(p,name,phase,1,true);const strike=stage38.strike;if(strike&&!strike.hit&&phase>=.4){strike.hit=true;const dir=V(-Math.sin(p.root.rotation.y),0,-Math.cos(p.root.rotation.y));cityHitActor(p.root.position,dir,false,1.25,25);stage38.hitEvents++;}}
  return;
 }
 if(gun){
  if(reloadWeapon){const duration=reloadWeapon==='pistol'?1.25:1.65,phase=clamp(1-(reloadUntil-gameplayTime)/duration,0,1);sampleLayer43(p,'Reload',phase,1,true);alignHeldWeapon(p);return;}
  const aiming=!!expansion29.combat.aim;sampleLayer43(p,aiming?'PistolAim':'PistolIdle',aiming?.6:(p.graph43.elapsed/1.65)%1,aiming?1:.88,true);
  if(time-lastAction<.19){const phase=clamp((time-lastAction)/.19,0,1);sampleLayer43(p,'PistolShoot',phase,.58,true);}
  // Solve against the actual grip and support locations, after sampling the animation.
  const forward=V(-Math.sin(p.root.rotation.y),0,-Math.cos(p.root.rotation.y)),right=V(Math.cos(p.root.rotation.y),0,-Math.sin(p.root.rotation.y)),height=p.bodyType?1.20:1.35;
  const target=p.root.position.add(V(0,height,0)).add(forward.scale(aiming?.50:.36)).add(right.scale(-.10));solveHand30(p,'r',target);alignHeldWeapon(p);
  if(p.equipment){p.equipment.computeWorldMatrix(true);const support=B.Vector3.TransformCoordinates(V(equipped==='rifle'?-.012:-.03,equipped==='rifle'?.043:-.025,equipped==='rifle'?-.27:.04),p.equipment.getWorldMatrix());solveHand30(p,'l',support);}
  return;
 }
 if(actionTimer>0){const phase=clamp(1-actionTimer/.38,0,1);sampleLayer43(p,equipped==='shovel'?'Shovel':'Bat',phase,.92,true);}
 else sampleLayer43(p,'Interact',.1,.28,true);
}

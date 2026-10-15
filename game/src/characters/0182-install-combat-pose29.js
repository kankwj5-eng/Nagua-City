function installCombatPose29(){
 const base=updateEquipmentPose;
 // Resolve a joint only when this combat action actually needs it. A cached
 // transform is discarded if a character skeleton is rebuilt.
 function combatBone29(p,name){
  const cache=p.combatBones29||(p.combatBones29=Object.create(null));
  const cached=cache[name];
  if(cached&&!cached.isDisposed())return cached;
  const joint=p.root.getDescendants().find(n=>n.name.endsWith(name));
  if(joint)cache[name]=joint;
  return joint;
 }
 updateEquipmentPose=function(p,dt){
  base(p,dt);
  if(city.state.block&&equipped==='hands'){
   const other=expansion29.combat.lastHand==='l'?'r':'l';
   const arm=combatBone29(p,'upperarm_'+other),lower=combatBone29(p,'lowerarm_'+other);
   if(arm?.rotationQuaternion)arm.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),-.82));
   if(lower?.rotationQuaternion)lower.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),-.58));
  }else if(equipped==='rifle'){
   const arm=combatBone29(p,'upperarm_l'),lower=combatBone29(p,'lowerarm_l');
   if(arm?.rotationQuaternion)arm.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),-.72));
   if(lower?.rotationQuaternion)lower.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),-.65));
  }
  if(equipped in ammo&&p.equipment?.rotationQuaternion&&actionTimer>0){
   const recoil=Math.sin(actionTimer/.38*Math.PI)*.10;
   p.equipment.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(1,0,0),-recoil));
  }
 };
}

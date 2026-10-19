// Pelea con las acciones que trae Mateo, sin interpolar huesos del rig eliminado.
function installCombat38(){
 const previous=updateEquipmentPose;
 updateEquipmentPose=function(person,dt){
  if(equipped!=='hands')return previous(person,dt);
  updateReload();
  actionTimer=Math.max(0,actionTimer-dt);
  if(city.state.block){
   originalV4.setClip(person,'Guard',true);
   return;
  }
  if(actionTimer>0){
   const progress=clamp(1-actionTimer/.50,0,1);
   const clip=expansion29.combat.lastHand==='l'?'Punch_L':'Punch_R';
   originalV4.seekClip(person,clip,progress);
   const strike=stage38.strike;
   if(strike&&!strike.hit&&progress>=.40){
    strike.hit=true;
    const dir=V(-Math.sin(person.root.rotation.y),0,-Math.cos(person.root.rotation.y));
    cityHitActor(person.root.position,dir,false,1.25,25);
    stage38.hitEvents++;
    startAudio();tone(100,40,.08,.07,'triangle');
   }
  }else originalV4.setClip(person,'Idle',true);
 };
 cityPunch=function(){
  if(!playing||driving||gameplayTime-(city.lastPunch||-10)<.55)return;
  if(!Combat29.strike(expansion29.combat,gameplayTime,'hands')){
   toast('Recuperá resistencia antes de golpear.');return;
  }
  city.lastPunch=gameplayTime;actionTimer=.50;lastAction=time;
  stage38.strike={start:gameplayTime,hit:false};
 };
}

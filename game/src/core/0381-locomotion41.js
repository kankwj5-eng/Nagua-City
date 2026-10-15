function locomotion41(p,speed,dt){
 p.helmet.setEnabled(false);p.animClock+=Math.min(dt,.1);if(p.far&&p.animClock<.08)return;dt=p.animClock;p.animClock=0;
 const rig=cacheRig41(p);p.gaitSpeed=smooth41(p.gaitSpeed||0,speed,speed>=(p.gaitSpeed||0)?10:15,dt);
 const walkTarget=smoothstep41(.025,.34,p.gaitSpeed),runTarget=smoothstep41(1.65,3.35,p.gaitSpeed);
 rig.walk=smooth41(rig.walk||0,walkTarget,12,dt);rig.run=smooth41(rig.run||0,runTarget,6,dt);
 const walk=rig.walk,run=rig.run,stride=GAIT.walkStride*(1-run)+GAIT.runStride*run;
 const pos=p.root.position;let distance=p.lastGaitPos?Math.hypot(pos.x-p.lastGaitPos.x,pos.z-p.lastGaitPos.z):speed*dt;
 if(distance>2){distance=0;rig.wasAir=false;rig.landing=0;}if(!p.lastGaitPos)p.lastGaitPos=pos.clone();else p.lastGaitPos.copyFrom(pos);
 p.phase=(p.phase+distance/(stride*p.root.scaling.y*(p.bodyType===1?.861:1)))%1;
 p.idlePhase=((p.idlePhase||0)+dt/3.8)%1;
 sampleHuman(p,'Idle',p.idlePhase,1);if(walk>.001)sampleHuman(p,'Walk',p.phase,walk);if(run>.001)sampleHuman(p,'Run',p.phase,run*walk);
 // Blend the complete pose against the last displayed pose, rather than a repeatedly mutated bone.
 const poseBlend=1-Math.exp(-dt*(p.far?18:26));
 for(const tr of rig.tracks){const value=tr.target[tr.property];if(tr.property==='rotationQuaternion')B.Quaternion.SlerpToRef(tr.value,value,poseBlend,value);else B.Vector3.LerpToRef(tr.value,value,poseBlend,value);tr.value.copyFrom(value);}
 const headingDelta=Math.atan2(Math.sin(p.root.rotation.y-rig.lastHeading),Math.cos(p.root.rotation.y-rig.lastHeading));rig.lastHeading=p.root.rotation.y;
 rig.turn=smooth41(rig.turn,clamp(headingDelta/Math.max(.001,dt),-3,3),8,dt);
 // Whole-body banking is modest; weapon aim keeps its existing hand IK.
 p.visual.rotation.z=clamp(-rig.turn*.013*walk,-.038,.038);p.visual.rotation.x=p.impact32>gameplayTime?Math.sin((p.impact32-gameplayTime)*12)*.06:0;
 const idleY=sole38(p,'Idle',p.idlePhase),walkY=sole38(p,'Walk',p.phase),runY=Math.min(sole38(p,'Run',p.phase),.024);
 const groundedY=.002-(idleY*(1-walk)+walkY*walk*(1-run)+runY*walk*run);
 rig.groundY=smooth41(rig.groundY,groundedY,24,dt);p.visual.position.y=rig.groundY;
 p.mode=walk<.1?'Idle':run>.5?'Run':'Walk';
 if(p.hero){
  const airborne=vertical!==0;rig.air=smooth41(rig.air,airborne?1:0,14,dt);
  if(rig.wasAir&&!airborne){rig.landing=.20;stage41.landings++;}rig.wasAir=airborne;rig.landing=Math.max(0,rig.landing-dt);
  if(rig.air>.01){sampleHuman(p,'Run',vertical>0?.29:.76,rig.air*.68);p.mode=vertical>0?'Jump':'Fall';}
  if(rig.landing>0){const amount=Math.sin(rig.landing/.2*Math.PI);p.visual.position.y-=amount*.035;p.visual.rotation.x+=amount*.035;p.mode='Land';}
  updateEquipmentPose(p,dt);
 }
 feet41(p,walk,run);
 for(const prop of p.streetProps||[])if(!prop.isDisposed())prop.setEnabled(!p.far);
}

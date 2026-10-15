function human43(p,speed,dt){
 p.helmet.setEnabled(false);p.animClock+=Math.min(.1,dt);if(p.far&&p.animClock<.08)return;dt=p.animClock;p.animClock=0;if(!p.graph43)resetGraph43(p);const g=p.graph43,rig=cacheRig41(p);g.elapsed+=dt;
 const position=p.root.position;let distance=g.lastPosition?Math.hypot(position.x-g.lastPosition.x,position.z-g.lastPosition.z):speed*dt;
 if(distance>2){distance=0;g.wasAir=false;g.landing=0;}if(!g.lastPosition)g.lastPosition=position.clone();else g.lastPosition.copyFrom(position);
 p.gaitSpeed=smooth41(p.gaitSpeed||0,speed,speed>(p.gaitSpeed||0)?10:14,dt);g.walk=smooth41(g.walk,smoothstep41(.04,.28,p.gaitSpeed),12,dt);g.run=smooth41(g.run,smoothstep41(1.65,3.2,p.gaitSpeed),9,dt);
 const stride=p.strides43?.Walk||1.22,runStride=Math.max(p.strides43?.Run||1.65,1.95);g.stride=(stride*(1-g.run)+runStride*g.run)*p.root.scaling.y;
 const cadence=Math.min(2.05,distance/Math.max(.001,dt*g.stride));p.phase=((p.phase||0)+cadence*dt)%1;p.idlePhase=(g.elapsed/(p.clips.Idle.duration||2.5))%1;
 sampleLayer43(p,'Idle',p.idlePhase,1);if(g.walk>.001)sampleLayer43(p,'Walk',p.phase,g.walk);if(g.run>.001)sampleLayer43(p,'Run',p.phase,g.run*g.walk);
 const idle=ground43(p,'Idle',p.idlePhase),walk=ground43(p,'Walk',p.phase),run=Math.min(ground43(p,'Run',p.phase),.03),offset=.003-(idle*(1-g.walk)+walk*g.walk*(1-g.run)+run*g.walk*g.run);
 g.offset=smooth41(g.offset,offset,32,dt);p.visual.position.y=g.offset;
 p.mode=g.walk<.12?'Idle':g.run>.5?'Run':'Walk';
 const delta=Math.atan2(Math.sin(p.root.rotation.y-g.lastHeading),Math.cos(p.root.rotation.y-g.lastHeading));g.lastHeading=p.root.rotation.y;g.turn=smooth41(g.turn,clamp(delta/Math.max(.001,dt),-3,3),9,dt);p.visual.rotation.z=clamp(-g.turn*.012*g.walk,-.03,.03);p.visual.rotation.x=p.impact32>gameplayTime?Math.sin((p.impact32-gameplayTime)*12)*.045:0;
 if(p.hero){
  const air=vertical!==0;if(air){g.airTime+=dt;const jumpAge=g.airTime,phase=vertical>0?clamp(jumpAge/.30,0,1):(g.airTime/.7)%1;sampleLayer43(p,vertical>0?'JumpStart':'JumpAir',phase,1);p.mode=vertical>0?'Jump':'Fall';}
  if(g.wasAir&&!air){g.landing=.23;stage41.landings++;}g.wasAir=air;if(!air)g.airTime=0;
  if(g.landing>0&&!air){const phase=1-g.landing/.23;sampleLayer43(p,'JumpLand',phase,g.landing/.23);p.mode='Land';g.landing=Math.max(0,g.landing-dt);}
  hands43(p,dt);
 }
 // Blend from the final previous displayed pose so transitions include the action layer.
 const alpha=1-Math.exp(-dt*(p.far?18:30));for(const t of rig.tracks){const v=t.target[t.property];if(t.property==='rotationQuaternion')B.Quaternion.SlerpToRef(t.value,v,alpha,v);else B.Vector3.LerpToRef(t.value,v,alpha,v);t.value.copyFrom(v);}
 plantFeet43(p,g.walk,g.run);for(const prop of p.streetProps||[])if(!prop.isDisposed())prop.setEnabled(!p.far);
}

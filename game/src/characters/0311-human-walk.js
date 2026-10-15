function humanWalk(p,speed,dt){
 p.helmet.setEnabled(false);p.animClock+=Math.min(dt,.10);if(p.far&&p.animClock<.08)return;dt=p.animClock;p.animClock=0;
 const k=1-Math.exp(-dt*11);p.gaitSpeed=(p.gaitSpeed||0)+(speed-(p.gaitSpeed||0))*k;
 const walk=clamp(p.gaitSpeed/.32,0,1),run=clamp((p.gaitSpeed-1.7)/1.8,0,1),stride=GAIT.walkStride+(GAIT.runStride-GAIT.walkStride)*run;
 const pos=p.root.position;let distance=p.lastGaitPos?Math.hypot(pos.x-p.lastGaitPos.x,pos.z-p.lastGaitPos.z):speed*dt;
 if(distance>2)distance=0;p.lastGaitPos=pos.clone();p.phase=(p.phase+distance/(stride*p.root.scaling.y*(p.bodyType===1?.861:1)))%1;p.idlePhase=((p.idlePhase||0)+dt/3)%1;
 sampleHuman(p,'Idle',p.idlePhase,1);if(walk>.001)sampleHuman(p,'Walk',p.phase,walk);if(run>.001)sampleHuman(p,'Run',p.phase,run);
 
 // Ground correction measured from the skinned shoe vertices, not the ankle joint.
 const curves=p.sole40||soleCurves[p.bodyType];const height=(name,phase)=>{const a=curves?.[name];if(!a)return p.bodyType===0?.014:.021;const frame=phase*(a.length-1),index=Math.floor(frame)%a.length,blend=frame-Math.floor(frame);return a[index]*(1-blend)+a[(index+1)%a.length]*blend;};
 const idleY=height('Idle',p.idlePhase),walkY=height('Walk',p.phase),runY=Math.min(height('Run',p.phase),.024);
 p.visual.position.y=.002-(idleY*(1-walk)+walkY*walk*(1-run)+runY*walk*run);p.mode=walk<.1?'Idle':run>.5?'Run':'Walk';
 if(p.hero){updateEquipmentPose(p,dt);if(vertical!==0)sampleHuman(p,'Run',.23,.4);}
 for(const prop of p.streetProps||[])if(!prop.isDisposed())prop.setEnabled(!p.far);
}

// Original predictive crossing extension inspired by studying separation of
// vehicle motion and pedestrian goals. No GTA code or constants were imported.
// Only used when vehicles travel almost parallel to the pedestrian path:
// the previous perpendicular-road ETA method cannot classify those contacts.
function crossingParallelConflict27(pos,dir,pace,v,vx,vz,horizon=3.4){
 const heading=v.heading??v.root.rotation.y??0;
 const rightX=Math.cos(heading),rightZ=-Math.sin(heading);
 const forwardX=-Math.sin(heading),forwardZ=-Math.cos(heading);
 const dx=pos.x-v.root.position.x,dz=pos.z-v.root.position.z;
 const relX=-vx,relZ=dir*Math.max(0,pace)-vz;
 const cross=dx*rightX+dz*rightZ,forward=dx*forwardX+dz*forwardZ;
 const crossVel=relX*rightX+relZ*rightZ,forwardVel=relX*forwardX+relZ*forwardZ;
 const width=(v.width||1.5)*.5+.42,length=(v.length||2.6)*.5+.42;
 let enter=0,exit=horizon;
 for(let axis=0;axis<2;axis++){
  const x=axis?forward:cross,speed=axis?forwardVel:crossVel,extent=axis?length:width;
  if(Math.abs(speed)<1e-7){if(Math.abs(x)>extent)return false;continue;}
  const a=(-extent-x)/speed,b=(extent-x)/speed;
  enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
  if(enter>exit)return false;
 }
 return enter<=exit;
}

function pedestrianCrossing27(p){const pos=p.root.position,q=p.brain25,dir=Math.sign(q.goal-pos.z);if(!dir)return false;
 for(const center of [-185,-111,-37,37,111,185]){const ahead=(center-pos.z)*dir;if(ahead<7.3||ahead>10.2)continue;
  for(const v of fleet){const isPlayer=driving&&v===current;if(!v.traffic&&!isPlayer)continue;const speed=isPlayer?state.speed:v.trafficSpeed||0;if(Math.abs(speed)<.15)continue;
   const heading=isPlayer?state.heading:v.heading,vx=-Math.sin(heading)*speed,vz=-Math.cos(heading)*speed,dx=pos.x-v.root.position.x;if(Math.abs(vx)<.15){if(crossingParallelConflict27(pos,dir,q.pace||0,v,vx,vz)){polish26.crossingWaits++;return true;}continue;}
   const eta=dx/vx;if(eta<-(v.length*.5+.7)/Math.abs(vx)||eta>3.4)continue;
   const z=v.root.position.z+vz*Math.max(0,eta);if(Math.abs(z-center)>7+v.width/2)continue;polish26.crossingWaits++;return true;
  }
 }return false;
}

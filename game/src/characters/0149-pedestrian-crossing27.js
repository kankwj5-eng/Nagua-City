function pedestrianCrossing27(p){const pos=p.root.position,q=p.brain25,dir=Math.sign(q.goal-pos.z);if(!dir)return false;
 for(const center of [-185,-111,-37,37,111,185]){const ahead=(center-pos.z)*dir;if(ahead<7.3||ahead>10.2)continue;
  for(const v of fleet){const isPlayer=driving&&v===current;if(!v.traffic&&!isPlayer)continue;const speed=isPlayer?state.speed:v.trafficSpeed||0;if(Math.abs(speed)<.15)continue;
   const heading=isPlayer?state.heading:v.heading,vx=-Math.sin(heading)*speed,vz=-Math.cos(heading)*speed,dx=pos.x-v.root.position.x;if(Math.abs(vx)<.15)continue;
   const eta=dx/vx;if(eta<-(v.length*.5+.7)/Math.abs(vx)||eta>3.4)continue;
   const z=v.root.position.z+vz*Math.max(0,eta);if(Math.abs(z-center)>7+v.width/2)continue;polish26.crossingWaits++;return true;
  }
 }return false;
}

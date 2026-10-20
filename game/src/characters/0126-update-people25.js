// Reutilizar senos/cosenos de los cinco giros posibles entre peatones.
// El orden de evasión y los ángulos son exactamente los del algoritmo anterior.
const pedestrianTurnValues25=[
 [1,0],
 [Math.cos(.36),Math.sin(.36)],
 [Math.cos(-.36),Math.sin(-.36)],
 [Math.cos(.75),Math.sin(.75)],
 [Math.cos(-.75),Math.sin(-.75)]
];
const pedestrianTurnOptions25Odd=[pedestrianTurnValues25[0],pedestrianTurnValues25[1],pedestrianTurnValues25[2],pedestrianTurnValues25[3],pedestrianTurnValues25[4]];
const pedestrianTurnOptions25Even=[pedestrianTurnValues25[0],pedestrianTurnValues25[2],pedestrianTurnValues25[1],pedestrianTurnValues25[3],pedestrianTurnValues25[4]];

// Un grupo limitado de peatones V4 acompaña al jugador: los mismos GLB
// se reubican en aceras de barrios cercanos, lejos del campo de visión.
let peopleStreamClockV4=0;
function streamPeopleV4(dt){
 if(typeof inWorld!=="function"||typeof groundAt!=="function")return;
 peopleStreamClockV4+=dt;
 if(peopleStreamClockV4<1.1)return;
 peopleStreamClockV4=0;
 const hero=driving?current.root.position:player.root.position;
 const roads=[-111,-37,37,111];
 const cap=quality==='low'?12:18;
 for(let i=0;i<pedestrians.length;i++){
  const p=pedestrians[i];
  if(p.trafficRider26)continue;
  if(i>=cap){
   p.lifeV4Active=false;p.root.setEnabled(false);p.contact?.setEnabled(false);
   continue;
  }
  const distance=Math.hypot(p.root.position.x-hero.x,p.root.position.z-hero.z);
  if(distance<115&&!p.lifeV4NeedsPlace){
   p.lifeV4Active=true;continue;
  }
  if(distance<120&&!p.lifeV4NeedsPlace)continue;
  if(p.downUntil>gameplayTime)continue;
  let placed=false;
  const lanes=roads.map(x=>({axis:'z',center:x,near:Math.abs(hero.x-x)}))
   .concat(roads.map(z=>({axis:'x',center:z,near:Math.abs(hero.z-z)})))
   .sort((a,b)=>a.near-b.near);
  for(let j=0;j<lanes.length&&!placed;j++){
   const lane=lanes[(i+j)%lanes.length];
   if(lane.near>95)continue;
   const side=(i+j)%2?1:-1;
   const pavement=lane.center+side*(7.8+(i%3)*.9);
   const along=(lane.axis==='z'?hero.z:hero.x)+((i+j)%2?1:-1)*(25+(i%7)*9+j*3);
   const x=lane.axis==='z'?pavement:along,z=lane.axis==='z'?along:pavement;
   if(!inWorld(x,z)||blocked(x,z,.31,null,true))continue;
   if(Math.hypot(x-hero.x,z-hero.z)<22)continue;
   if(pedestrians.some(o=>o!==p&&o.lifeV4Active&&Math.hypot(o.root.position.x-x,o.root.position.z-z)<2.1))continue;
   p.root.position.set(x,groundAt(x,z),z);
   p.root.rotation.y=lane.axis==='z'?side>0?0:Math.PI:side*Math.PI/2;
   p.direction=(i+j)%2?1:-1;p.speed=0;
   const alongHere=lane.axis==='z'?z:x;
   p.path={x,z,min:alongHere-15,max:alongHere+15,axis:lane.axis};
   p.brain25.lane=lane.axis==='z'?x:z;
   p.brain25.goal=p.direction>0?p.path.max:p.path.min;
   p.brain25.wait=(i%4)*.15;p.brain25.stuck=0;p.brain25.animation=0;
   p.lifeV4Active=true;p.lifeV4NeedsPlace=false;
   p.root.setEnabled(true);
   placed=true;
  }
  if(!placed){
   p.lifeV4Active=false;p.lifeV4NeedsPlace=true;
   p.root.setEnabled(false);p.contact?.setEnabled(false);
  }
 }
}
function updatePeople25(dt){if(!playing||dt<=0)return;streamPeopleV4(dt);const hero=driving?current.root.position:player.root.position;const all=stage39.pool;let count39=0;for(const p of pedestrians)if(!p.downUntil&&p.lifeV4Active!==false){let rec=all[count39];if(!rec)rec=all[count39]={p,x:0,z:0};rec.p=p;rec.x=p.root.position.x;rec.z=p.root.position.z;count39++;}all.length=count39;simulation25.spatial.build(all);for(const p of pedestrians){if(p.lifeV4Active===false){p.root.setEnabled(false);p.contact?.setEnabled(false);continue;}if(p.downUntil){p.root.setEnabled(false);p.contact.setEnabled(false);if(gameplayTime>=p.downUntil){p.downUntil=0;p.hp=100;}else continue;}const d=B.Vector3.DistanceSquared(p.root.position,hero);p.root.setEnabled(d<140*140);if(!p.root.isEnabled())continue;const detailed=d<(quality==='high'?65:quality==='low'?32:45)**2;p.far=!detailed;for(const m of p.nearMeshes)m.setEnabled(detailed);for(const m of p.lodMeshes)m.setEnabled(!detailed);const q=p.brain25,pause=q.wait>0;q.wait=Math.max(0,q.wait-dt);let gx=p.path?.axis==='x'?q.goal:q.lane,gz=p.path?.axis==='x'?q.lane:q.goal,desired=pause?0:q.pace;
 // Frenado anticipado: la animación y el desplazamiento comparten una
 // desaceleración gradual; el detector comprueba vehículos antes del cruce.
 if(!pause&&pedestrianCrossing27(p)){desired=0;q.state='crossing-wait';}if(p.fleeUntil>gameplayTime){q.state='flee';const away=p.root.position.subtract(hero);away.y=0;if(away.length()<.01)away.z=1;away.normalize();gx=p.root.position.x+away.x*4;gz=p.root.position.z+away.z*4;desired=3.25;}else if(pause){q.state=p.index>=230?'browse':'wait';}else{q.state=desired===0?'crossing-wait':'walk';if(Math.abs((p.path?.axis==='x'?p.root.position.x:p.root.position.z)-q.goal)<.48&&Math.abs((p.path?.axis==='x'?p.root.position.z:p.root.position.x)-q.lane)<.45){p.direction*=-1;q.goal=p.direction>0?p.path.max:p.path.min;q.wait=.6+(p.index%4)*.38;desired=0;}}
 let dir=V(gx-p.root.position.x,0,gz-p.root.position.z);if(dir.length()>.01)dir.normalize();else desired=0;const neighbors=simulation25.spatial.near(p.root.position.x,p.root.position.z,1.6).filter(o=>o.p!==p);let proposed=dir.clone(),clear=false;for(const turn of (p.index%2?pedestrianTurnOptions25Odd:pedestrianTurnOptions25Even)){const candidate=V(dir.x*turn[0]-dir.z*turn[1],0,dir.x*turn[1]+dir.z*turn[0]),x=p.root.position.x+candidate.x*.62,z=p.root.position.z+candidate.z*.62;if(q.state!=='flee'&&Math.abs((p.path?.axis==='x'?z:x)-q.lane)>1)continue;if(blocked(x,z,.28,null,true))continue;if(neighbors.some(o=>Math.hypot(o.p.root.position.x-x,o.p.root.position.z-z)<.62))continue;if(Math.hypot(hero.x-x,hero.z-z)<.85)continue;proposed=candidate;clear=true;break;}if(!clear){desired=0;q.stuck=(q.stuck||0)+dt;q.state='yield';if(q.stuck>q.patience){p.direction*=-1;q.goal=p.direction>0?p.path.max:p.path.min;q.wait=.25;q.stuck=0;}}else q.stuck=0;
 const target=Math.atan2(-proposed.x,-proposed.z),turn=Math.atan2(Math.sin(target-p.root.rotation.y),Math.cos(target-p.root.rotation.y));p.root.rotation.y+=clamp(turn,-dt*3.7,dt*3.7);if(Math.abs(turn)>.65)desired=0;p.speed=(p.speed||0)+(desired-(p.speed||0))*(1-Math.exp(-dt*7));const beforeX=p.root.position.x,beforeY=p.root.position.y,beforeZ=p.root.position.z,step=p.speed*dt;const nx=beforeX+proposed.x*step,nz=beforeZ+proposed.z*step;if(!neighbors.some(o=>Math.hypot(o.p.root.position.x-nx,o.p.root.position.z-nz)<.50)&&Math.hypot(hero.x-nx,hero.z-nz)>.62)slide(p.root.position,proposed.x*step,proposed.z*step,.26,null);p.root.position.y=groundAt(p.root.position.x,p.root.position.z);const actual=Math.hypot(p.root.position.x-beforeX,p.root.position.y-beforeY,p.root.position.z-beforeZ)/dt;q.animation+=dt;const interval=d<35*35?0:d<80*80?.08:.2;if(q.animation>=interval){walkPose(p,actual,q.animation);q.animation=0;}placeContact(p.contact,p.root.position,p.root.rotation.y,true);
 }}


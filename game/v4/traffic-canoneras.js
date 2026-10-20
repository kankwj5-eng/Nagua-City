/* Tráfico V4: exclusivamente seis GLB nuevos. No hay dependencias del parque anterior. */
const TRAFFIC_V4_IDS=Object.freeze(['hilux','landcruiser','pulsar','taypan','mototaxi-roja','canonera-abierta']);
const TRAFFIC_V4_LANES=Object.freeze([-48,-16,29,35,-42,-22]);
function cloneTrafficV4(source,index){
 const B_=B();
 // Los prefabs se muestran bajo un root externo al contenedor GLB.
 // Desparentar, clonar y restaurar evita perder jerarquías y clips.
 const parents=source.container.rootNodes.map(node=>[node,node.parent]);
 let clone;
 try{
  for(const [node] of parents)node.parent=null;
  clone=source.container.instantiateModelsToScene(n=>'trafico_v4_'+index+'_'+n,false,{doNotInstantiate:true});
 }finally{for(const [node,parent] of parents)node.parent=parent;}
 const root=new B_.TransformNode('trafico_nuevo_'+source.id+'_'+index,state.scene);
 const visual=new B_.TransformNode('carroceria_nueva_'+index,state.scene);
 visual.parent=root;visual.rotation.y=-Math.PI/2;
 for(const n of clone.rootNodes)n.parent=visual;
 for(const mesh of root.getChildMeshes()){mesh.isPickable=false;mesh.receiveShadows=true;}
 return {id:source.id,root,visual,container:clone,
  groups:new Map(clone.animationGroups.map(g=>[g.name.replace(/^trafico_v4_\d+_/,''),g])),
  info:source.info,speed:0,steer:0,heading:Math.PI,roll:0,
  wheelbase:source.wheelbase,width:source.width,max:source.max,
  traffic:true,trafficPause:0,trafficTarget:1,blockedFor:0,controlUser:false};
}
function initTrafficV4(){
 state.traffic=[];
 for(let i=0;i<TRAFFIC_V4_IDS.length;i++){
  const original=state.cars[i],road=TRAFFIC_V4_LANES[i];
  if(original.id!==TRAFFIC_V4_IDS[i])throw Error('Orden inválido del tráfico V4: '+original.id);
  const ai=cloneTrafficV4(original,i);
  const z=89+i*4.3;
  const site=state.officialCity.findSpace(road,z,Math.max(.65,ai.width*.43));
  ai.root.position.set(site[0],state.officialCity.groundAt(...site),site[1]);
  ai.root.rotation.y=Math.PI;ai.heading=Math.PI;
  ai.route={x:road,near:83,far:123,target:123};
  ai.trafficPause=i*.4;state.traffic.push(ai);
 }
}
function trafficNearbyV4(self,x,z,dist){
 const min=dist*dist;
 for(const other of [...state.cars,...state.traffic]){
  if(other===self||other.root?.isEnabled?.()===false)continue;
  const dx=x-other.root.position.x,dz=z-other.root.position.z;
  if(dx*dx+dz*dz<min)return true;
 }
 if(state.player?.root?.isEnabled?.()!==false){
  const dx=x-state.player.root.position.x,dz=z-state.player.root.position.z;
  if(dx*dx+dz*dz<Math.max(1.4,dist*.7)**2)return true;
 }
 for(const person of state.people){
  const dx=x-person.root.position.x,dz=z-person.root.position.z;
  if(dx*dx+dz*dz<Math.max(1.35,dist*.65)**2)return true;
 }
 return false;
}
function updateTrafficV4(dt){
 if(!state.traffic?.length)return;
 const city=state.officialCity;
 for(const car of state.traffic){
  if(car===state.driving||car.controlUser)continue;
  if(car.trafficPause>0){car.trafficPause=Math.max(0,car.trafficPause-dt);car.speed=Math.max(0,car.speed-dt*4);continue;}
  const pos=car.root.position,route=car.route;
  if(Math.abs(route.target-pos.z)<2.25){
   route.target=route.target===route.far?route.near:route.far;
   car.trafficPause=.6;continue;
  }
  const heading=route.target>pos.z?Math.PI:0;
  const turn=Math.atan2(Math.sin(heading-car.heading),Math.cos(heading-car.heading));
  car.heading+=Math.max(-dt*2.2,Math.min(dt*2.2,turn));
  const aligned=Math.abs(turn)<.24;
  const targetSpeed=aligned?(car.info.type==='moto'?4.4:car.info.type==='caponera'?2.9:3.3):0;
  car.speed+=(targetSpeed-car.speed)*(1-Math.exp(-dt*(aligned?2:5)));
  const vx=-Math.sin(car.heading),vz=-Math.cos(car.heading);
  const testX=pos.x+vx*Math.max(1.4,car.speed*.7),testZ=pos.z+vz*Math.max(1.4,car.speed*.7);
  const radius=Math.max(.6,car.width*.43);
  const collision=city.blocked(testX,testZ,radius)||trafficNearbyV4(car,testX,testZ,car.width*1.1+1.5);
  if(collision){car.speed=Math.max(0,car.speed-dt*11);car.blockedFor+=dt;
   if(car.blockedFor>5){car.blockedFor=0;route.target=route.target===route.far?route.near:route.far;car.trafficPause=.8;}
  }else car.blockedFor=0;
  const nx=pos.x+vx*car.speed*dt,nz=pos.z+vz*car.speed*dt;
  if(!city.blocked(nx,nz,radius)&&!trafficNearbyV4(car,nx,nz,car.width*.75+.5)){
   pos.x=nx;pos.z=nz;pos.y=city.groundAt(nx,nz);
  }
  car.root.rotation.y=car.heading;
  car.steer=Math.max(-1,Math.min(1,turn/.65));
  animateVehicleV4(car,dt);
 }
}
function animateVehicleV4(car,dt){
 const radius=car.info.radius||.30;
 car.roll+=(car.speed||0)*dt/radius;
 const phase=((car.roll/(Math.PI*2))%1+1)%1;
 for(const wheel of car.info.wheels)anim(car,'Rodar_'+wheel,phase);
 const left=car.groups.get('Direccion_Izquierda'),right=car.groups.get('Direccion_Derecha');
 const positive=car.steer>=0,chosen=positive?right:left,other=positive?left:right;
 if(other&&other._prepared){other.stop();other._prepared=false;}
 if(chosen)anim(car,positive?'Direccion_Derecha':'Direccion_Izquierda',Math.min(.5,Math.abs(car.steer)*.5));
}
function vehicleContactV4(self,x,z,r){
 for(const v of [...state.cars,...state.traffic]){
  if(v===self||!v.root?.position)continue;
  const dx=x-v.root.position.x,dz=z-v.root.position.z;
  if(dx*dx+dz*dz<Math.pow(r+v.width*.43+.22,2))return true;
 }
 if(self)for(const p of state.people){
  const dx=x-p.root.position.x,dz=z-p.root.position.z;
  if(dx*dx+dz*dz<(r+.45)**2)return true;
 }
 return false;
}
function updatePedestriansV4(dt){
 const city=state.officialCity;
 for(const p of state.people){
  p.walkTimer-=dt;
  if(p.walkTimer<=0){p.walkDirection*=-1;p.walkTimer=4+(p.id.length%3);}
  const z=p.root.position.z,dir=p.walkDirection;
  if(z<88&&dir<0||z>160&&dir>0){p.walkDirection*=-1;p.walkTimer=1.2;}
  const next=z+p.walkDirection*p.speed*dt;
  const blocked=city.blocked(p.root.position.x,next,.32)||
   [...state.cars,...state.traffic].some(v=>{
    const dx=p.root.position.x-v.root.position.x,dz=next-v.root.position.z;
    return dx*dx+dz*dz<Math.max(1.45,v.width*.7+1)**2;
   });
  const moving=!blocked&&Number.isFinite(next);
  if(moving){p.root.position.z=next;p.root.position.y=city.groundAt(p.root.position.x,next);}
  else p.walkTimer=Math.min(p.walkTimer,.75);
  p.root.rotation.y=p.walkDirection>0?Math.PI:0;
  const action=moving?'Walk':'Idle';
  if(p.active!==action)p.play(action,true,1);
 }
}

/* Nagua City v4 — gameplay sin modelos, clips ni nombres de flota anteriores.
 * Montable en la escena y geometría urbana existente. Movimiento y controles
 * son inyectables; el puente no reconstruye ni altera calles y edificios.
 */
(function(scope){
"use strict";
const CAST=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
 "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"];
const VEHICLES=["hilux","landcruiser","pulsar","taypan"];
const METRICS={
 hilux:{bike:false,bus:false,width:1.77,length:5.28,wheelbase:3.08,maxSpeed:35,mass:2150},
 landcruiser:{bike:false,bus:false,width:1.79,length:5.18,wheelbase:3.18,maxSpeed:33,mass:2650},
 pulsar:{bike:true,bus:false,width:.76,length:2.02,wheelbase:1.37,maxSpeed:31,mass:160},
 taypan:{bike:true,bus:false,width:.76,length:2.00,wheelbase:1.33,maxSpeed:25,mass:135}
};
function clamp(x,a,b){return Math.min(b,Math.max(a,x));}
function distance2(a,b){return (a.x-b.x)**2+(a.z-b.z)**2;}
function mount(options){
 const {bundle,groundAt,blocked=()=>false,spawn={x:-37,z:111},drivePhysics}=options;
 if(!bundle?.characters?.spawn||!bundle?.vehicles?.create||typeof groundAt!=="function")
  throw Error("Faltan motores de los modelos nuevos o terreno");
 if(bundle.characters.ids.length!==10||bundle.vehicles.ids.length!==4||
  bundle.characters.ids.some((id,i)=>id!==CAST[i])||
  bundle.vehicles.ids.some((id,i)=>id!==VEHICLES[i]))
  throw Error("Catálogo de modelos distinto de 10 personas y 4 vehículos");
 const setPosition=(entity,x,z)=>{
  entity.root.position.x=x;entity.root.position.z=z;
  entity.root.position.y=groundAt(x,z);
 };
 const hero=bundle.characters.spawn(CAST[0],0);
 setPosition(hero,spawn.x,spawn.z);
 const pedestrians=CAST.slice(1).map((name,i)=>{
  const character=bundle.characters.spawn(name,i+1);
  const side=i%2?1:-1,x=spawn.x+side*(8+i%3),z=spawn.z+((i-4)*8);
  setPosition(character,x,z);
  character.root.rotation.y=i%2?Math.PI:0;
  return {character,index:i+1,direction:i%2?1:-1,min:z-12,max:z+12,speed:1+.04*(i%3)};
 });
 const vehicles=VEHICLES.map((id,i)=>{
  const unit=bundle.vehicles.create(id,i),metrics=METRICS[id];
  const x=spawn.x+4+(i%2)*4.5,z=spawn.z+10+Math.floor(i/2)*8;
  setPosition(unit,x,z);unit.root.rotation.y=Math.PI;
  Object.assign(unit,metrics,{heading:Math.PI,baseY:unit.root.position.y});
  return unit;
 });
 let driving=null,alive=true,move={x:0,z:0},heading=0,speed=0,steer=0;
 const state={x:0,z:0,heading:0,speed:0,steer:0,lean:0,wheelie:0,throttle:0,gear:1};
 function requireActive(){if(!alive)throw Error("El mundo v4 fue liberado");}
 function nearby(limit=3.3){
  const pos=hero.root.position;
  let result=null,best=limit*limit;
  for(const car of vehicles){
   const d=distance2(car.root.position,pos);
   if(d<best){best=d;result=car;}
  }
  return result;
 }
 function exitPosition(car){
  const p=car.root.position,width=car.width/2+1.05;
  for(const side of [-1,1]){
   const x=p.x+Math.cos(car.root.rotation.y)*width*side;
   const z=p.z-Math.sin(car.root.rotation.y)*width*side;
   if(!blocked(x,z,.33,car))return {x,z};
  }
  return null;
 }
 function toggleVehicle(){
  requireActive();
  if(driving){
   const exit=exitPosition(driving);
   if(!exit)return false;
   driving=null;setPosition(hero,exit.x,exit.z);hero.root.setEnabled(true);
   hero.walk(0);speed=0;move.x=move.z=0;return true;
  }
  const car=nearby();
  if(!car)return false;
  driving=car;speed=0;steer=0;
  state.x=car.root.position.x;state.z=car.root.position.z;state.heading=car.heading;
  state.speed=0;state.steer=0;state.lean=0;state.wheelie=0;state.throttle=0;state.gear=1;
  hero.root.setEnabled(false);return true;
 }
 function personStep(dt,input){
  const tx=clamp(input.strafe||0,-1,1),forward=clamp(input.forward||0,-1,1);
  let dx=tx*Math.cos(heading)+forward*Math.sin(heading),
      dz=tx*Math.sin(heading)-forward*Math.cos(heading);
  const n=Math.hypot(dx,dz);if(n>1){dx/=n;dz/=n;}
  const max=input.run?4.1:1.8,k=1-Math.exp(-dt*10);
  move.x+=(dx*max-move.x)*k;move.z+=(dz*max-move.z)*k;
  const before=hero.root.position,{x,z}=before;
  if(!blocked(x+move.x*dt,z+move.z*dt,.33,hero)){
   setPosition(hero,x+move.x*dt,z+move.z*dt);
  }else if(!blocked(x+move.x*dt,z,.33,hero))setPosition(hero,x+move.x*dt,z);
  else if(!blocked(x,z+move.z*dt,.33,hero))setPosition(hero,x,z+move.z*dt);
  const actual=Math.hypot(hero.root.position.x-x,hero.root.position.z-z)/Math.max(dt,.001);
  if(actual>.1){
   const target=Math.atan2(-move.x,-move.z),turn=Math.atan2(Math.sin(target-hero.root.rotation.y),Math.cos(target-hero.root.rotation.y));
   hero.root.rotation.y+=clamp(turn,-dt*8,dt*8);
  }
  hero.walk(actual);
 }
 function vehicleStep(dt,input){
  const car=driving;let turn=clamp(input.strafe||0,-1,1);
  if(typeof drivePhysics==="function"){
   drivePhysics(state,{throttle:clamp(input.forward||0,-1,1),steer:turn,brake:input.brake?1:0},car,dt);
   speed=state.speed;steer=state.steer;
  }else{
   const target=clamp(input.forward||0,-1,1)*(car.bike?22:26),k=1-Math.exp(-dt*(input.brake?12:2));
   speed+=(target-speed)*k;if(input.brake)speed*=Math.exp(-dt*8);
   steer+=(turn-steer)*(1-Math.exp(-dt*6));
   state.heading-=speed/car.wheelbase*steer*.34*dt;
   state.x+=-Math.sin(state.heading)*speed*dt;state.z+=-Math.cos(state.heading)*speed*dt;
   state.speed=speed;state.steer=steer;
  }
  if(!blocked(state.x,state.z,car.width/2,car)){
   setPosition(car,state.x,state.z);car.heading=state.heading;car.root.rotation.y=state.heading;
  }else{state.speed=0;speed=0;state.x=car.root.position.x;state.z=car.root.position.z;}
  // The new GLB already owns wheel rotation and steering; old wheel poses
  // must not be applied on top of these tracks.
  car.update(speed,clamp(turn,-1,1),dt);
 }
 function pedestrianStep(dt){
  for(const p of pedestrians){
   const entity=p.character,at=entity.root.position;
   if(at.z>=p.max)p.direction=-1;
   else if(at.z<=p.min)p.direction=1;
   const dz=p.direction*p.speed*dt;
   if(!blocked(at.x,at.z+dz,.26,entity))setPosition(entity,at.x,at.z+dz);
   const rotation=p.direction===1?Math.PI:0;
   const angle=Math.atan2(Math.sin(rotation-entity.root.rotation.y),Math.cos(rotation-entity.root.rotation.y));
   entity.root.rotation.y+=clamp(angle,-dt*3,dt*3);
   entity.walk(Math.abs(dz)/Math.max(dt,.001));
  }
 }
 function step(dt,input={}){
  requireActive();dt=clamp(Number(dt)||0,0,.05);if(!dt)return;
  heading=Number.isFinite(input.cameraYaw)?input.cameraYaw:heading;
  if(driving)vehicleStep(dt,input);else personStep(dt,input);
  pedestrianStep(dt);
 }
 function action(name){
  requireActive();
  if(driving)return false;
  if(!["Punch_L","Punch_R","Guard","HitReaction","Recover","Talk","Wave"].includes(name))return false;
  hero.play(name,false);return true;
 }
 return Object.freeze({
  player:hero,pedestrians,vehicles,state,step,toggleVehicle,action,nearby,
  get current(){return driving;},get driving(){return !!driving;},
  get worldModelCount(){return {characters:10,vehicles:4,lod1:0,legacy:0};},
  dispose(){if(!alive)return;alive=false;for(const p of pedestrians)p.character.dispose();hero.dispose();
   for(const v of vehicles)v.dispose();}
 });
}
const api=Object.freeze({CAST,VEHICLES,METRICS,mount});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(scope)scope.NaguaV4City=api;
})(typeof window!=="undefined"?window:null);

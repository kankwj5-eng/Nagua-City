// Circulación nueva: ninguna malla ni animación de la flota sustituida.
function stepFleet13(dt){
 updateTrafficSignals23(dt);
 if(!(dt>0))return;
 for(const v of fleet){
  if(!v.traffic||v.retired28||v===current&&driving||v.garage)continue;
  const route=v.route;
  if(!route)continue;
  const pos=v.root.position;
  if(pos.z>=route.max-2)route.target=-1;
  if(pos.z<=route.min+2)route.target=1;
  const turn=route.target>0?Math.PI:0;
  const delta=Math.atan2(Math.sin(turn-v.heading),Math.cos(turn-v.heading));
  v.heading+=clamp(delta,-dt*2.0,dt*2.0);
  const dx=-Math.sin(v.heading),dz=-Math.cos(v.heading);
  const aheadX=pos.x+dx*3.5,aheadZ=pos.z+dz*3.5;
  const clear=!blocked(aheadX,aheadZ,v.width*.44,v,true);
  const nearby=pedestrians.some(p=>{
   if(!p.root?.isEnabled?.())return false;
   return Math.hypot(p.root.position.x-aheadX,p.root.position.z-aheadZ)<1.5;
  });
  const safe=clear&&!nearby&&Math.abs(delta)<.45;
  const target=safe?(v.bike?5:v.meta.mass<700?3.1:4):0;
  v.trafficSpeed=(v.trafficSpeed||0)+(target-(v.trafficSpeed||0))*(1-Math.exp(-dt*(safe?1.9:8)));
  const nx=pos.x+dx*v.trafficSpeed*dt,nz=pos.z+dz*v.trafficSpeed*dt;
  if(!blocked(nx,nz,v.width*.42,v,true)){pos.x=nx;pos.z=nz;}
  else v.trafficSpeed=0;
  pos.y=roadSurface50(pos.x,pos.z,!!v.overpass50);
  v.root.rotation.y=v.heading;
  originalV4.animateWheels(v,v.trafficSpeed,delta,dt);
 }
}

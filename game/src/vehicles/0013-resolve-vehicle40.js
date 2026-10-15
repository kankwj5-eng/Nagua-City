function resolveVehicle40(v,oldX,oldZ,r,dt){
 const result=Physics40.sweep(oldX,oldZ,(state.x-oldX)/dt,(state.z-oldZ)/dt,dt,(x,z)=>vehicleContact40(x,z,v,r));
 state.x=result.x;state.z=result.z;
 if(result.hits){
  stage40.contacts+=result.hits;stage40.lastImpact=result.normalSpeed;
  state.speed=-Math.sin(state.heading)*result.vx-Math.cos(state.heading)*result.vz;
  state.sideSpeed40=Math.cos(state.heading)*result.vx-Math.sin(state.heading)*result.vz;
  if(result.normalSpeed>0)crash32(v,result.normalSpeed);
 }
}

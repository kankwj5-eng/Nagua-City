var Physics40={
 spring(value,velocity,target,frequency,damping,dt){
  const f=1+2*dt*damping*frequency, k=frequency*frequency, inverse=1/(f+dt*dt*k);
  return [(f*value+dt*velocity+dt*dt*k*target)*inverse,(velocity+dt*k*(target-value))*inverse];
 },
 impact(vx,vz,nx,nz,restitution=.08){
  const incoming=vx*nx+vz*nz;if(incoming>=0)return {vx,vz,normalSpeed:0};
  return {vx:vx-(1+restitution)*incoming*nx,vz:vz-(1+restitution)*incoming*nz,normalSpeed:-incoming};
 },
 // Sweep in bounded increments, project contacts, retain tangential motion.
 sweep(x,z,vx,vz,dt,contact){
  const steps=Math.max(1,Math.ceil(Math.hypot(vx,vz)*dt/.16)),h=dt/steps;
  let normalSpeed=0,hits=0;
  for(let n=0;n<steps;n++){
   const oldX=x,oldZ=z;let tx=x+vx*h,tz=z+vz*h,c;
   for(let pass=0;pass<4&&(c=contact(tx,tz));pass++){
    const result=this.impact(vx,vz,c.nx,c.nz);normalSpeed=Math.max(normalSpeed,result.normalSpeed);vx=result.vx;vz=result.vz;
    tx+=c.nx*(c.depth+.0005);tz+=c.nz*(c.depth+.0005);hits++;
   }
   if(contact(tx,tz)){x=oldX;z=oldZ;vx=vz=0;break;}else{x=tx;z=tz;}
  }
  return {x,z,vx,vz,normalSpeed,hits};
 }
};

/* Deterministic game rules. Distances are metres, speeds m/s, time seconds. */

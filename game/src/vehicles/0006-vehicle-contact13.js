var VehicleContact13={
 box(a,b){
  const ac=Math.cos(a.heading||0),as=Math.sin(a.heading||0),bc=Math.cos(b.heading||0),bs=Math.sin(b.heading||0),dx=a.x-b.x,dz=a.z-b.z;
  let depth=Infinity,nx=0,nz=0;
  for(const [x,z] of [[ac,-as],[as,ac],[bc,-bs],[bs,bc]]){
   const ra=Math.abs(x*ac-z*as)*a.halfWidth+Math.abs(x*as+z*ac)*a.halfLength,rb=Math.abs(x*bc-z*bs)*b.halfWidth+Math.abs(x*bs+z*bc)*b.halfLength,projection=dx*x+dz*z,overlap=ra+rb-Math.abs(projection);
   if(overlap<=0)return null;
   if(overlap<depth){depth=overlap;const sign=projection<0?-1:1;nx=x*sign;nz=z*sign;}
  }
  return {nx,nz,depth};
 },
 circle(a,circle){
  const c=Math.cos(a.heading||0),s=Math.sin(a.heading||0),dx=circle.x-a.x,dz=circle.z-a.z,lx=c*dx-s*dz,lz=s*dx+c*dz,qx=Math.max(-a.halfWidth,Math.min(a.halfWidth,lx)),qz=Math.max(-a.halfLength,Math.min(a.halfLength,lz)),vx=qx-lx,vz=qz-lz,d=Math.hypot(vx,vz);
  if(d>=circle.radius)return null;
  if(d>1e-10)return {nx:(c*vx+s*vz)/d,nz:(-s*vx+c*vz)/d,depth:circle.radius-d};
  // Circle centre inside the body: move the body away from its nearest face.
  const px=a.halfWidth-Math.abs(lx),pz=a.halfLength-Math.abs(lz);
  if(px<pz){const sign=lx<0?1:-1;return {nx:c*sign,nz:-s*sign,depth:circle.radius+px};}
  const sign=lz<0?1:-1;return {nx:s*sign,nz:c*sign,depth:circle.radius+pz};
 },
 bounds(a){const c=Math.abs(Math.cos(a.heading||0)),s=Math.abs(Math.sin(a.heading||0));return {x:c*a.halfWidth+s*a.halfLength,z:s*a.halfWidth+c*a.halfLength};}
};


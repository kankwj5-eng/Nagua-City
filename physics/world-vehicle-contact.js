function vehicleContact40(x,z,v,r){
 const shape={x,z,heading:state.heading,halfWidth:Math.max(.15,v.width/2),halfLength:Math.max(.30,v.length/2)},bounds=VehicleContact13.bounds(shape);let best=null;
 const keep=c=>{if(c&&(!best||c.depth>best.depth))best=c;};
 const seen=new Set();for(let gx=Math.floor((x-bounds.x)/12);gx<=Math.floor((x+bounds.x)/12);gx++)for(let gz=Math.floor((z-bounds.z)/12);gz<=Math.floor((z+bounds.z)/12);gz++)for(const b of colliderGrid.get(gx+','+gz)||[]){
  if(seen.has(b))continue;seen.add(b);keep(VehicleContact13.box(shape,{x:(b[0]+b[2])/2,z:(b[1]+b[3])/2,halfWidth:(b[2]-b[0])/2,halfLength:(b[3]-b[1])/2,heading:0}));
 }
 if(city24.roundabout)keep(VehicleContact13.circle(shape,city24.roundabout));
 for(const other of fleet){
  if(other===v||other.garage&&other!==current||other.retired28)continue;
  const obstacle={x:other.root.position.x,z:other.root.position.z,heading:other.heading,halfWidth:other.width/2,halfLength:other.length/2},ext=VehicleContact13.bounds(obstacle);
  if(Math.abs(x-obstacle.x)>bounds.x+ext.x||Math.abs(z-obstacle.z)>bounds.z+ext.z)continue;
  keep(VehicleContact13.box(shape,obstacle));
 }
 // The map boundary is irregular. Probe the footprint, then reuse only the old
 // inward-boundary search (not its circle-vs-box or circle-vs-vehicle test).
 const c=Math.cos(state.heading),s=Math.sin(state.heading);
 for(const [lx,lz] of [[0,0],[-shape.halfWidth,-shape.halfLength],[shape.halfWidth,-shape.halfLength],[-shape.halfWidth,shape.halfLength],[shape.halfWidth,shape.halfLength],[0,-shape.halfLength],[0,shape.halfLength],[-shape.halfWidth,0],[shape.halfWidth,0]]){
  const px=x+c*lx+s*lz,pz=z-s*lx+c*lz;if(inWorld(px,pz))continue;
  let nearest=Infinity,contact=null;for(let k=0;k<16;k++){const angle=k*Math.PI/8,nx=Math.cos(angle),nz=Math.sin(angle);for(let d=.02;d<=1;d+=.04)if(inWorld(px+nx*d,pz+nz*d)){if(d<nearest){nearest=d;contact={nx,nz,depth:d};}break;}}
  keep(contact||{nx:0,nz:0,depth:1});
 }
 return best;
}

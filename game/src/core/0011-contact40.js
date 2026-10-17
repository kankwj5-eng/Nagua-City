function contact40(x,z,r,ignore){
 let best=null;const keep=(nx,nz,depth)=>{if(depth>0&&(!best||depth>best.depth))best={nx,nz,depth};};
 if(!inWorld(x,z)){
  // The shoreline/world boundary is irregular: find a nearby inward direction.
  let nearest=Infinity;for(let k=0;k<16;k++){const a=k*Math.PI/8,nx=Math.cos(a),nz=Math.sin(a);for(let d=.02;d<=1;d+=.04)if(inWorld(x+nx*d,z+nz*d)){if(d<nearest){nearest=d;best={nx,nz,depth:d};}break;}}
  if(!best)return {nx:0,nz:0,depth:1};
 }
 if(city24.roundabout){const q=city24.roundabout,dx=x-q.x,dz=z-q.z,d=Math.hypot(dx,dz);if(d<q.radius+r)keep(d?dx/d:1,d?dz/d:0,q.radius+r-d);}
 const seen=new Set();for(let gx=-1;gx<=1;gx++)for(let gz=-1;gz<=1;gz++)for(const b of colliderGrid.get((Math.floor(x/12)+gx)+','+(Math.floor(z/12)+gz))||[]){
  if(seen.has(b))continue;seen.add(b);const dx=x-clamp(x,b[0],b[2]),dz=z-clamp(z,b[1],b[3]),d=Math.hypot(dx,dz);
  if(d>0&&d<r)keep(dx/d,dz/d,r-d);
  else if(d===0){const faces=[[x-b[0],-1,0],[b[2]-x,1,0],[z-b[1],0,-1],[b[3]-z,0,1]].sort((a,b)=>a[0]-b[0]);keep(faces[0][1],faces[0][2],r+faces[0][0]);}
 }
 for(const v of fleet){
  if(v===ignore||v.garage&&v!==current||v.retired28||v===current&&driving)continue;
  if(Math.abs(groundAt(x,z)-v.root.position.y)>2.8)continue;const dx=x-v.root.position.x,dz=z-v.root.position.z;if(Math.abs(dx)>v.length/2+r+1||Math.abs(dz)>v.length/2+r+1)continue;
  const c=Math.cos(v.heading),s=Math.sin(v.heading),lx=c*dx-s*dz,lz=s*dx+c*dz,hx=v.width/2+r,hz=v.length/2+r;
  if(Math.abs(lx)<hx&&Math.abs(lz)<hz){const px=hx-Math.abs(lx),pz=hz-Math.abs(lz);if(px<pz){const sign=lx<0?-1:1;keep(c*sign,-s*sign,px);}else{const sign=lz<0?-1:1;keep(s*sign,c*sign,pz);}}
 }
 return best;
}

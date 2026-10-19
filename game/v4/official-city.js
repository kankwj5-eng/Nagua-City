/* Nagua City V4: visualiza los recursos urbanos originales sin cargar modelos antiguos. */
class OfficialCityV4 {
 constructor(B,scene){
  this.B=B;this.scene=scene;
  this.world=JSON.parse(document.getElementById('city-meta-world').textContent);
  this.ext=JSON.parse(document.getElementById('city-meta-extensions').textContent);
  this.data=JSON.parse(document.getElementById('city-data').textContent);
  this.tiles=new Map();this.textures=new Map();this.materials=new Map();this.loading=false;
  this.grid=new Map();this.obstacles=new Map();this.lastStream=0;this.error=null;
  for(const t of this.data.surfaces||[]){
   const xa=Math.floor(Math.min(t[0],t[3],t[6])/8),xb=Math.floor(Math.max(t[0],t[3],t[6])/8),
    za=Math.floor(Math.min(t[2],t[5],t[8])/8),zb=Math.floor(Math.max(t[2],t[5],t[8])/8);
   for(let x=xa;x<=xb;x++)for(let z=za;z<=zb;z++){
    const k=x+','+z;if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(t);
   }
  }
  for(const b of this.data.boxes||[]){
   if(b.length<4||!b.slice(0,4).every(Number.isFinite))continue;
   for(let x=Math.floor(b[0]/12);x<=Math.floor(b[2]/12);x++)for(let z=Math.floor(b[1]/12);z<=Math.floor(b[3]/12);z++){
    const k=x+','+z;if(!this.obstacles.has(k))this.obstacles.set(k,[]);this.obstacles.get(k).push(b);
   }
  }
  this.defs=[...this.world.zones.map((z,i)=>({z,i,kind:'world'})),...this.ext.zones.map((z,i)=>({z,i,kind:'extensions'}))];
  const baseMaterial=new B.StandardMaterial('Horizonte urbano V4',scene);
  baseMaterial.diffuseColor=B.Color3.FromHexString('#547668');baseMaterial.specularColor=B.Color3.Black();
  const base=B.MeshBuilder.CreateGround('Base del terreno original',{width:1100,height:1100},scene);
  base.position.y=-.18;base.material=baseMaterial;base.isPickable=false;
  this.limit=matchMedia('(pointer:coarse)').matches?10:16;
 }
 static decode(text){const raw=atob(text.trim()),result=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)result[i]=raw.charCodeAt(i);return result;}
 async unpack(id){
  const el=document.getElementById(id);if(!el)throw Error('Falta recurso del mapa original: '+id);
  const b=OfficialCityV4.decode(el.textContent);
  const stream=new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
 }
 groundAt(x,z){
  let h=-Infinity;
  for(const t of this.grid.get(Math.floor(x/8)+','+Math.floor(z/8))||[]){
   const den=(t[5]-t[8])*(t[0]-t[6])+(t[6]-t[3])*(t[2]-t[8]);if(Math.abs(den)<1e-8)continue;
   const a=((t[5]-t[8])*(x-t[6])+(t[6]-t[3])*(z-t[8]))/den,
    b=((t[8]-t[2])*(x-t[6])+(t[0]-t[6])*(z-t[8]))/den,c=1-a-b;
   if(a>=-.0001&&b>=-.0001&&c>=-.0001)h=Math.max(h,a*t[1]+b*t[4]+c*t[7]+.003);
  }
  return Number.isFinite(h)?h:.003;
 }
 inWorld(x,z){
  if(z<-287&&z>-330)return Math.abs(x+222)<2.1&&z>-308.5||Math.abs(x+222)<4.5&&z>-310.5&&z<-307.5;
  return Math.abs(x+222)<4.5&&z>-311&&z<-276||x>-266&&x<108&&z>-300&&z<=-266||
   Math.abs(x)<266&&Math.abs(z)<266||x>-20&&x<108&&z>=266&&z<515||
   x>=266&&x<397&&z>-46&&z<117||x>-270&&x<-172&&z>=-288&&z<-262||x>-405&&x<-259&&z>-90&&z<107;
 }
 blocked(x,z,r=.3){
  if(!this.inWorld(x,z))return true;
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)
   for(const b of this.obstacles.get((Math.floor(x/12)+dx)+','+(Math.floor(z/12)+dz))||[]){
    const xx=Math.max(b[0],Math.min(x,b[2])),zz=Math.max(b[1],Math.min(z,b[3]));
    if((x-xx)**2+(z-zz)**2<r*r)return true;
   }
  return false;
 }
 findSpace(x,z,r=.4){
  if(!this.blocked(x,z,r))return [x,z];
  for(let d=1;d<=17;d+=1.5)for(let a=0;a<8;a++){
   const angle=a*Math.PI/4,nx=x+d*Math.cos(angle),nz=z+d*Math.sin(angle);
   if(!this.blocked(nx,nz,r))return [nx,nz];
  }
  return [x,z];
 }
 image(kind,index){
  const key=kind+'-'+index;if(this.textures.has(key))return this.textures.get(key);
  const meta=(kind==='world'?this.world:this.ext).images[index];if(!meta)return null;
  const el=document.getElementById('city-image-'+key);if(!el)return null;
  const encoded=el.textContent.trim(),png=encoded.startsWith('iVBOR'),webp=encoded.startsWith('UklGR');
  const mime=png?'image/png':webp?'image/webp':'image/jpeg';
  const uri=encoded.startsWith('data:')?encoded:'data:'+mime+';base64,'+encoded;
  const t=new this.B.Texture(uri,this.scene,false,
   kind==='extensions'?!meta.flipY:false,this.B.Texture.TRILINEAR_SAMPLINGMODE);
  if(meta.repeat){t.uScale=meta.repeat[0];t.vScale=meta.repeat[1];}
  t.wrapU=t.wrapV=this.B.Texture.WRAP_ADDRESSMODE;this.textures.set(key,t);return t;
 }
 material(kind,index){
  const key=kind+'-'+index;if(this.materials.has(key))return this.materials.get(key);
  const meta=(kind==='world'?this.world:this.ext).materials[index];if(!meta)throw Error('Material inexistente '+key);
  const B=this.B,m=new B.PBRMaterial('Ciudad original '+key,this.scene);
  m.albedoColor=B.Color3.FromArray((meta.color||[1,1,1]).slice(0,3));
  if(kind==='extensions')m.albedoColor=m.albedoColor.toGammaSpace();
  m.roughness=meta.roughness??.85;m.metallic=meta.metalness??0;
  m.backFaceCulling=!meta.double;m.environmentIntensity=.55;
  const tex=kind==='world'?meta.texture:meta.image;
  if(tex!=null)m.albedoTexture=this.image(kind,tex);
  if(kind==='extensions'){
   m.alpha=meta.alpha??1;if(meta.emissive)m.emissiveColor=B.Color3.FromArray(meta.emissive);
   if(m.alpha<1)m.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHABLEND;
  }
  this.materials.set(key,m);return m;
 }
 makeMesh(name,p,n,uv,i,color,material,root){
  const B=this.B,mesh=new B.Mesh(name,this.scene),data=new B.VertexData();
  data.positions=p;data.normals=n;data.uvs=uv;data.indices=i;
  if(color){const count=p.length/3,rgba=new Float32Array(count*4);
   for(let k=0;k<count;k++){rgba[k*4]=color[k*3];rgba[k*4+1]=color[k*3+1];rgba[k*4+2]=color[k*3+2];rgba[k*4+3]=1;}
   data.colors=rgba;
  }
  data.applyToMesh(mesh);mesh.material=material;mesh.isPickable=false;mesh.parent=root;
  mesh.overrideMaterialSideOrientation=B.Material.CounterClockWiseSideOrientation;return mesh;
 }
 static typed(b64,type){const bytes=OfficialCityV4.decode(b64);return new type(bytes.buffer,bytes.byteOffset,bytes.byteLength/type.BYTES_PER_ELEMENT);}
 async loadTile(item){
  const {z,i,kind}=item,id=kind+'-'+z.id;if(this.tiles.has(id))return;
  const root=new this.B.TransformNode('Sector original '+z.id,this.scene);
  try{
   const bytes=await this.unpack('city-zone-'+kind+'-'+i);
   if(kind==='world'){
    const size=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(0,true),
      parts=JSON.parse(new TextDecoder().decode(bytes.subarray(4,4+size))),offset=4+size;
    for(const g of parts){
     const mat=this.material('world',g.m),rawName=this.world.materials[g.m]?.name||'';
     if(/^(lago|agua|water)$/i.test(rawName))continue;
     const numbers=(at,count)=>new Float32Array(bytes.buffer,bytes.byteOffset+offset+at,count);
     const p=numbers(g.p,g.count*3),rawN=new Int8Array(bytes.buffer,bytes.byteOffset+offset+g.n,g.count*3),n=new Float32Array(rawN.length);
     for(let k=0;k<n.length;k++)n[k]=rawN[k]/127;
     const uv=numbers(g.uv,g.count*2),indices=new Uint32Array(bytes.buffer,bytes.byteOffset+offset+g.i,g.icount);
     this.makeMesh(z.id,p,n,uv,indices,null,mat,root);
    }
   }else{
    const parts=JSON.parse(new TextDecoder().decode(bytes));
    for(const g of parts){
     const p=OfficialCityV4.typed(g.p,Float32Array),rawN=OfficialCityV4.typed(g.n,Int8Array),normal=new Float32Array(rawN.length);
     for(let k=0;k<rawN.length;k++)normal[k]=rawN[k]/127;
     const uv=OfficialCityV4.typed(g.uv,Float32Array),i=OfficialCityV4.typed(g.i,Uint32Array);
     const c=g.c?OfficialCityV4.typed(g.c,Float32Array):null;
     this.makeMesh(z.id,p,normal,uv,i,c,this.material('extensions',g.m),root);
    }
   }
   this.tiles.set(id,{root,item});
  }catch(e){root.dispose();this.error=e;throw e;}
 }
 async stream(x,z,initial=false){
  if(this.loading)return;this.loading=true;
  try{
   const radius=initial?130:matchMedia('(pointer:coarse)').matches?160:205;
   const near=this.defs.map(item=>({item,d:Math.hypot(item.z.x-x,item.z.z-z)}))
    .filter(o=>o.item.z.permanent||o.d<radius).sort((a,b)=>a.d-b.d);
   const wanted=new Set(near.slice(0,this.limit).map(o=>o.item.kind+'-'+o.item.z.id));
   for(const [id,item] of this.tiles){if(!wanted.has(id)&&!item.item.z.permanent){item.root.dispose();this.tiles.delete(id);}}
   let count=0;for(const {item} of near){const id=item.kind+'-'+item.z.id;
    if(!wanted.has(id)||this.tiles.has(id))continue;
    await this.loadTile(item);if(++count>=(initial?4:1))break;
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }finally{this.loading=false;}
 }
 inspect(){return {originalWorldZones:this.world.zones.length,originalExtensionZones:this.ext.zones.length,
  loadedZones:this.tiles.size,originalTextures:this.world.images.length+this.ext.images.length,
  oldVehicleModels:0,oldCharacters:0};}
}

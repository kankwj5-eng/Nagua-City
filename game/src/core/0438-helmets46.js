function helmets46(){
 const shell=pbr('Casco integral lacado46','#25323d',.24),edge=pbr('Borde de casco46','#141b20',.86),glass=pbr('Visor curvo policarbonato46','#b6c4c8',.14,.02);shell.clearCoat.isEnabled=true;shell.clearCoat.intensity=.95;shell.clearCoat.roughness=.12;glass.alpha=.28;glass.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHABLEND;glass.backFaceCulling=false;
 const sources=new Map();for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)]){
  const key=(p.uniform28?2:0)+p.bodyType;let templates=sources.get(key);
  if(!templates){const center=p.bodyType?1.585:1.683,items=[],pos=[],uv=[],indices=[],segments=48,rows=28;
   for(let j=0;j<=rows;j++)for(let i=0;i<=segments;i++){const theta=j/rows*Math.PI,phi=i/segments*Math.PI*2;pos.push(Math.sin(theta)*Math.cos(phi)*.109,center+Math.cos(theta)*.141,Math.sin(theta)*Math.sin(phi)*.139+.021);uv.push(i/segments,j/rows);}
   for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const k=j*(segments+1)+i,x=(pos[k*3]+pos[(k+1)*3])/2,y=(pos[k*3+1]+pos[(k+1)*3+1])/2,z=(pos[k*3+2]+pos[(k+1)*3+2])/2;if(z>.086&&y>center-.062&&y<center+.066&&Math.abs(x)<.099)continue;const b=k+segments+1;indices.push(k,k+1,b,k+1,b+1,b);}
   const normal=[];B.VertexData.ComputeNormals(pos,indices,normal);items.push(meshData('Carcasa anatómica46',pos,normal,uv,indices,null,shell,null));
   const vp=[],vn=[],vi=[];for(let j=0;j<=10;j++)for(let i=0;i<=32;i++){const a=-1.09+i/32*2.18,yy=center-.066+j/10*.132;vp.push(Math.sin(a)*.116,yy,.025+Math.cos(a)*.144);}for(let j=0;j<10;j++)for(let i=0;i<32;i++){const a=j*33+i,b=a+33;vi.push(a,a+1,b,a+1,b+1,b);}B.VertexData.ComputeNormals(vp,vi,vn);items.push(meshData('Visor envolvente46',vp,vn,null,vi,null,glass,null));
   for(const y of [center-.078,center+.073]){const path=[];for(let i=0;i<=30;i++){const a=-1.13+i/30*2.26;path.push(V(Math.sin(a)*.112,y,.024+Math.cos(a)*.14));}const m=B.MeshBuilder.CreateTube('Junta de visor46',{path,radius:.005,tessellation:6},scene);m.material=edge;items.push(m);}
   for(const side of [-1,1]){const m=shape46('CreateCylinder',{diameter:.025,height:.008,tessellation:16},edge,V(side*.111,center-.02,.057));m.rotation.z=Math.PI/2;items.push(m);}
   const chin=shape46('CreateSphere',{diameter:1,segments:24},shell,V(0,center-.101,.108),V(.182,.070,.170));items.push(chin);for(const x of [-.032,0,.032])items.push(shape46('CreateBox',{width:.019,height:.007,depth:.005},edge,V(x,center-.103,.191)));
   templates=skinPart46(p,merge46('Casco46',items),'Casco46',()=> 'head');for(const m of templates)m.setEnabled(false);sources.set(key,templates);
  }
  for(const m of p.root.getChildMeshes().filter(m=>/Helmet/.test(m.name)))m.dispose(false,false);
  const meshes=templates.map(m=>{const v=m.clone('Casco46_'+p.index,m.parent);v.skeleton=p.nearMeshes.find(x=>x.skeleton).skeleton;v.parent=p.nearMeshes.find(x=>x.skeleton).parent;v.setEnabled(false);return v;});
  p.helmet={setEnabled(value){for(const m of meshes)m.setEnabled(value);},isEnabled(){return meshes.some(m=>m.isEnabled());}};p.helmet46=meshes;art46.helmets++;
 }
 // Prototype meshes remain hidden outside any actor visibility hierarchy.
 for(const meshes of sources.values())for(const m of meshes){m.parent=null;m.setEnabled(false);}
}

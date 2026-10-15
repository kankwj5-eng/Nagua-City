// Cinco siluetas moderadas de árboles sin añadir geometría ni variantes GPU.
// El tamaño base, la distribución y el número de instancias se conservan.
function treeSilhouette42(index,baseScale){
 const variants=[[1,1,1],[.94,1.10,1.03],[1.08,.94,.94],[.92,1.05,1.10],[1.05,1.12,.95]];
 const shape=variants[((index%variants.length)+variants.length)%variants.length];
 return [baseScale*shape[0],baseScale*shape[1],baseScale*shape[2]];
}

function vegetation42(){
 const bark=pbr('Corteza escaneada42','#ffffff',1);surface42(bark,'bark_brown_02',1.8);const leaf=leafMaterial42(),sources=[treeSource42(0,bark,leaf),treeSource42(1,bark,leaf)];
 const positions=stage38.trees.map((r,i)=>({x:r.position.x,z:r.position.z,scale:r.scaling.x,rotation:r.rotation.y,i}));
 for(const old of stage38.trees){district31.roots=district31.roots.filter(r=>r!==old);old.dispose();}stage38.trees.length=0;
 for(const p of positions){const root=new B.TransformNode('Árbol tropical de copa densa42 '+p.i,scene);root.position.set(p.x,groundAt(p.x,p.z),p.z);root.rotation.y=p.rotation;const silhouette=treeSilhouette42(p.i,p.scale);root.scaling.set(silhouette[0],silhouette[1],silhouette[2]);for(const source of sources[p.i%2].getChildMeshes()){const m=source.createInstance('Árbol42 '+p.i+' '+source.name);m.parent=root;m.setEnabled(true);m.receiveShadows=true;m.isPickable=false;}root.metadata={x31:p.x,z31:p.z,r31:125};district31.roots.push(root);stage42.trees.push(root);}
 // A separate palm model: tapering trunk, arching rachis, individual pointed leaflets.
 const palm=new B.TransformNode('Fuente palma42',scene),trunk=B.MeshBuilder.CreateTube('Tronco de palma42',{path:[V(),V(.12,3,0),V(.24,6.4,.08),V(.14,8,.12)],radiusFunction:i=>[.19,.16,.13,.12][i],tessellation:12},scene);trunk.parent=palm;trunk.material=bark;projectUV34(trunk,1.8);
 const pos=[],idx=[],tex=[];for(let branch=0;branch<12;branch++){const a=branch*Math.PI/6,start=V(.14,8,.12);for(let j=0;j<19;j++){const t=(j+.5)/19,center=start.add(V(Math.cos(a)*t*2.6,Math.sin(t*Math.PI)*.7-t*.8,Math.sin(a)*t*2.6)),spread=Math.sin(t*Math.PI)*.85;for(const sign of [-1,1]){const end=center.add(V(-Math.sin(a)*spread*sign,-.21-t*.15,Math.cos(a)*spread*sign)),side=V(Math.cos(a)*.043,0,Math.sin(a)*.043),base=pos.length/3;for(const p of [center.subtract(side),center.add(side),end])pos.push(p.x,p.y,p.z);tex.push(0,0,1,0,.5,1);idx.push(base,base+1,base+2);}}}
 const normals=[];B.VertexData.ComputeNormals(pos,idx,normals);meshData('Frondas de palma42',pos,normals,tex,idx,null,leaf,palm);palm.setEnabled(false);stage42.sources.push(palm);
 for(let i=0;i<12;i++){const x=-111+(i%6)*44,z=i<6?101:-101;if([-185,-111,-37,37,111,185].some(r=>Math.abs(x-r)<8||Math.abs(z-r)<8)||blocked(x,z,.4,null,true))continue;const root=new B.TransformNode('Palmera avenida42 '+i,scene);root.position.set(x,groundAt(x,z),z);root.rotation.y=i*2.399;root.scaling.setAll(.8+(i%3)*.1);for(const src of palm.getChildMeshes()){const m=src.createInstance('Palmera42 '+i+' '+src.name);m.parent=root;m.setEnabled(true);m.receiveShadows=true;m.isPickable=false;}root.metadata={x31:x,z31:z,r31:140};district31.roots.push(root);stage42.palms.push(root);addWorldBox(x,z,.32,.32);}
}

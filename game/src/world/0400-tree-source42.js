function treeSource42(variant,bark,leaf){
 const root=new B.TransformNode('Fuente árbol tropical42 '+variant,scene),wood=[];let seed=42021+variant*91;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const trunk=B.MeshBuilder.CreateTube('Tronco42',{path:[V(0,0,0),V(.04,1.4,.03),V(-.08,2.8,.08),V(.10,4.1,0)],radiusFunction:i=>[.17,.135,.095,.035][i],tessellation:10},scene);trunk.material=bark;wood.push(trunk);
 const points=[],indices=[],uv=[],colors=[];
 for(let branch=0;branch<7;branch++){
  const angle=branch*2.399+variant*.7,r=1.15+rand()*.65,center=V(Math.cos(angle)*r,3.45+rand()*1.45,Math.sin(angle)*r),stem=B.MeshBuilder.CreateTube('Rama42',{path:[V(0,2.0+branch*.19,0),center.scale(.55).add(V(0,1.1,0)),center],radiusFunction:i=>[.066,.036,.009][i],tessellation:6},scene);stem.material=bark;wood.push(stem);
  for(let j=0;j<145;j++){
   const a=rand()*Math.PI*2,t=rand()*2-1,rr=Math.pow(rand(),.40),sx=Math.sqrt(1-t*t)*Math.cos(a),sz=Math.sqrt(1-t*t)*Math.sin(a),pos=center.add(V(sx*rr*1.23,t*rr*.82,sz*rr*1.13));
   const yaw=rand()*Math.PI*2,tilt=(rand()-.5)*1.25,w=.055+rand()*.035,len=.17+rand()*.11,right=V(Math.cos(yaw),0,Math.sin(yaw)),axis=V(-Math.sin(yaw)*Math.cos(tilt),Math.sin(tilt),Math.cos(yaw)*Math.cos(tilt)),normal=B.Vector3.Cross(right,axis).normalize(),base=points.length/3;
   for(const [u,v] of [[0,0],[-1,.32],[-.8,.72],[0,1],[.8,.72],[1,.32],[0,.48]]){const p=pos.add(right.scale(u*w)).add(axis.scale((v-.5)*len)).add(normal.scale(Math.sin(v*Math.PI)*.012));points.push(p.x,p.y,p.z);uv.push(u*.5+.5,v);const shade=.70+rr*.27;colors.push(shade,shade,shade);}
   for(let k=0;k<6;k++)indices.push(base+6,base+k,base+(k+1)%6);
  }
 }
 const normal=[];B.VertexData.ComputeNormals(points,indices,normal);const foliage=meshData('Copa de hojas42',points,normal,uv,indices,colors,leaf,root);const joined=B.Mesh.MergeMeshes(wood,true,true);joined.name='Tronco ramificado42';joined.material=bark;joined.parent=root;projectUV34(joined,1.8);
 root.setEnabled(false);stage42.sources.push(root);return root;
}

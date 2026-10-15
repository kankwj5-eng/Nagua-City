function skinPart46(p,meshes,name,boneFor){
 const body=p.nearMeshes.find(m=>m.skeleton),skeleton=body.skeleton;
 for(const m of meshes){const vertices=m.getVerticesData(B.VertexBuffer.PositionKind),joints=new Float32Array(vertices.length/3*4),weights=new Float32Array(joints.length);
  for(let i=0;i<vertices.length/3;i++){const name=boneFor(vertices,i),bone=skeleton.bones.findIndex(b=>b.name.replace(/^h\d+_/,'')===name);if(bone<0)throw Error('Falta hueso '+name);joints[i*4]=bone;weights[i*4]=1;}
  m.setVerticesData(B.VertexBuffer.MatricesIndicesKind,joints);m.setVerticesData(B.VertexBuffer.MatricesWeightsKind,weights);m.skeleton=skeleton;m.parent=body.parent;m.name=name+' '+m.material.name;m.alwaysSelectAsActiveMesh=false;
 }return meshes;
}

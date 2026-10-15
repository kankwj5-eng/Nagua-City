function projectUV34(mesh,scale){
 if(!mesh.getTotalVertices()||mesh.skeleton||mesh.isAnInstance)return;const pos=mesh.getVerticesData(B.VertexBuffer.PositionKind),normal=mesh.getVerticesData(B.VertexBuffer.NormalKind);if(!pos||!normal)return;
 mesh.computeWorldMatrix(true);const world=mesh.getWorldMatrix(),uv=new Float32Array(pos.length/3*2);
 for(let i=0;i<pos.length/3;i++){const j=i*3,p=B.Vector3.TransformCoordinates(V(pos[j],pos[j+1],pos[j+2]),world),n=B.Vector3.TransformNormal(V(normal[j],normal[j+1],normal[j+2]),world);const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);uv[i*2]=(ay>ax&&ay>az?p.x:ax>az?p.z:p.x)/scale;uv[i*2+1]=(ay>ax&&ay>az?p.z:p.y)/scale;}
 mesh.setVerticesData(B.VertexBuffer.UVKind,uv,false);stage34.uvMeshes++;
}

function loft46(name,rings,mat,segments=36){
 const pos=[],uv=[],ind=[];for(let j=0;j<rings.length;j++){const [z,xr,yr,y]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;pos.push(Math.cos(a)*xr,y+Math.sin(a)*yr,z);uv.push(i/segments,j/(rings.length-1));}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;ind.push(a,a+1,b,a+1,b+1,b);}const norm=[];B.VertexData.ComputeNormals(pos,ind,norm);return meshData(name,pos,norm,uv,ind,null,mat,null);
}

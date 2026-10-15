function compactGeometry46(geometries=scene.geometries){
 art46.compactedArrays??=0;art46.compactedValues??=0;
 for(const g of geometries){for(const kind of g.getVerticesDataKinds()){const vb=g.getVertexBuffer(kind),raw=vb?.getData();if(!Array.isArray(raw))continue;const data=g.getVerticesData(kind);if(!data)continue;g.setVerticesData(kind,new Float32Array(data),vb.isUpdatable(),vb.getSize());art46.compactedArrays++;art46.compactedValues+=data.length;}
  const indices=g.getIndices();if(Array.isArray(indices)){let maximum=0;for(const index of indices)maximum=Math.max(maximum,index);g.setIndices(maximum<65536?new Uint16Array(indices):new Uint32Array(indices),g.getTotalVertices());art46.compactedArrays++;art46.compactedValues+=indices.length;}}
}

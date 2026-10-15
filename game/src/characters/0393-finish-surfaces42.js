function finishSurfaces42(){
 for(const mat of scene.materials.slice()){
  if(/^asfalto$|Asfalto|asfalto/i.test(mat.name))surface42(mat,'asphalt_02',3.2,'#b3b5b4');
  else if(/^acera$|Losa de portal|Loseta de paseo|Losa de portal|Adoquín de corredor|Cerámica de portales|Losa.*concreto/i.test(mat.name))surface42(mat,'concrete_pavement',2.5,'#d7d3c9');
  else if(mat.metadata?.surface35==='tierra_ia'||/Terreno residencial extendido|Pasaje residencial de tierra|Tierra compactada|Suelo terroso|Suelo de solar/i.test(mat.name))surface42(mat,'brown_mud_dry',3.6,'#ddd2bd');
  else if(/Corteza|Ramas|Tronco|Corteza ramificada/i.test(mat.name))surface42(mat,'bark_brown_02',1.8);
 }
 // New world meshes inherit UV metres when streamed; already loaded meshes need reprojection once.
 for(const m of scene.meshes)if(m.material?.metadata?.surface42&&!m.isAnInstance&&!m.skeleton&&m.getTotalVertices())projectUV34(m,m.material.metadata.worldScale);
}

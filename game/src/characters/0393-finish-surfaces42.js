function finishSurfaces42(){
 for(const mat of scene.materials.slice()){
  // Use already-loaded scanned PBR grass/soil maps instead of the single
  // flat/bitmap-only legacy ground materials. Shared textures, no new downloads.
  // A tighter metre-space UV scale retains fine detail near the player.
  if(/^(zacate|Jardín de barrio|Jardín de rotonda)$/i.test(mat.name)){
   if(stage42.textures.aerial_grass_rock?.diff)surface42(mat,'aerial_grass_rock',2.15,'#bdd49c');
   else material34(mat,'aerial_grass_rock',2.15,'#bdd49c');
   mat.roughness=.96;
   mat.metadata={...(mat.metadata||{}),naturalGroundStage1:true};
  }
  else if(mat.name==='tierra'){
   surface42(mat,'brown_mud_dry',2.75,'#d8c8ac');
   mat.roughness=.97;
   mat.metadata={...(mat.metadata||{}),naturalGroundStage1:true};
  }
  else if(/^asfalto$|Asfalto|asfalto/i.test(mat.name))surface42(mat,'asphalt_02',3.2,'#b3b5b4');
  else if(/^acera$|Losa de portal|Loseta de paseo|Losa de portal|Adoquín de corredor|Cerámica de portales|Losa.*concreto/i.test(mat.name))surface42(mat,'concrete_pavement',2.5,'#d7d3c9');
  else if(mat.metadata?.surface35==='tierra_ia'||/Terreno residencial extendido|Pasaje residencial de tierra|Tierra compactada|Suelo terroso|Suelo de solar/i.test(mat.name))surface42(mat,'brown_mud_dry',3.6,'#ddd2bd');
  else if(/Corteza|Ramas|Tronco|Corteza ramificada/i.test(mat.name))surface42(mat,'bark_brown_02',1.8);
 }
 // Respect mobile low quality without allocating replacement maps or shaders.
 const priorSettings=settings;
 settings=function(){
  priorSettings();
  for(const mat of scene.materials){
   if(!mat.metadata?.naturalGroundStage1)continue;
   const family=mat.metadata.surface42||mat.metadata.surface34;
   const textures=stage42.textures[family]||stage34.families[family];
   mat.bumpTexture=quality==='low'?null:textures?.normal||textures?.nor_gl||null;
  }
 };
 settings();
 // New world meshes inherit UV metres when streamed; already loaded meshes need reprojection once.
 for(const m of scene.meshes)if(m.material?.metadata?.surface42&&!m.isAnInstance&&!m.skeleton&&m.getTotalVertices())projectUV34(m,m.material.metadata.worldScale);
}

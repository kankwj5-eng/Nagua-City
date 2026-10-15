function materials46(){
 const families=stage34.families;for(const mat of scene.materials.slice()){
  if(!(mat instanceof B.PBRMaterial)||mat.name.includes('46'))continue;let family=null;
  if(/Estuco|Pared residencial|Fachada|pared\d|Pared de|Muro de|Muros de|Pintura de casa/i.test(mat.name))family='painted_plaster_wall';
  else if(/Ladrillo|brick/i.test(mat.name))family='brick_wall_001';
  else if(/Techo metálico|Lámina|Roof.*metal|roofMetal|Zinc|chapa|Cubierta metálica/i.test(mat.name))family='corrugated_iron';
  else if(/Baldosa|Cerámica|Loseta|Concreto|Acera/i.test(mat.name)&&!mat.metadata?.surface42)family='concrete_floor';
  if(!family||!families[family]?.diff)continue;const maps=families[family];mat.albedoTexture=maps.diff;mat.bumpTexture=maps.normal||maps.nor_gl;mat.metallicTexture=maps.arm||maps.rough;mat.useRoughnessFromMetallicTextureAlpha=false;mat.useRoughnessFromMetallicTextureGreen=true;mat.useMetallnessFromMetallicTextureBlue=false;mat.roughness=family==='corrugated_iron'?.52:.92;mat.metallic=family==='corrugated_iron'?.68:0;if(mat.bumpTexture)mat.bumpTexture.level=family==='brick_wall_001'?.42:.20;mat.metadata={...(mat.metadata||{}),worldScale:family==='brick_wall_001'?2:3};art46.materialUpgrades++;
 }
 for(const m of scene.meshes)if(m.material?.metadata?.worldScale&&!m.skeleton&&!m.isAnInstance&&m.getTotalVertices()&&/Pared|Fachada|Muro|Techo|Ladrillo|roof|pared/i.test(m.material.name))projectUV34(m,m.material.metadata.worldScale);
}
// Same garden sources and placements; only render-instance residency changes.

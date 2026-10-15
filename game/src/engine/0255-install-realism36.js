function installRealism36(){
 for(const m of scene.materials.slice()){
  if(m.metadata?.surface34||m.metadata?.surface35){const wall=/wall|plaster|estuco/.test(m.metadata.surface34||'');new SurfaceVariation36(m,wall);stage36.materials++;}
  if(m instanceof B.PBRMaterial)m.enableSpecularAntiAliasing=true;
 }
 for(const key of ['paint','red','white','yellow','blue']){const m=assetMats[key];if(m){m.metallic=0;m.roughness=.31;m.clearCoat.intensity=.72;m.clearCoat.roughness=.18;}}
 for(const key of ['rubber','seat','jeans','shirt','streetFabric']){const m=assetMats[key];if(m){m.metallic=0;m.roughness=key==='seat'?.82:.95;}}
 if(assetMats.foliage33){stage36.wind=new LeafWind36(assetMats.foliage33);assetMats.foliage33.twoSidedLighting=true;}
 details36();for(const root of stage36.details)for(const m of root.getChildMeshes())finishMeshUV34(m);
 const before=settings;settings=function(){before();if(stage36.wind)stage36.wind.strength=quality==='low'?0:.65;};
}


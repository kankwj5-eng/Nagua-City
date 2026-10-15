function finishHumans41(){
 const cloth=detailNormal41('Normal de tejido41',128,'cloth'),skin=detailNormal41('Microrelieve de piel41',128,'skin');cloth.uScale=cloth.vScale=18;skin.uScale=skin.vScale=10;
 const visited=new Set();for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)]){
  cacheRig41(p);stage41.people++;
  for(const m of [...p.nearMeshes,...p.lodMeshes]){
   const mat=m.material;if(!mat||visited.has(mat.uniqueId))continue;visited.add(mat.uniqueId);
   if(m.part28||/Camiseta|Short|Ropa de calle/.test(mat.name)){mat.bumpTexture=cloth;mat.bumpTexture.level=.16;mat.roughness=.87;mat.metallic=0;if(mat.sheen){mat.sheen.isEnabled=true;mat.sheen.intensity=.10;}}
   else if(/Piel|CitizenAtlas|protagonista|Protagonista|Acabado humano/.test(mat.name)){mat.bumpTexture=skin;mat.bumpTexture.level=.10;mat.roughness=.72;mat.metallic=0;mat.environmentIntensity=.42;}
   else continue;stage41.materials++;
  }
 }
 for(const mat of [assetMats.weaponSteel,assetMats.toolMetal])if(mat){mat.roughness=.31;mat.metallic=.82;mat.environmentIntensity=.65;}
 const grip=assetMats.weaponGrip;if(grip){grip.bumpTexture=cloth;grip.roughness=.84;}
}

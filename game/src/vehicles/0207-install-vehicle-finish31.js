function installVehicleFinish31(){
 // The packed cars already contain windshield, lateral and rear window meshes.
 // Keep their surfaces visible instead of painting every pane opaque.
 // The same ONE shared material covers every car, no added meshes or textures.
 const smoke=pbr('Cristal de ventanas31','#547078',.16,0);
 // Alpha blending costs extra fill-rate on low-end Mali devices.
 // Keep a reflective dielectric tint below high quality; swap one shared
 // material only when the user changes graphics quality.
 const glassQuality31=()=>{
  const transparent=quality==='high';
  smoke.alpha=transparent?.78:1;
  smoke.transparencyMode=transparent?B.PBRMaterial.PBRMATERIAL_ALPHABLEND:B.PBRMaterial.PBRMATERIAL_OPAQUE;
 };
 glassQuality31();
 const priorGlassSettings31=settings;
 settings=function(){priorGlassSettings31();glassQuality31();};
 smoke.backFaceCulling=false;
 smoke.environmentIntensity=.64;
 smoke.clearCoat.isEnabled=true;
 smoke.clearCoat.intensity=.62;
 smoke.clearCoat.roughness=.10;
 for(const v of fleet){
  for(const mesh of v.root.getChildMeshes()){
   const name=mesh.material?.name;
   if(name==='glass'||/^(?:Cristal oscuro opaco31|Cristal de ventanas31)$/.test(name||'')){
    // Headlight lenses on motorcycles are not transparent cabin windows.
    if(!v.bike){mesh.material=smoke;mesh.receiveShadows=false;continue;}
   }
   if(mesh.material){mesh.material.alpha=1;mesh.material.transparencyMode=B.PBRMaterial.PBRMATERIAL_OPAQUE;}
  }
  district31.opaqueVehicles++;
 }
 // Better readability at modest budgets: restrained contrast, warmer direct light and cooler shade.
 const lighting=lightSettings;lightSettings=function(){lighting();scene.imageProcessingConfiguration.contrast=1.16;scene.imageProcessingConfiguration.exposure=$('lighting').value==='dia'?1.02:1.08;scene.fogStart=145;scene.fogEnd=335;};lightSettings();
}

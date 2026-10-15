function surface42(mat,family,scale,tint=null){
 const maps=stage42.textures[family];if(!mat||!maps||!(mat instanceof B.PBRMaterial))return;
 mat.albedoTexture=maps.diff;mat.bumpTexture=maps.normal;mat.bumpTexture.level=family==='bark_brown_02'?.55:family==='asphalt_02'?.32:.38;
 mat.invertNormalMapX=false;mat.invertNormalMapY=false;mat.metallicTexture=maps.arm;mat.useRoughnessFromMetallicTextureAlpha=false;mat.useRoughnessFromMetallicTextureGreen=true;mat.useMetallnessFromMetallicTextureBlue=true;mat.useAmbientOcclusionFromMetallicTextureRed=true;mat.ambientTextureStrength=.52;mat.metallic=1;mat.roughness=1;mat.environmentIntensity=.48;
 // Césped y tierra son dieléctricos, no metal. Mantener el ARM compartido
 // para roughness (G) y AO (R), sin usar su canal metálico (B).
 // No se crean mapas, shaders, mallas ni llamadas de dibujo adicionales.
 if(family==='aerial_grass_rock'||family==='brown_mud_dry'){
  mat.useMetallnessFromMetallicTextureBlue=false;
  mat.metallic=0;
  mat.roughness=.98;
  mat.environmentIntensity=.28;
 }
 mat.albedoColor=tint?B.Color3.FromHexString(tint):B.Color3.White();mat.enableSpecularAntiAliasing=true;mat.metadata={...(mat.metadata||{}),surface42:family,worldScale:scale};stage42.materials++;
}

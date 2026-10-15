function surface42(mat,family,scale,tint=null){
 const maps=stage42.textures[family];if(!mat||!maps||!(mat instanceof B.PBRMaterial))return;
 mat.albedoTexture=maps.diff;mat.bumpTexture=maps.normal;mat.bumpTexture.level=family==='bark_brown_02'?.55:family==='asphalt_02'?.32:.38;
 mat.invertNormalMapX=false;mat.invertNormalMapY=false;mat.metallicTexture=maps.arm;mat.useRoughnessFromMetallicTextureAlpha=false;mat.useRoughnessFromMetallicTextureGreen=true;mat.useMetallnessFromMetallicTextureBlue=true;mat.useAmbientOcclusionFromMetallicTextureRed=true;mat.ambientTextureStrength=.52;mat.metallic=1;mat.roughness=1;mat.environmentIntensity=.48;
 mat.albedoColor=tint?B.Color3.FromHexString(tint):B.Color3.White();mat.enableSpecularAntiAliasing=true;mat.metadata={...(mat.metadata||{}),surface42:family,worldScale:scale};stage42.materials++;
}

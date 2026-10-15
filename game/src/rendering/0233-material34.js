function material34(mat,family,scale,tint=null){
 const t=stage34.families[family];if(!t||!mat||!('albedoTexture' in mat))return;
 mat.albedoTexture=t.diff;mat.bumpTexture=t.normal||null;mat.invertNormalMapX=false;mat.invertNormalMapY=false;
 if(t.arm){mat.metallicTexture=t.arm;mat.useRoughnessFromMetallicTextureAlpha=false;mat.useRoughnessFromMetallicTextureGreen=true;mat.useMetallnessFromMetallicTextureBlue=true;mat.useAmbientOcclusionFromMetallicTextureRed=true;mat.ambientTextureStrength=.68;mat.metallic=1;mat.roughness=1;}else{mat.metallicTexture=null;mat.metallic=0;mat.roughness=.96;}
 mat.environmentIntensity=family==='corrugated_iron'?.38:.29;mat.albedoColor=tint?B.Color3.FromHexString(tint):B.Color3.White();mat.metadata={...(mat.metadata||{}),worldScale:scale,surface34:family};stage34.materials++;
}

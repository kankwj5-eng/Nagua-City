function materials37(){
 assetMats.trim37=pbr('Polímero de piezas37','#171d20',.82,0);
 assetMats.lens37=pbr('Óptica sellada37','#617e87',.16,0);assetMats.lens37.clearCoat.isEnabled=true;assetMats.lens37.clearCoat.intensity=.85;assetMats.lens37.clearCoat.roughness=.08;assetMats.lens37.environmentIntensity=.80;
 assetMats.lamp37=pbr('Reflector óptico37','#cad9de',.18,.15);
 for(const m of [assetMats.trim37,assetMats.lens37,assetMats.lamp37]){m.alpha=1;m.transparencyMode=B.PBRMaterial.PBRMATERIAL_OPAQUE;m.enableSpecularAntiAliasing=true;stage37.materials++;}
 // All additional paint colors use the dielectric paint model too.
 for(const key of ['graphite','emerald','orange','cream','black']){const m=assetMats[key];if(m){m.metallic=0;m.roughness=.31;m.clearCoat.isEnabled=true;m.clearCoat.intensity=.72;m.clearCoat.roughness=.18;}}
}

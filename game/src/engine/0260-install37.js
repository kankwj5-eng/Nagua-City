function install37(){
 for(const key of ['graphite','emerald','orange','cream','black']){const m=assetMats[key];if(m){m.metallic=0;m.roughness=.31;m.clearCoat.isEnabled=true;m.clearCoat.intensity=.72;m.clearCoat.roughness=.18;}}
 const before=settings;settings=function(){before();if(stage37.wind)stage37.wind.strength=quality==='low'?0:.50;for(const r of stage37.plants)r.metadata.r31=quality==='low'?55:95;for(const r of stage37.grass)r.metadata.r31=quality==='low'?40:75;};
}


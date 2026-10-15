function installTechnical44(){
 stage35.settings.mode='auto';$('adaptive35').value='auto';resetBudget35();
 refreshZones25=refreshZones44;updateHouseDetails=updateHouses44;
 // Stopped legacy groups retain old keyframes after the new graph replaces them.
 // Keep both motorcycle clip tracks; group disposal does not dispose target nodes.
 const rideKeys=new Map();for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)])for(const name of ['RideBoxer','RidePulsar'])for(const t of p.clips[name]?.tracks||[]){const key=[(p.uniform28?2:0)+p.bodyType,name,t.target.name.replace(/^h\d+_/,''),t.property].join('|');if(rideKeys.has(key)){t.keys=rideKeys.get(key);technical44.sharedRideTracks++;}else rideKeys.set(key,t.keys);}
 for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)]){for(const group of [...p.entry.animationGroups]){group.dispose();technical44.releasedAnimationGroups++;}p.entry.animationGroups.length=0;}
 for(const s of catalog.images)technical44.releasedImageStrings+=s.length;catalog.images.length=0;
 for(const s of extensions.images){if(s.data){technical44.releasedImageStrings+=s.data.length;delete s.data;}}
 let lastShadow44='';const shadows=updateShadowList;updateShadowList=function(){const key=[scene.getFrameId(),zoneRevision44,houseRevision44,scene.meshes.length,quality,homeMode,homeGarage,driving,current?.id].join('|');if(key===lastShadow44){technical44.shadowCoalesced++;return;}lastShadow44=key;technical44.shadowScans++;shadows();};
}

// Authored character, motorcycles, helmets, gardens and material integration.

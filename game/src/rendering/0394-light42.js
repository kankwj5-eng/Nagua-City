// ACES-friendly restrained contrast and a genuinely darker evening.
// No additional post-processing pass or dynamic light is allocated on mobile.
function light42(){
 const day=$('lighting').value==='dia',ambient=scene.lights.find(l=>l instanceof B.HemisphericLight);
 sun.direction.copyFrom(day?V(.42,-.76,-.49):V(.62,-.54,-.56)).normalize();
 sun.intensity=day?1.92:1.18;
 sun.diffuse=B.Color3.FromHexString(day?'#f4ecd9':'#dfbb97');
 if(ambient){ambient.intensity=day?.43:.32;ambient.diffuse=B.Color3.FromHexString(day?'#b4c3cf':'#89949e');ambient.groundColor=B.Color3.FromHexString('#79715f');}
 scene.environmentIntensity=day?.58:.43;
 scene.imageProcessingConfiguration.exposure=day?.99:.90;
 scene.imageProcessingConfiguration.contrast=1.12;
 scene.fogColor=B.Color3.FromHexString(day?'#9daeb8':'#817f7d');
 scene.fogStart=quality==='low'?100:165;scene.fogEnd=quality==='high'?410:290;
}

function light42(){
 const day=$('lighting').value==='dia',ambient=scene.lights.find(l=>l instanceof B.HemisphericLight);
 sun.direction.copyFrom(day?V(.42,-.76,-.49):V(.62,-.54,-.56)).normalize();sun.intensity=day?2.05:1.85;sun.diffuse=B.Color3.FromHexString(day?'#fff4df':'#ffdeb4');
 if(ambient){ambient.intensity=.46;ambient.diffuse=B.Color3.FromHexString('#b9ccde');ambient.groundColor=B.Color3.FromHexString('#79715f');}
 scene.environmentIntensity=.62;scene.imageProcessingConfiguration.exposure=day?1.06:1.10;scene.imageProcessingConfiguration.contrast=1.08;
 scene.fogColor=B.Color3.FromHexString(day?'#9daeb8':'#b8aca0');scene.fogStart=quality==='low'?100:165;scene.fogEnd=quality==='high'?410:290;
}

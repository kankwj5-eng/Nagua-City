// Download only the compressed GLB chosen for the current game build.
// Portable HTML continues to decode its original embedded base64 unchanged.
async function fetchHumanGlb48(src){
 const url=new URL(src,document.baseURI);
 if(url.origin!==location.origin)throw Error('Modelo fuera del origen');
 const res=await fetch(url.href,{cache:'force-cache'});
 if(!res.ok)throw Error('No se pudo descargar el personaje ('+res.status+')');
 const compressed=new Uint8Array(await res.arrayBuffer());
 startup48.remoteRequests=(startup48.remoteRequests||0)+1;
 startup48.remoteBytes=(startup48.remoteBytes||0)+compressed.byteLength;
 return new Uint8Array(await inflate(compressed));
}
async function prepareHumans(){const raw=await packed48('humans');delete INTEGRATED.humans;for(const model of raw.models){const glb=model.glb.startsWith('./assets/stream/')?await fetchHumanGlb48(model.glb):bytes(model.glb);model.glb='';const container=await B.SceneLoader.LoadAssetContainerAsync('',glb,scene,null,'.glb');await loadYield25();for(const a of container.animationGroups)a.stop();for(const m of container.meshes){m.isPickable=false;m.receiveShadows=true;if(m.material){m.material.environmentIntensity=.65;if(m.material.name.includes('CitizenAtlas')){m.material.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHATEST;m.material.alphaCutOff=.40;}m.material.backFaceCulling=!/hair|ponytail|short02/i.test(m.name);}}humanContainers.push(container);}soleCurves.push(...(raw.soleCurves||[]));for(let i=0;i<2;i++){const original=humanContainers[i].materials.find(m=>m.name.includes('CitizenAtlas')||m.name.includes('Piel anatómica MH43')||m.name.startsWith('Piel_MPFB28')).albedoTexture;wardrobe.push([original,...await Promise.all(raw.wardrobe[i].map(s=>loadTexture(s.startsWith('./assets/stream/')?s:'data:image/jpeg;base64,'+s,false)))]);}}

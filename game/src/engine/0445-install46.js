// Pequeña respuesta de la carrocería a la diferencia de altura entre ejes.
// Modelo original, solo presentación: no altera contactos, fuerzas ni ruedas.
function bikeTerrainTarget46(x,z,heading,wheelbase,sampleGround){
 const span=clamp(Number.isFinite(wheelbase)?wheelbase:1.3,.9,2.2);
 const dx=-Math.sin(heading)*span*.5,dz=-Math.cos(heading)*span*.5;
 const front=sampleGround(x+dx,z+dz),rear=sampleGround(x-dx,z-dz);
 if(!Number.isFinite(front)||!Number.isFinite(rear))return 0;
 return clamp(Math.atan2(front-rear,span),-.085,.085);
}

async function install46(){
 pruneLegacy46();
 const leafEl=$('asset-leaf46');art46.leafTexture=await loadTexture('data:image/webp;base64,'+leafEl.textContent,false);art46.leafTexture.hasAlpha=true;art46.leafTexture.gammaSpace=true;leafEl.remove();
 hero46();helmets46();for(const v of fleet)bike46(v);materials46();gardens46();compactGeometry46();
 // Newly streamed geometry must keep packed CPU buffers too.
 const originalMeshData=meshData;meshData=function(name,p,n,u,i,c,mat,parent){return originalMeshData(name,Array.isArray(p)?new Float32Array(p):p,Array.isArray(n)?new Float32Array(n):n,Array.isArray(u)?new Float32Array(u):u,Array.isArray(i)?new Uint32Array(i):i,c,mat,parent);};
 const house=buildHouseDetails;buildHouseDetails=function(...args){const root=house(...args);compactGeometry46([...new Set(root.getChildMeshes().map(m=>m.geometry).filter(Boolean))]);return root;};
 const update=updateFleet;updateFleet=function(dt){update(dt);for(const v of fleet)if(v.art46){for(const m of v.parts.body.getChildMeshes())if(!/bike46/.test(m.name)&&/_(?:paint|red|seat)_/.test(m.name))m.setEnabled(false);for(const part of ['wheel_front','wheel_rear'])for(const m of v.parts[part].getChildMeshes())if(!/bike46|Tornillería/.test(m.name))m.setEnabled(false);}};
 scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;scene.skipPointerUpPicking=true;
 const resetInertia=resetInertia30;resetInertia30=function(){resetInertia();state.motoPitch46=state.motoPitchVelocity46=0;if(current?.bike){current.slopePitch46=0;current.slopeAt46=NaN;current.parts.body.rotation.x=0;}};
 const suspend=suspension40;suspension40=function(v){suspend(v);if(v.bike&&v.art46&&driving){
  const now=gameplayTime,last=v.slopeAt46;
  // Consultar el terreno como máximo 10 veces por segundo (dos apoyos),
  // manteniendo interpolación suave en los pasos de física a 60 Hz.
  if(!Number.isFinite(last)||now<last||now-last>=.10){
   v.slopeTarget46=bikeTerrainTarget46(v.root.position.x,v.root.position.z,state.heading,v.wheelbase,groundAt);
   v.slopeAt46=now;
  }
  v.slopePitch46=(v.slopePitch46||0)+((v.slopeTarget46||0)-(v.slopePitch46||0))*(1-Math.exp(-6/60));
  v.parts.body.rotation.x=(state.motoPitch46||0)+v.slopePitch46;
 }};
}

// Android/local-file startup: no cloned legacy animation buffers and no silent wait.

async function install46(){
 pruneLegacy46();
 const leafEl=$('asset-leaf46');art46.leafTexture=await loadTexture('data:image/webp;base64,'+leafEl.textContent,false);art46.leafTexture.hasAlpha=true;art46.leafTexture.gammaSpace=true;leafEl.remove();
 hero46();helmets46();for(const v of fleet)bike46(v);materials46();gardens46();compactGeometry46();
 // Newly streamed geometry must keep packed CPU buffers too.
 const originalMeshData=meshData;meshData=function(name,p,n,u,i,c,mat,parent){return originalMeshData(name,Array.isArray(p)?new Float32Array(p):p,Array.isArray(n)?new Float32Array(n):n,Array.isArray(u)?new Float32Array(u):u,Array.isArray(i)?new Uint32Array(i):i,c,mat,parent);};
 const house=buildHouseDetails;buildHouseDetails=function(...args){const root=house(...args);compactGeometry46([...new Set(root.getChildMeshes().map(m=>m.geometry).filter(Boolean))]);return root;};
 const update=updateFleet;updateFleet=function(dt){update(dt);for(const v of fleet)if(v.art46){for(const m of v.parts.body.getChildMeshes())if(!/bike46/.test(m.name)&&/_(?:paint|red|seat)_/.test(m.name))m.setEnabled(false);for(const part of ['wheel_front','wheel_rear'])for(const m of v.parts[part].getChildMeshes())if(!/bike46|Tornillería/.test(m.name))m.setEnabled(false);}};
 scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;scene.skipPointerUpPicking=true;
 const resetInertia=resetInertia30;resetInertia30=function(){resetInertia();state.motoPitch46=state.motoPitchVelocity46=0;if(current?.bike)current.parts.body.rotation.x=0;};
 const suspend=suspension40;suspension40=function(v){suspend(v);if(v.bike&&v.art46&&driving){v.parts.body.rotation.x=state.motoPitch46||0;}};
}

// Android/local-file startup: no cloned legacy animation buffers and no silent wait.

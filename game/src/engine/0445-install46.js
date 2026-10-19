// Calidad original de Managua; sin retoques al esqueleto ni a las motos GLB.
async function install46(){
 const leafEl=$('asset-leaf46');
 art46.leafTexture=await loadTexture('data:image/webp;base64,'+leafEl.textContent,false);
 art46.leafTexture.hasAlpha=true;art46.leafTexture.gammaSpace=true;
 leafEl.remove();
 materials46();gardens46();compactGeometry46();
 const meshOriginal=meshData;
 meshData=function(name,p,n,u,i,c,mat,parent){
  return meshOriginal(name,Array.isArray(p)?new Float32Array(p):p,
   Array.isArray(n)?new Float32Array(n):n,Array.isArray(u)?new Float32Array(u):u,
   Array.isArray(i)?new Uint32Array(i):i,c,mat,parent);
 };
 const houseOriginal=buildHouseDetails;
 buildHouseDetails=function(...args){
  const root=houseOriginal(...args);
  compactGeometry46([...new Set(root.getChildMeshes().map(m=>m.geometry).filter(Boolean))]);
  return root;
 };
 scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;
 scene.skipPointerUpPicking=true;
}

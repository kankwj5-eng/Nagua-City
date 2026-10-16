async function maps42(){
 const el=$('asset-materials42'),raw=await packed48('materials42');el.remove();
 for(const [family,channels] of Object.entries(raw)){const maps={};for(const [key,src] of Object.entries(channels)){maps[key]=await loadTexture(src,false);maps[key].gammaSpace=key==='diff';maps[key].anisotropicFilteringLevel=8;}stage42.textures[family]=maps;}
}

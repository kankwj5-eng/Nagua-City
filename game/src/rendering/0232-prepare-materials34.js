async function prepareMaterials34(){
 status('Preparando texturas de calles y viviendas…',73);
 const node=$('asset-surfaces34');if(!node)throw Error('Faltan las texturas V34');const packed=await packed48('surfaces34');node.remove();
 for(const [name,channels] of Object.entries(packed)){const maps={};for(const [kind,src] of Object.entries(channels)){maps[kind]=await loadTexture(src,false);maps[kind].gammaSpace=kind==='diff';maps[kind].anisotropicFilteringLevel=4;if(kind==='normal')maps[kind].level=.20;await loadYield25();}stage34.families[name]=maps;}
}

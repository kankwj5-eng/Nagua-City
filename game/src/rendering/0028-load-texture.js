async function loadTexture(src,invert=false){
 const previous=scene.useDelayedTextureLoading;let t,resolve48,reject48;const ready48=new Promise((resolve,reject)=>{resolve48=resolve;reject48=reject;});ready48.catch(()=>{});
 try{scene.useDelayedTextureLoading=true;t=new B.Texture(src,scene,false,invert,B.Texture.TRILINEAR_SAMPLINGMODE,()=>resolve48(),(_,e)=>{const message=String(e?.message||e||'Textura inválida');startup48.textureErrors.push(message);reject48(Error(message));});}
 finally{scene.useDelayedTextureLoading=previous;}
 t.startupReady48=ready48;t.gammaSpace=true;t.wrapU=t.wrapV=B.Texture.WRAP_ADDRESSMODE;t.anisotropicFilteringLevel=8;return t;
}

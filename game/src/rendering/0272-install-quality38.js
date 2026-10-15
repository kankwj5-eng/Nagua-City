function installQuality38(){
 $('quality').value=matchMedia('(pointer:coarse)').matches?'medium':'high';stage35.settings.mode='auto';$('adaptive35').value='auto';stage35.settings.sharp=.16;$('sharp35').value='0.16';
 const previous=settings;settings=function(){previous();stage38.image.mode=stage35.settings.mode;const caps=engine.getCaps();for(const tex of scene.textures)if(tex.wrapU===B.Texture.WRAP_ADDRESSMODE||tex.wrapV===B.Texture.WRAP_ADDRESSMODE)tex.anisotropicFilteringLevel=Math.min(8,caps.maxAnisotropy||8);if(stage35.sharpen)stage35.sharpen.samples=engine.webGLVersion>1?Math.min(quality==='high'?4:2,caps.maxMSAASamples||1):1;if(stage38.leafWind)stage38.leafWind.strength=quality==='low'?0:.40;for(const r of stage38.trees)r.metadata.r31=quality==='low'?65:115;};
}


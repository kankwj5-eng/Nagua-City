function shadowSettings42(){
 const size=quality==='high'?2048:quality==='low'?512:1024;
 if(!shadow||shadow.getShadowMap().getSize().width!==size){shadow?.dispose();shadow=new B.ShadowGenerator(size,sun);}
 sun.shadowEnabled=true;sun.autoUpdateExtends=false;sun.shadowMinZ=15;sun.shadowMaxZ=175;
 const radius=quality==='low'?24:quality==='high'?38:32;sun.orthoLeft=-radius;sun.orthoRight=radius;sun.orthoTop=radius;sun.orthoBottom=-radius;
 shadow.bias=.00015;shadow.normalBias=.016;shadow.setDarkness(.13);shadow.filteringQuality=quality==='high'?B.ShadowGenerator.QUALITY_MEDIUM:B.ShadowGenerator.QUALITY_LOW;
 if(stage42.settings.shadow==='cinema'&&engine.webGLVersion>1&&quality==='high'){shadow.useContactHardeningShadow=true;shadow.contactHardeningLightSizeUVRatio=.012;}
 else shadow.usePercentageCloserFiltering=true;
 updateShadowList();
}

function ao42(){
 if(stage42.ao){stage42.ao.dispose();stage42.ao=null;}
 if(!stage42.settings.ao||quality!=='high'||engine.webGLVersion<2||!B.SSAO2RenderingPipeline)return;
 try{const ao=new B.SSAO2RenderingPipeline('Oclusión ambiental42',scene,{ssaoRatio:.5,blurRatio:.5},[camera]);ao.totalStrength=.62;ao.radius=.7;ao.samples=8;ao.maxZ=80;ao.expensiveBlur=false;stage42.ao=ao;}catch(e){stage42.errors.push('AO: '+e.message);}
}

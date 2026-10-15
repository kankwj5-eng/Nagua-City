function sharpenSettings35(){const want=quality!=='low'&&stage35.settings.sharp>0;try{
 if(want&&!stage35.sharpen){stage35.sharpen=new B.SharpenPostProcess('Nitidez suave35',1,null,B.Texture.BILINEAR_SAMPLINGMODE,engine,false);stage35.sharpen.colorAmount=1;stage35.fxaa=null;}
 if(want&&!stage35.sharpenAttached){camera.attachPostProcess(stage35.sharpen);stage35.sharpenAttached=true;}
 if(!want&&stage35.sharpenAttached){camera.detachPostProcess(stage35.sharpen);stage35.sharpenAttached=false;}
 if(stage35.sharpen)stage35.sharpen.edgeAmount=stage35.settings.sharp;
 }catch(e){stage35.errors.push(String(e));stage35.settings.sharp=0;}}

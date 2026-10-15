function leafMaterial42(){
 const mat=pbr('Lámina foliar tropical42','#ffffff',.88),texture=new B.DynamicTexture('Nervaduras de hojas42',{width:128,height:256},scene,true),c=texture.getContext(),im=c.createImageData(128,256);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){const u=(x/127-.5)*2,v=y/255,k=(y*128+x)*4,vein=Math.pow(.5+.5*Math.cos(v*105+Math.abs(u)*13),16),mid=Math.exp(-Math.abs(u)*70),varied=Math.sin(v*10+u*8)*.04;im.data[k]=45+vein*18+mid*21+varied*60;im.data[k+1]=85+vein*19+mid*29+varied*100;im.data[k+2]=24+vein*8+mid*12;im.data[k+3]=255;}
 c.putImageData(im,0,0);texture.update();texture.gammaSpace=true;mat.albedoTexture=texture;mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.subSurface.isTranslucencyEnabled=true;mat.subSurface.translucencyIntensity=.18;mat.subSurface.tintColor=B.Color3.FromHexString('#70964a');new LeafWind36(mat).strength=.33;return mat;
}

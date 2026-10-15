function leafTexture37(){
 const t=new B.DynamicTexture('Lámina foliar y nervaduras37',{width:256,height:512},scene,true),c=t.getContext(),im=c.createImageData(256,512);let seed=7611;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<512;y++)for(let x=0;x<256;x++){const u=(x/255-.5)*2,v=y/511,mid=Math.exp(-Math.abs(u)*65),vein=Math.pow(.5+.5*Math.sin(v*224+Math.abs(u)*8),10),edge=Math.pow(Math.abs(u),4),variation=Math.sin(v*15+u*4)*.05+(rand()-.5)*.05;const i=(y*256+x)*4;im.data[i]=Math.max(0,Math.min(255,54+mid*35+vein*13+edge*15+variation*110));im.data[i+1]=Math.max(0,Math.min(255,101+mid*31+vein*14-edge*11+variation*100));im.data[i+2]=Math.max(0,Math.min(255,25+mid*9+vein*3+variation*50));im.data[i+3]=255;}
 c.putImageData(im,0,0);t.update();t.gammaSpace=true;t.wrapU=t.wrapV=B.Texture.CLAMP_ADDRESSMODE;t.anisotropicFilteringLevel=4;return t;
}

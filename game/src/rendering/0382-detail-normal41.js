function detailNormal41(name,size,kind){
 const t=new B.DynamicTexture(name,{width:size,height:size},scene,true),c=t.getContext(),im=c.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4;
  const dx=kind==='cloth'?Math.sin(x*1.57)*.15:Math.sin(x*.77+y*1.11)*.018;
  const dy=kind==='cloth'?Math.cos(y*1.57)*.15:Math.cos(x*1.17-y*.81)*.018;
  const n=1/Math.sqrt(1+dx*dx+dy*dy);im.data[i]=(dx*n*.5+.5)*255;im.data[i+1]=(dy*n*.5+.5)*255;im.data[i+2]=(n*.5+.5)*255;im.data[i+3]=255;
 }c.putImageData(im,0,0);t.update();t.gammaSpace=false;t.wrapU=t.wrapV=B.Texture.WRAP_ADDRESSMODE;t.anisotropicFilteringLevel=4;return t;
}

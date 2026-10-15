function facadeAtlas41(){
 const t=new B.DynamicTexture('Atlas de desgaste y azulejos41',{width:512,height:512},scene,true),c=t.getContext();
 c.fillStyle='#c9bb98';c.fillRect(0,0,512,512);let seed=4107;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){const k=Math.floor(rand()*3);c.fillStyle=['#d8cbae','#afa98d','#c9bc9d'][k];c.fillRect(x+2,y+2,60,60);c.strokeStyle='#f4e7c164';c.strokeRect(x+3,y+3,58,58);}
 for(let j=0;j<1400;j++){c.fillStyle=j%2?'#ffffff13':'#00000014';c.fillRect(rand()*512,rand()*512,1+rand()*4,1+rand()*3);}
 t.update();t.gammaSpace=true;t.anisotropicFilteringLevel=4;return t;
}

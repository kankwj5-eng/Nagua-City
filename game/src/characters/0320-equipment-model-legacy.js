function equipmentModelLegacy(name,parent){const root=new B.TransformNode('Equipo '+name,scene);root.parent=parent;const wood=assetMats.toolWood,metal=assetMats.toolMetal;
 const part=(w,h,d,x,y,z,mat)=>{const m=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m;};
 if(name==='shovel'){part(.035,.85,.038,0,.32,0,wood);part(.22,.29,.026,0,.87,0,metal).rotation.x=.18;part(.14,.035,.035,0,-.16,0,wood);}
 if(name==='bat'){const m=B.MeshBuilder.CreateCylinder('Bate',{height:.78,diameterTop:.083,diameterBottom:.035,tessellation:20},scene);m.parent=root;m.position.y=.29;m.material=wood;m.isPickable=false;}
 if(name==='pistol'||name==='rifle'){const long=name==='rifle';part(.045,.15,.07,0,-.045,0,assetMats.rubber);part(.065,.06,long?.48:.20,0,.05,long?-.17:-.05,metal);if(long){part(.075,.09,.22,0,.03,.17,wood);part(.045,.17,.08,0,-.05,-.14,metal);part(.026,.026,.10,0,.09,-.20,metal);}}
 return root;
}

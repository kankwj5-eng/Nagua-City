function weaponFinish41(name,root){
 if(name!=='pistol'&&name!=='rifle')return root;
 const rifle=name==='rifle',z=rifle?-.614:-.179,y=rifle?.06:.064;
 const rim=B.MeshBuilder.CreateTorus('Boca del cañón41',{diameter:rifle?.022:.018,thickness:.004,tessellation:16},scene);rim.parent=root;rim.rotation.x=Math.PI/2;rim.position.set(0,y,z);rim.material=assetMats.weaponSteel;rim.isPickable=false;
 const bore=B.MeshBuilder.CreateDisc('Interior del cañón41',{radius:rifle?.008:.006,tessellation:16,sideOrientation:B.Mesh.DOUBLESIDE},scene);bore.parent=root;bore.position.set(0,y,z+.002);bore.material=assetMats.bore41||(assetMats.bore41=pbr('Interior mate41','#07090b',1));bore.isPickable=false;
 if(!rifle)for(const side of [-1,1])for(let i=0;i<6;i++){const groove=B.MeshBuilder.CreateBox('Estría de corredera41',{width:.0015,height:.027,depth:.002},scene);groove.parent=root;groove.position.set(side*.0235,.064,.018+i*.009);groove.material=assetMats.weaponGrip;groove.isPickable=false;}
 return root;
}

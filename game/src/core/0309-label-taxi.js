function labelTaxi(v){if(v.name!=='taxi')return;repaint(v,'yellow');const tex=new B.DynamicTexture('TAXI',{width:256,height:80},scene,false);tex.drawText('TAXI',null,58,'bold 55px Arial','#17251f','#e8c44a',true);const mat=new B.StandardMaterial('Rótulo de servicio',scene);mat.diffuseTexture=tex;mat.emissiveColor=new B.Color3(.16,.13,.04);const sign=B.MeshBuilder.CreateBox('Texto TAXI',{width:.49,height:.13,depth:.012},scene);sign.parent=v.parts.body;sign.position.set(0,1.60,.03);sign.material=mat;sign.isPickable=false;}

// Distances measured from the embedded GLB stance trajectories.

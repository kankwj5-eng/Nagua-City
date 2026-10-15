function lightsNeighborhood42(){
 if(story42.lights)return;story42.lights=true;const warm=pbr('Luz recuperada del barrio42','#fff0c8',.9);warm.emissiveColor=B.Color3.FromHexString('#efc77e');for(const [x,z] of [[-354,22],[-330,22],[-339,22]]){const bulb=B.MeshBuilder.CreateSphere('Lámpara del barrio42',{diameter:.14,segments:8},scene);bulb.position.set(x,2.4,z);bulb.material=warm;bulb.isPickable=false;const l=new B.PointLight('Luz del local42',bulb.position.clone(),scene);l.diffuse=B.Color3.FromHexString('#ffd39a');l.intensity=.35;l.range=4;}
}

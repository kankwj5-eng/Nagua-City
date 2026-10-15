function installVisual33(){
 canopy32=canopy33;
 const baseLight=lightSettings;lightSettings=function(){baseLight();const day=$('lighting').value==='dia';const ambient=scene.getLightByName('ambient');if(ambient){ambient.intensity=day?.70:.64;ambient.diffuse=new B.Color3(.77,.85,.94);ambient.groundColor=new B.Color3(.32,.29,.22);}sun.intensity=day?2.65:2.35;sun.diffuse=day?new B.Color3(1,.95,.85):new B.Color3(1,.83,.64);scene.imageProcessingConfiguration.exposure=day?1.03:1.08;scene.imageProcessingConfiguration.contrast=1.13;scene.fogColor=day?new B.Color3(.63,.73,.77):new B.Color3(.72,.72,.65);scene.fogStart=quality==='low'?105:160;scene.fogEnd=quality==='low'?230:360;};lightSettings();
 const oldSettings=settings;settings=function(){oldSettings();lightSettings();};
 const bark=assetMats.bark33||(assetMats.bark33=pbr('Ramas de copa33','#675b42',.98));bark.albedoTexture=fabric('Corteza rugosa33','#81735b','wood');
 for(let i=0;i<18;i++){const x=-225+(i%9)*51,z=i<9?125:-124;if(blocked(x,z,.45,null,true))continue;const y=groundAt(x,z),root=new B.TransformNode('Árbol de acera33 '+i,scene);const trunk=B.MeshBuilder.CreateTube('Tronco ramificado33',{path:[V(x,y,z),V(x+.08,y+1.4,z),V(x-.10,y+2.9,z)],radius:.12,tessellation:7},scene);trunk.parent=root;trunk.material=bark;trunk.isPickable=false;canopy33(root,V(x,y+3.25,z),2.6,null);registerDetail31(root,x,z,quality==='low'?85:125);addWorldBox(x,z,.23,.23);stage33.trees=(stage33.trees||0)+1;}
 // Finish real material maps already included in the game; avoid new external requests.
 let materials=0;for(const m of scene.materials){if(/pared\d|Estuco|Fachada|Pared residencial|Bloque de patio|Casa de patio/i.test(m.name)&&m.albedoTexture){m.roughness=.98;m.environmentIntensity=.24;if(m.bumpTexture)m.bumpTexture.level=.23;materials++;}if(/Corteza|Ramas|Tronco/.test(m.name))m.roughness=.98;if(/Cristal oscuro/.test(m.name)){m.roughness=.29;m.clearCoat.intensity=.32;}if(/Asfalto|asfalto/.test(m.name)){m.roughness=.97;m.environmentIntensity=.22;}}
 stage33.surfaceFinishes=materials;stage33.atmosphere='Luz cálida, sombras frías y bruma por distancia';
}


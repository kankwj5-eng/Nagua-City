function installVehicleFinish31(){// Cristal tintado visible aun con el camino de render opaco de Android.
// Evita alpha blending y draw calls adicionales mientras el telefono va lento.
// La transparencia física real queda para un perfil medido y presupuestado.
const smoke=pbr('Cristal automotriz reflejante31','#577f91',.13,0);
smoke.alpha=1;smoke.transparencyMode=B.PBRMaterial.PBRMATERIAL_OPAQUE;
smoke.backFaceCulling=false;smoke.clearCoat.isEnabled=true;
smoke.clearCoat.intensity=.88;smoke.clearCoat.roughness=.065;
smoke.environmentIntensity=1.12;
smoke.emissiveColor=new B.Color3(.025,.041,.050);for(const v of fleet){for(const mesh of v.root.getChildMeshes()){const name=mesh.material?.name;if(typeof name==='string'&&/glass|cristal|ventana|window/i.test(name))mesh.material=smoke;if(mesh.material){mesh.material.alpha=1;mesh.material.transparencyMode=B.PBRMaterial.PBRMATERIAL_OPAQUE;}}district31.opaqueVehicles++;}
 // Better readability at modest budgets: restrained contrast, warmer direct light and cooler shade.
 const lighting=lightSettings;lightSettings=function(){lighting();scene.imageProcessingConfiguration.contrast=1.16;scene.imageProcessingConfiguration.exposure=$('lighting').value==='dia'?1.02:1.08;scene.fogStart=145;scene.fogEnd=335;};lightSettings();
}

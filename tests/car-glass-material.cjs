"use strict";
// Ejecuta la función REAL del acabado automotriz con un motor mínimo.
// La meta es mejorar la lectura del vidrio SIN blending ni mallas nuevas.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../game/src/vehicles/0207-install-vehicle-finish31.js"),"utf8");
const mats=[{name:"glass",alpha:.5},{name:"GLASS shade"},{name:"Cristal lateral"},{name:"paint",alpha:1},{name:"rubber"}];
const before=mats.length;
const vehicles=[
 {root:{getChildMeshes:()=>[...mats.slice(0,3)].map(material=>({material}))}},
 {root:{getChildMeshes:()=>[...mats.slice(3)].map(material=>({material}))}}
];
const originalBody=vehicles[1].root.getChildMeshes()[0].material;
let newMaterials=0,priorLights=0,scene={imageProcessingConfiguration:{contrast:0,exposure:0},fogStart:0,fogEnd:0},district31={opaqueVehicles:0};
const B={Color3:class{constructor(r,g,b){this.r=r;this.g=g;this.b=b;}},PBRMaterial:{PBRMATERIAL_OPAQUE:0}};
const ctx={fleet:vehicles,scene,B,district31,pbr:(name,tint,roughness,metallic)=>{newMaterials++;return {name,albedoColor:tint,roughness,metallic,clearCoat:{isEnabled:false}};},
 lightSettings:()=>{priorLights++;},$:(id)=>({value:"dia"})};
vm.createContext(ctx);vm.runInContext(source+"\ninstallVehicleFinish31();",ctx);
const list=vehicles[0].root.getChildMeshes();
const glass=list[0].material;
assert.equal(newMaterials,1,"Un solo material compartido; ninguna textura nueva");
assert(list.every(m=>m.material===glass),"Reutiliza el mismo vidrio para todas las piezas");
assert.equal(glass.name,"Cristal automotriz reflejante31");
assert.equal(glass.albedoColor,"#577f91");
assert.equal(glass.metallic,0);
assert.equal(glass.roughness,.13);
assert(glass.environmentIntensity>=1);
assert(glass.emissiveColor.r>0);
assert(glass.emissiveColor.b>glass.emissiveColor.r);
assert(glass.clearCoat.isEnabled&&glass.clearCoat.intensity>.8);
assert.equal(glass.transparencyMode,0,"Camino de render opaco preserva rendimiento Android");
assert.equal(glass.alpha,1);
assert.equal(glass.backFaceCulling,false);
assert.equal(vehicles[1].root.getChildMeshes()[0].material,originalBody,"No cambiar pintura original");
assert.equal(district31.opaqueVehicles,2);
assert.equal(priorLights,1);
assert.equal(scene.fogStart,145);assert.equal(scene.fogEnd,335);
assert.equal(mats.length,before);
console.log("CAR_GLASS_MATERIAL_OK "+JSON.stringify({sharedMaterials:newMaterials,glassPanels:list.length,alphaBlending:false,newMeshes:0,newTextures:0,lightingPreserved:true}));

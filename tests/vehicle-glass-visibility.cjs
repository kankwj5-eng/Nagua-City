"use strict";
/* Execute the production vehicle-finish function against the real material
 * contract. Cars get see-through glass; motorcycle optics stay unchanged. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0207-install-vehicle-finish31.js"),"utf8");
class PBRMaterial{
 constructor(name){this.name=name;this.alpha=1;this.transparencyMode=0;this.clearCoat={isEnabled:false,intensity:0,roughness:1};this.metallic=.3;this.roughness=.5;this.environmentIntensity=.5;}
}
PBRMaterial.PBRMATERIAL_OPAQUE=0;PBRMaterial.PBRMATERIAL_ALPHABLEND=2;
const glass=new PBRMaterial("glass"),paint=new PBRMaterial("paint"),headlamp=new PBRMaterial("glass");
const make=(name,bike,materials)=>{const meshes=materials.map(material=>({material,receiveShadows:true}));return {name,bike,root:{getChildMeshes(){return meshes;}}};};
const sedan=make("sedan",false,[glass,glass,glass,paint]);
const suv=make("suv",false,[glass,paint,glass]);
const bus=make("bus",false,[glass,paint]);
const moto=make("pulsar",true,[headlamp,paint]);
const cars=[sedan,suv,bus];
const fleet=[...cars,moto];
const ctx={B:{PBRMaterial},fleet,district31:{opaqueVehicles:0},
 scene:{imageProcessingConfiguration:{},fogStart:0,fogEnd:0},
 pbr:(name,color,roughness,metallic)=>{const p=new PBRMaterial(name);p.albedoColor=color;p.roughness=roughness;p.metallic=metallic;return p;},
 lightSettings(){},$(){return {value:"dia"};}};
vm.createContext(ctx);vm.runInContext(source+"\ninstallVehicleFinish31();",ctx);
const tinted=sedan.root.getChildMeshes()[0].material;
assert.equal(tinted.name,"Cristal de ventanas31");
assert.equal(tinted.alpha,.78);
assert.equal(tinted.transparencyMode,PBRMaterial.PBRMATERIAL_ALPHABLEND);
assert.equal(tinted.backFaceCulling,false);
assert.equal(tinted.metallic,0);
assert.equal(tinted.clearCoat.isEnabled,true);
let glassCount=0;
for(const car of cars)for(const mesh of car.root.getChildMeshes()){
 if(mesh.material===tinted){glassCount++;assert.equal(mesh.receiveShadows,false);}
 else{assert.equal(mesh.material,paint);assert.equal(mesh.material.alpha,1);}
}
assert.equal(glassCount,6);
assert.equal(moto.root.getChildMeshes()[0].material,headlamp,"Optical lenses of motorcycles must not be replaced");
assert.equal(headlamp.alpha,1);
assert.equal(headlamp.transparencyMode,PBRMaterial.PBRMATERIAL_OPAQUE);
assert.equal(ctx.district31.opaqueVehicles,4,"Per-vehicle statistics preserved");
assert.equal(ctx.scene.imageProcessingConfiguration.contrast,1.16);
console.log("CAR_GLASS_VISIBILITY_OK "+JSON.stringify({carMeshes:glassCount,sharedMaterials:1,noNewMeshes:true,motorcycleLensesUntouched:true,opacity:.78,transparent:true}));

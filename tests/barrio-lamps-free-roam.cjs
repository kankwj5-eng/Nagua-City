"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,p),"utf8");
const light=read("../game/src/world/0412-lights-neighborhood42.js");
const installer=read("../game/src/engine/0404-install42.js");
assert(installer.includes("light42();shadowSettings42();lightsNeighborhood42();"),"Encender faroles durante la instalación normal, sin necesidad de iniciar historia");
assert(!/PointLight|SpotLight|ShadowGenerator|DynamicTexture/.test(light),"No crear luces dinámicas o nuevos atlas para Android");
assert(!/\bstory42\b/.test(light),"Ninguna misión debe activar los faroles");
const instances=[],registered=[],materials=[];
const ctx={stage42:{neighborhoodLamps:false},assetMats:{steel:"acero"},groundAt:()=>.10,
 B:{Color3:{FromHexString:hex=>({hex})}},
 pbr:(name,color,rough)=>{const m={name,color,rough};materials.push(m);return m;},
 makeDetailGroup:(name,build)=>{
  const parts=[];build({box:(...args)=>parts.push(args)});
  const root={name,parts};instances.push(root);return root;
 },
 registerDetail31:(root,x,z,r)=>registered.push({root,x,z,r})
};
vm.createContext(ctx);
vm.runInContext(light+"\nlightsNeighborhood42();lightsNeighborhood42();",ctx);
assert.equal(ctx.stage42.neighborhoodLamps,true,"No se activó el modo libre");
assert.equal(instances.length,1,"Registro idempotente de los faroles");
assert.equal(materials.length,1,"Una sola textura/material emisivo reutilizable");
assert.equal(registered.length,1,"Un solo grupo por barrio para LOD");
assert.equal(registered[0].r,100,"Limitación por distancia para móviles");
const parts=instances[0].parts;
assert.equal(parts.filter(p=>p[0]==="Montura pared de farol42").length,3);
assert.equal(parts.filter(p=>p[0]==="Difusor cálido de farol42").length,3);
assert(parts.every(p=>p[2]>2),"Las luminarias no pueden atravesar el suelo");
assert.equal(materials[0].emissiveColor.hex,"#b28a46");
console.log("BARRIO_FREE_ROAM_LAMPS_OK "+JSON.stringify({fixtures:3,groups:1,dynamicLights:0,materials:1,activations:1}));

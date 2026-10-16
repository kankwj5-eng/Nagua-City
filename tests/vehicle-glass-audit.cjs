"use strict";
/* Material, triangles and bounds audit of genuine packed vehicle meshes.
 * Reads packed game assets, NEVER constructs extra render geometry. */
const assert=require("node:assert/strict"),zlib=require("node:zlib"),path=require("node:path"),fs=require("node:fs"),script=require("./html-script.cjs");
(async()=>{
 const source=process.argv[2]||path.join(__dirname,"../Managua_Del_taller_al_lago(1).html");
 const encoded=await script(source,"asset-vehicles");
 const assets=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,"base64")).toString("utf8"));
 const materials=Object.fromEntries(assets.materials.map(m=>[m.name,m]));
 const inventory={};
 for(const [name,spec] of Object.entries(assets.models)){
  const transparent=spec.groups.filter(g=>/glass|cristal|vidrio|window/i.test(g.material));
  inventory[name]={modelGroups:spec.groups.length,glassGroups:transparent.length,glass:transparent.map(g=>{
   const bytes=Buffer.from(g.p,"base64"),xyz=new Float32Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/4));
   const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
   for(let k=0;k<xyz.length;k+=3)for(let axis=0;axis<3;axis++){const x=xyz[k+axis];bounds.min[axis]=Math.min(bounds.min[axis],x);bounds.max[axis]=Math.max(bounds.max[axis],x);}
   return {part:g.part,material:g.material,bounds,vertexCount:xyz.length/3,indices:Buffer.from(g.i,"base64").byteLength/4};
  }),meta:{width:spec.meta.width,length:spec.meta.length}};
 }
 for(const [name,extra] of Object.entries(assets.variants||{}))inventory[name]={derivedFrom:extra.base,extraGlass:extra.groups.filter(g=>/glass|cristal|vidrio|window/i.test(g.material)).length};
 assert(Object.keys(inventory).length>=10);
 console.log("CAR_GLASS_INVENTORY "+JSON.stringify({materials:Object.keys(materials).filter(n=>/glass|cristal|vidrio|window/i.test(n)).map(n=>({name:n,color:materials[n].color,metalness:materials[n].metalness,roughness:materials[n].roughness})),inventory}));
})().catch(e=>{console.error(e);process.exitCode=1});

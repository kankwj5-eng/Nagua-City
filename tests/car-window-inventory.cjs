"use strict";
// Inventario de paneles de vidrio en los modelos reales comprimidos del juego.
// No presupone ventanas que no estén presentes: registra huecos y medidas.
const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib"),assert=require("node:assert/strict"),script=require("./html-script.cjs");
const root=path.resolve(__dirname,"..");
const html=process.argv[2]||path.join(root,"Managua_Del_taller_al_lago(1).html");
(async()=>{
 const pack=JSON.parse(zlib.gunzipSync(Buffer.from(await script(html,"asset-vehicles"),"base64")));
 const bikeNames=new Set(["pulsar","boxer","discover","trail","delivery","yamaha","taypan","urban125","enduro","bicycle"]);
 const counts={},records=[];
 const entries=new Map(Object.entries(pack.models));
 for(const [name,variant] of Object.entries(pack.variants||{})){
  const base=pack.models[variant.base];if(!base)continue;
  entries.set(name,{groups:[...base.groups,...(variant.groups||[])],meta:{...base.meta,...variant.meta}});
 }
 for(const [name,spec] of entries){
  if(bikeNames.has(name)||name.startsWith("caponera"))continue;
  const glass=spec.groups.filter(g=>/glass|cristal|ventana|window/i.test(g.material||""));
  const panels=[];
  for(const group of glass){
   const bytes=Buffer.from(group.p,"base64"),box={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
   for(let i=0;i+11<bytes.length;i+=12)for(let axis=0;axis<3;axis++){
    const value=bytes.readFloatLE(i+axis*4);
    if(!Number.isFinite(value))continue;
    box.min[axis]=Math.min(box.min[axis],value);
    box.max[axis]=Math.max(box.max[axis],value);
   }
   panels.push({material:group.material,part:group.part,vertices:bytes.length/12,min:box.min.map(v=>+v.toFixed(3)),max:box.max.map(v=>+v.toFixed(3))});
  }
  counts[name]=panels.length;
  records.push({name,groups:spec.groups.length,glassPanels:panels});
 }
 assert(records.length>=5,"No se encontraron modelos de automóviles");
 assert(records.some(r=>r.glassPanels.length),"No hay ningún vidrio en el paquete original");
 console.log("CAR_WINDOW_INVENTORY "+JSON.stringify({models:records.length,counts,records}));
 const blank=records.filter(r=>!r.glassPanels.length).map(r=>r.name);
 console.log("CAR_WINDOW_MISSING "+JSON.stringify(blank));
})().catch(e=>{console.error(e);process.exitCode=1});

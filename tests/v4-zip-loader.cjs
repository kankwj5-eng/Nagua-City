"use strict";
// Validación del archivo real (opcional) o de un ZIP sintético en CI.
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const cp=require("node:child_process"),assert=require("node:assert/strict");
const api=require("../game/v4/zip-loader.js");
const fixture=process.argv[2]||"";
async function main(){
 let zip;
 if(fixture){zip=fs.readFileSync(fixture);}
 else{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),"nagua-v4-"));
  try{
   const target=path.join(d,"test.zip");
   const script=String.raw`import zipfile,sys,json
p=sys.argv[1]
ids=("01_mateo","02_ernesto","03_daniel","04_luis","05_rafael","06_valeria","07_marisol","08_xiomara","09_rosa","10_elena")
cars=("Hilux-grafito.glb","Land-Cruiser-roja.glb","Pulsar-NS200.glb","Serpento-Taypan-150.glb")
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED) as z:
 for id in ids:z.writestr("characters-v4/"+id+".glb",b"glTFfake")
 for id in cars:z.writestr("vehicles-v4/"+id,b"glTFfake")
 z.writestr("characters-v4/cast.json",json.dumps({"totalModelos":10,"modelosLOD1Importados":0,"personajes":[{"id":id,"archivo":id+".glb"} for id in ids]}))
 z.writestr("vehicles-v4/vehicles-v4.json",json.dumps({"vehicleModels":4,"oldVehicleModels":0,"vehicles":[{"file":id} for id in cars]}))
`;
   cp.execFileSync("python3",["-c",script,target]);
   zip=fs.readFileSync(target);
  }finally{fs.rmSync(d,{recursive:true,force:true});}
 }
 const archive=api.readZip(zip),meta=await archive.metadata();
 assert.equal(meta.cast.personajes.length,10);assert.equal(meta.vehicles.vehicles.length,4);
 assert.equal(api.ALLOWED.length,16);
 for(const id of api.CAST){
  const bytes=await archive.get("characters-v4/"+id+".glb");
  assert.equal(Buffer.from(bytes.subarray(0,4)).toString(),"glTF");
 }
 for(const id of api.VEHICLE_FILES){
  const bytes=await archive.get("vehicles-v4/"+id);
  assert.equal(Buffer.from(bytes.subarray(0,4)).toString(),"glTF");
 }
 await assert.rejects(()=>archive.get("characters-v4/11_npc.glb"));
 assert.throws(()=>api.readZip(Buffer.from("not a zip")));
 console.log("ARCHIVO_NAGUA_V4_VALIDADO",JSON.stringify({modelos:archive.modelCount,zipMB:Math.round(archive.zipBytes/1e6*100)/100,real:!!fixture}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

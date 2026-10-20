/* Nagua City v4 — archivo portátil de 10 personajes + 4 vehículos.
 * Lectura selectiva de ZIP local, sin servidor externo ni modelos antiguos.
 * Solo se descomprimen los 14 GLB autorizados y sus dos manifiestos.
 */
(function(scope){
"use strict";
const CAST=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
 "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"];
const VEHICLE_FILES=["Hilux-grafito.glb","Land-Cruiser-roja.glb",
 "Pulsar-NS200.glb","Serpento-Taypan-150.glb"];
const ALLOWED=[...CAST.map(n=>"characters-v4/"+n+".glb"),
 ...VEHICLE_FILES.map(n=>"vehicles-v4/"+n),
 "characters-v4/cast.json","vehicles-v4/vehicles-v4.json"];
const LIMIT=32*1024*1024;
function readZip(input){
 const a=input instanceof Uint8Array?input:new Uint8Array(input);
 const v=new DataView(a.buffer,a.byteOffset,a.byteLength),len=a.length;
 const u16=i=>v.getUint16(i,true),u32=i=>v.getUint32(i,true);
 const decoder=new TextDecoder("utf-8",{fatal:true});
 let eocd=-1;
 for(let i=len-22;i>=Math.max(0,len-65557);i--)if(u32(i)===0x06054b50){eocd=i;break;}
 if(eocd<0)throw Error("El archivo no es un ZIP válido");
 if(u16(eocd+4)||u16(eocd+6)||u16(eocd+8)!==u16(eocd+10))
  throw Error("No se admiten ZIP multidisco");
 const count=u16(eocd+10),end=u32(eocd+16)+u32(eocd+12);
 if(count>64||end>len||u32(eocd+16)+u32(eocd+12)>eocd)
  throw Error("Directorio ZIP fuera de límites");
 let pos=u32(eocd+16);const entries=new Map();
 for(let i=0;i<count;i++){
  if(pos+46>len||u32(pos)!==0x02014b50)throw Error("Directorio ZIP corrupto");
  const method=u16(pos+10),crc=u32(pos+16),packed=u32(pos+20),size=u32(pos+24),
   nameLen=u16(pos+28),extra=u16(pos+30),comment=u16(pos+32),
   disk=u16(pos+34),local=u32(pos+42);
  if(pos+46+nameLen+extra+comment>len||disk)
   throw Error("Entrada ZIP fuera de límites");
  const name=decoder.decode(a.subarray(pos+46,pos+46+nameLen));
  if(name.includes("..")||name.includes("\\")||name.startsWith("/")||entries.has(name))
   throw Error("Ruta ZIP insegura o duplicada: "+name);
  if((method!==0&&method!==8)||size>LIMIT||packed>LIMIT)
   throw Error("Compresión o tamaño no permitido: "+name);
  if(local+30>len||u32(local)!==0x04034b50)
   throw Error("Encabezado de modelo ausente: "+name);
  const start=local+30+u16(local+26)+u16(local+28);
  if(start+packed>len)throw Error("Datos ZIP incompletos: "+name);
  entries.set(name,{start,packed,size,crc,method});
  pos+=46+nameLen+extra+comment;
 }
 for(const name of ALLOWED)if(!entries.has(name))throw Error("Falta archivo requerido: "+name);
 const glbs=[...entries.keys()].filter(name=>name.toLowerCase().endsWith(".glb"));
 if(glbs.length!==14||glbs.some(name=>!ALLOWED.includes(name)))
  throw Error("Solo se permiten 10 personajes y 4 vehículos (sin LOD1)");
 async function get(name){
  const item=entries.get(name);
  if(!item||!ALLOWED.includes(name))throw Error("Archivo no autorizado: "+name);
  const compressed=a.subarray(item.start,item.start+item.packed);
  let result;
  if(item.method===0)result=compressed.slice();
  else{
   if(typeof DecompressionStream!=="function")
    throw Error("El navegador necesita DecompressionStream para abrir el ZIP");
   const body=new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
   result=new Uint8Array(await new Response(body).arrayBuffer());
  }
  if(result.length!==item.size)throw Error("Tamaño de archivo incorrecto: "+name);
  // CRC32 contra el índice central del ZIP, además del SHA256 del manifiesto.
  let crc=-1;
  for(const b of result){crc^=b;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  if(((crc^-1)>>>0)!==item.crc)throw Error("CRC32 incorrecto: "+name);
  return result;
 }
 async function metadata(){
  const cast=JSON.parse(new TextDecoder().decode(await get("characters-v4/cast.json")));
  const vehicles=JSON.parse(new TextDecoder().decode(await get("vehicles-v4/vehicles-v4.json")));
  if(cast.totalModelos!==10||cast.modelosLOD1Importados!==0||cast.personajes?.length!==10||
     vehicles.vehicleModels!==4||vehicles.oldVehicleModels!==0||vehicles.vehicles?.length!==4)
   throw Error("Elenco o flota diferentes del acuerdo de 10 + 4");
  for(let i=0;i<10;i++)if(cast.personajes[i].id!==CAST[i]||
    cast.personajes[i].archivo!==CAST[i]+".glb")throw Error("Personaje no autorizado");
  for(let i=0;i<4;i++)if(vehicles.vehicles[i].file!==VEHICLE_FILES[i])
   throw Error("Vehículo no autorizado");
  return {cast,vehicles};
 }
 async function verified(name,sha){
  const bytes=await get(name);
  if(!crypto?.subtle)throw Error("La verificación SHA256 necesita un navegador seguro");
  const hash=await crypto.subtle.digest("SHA-256",bytes);
  const hex=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
  if(hex!==sha)throw Error("El archivo no coincide con el paquete original: "+name);
  return bytes;
 }
 return Object.freeze({get,metadata,verified,modelCount:14,
  manifestFiles:2,zipBytes:len});
}
async function mount(input,B,scene,peopleApi,vehiclesApi){
 const archive=readZip(input),meta=await archive.metadata();
 peopleApi.validateCast(meta.cast);vehiclesApi.validate(meta.vehicles);
 const characters=await peopleApi.loadCast(B,scene,meta.cast,item=>{
  const entry=meta.cast.personajes.find(p=>p.archivo===item);
  if(!entry)throw Error("Personaje fuera de catálogo: "+item);
  return archive.verified("characters-v4/"+item,entry.sha256);
 });
 let vehicles;
 try{
  vehicles=await vehiclesApi.load(B,scene,meta.vehicles,item=>{
   const entry=meta.vehicles.vehicles.find(p=>p.file===item);
   if(!entry)throw Error("Vehículo fuera de catálogo: "+item);
   return archive.verified("vehicles-v4/"+item,entry.sha256);
  });
 }catch(e){characters.release();throw e;}
 return Object.freeze({characters,vehicles,metadata:meta,
  inspect(){return {characters:characters.inspect(),vehicles:vehicles.inspect(),legacyAssets:0,lod1:0};},
  dispose(){vehicles.dispose();characters.release();}
 });
}
const api=Object.freeze({CAST,VEHICLE_FILES,ALLOWED,readZip,mount});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(scope)scope.NaguaV4Archive=api;
})(typeof window!=="undefined"?window:null);

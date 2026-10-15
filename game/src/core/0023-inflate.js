async function inflate(b){
 const reader=new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
 let timer;const chunks=[];let length=0;
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{reader.cancel().catch(()=>{});reject(Error('La descompresión no terminó. Volvé a abrir el archivo.'));},90000);});
 try{return await Promise.race([(async()=>{for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);length+=value.byteLength;}const out=new Uint8Array(length);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.byteLength;}return out.buffer;})(),timeout]);}
 finally{clearTimeout(timer);try{reader.releaseLock();}catch{}}
}

function embedded48(id){
 const el=document.getElementById(id);
 if(!el)throw Error('Falta recurso '+id);
 return el.textContent.trim();
}
// The portable HTML keeps its inline data.  Only the PWA supplies data-src.
// Never fetch a resource until its consumer actually needs it.
async function embeddedRemote48(id,binary=false){
 const el=document.getElementById(id);
 if(!el)throw Error('Falta recurso '+id);
 if(!el.dataset.src){
  const encoded=embedded48(id);
  return binary?bytes(encoded):encoded;
 }
 const url=new URL(el.dataset.src,document.baseURI);
 if(url.origin!==location.origin)throw Error('Recurso fuera del origen: '+id);
 const result=await fetch(url.href,{cache:'force-cache'});
 if(!result.ok)throw Error('No se pudo descargar '+id+' ('+result.status+')');
 const payload=binary?new Uint8Array(await result.arrayBuffer()):await result.text();
 startup48.remoteRequests=(startup48.remoteRequests||0)+1;
 startup48.remoteBytes=(startup48.remoteBytes||0)+payload.length;
 return payload;
}

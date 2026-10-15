const boot45=(()=>{
 const began=performance.now(),stages=[];let phaseAt=began,phaseName='Arranque',done=false,failed=false,zoneCount=0,trackingZones=false,timer;
 const retry=document.createElement('button');retry.id='bootRetry45';retry.textContent='VOLVER A ABRIR';retry.hidden=true;retry.onclick=()=>location.reload();$('status').after(retry);
 function progress(text,pct){if(done)return;if(text!==phaseName){stages.push({name:phaseName,ms:Math.round(performance.now()-phaseAt)});phaseName=text;phaseAt=performance.now();}retry.hidden=true;}
 function phase(text,pct){if(pct>=92)trackingZones=false;status(text,pct);}
 function fail(error){failed=true;clearInterval(timer);$('status').textContent='No se pudo abrir: '+(error?.message||String(error));$('status').classList.add('error');$('start').disabled=true;$('start').textContent='ARRANQUE INTERRUMPIDO';retry.hidden=false;}
 timer=setInterval(()=>{if(done||failed)return;const seconds=Math.floor((performance.now()-phaseAt)/1000);if(seconds>=20){$('status').textContent=phaseName+' · '+seconds+' s';if(seconds>=90){$('status').textContent='La carga no ha terminado en: '+phaseName+'. Podés volver a abrir el archivo.';retry.hidden=false;}}},1000);
 $('view').addEventListener('webglcontextlost',()=>{if(!done)fail(Error('El teléfono interrumpió el contexto gráfico durante la carga. Volvé a abrir el archivo.'));});
 return {progress,phase,fail,startZones(){zoneCount=0;trackingZones=true;},zone(id){if(trackingZones)phase('Cargando calles · '+(zoneCount+1)+'/9…',75+Math.min(zoneCount,8)*1.7);},zoneDone(){if(trackingZones)zoneCount++;},finish(){done=true;clearInterval(timer);retry.remove();},inspect(){return {done,failed,phase:phaseName,zones:zoneCount,ms:Math.round(performance.now()-began),stages};}};
})();


function installRuntimeDiagnostics09(B,scene,engine,getContext,instrument,gpuInstrument){
 const recorder=createFrameRecorder09(()=>performance.now(),getContext),flags=['captureActiveMeshesEvaluationTime','captureRenderTargetsRenderTime','captureRenderTime','captureAnimationsTime'],saved={};
 let observing=false;
 function finish(reason){recorder.stop(reason);if(observing){for(const flag of flags)instrument[flag]=saved[flag];observing=false;}return recorder.result;}
 const after=scene.onAfterRenderObservable.add(()=>{
  if(!recorder.active)return;
  const values={drawCalls:instrument?.drawCallsCounter?.current};
  for(const [name,key] of [['activeMeshesMs','activeMeshesEvaluationTimeCounter'],['renderTargetsMs','renderTargetsRenderTimeCounter'],['drawCPUms','renderTimeCounter'],['animationsMs','animationsTimeCounter']])values[name]=instrument?.[key]?.current;
  // Babylon timer queries can span more than one CPU frame. This is a sample of the
  // latest completed GPU query, not a synchronous CPU/GPU attribution per frame.
  const ns=gpuInstrument()?.gpuFrameTimeCounter?.current;if(Number.isFinite(ns)&&ns>0)values.gpuMs=ns/1e6;
  recorder.rendered(values);
 });
 const visibility=()=>{if(document.hidden&&recorder.active)finish('page-hidden');};document.addEventListener('visibilitychange',visibility);
 scene.onDisposeObservable.addOnce(()=>{finish('scene-disposed');scene.onAfterRenderObservable.remove(after);document.removeEventListener('visibilitychange',visibility);});
 const api={
  start(seconds=15){finish('restarted');recorder.start(seconds);if(instrument){for(const flag of flags){saved[flag]=instrument[flag];instrument[flag]=true;}observing=true;}},
  frame(now){if(!recorder.active)return;recorder.frame(now);if(!recorder.active)finish();},
  wrap:(name,fn)=>recorder.measure(name,fn),stop:finish,get active(){return recorder.active;},get report(){return recorder.result;},
  download(){const report=finish('download');if(!report)return false;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='Nagua-rendimiento.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
 };
 return api;
}


// Catalog payloads remain embedded for content:// and offline use. Only selected
// zones are decompressed. Images are handed to Babylon when a material is visible.

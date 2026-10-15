// Opt-in, bounded diagnostic recorder. No per-frame clocks or samples while idle.
function createFrameRecorder09(clock,context,maxFrames=3600){
 let active=false,began=0,previous=null,duration=0,result=null,startContext=null,stages={},frames=[],gpu=[],drawCalls=[],engineStages={};
 const percentile=(a,p)=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return s[Math.ceil((s.length-1)*p)];};
 const summary=a=>a.length?{count:a.length,mean:a.reduce((s,v)=>s+v,0)/a.length,p50:percentile(a,.5),p95:percentile(a,.95),p99:percentile(a,.99),max:Math.max(...a)}:null;
 function stop(reason='completed'){
  if(!active)return result;active=false;
  const timing=summary(frames),stopped=clock();
  result={schema:1,reason,durationMs:stopped-began,targetFPS:60,budgetMs:1000/60,frameIntervalsMs:timing,averageFPS:timing?1000/timing.mean:null,overBudgetFrames:frames.filter(v=>v>1000/60).length,framesOver33ms:frames.filter(v=>v>1000/30).length,stages,gpuMs:summary(gpu),drawCalls:summary(drawCalls),engineStages,startContext,context:context(),notes:['CPU stage times are nested and must not be added together.','Frame intervals include browser scheduling; GPU values require a supported timer query.','GPU samples may repeat the latest completed asynchronous query.','JavaScript heap is not total process RAM. This report alone does not certify stable 60 FPS.']};
  return result;
 }
 return {
  get active(){return active;},get result(){return result;},
  start(seconds=15){if(!Number.isFinite(seconds)||seconds<1||seconds>120)throw Error('Duración inválida');active=true;began=clock();duration=seconds*1000;previous=null;result=null;startContext=context();stages={};frames=[];gpu=[];drawCalls=[];engineStages={};},
  frame(now){if(!active)return;if(previous!==null){const dt=now-previous;if(Number.isFinite(dt)&&dt>0)frames.push(dt);}previous=now;if(now-began>=duration||frames.length>=maxFrames)stop(frames.length>=maxFrames?'frame-limit':'completed');},
  measure(name,fn){return function(...args){if(!active)return fn.apply(this,args);const start=clock();try{return fn.apply(this,args);}finally{const ms=clock()-start,c=stages[name]||(stages[name]={calls:0,totalMs:0,maxMs:0});c.calls++;c.totalMs+=ms;c.maxMs=Math.max(c.maxMs,ms);}};},
  rendered(values){if(!active)return;for(const [name,value] of Object.entries(values)){if(!Number.isFinite(value)||value<0)continue;if(name==='gpuMs'){if(value>0&&gpu.length<maxFrames)gpu.push(value);}else if(name==='drawCalls'){if(drawCalls.length<maxFrames)drawCalls.push(value);}else{const c=engineStages[name]||(engineStages[name]={calls:0,totalMs:0,maxMs:0});c.calls++;c.totalMs+=value;c.maxMs=Math.max(c.maxMs,value);}}},stop
 };
}
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

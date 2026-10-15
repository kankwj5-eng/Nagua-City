function updateTelemetry39(){
 const sorted=[...stage39.samples].sort((a,b)=>a-b),mean=stage39.samples.reduce((a,b)=>a+b,0)/Math.max(1,stage39.samples.length),fps=mean?1000/mean:0,mem=performance.memory?.usedJSHeapSize,gpu=stage39.instrument?.gpuFrameTimeCounter?.current;
 stage39.gpuMs=Number.isFinite(gpu)&&gpu>0?gpu/1e6:null;stage39.drawCalls=Number.isFinite(engine._drawCalls?.current)?engine._drawCalls.current:null;
 stage39.metrics={fps,frameMs:mean,p95:sorted.length?sorted[Math.floor((sorted.length-1)*.95)]:null,jsMs:stage39.jsMs,memoryBytes:Number.isFinite(mem)&&mem>0?mem:null,gpuMs:stage39.gpuMs,cpuPercent:null,temperatureC:null,drawCalls:stage39.drawCalls,activeMeshes:scene.getActiveMeshes().length,zones:zones.size,width:engine.getRenderWidth(),height:engine.getRenderHeight()};
 const m=stage39.metrics,fields={fps:fps?fps.toFixed(0):'—',frame:mean?mean.toFixed(1)+' ms':'—',js:m.jsMs.toFixed(1)+' ms',gpu:m.gpuMs!==null?m.gpuMs.toFixed(1)+' ms':'N/D',ram:m.memoryBytes!==null?(m.memoryBytes/1048576).toFixed(0)+' MB≈':'N/D',cpu:'N/D',temp:'N/D',draw:m.drawCalls??'N/D',meshes:m.activeMeshes,zones:m.zones,res:m.width+'×'+m.height,p95:m.p95!==null?m.p95.toFixed(0)+' ms':'—'};
 for(const [key,value] of Object.entries(fields)){const el=$('metric39-'+key);if(el&&el.textContent!==String(value))el.textContent=String(value);}
}
// Conservative broad phase: every box intersecting the padded camera ray AABB is retained.

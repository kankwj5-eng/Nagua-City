const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),script=require('./html-script.cjs');
(async()=>{
 const root=path.resolve(__dirname,'..'),helper=fs.readFileSync(path.join(root,'performance/runtime-diagnostics.js'),'utf8');
 const create=new Function(helper+';return createFrameRecorder09;')();let now=0,clocks=0;
 const recorder=create(()=>{clocks++;return now;},()=>({physicalAndroid:false}),4);
 const target={bias:2,work:recorder.measure('work',function(n){now+=3;return n+this.bias;})};
 assert.equal(target.work(5),7);assert.equal(clocks,0,'idle does not read clock');recorder.frame(100);assert.equal(clocks,0);
 recorder.start(15);for(const t of [0,10,20,40,60])recorder.frame(t);
 assert.equal(recorder.active,false);assert.equal(recorder.result.reason,'frame-limit');assert.equal(recorder.result.frameIntervalsMs.count,4);assert.equal(recorder.result.framesOver33ms,0);assert.equal(recorder.result.overBudgetFrames,2);
 recorder.start(1);assert.equal(target.work(6),8);assert.equal(recorder.active,true);
 recorder.rendered({gpuMs:2,drawCalls:100,activeMeshesMs:4,invalid:NaN});
 const throws=recorder.measure('throws',()=>{now+=7;throw Error('same error');});assert.throws(throws,/same error/);
 recorder.frame(0);recorder.frame(16);recorder.frame(34);now=1004;recorder.frame(now);
 const report=recorder.result;assert.equal(report.stages.work.calls,1);assert.equal(report.stages.work.totalMs,3);assert.equal(report.stages.throws.totalMs,7);assert.equal(report.gpuMs.mean,2);assert.equal(report.drawCalls.mean,100);assert.equal(report.engineStages.activeMeshesMs.totalMs,4);assert.equal(report.averageFPS,1000/(1004/3));assert.equal(report.frameIntervalsMs.p95,970);assert.equal(recorder.stop(),report);
 assert.throws(()=>recorder.start(Infinity));assert.throws(()=>recorder.start(0));
 // Integration checks against the delivered app, including original visual resources.
 const app=await script(path.join(root,'dist/Managua.html'),'appSource');assert(app.includes('diagnostics09.frame(now)'));assert(app.includes("Object.defineProperty(window.Nicaragua,'diagnostics09'"));assert(app.includes("wrap('sceneRenderCPU',scene.render)"));new (Object.getPrototypeOf(async function(){}).constructor)(app);
 const result={block:9,idleClockReads:0,boundedRecording:true,percentilesAndIntervals:true,exceptionsAndThisPreserved:true,deliveredAppSyntax:true,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block09.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});

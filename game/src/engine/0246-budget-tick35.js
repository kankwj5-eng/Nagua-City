function budgetTick35(){const now=performance.now(),ms=stage35.lastFrame?now-stage35.lastFrame:0;stage35.lastFrame=now;
 if(!playing||document.hidden||streamBusy||now<stage35.warmUntil){stage35.controller.reset(now);return;}
 if(stage35.settings.mode==='auto'){const ratio=stage35.controller.observe(ms,now,stage35.settings.target);if(ratio!==null)applyScale35(ratio);}
 const el=$('performanceInfo35');if(el&&now-(stage35.infoAt||0)>1000){stage35.infoAt=now;el.textContent='Resolución: '+Math.round(stage35.controller.ratio*100)+'% de la calidad elegida · '+Math.round(engine.getFps())+' FPS';}
}

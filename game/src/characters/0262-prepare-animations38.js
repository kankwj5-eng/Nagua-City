async function prepareAnimations38(){
 const el=$('asset-animation38'),raw=JSON.parse(new TextDecoder().decode(await inflate(bytes(el.textContent))));el.remove();
 const sharedKeys38=new Map();for(const model of raw){const clips={};for(const [name,clip] of Object.entries(model.clips)){const tracks=[];for(const [bone,values] of Object.entries(clip.tracks))for(const [kind,prop] of [['rotation','rotationQuaternion'],['translation','position']]){const keys=packKeys45(values[kind],kind,sharedKeys38);tracks.push({bone,property:prop,keys});}clips[name]={from:0,to:clip.frames,tracks};}stage38.cache.push(clips);}
 const factorySoles38=raw.map(model=>model.soleCurves);stage38.animationModels=raw.length;for(let i=0;i<2;i++)Object.assign(soleCurves[i],raw[i].soleCurves);
 GAIT.walkStride=.9032258;GAIT.runStride=2.2666667;
 const previous=makeHuman;makeHuman=function(index,hero,uniform=false){const p=previous(index,hero,uniform),model=(uniform?2:0)+p.bodyType,targets=new Map(p.clips.Idle.tracks.map(t=>[t.target.name.replace(/^h\d+_/,''),t.target]));for(const [name,clip] of Object.entries(stage38.cache[model]))p.clips[name]={from:clip.from,to:clip.to,tracks:clip.tracks.map(t=>({target:targets.get(t.bone),property:t.property,keys:t.keys})).filter(t=>t.target)};p.animation38=true;p.sole40=factorySoles38[model];p.lastGaitPos=null;sampleHuman(p,'Idle',0,1);return p;};
}

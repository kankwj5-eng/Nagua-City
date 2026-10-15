function sampleLayer43(p,name,phase,weight=1,upper=false){
 const clip=p.clips[name];if(!clip)return;const key=name+(upper?'Upper43':'Full43');
 if(upper&&!p.clips[key])p.clips[key]={...clip,tracks:clip.tracks.filter(t=>/spine_|clavicle_|upperarm_|lowerarm_|hand_|neck_|head$|index_|middle_|ring_|pinky_|thumb_/i.test(t.target.name))};
 sampleHuman(p,upper?key:name,clamp(phase,0,1),weight);
}

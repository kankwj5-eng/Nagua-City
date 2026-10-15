function pruneLegacy46(){
 art46.releasedNodeTracks=0;art46.prunedTemplateTracks=0;
 for(const p of [player,...pedestrians,...city.actors,...polish26.riders.map(r=>r.p)])for(const node of p.root.getDescendants())if(node.animations?.length){art46.releasedNodeTracks+=node.animations.length;node.animations=[];}
 for(const container of humanContainers){for(const node of [...container.transformNodes,...container.meshes])if(node.animations?.length)node.animations=[];for(const group of container.animationGroups)if(['Idle','Walk','Run'].includes(group.name))for(const track of group.targetedAnimations){const keys=track.animation.getKeys();if(keys.length>1){art46.prunedTemplateTracks++;track.animation.setKeys([keys[0]]);}}}
}

function locomotion42(){
 const walk=humanWalk;humanWalk=function(p,speed,dt){walk(p,speed,dt);if(p.far||!p.human||p.hero&&(vertical!==0||actionTimer>0||equipped!=='hands'))return;const rig=cacheRig41(p),head=rig.nodes.get('head');if(!head?.rotationQuaternion)return;
 // A restrained look-ahead, proportional to turn speed; stops once the body catches up.
 const angle=clamp((rig.turn||0)*.028,-.085,.085);head.rotationQuaternion.multiplyInPlace(B.Quaternion.RotationAxis(V(0,1,0),angle));};
 const previous=jump;jump=function(){previous();if(vertical!==0&&player.rig41){player.rig41.wasAir=true;}};
}

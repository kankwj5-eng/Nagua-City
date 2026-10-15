function blockedShot(p,dir,length){for(let d=.7;d<length-.45;d+=.25){const q=p.add(dir.scale(d));if(blocked(q.x,q.z,.025,null,false))return true;}return false;}

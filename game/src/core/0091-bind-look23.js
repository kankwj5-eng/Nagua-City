function bindLook23(look){const points=new Map();let distance=0;
 look.onpointerdown=e=>{points.set(e.pointerId,{x:e.clientX,y:e.clientY});look.setPointerCapture(e.pointerId);distance=0;e.preventDefault();};
 look.onpointermove=e=>{if(!points.has(e.pointerId)||!playing)return;const old=points.get(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});lastLook=time;
 if(points.size===2){const a=[...points.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(distance>0&&d>10)zoomCamera(Math.log(distance/d));distance=d;}
 else if(points.size===1){yaw-=(e.clientX-old.x)*sensitivity;pitch=clamp(pitch+(e.clientY-old.y)*sensitivity,-.06,.72);}}
 const end=e=>{points.delete(e.pointerId);distance=0;};look.onpointerup=look.onpointercancel=look.onlostpointercapture=end;
 look.addEventListener('wheel',e=>{if(playing){zoomCamera(e.deltaY*.0012);e.preventDefault();}},{passive:false});
}

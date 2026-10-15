function anchorShadow42(){
 const p=homeMode?(current?.root.position||spawn):driving?current.root.position:player.root.position;
 const d=sun.direction,h=95,step=2*Math.abs(sun.orthoRight)/shadow.getShadowMap().getSize().width;
 sun.position.set(Math.round((p.x-d.x*h/Math.abs(d.y))/step)*step,h,Math.round((p.z-d.z*h/Math.abs(d.y))/step)*step);
}

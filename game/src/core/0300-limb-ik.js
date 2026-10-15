function limbIK(start,target,length1,length2,bend){
 const d=target.subtract(start);
 const distance=d.length();
 const len=clamp(distance,.06,length1+length2-.002);
 // Avoid zero-length directions after transitions or coincident grip targets.
 const dir=distance>1e-8?d.scale(1/distance):V(0,0,-1);
 let orth=bend.subtract(dir.scale(B.Vector3.Dot(bend,dir)));
 // Parallel/anti-parallel bend hints have no normal direction. A deterministic
 // perpendicular keeps the elbow/knee bent instead of collapsing into a line.
 if(orth.lengthSquared()<1e-10){
  const axis=Math.abs(dir.y)<.9?V(0,1,0):V(1,0,0);
  orth=axis.subtract(dir.scale(B.Vector3.Dot(axis,dir)));
 }
 orth.normalize();
 const along=(length1*length1-length2*length2+len*len)/(2*len);
 const height=Math.sqrt(Math.max(0,length1*length1-along*along));
 return start.add(dir.scale(along)).add(orth.scale(height));
}

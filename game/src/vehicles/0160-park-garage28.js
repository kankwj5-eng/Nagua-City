function parkGarage28(v){if(!v?.garage)return;for(const x of [-65,-83,-147,65,83])for(const side of [1,-1]){const z=111+side*8.7,heading=Math.PI/2;if(!vehicleFootprint26(v,x,z,heading,true))continue;v.root.position.set(x,groundAt(x,z),z);v.heading=heading;v.root.rotation.set(0,heading,0);v.parked28=true;return;}}


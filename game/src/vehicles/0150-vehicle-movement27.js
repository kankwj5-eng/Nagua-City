function vehicleMovement27(v){const snap=fleetSnapshot25().find(o=>o.id===v.id);return {x:snap.x,z:snap.z,heading:snap.heading,speed:snap.speed,active:snap.active};}


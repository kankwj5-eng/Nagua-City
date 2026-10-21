// Asientos situados en coordenadas de vehículo (frente -Z). Se conserva el
// esqueleto GLB y se mueve únicamente el nodo raíz de su instancia.
function humanRide(person,vehicle){
 if(!person||!vehicle)return;
 const moto=!!vehicle.bike,caponera=!!vehicle.caponera;
 person.root.parent=vehicle.root;
 // Los dos tipos de moto y las dos caponeras utilizan distinta altura/longitud.
 const seat=moto?{x:0,y:.76,z:.16}:caponera?{x:0,y:.65,z:-.40}:{x:-.36,y:.45,z:-.34};
 person.root.position.set(seat.x,seat.y,seat.z);
 person.root.rotation.set(0,0,0);
 // Al caminar, el visual lleva un giro de 180° para compensar el rig GLB.
 // Ese giro no vale sentado: se elimina dentro del marco del vehículo.
 person.visual.rotation.y=0;
 person.visual.position.set(0,0,0);
 person.root.setEnabled(true);
 // Crouch es una postura de agacharse, no de conducir; no debe usarse como asiento.
 originalV4.setClip(person,'Idle');
}

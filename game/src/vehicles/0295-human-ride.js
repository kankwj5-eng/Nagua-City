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
 person.visual.position.y=0;
 person.root.setEnabled(true);
 // Mateo sí tiene Crouch; los NPC V4 tienen Idle pero no Crouch.
 originalV4.setClip(person,person.hero?'Crouch':'Idle');
}

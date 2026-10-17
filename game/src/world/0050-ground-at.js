function groundAt(x,z){if(Math.abs(x+222)<2.2&&z<-276&&z>-309)return .312;if(Math.abs(x+222)<4.5&&z<=-308&&z>-311)return .35;let h=-Infinity;for(const t of surfaceGrid.get(Math.floor(x/8)+','+Math.floor(z/8))||[]){const den=(t[5]-t[8])*(t[0]-t[6])+(t[6]-t[3])*(t[2]-t[8]);if(Math.abs(den)<1e-8)continue;const a=((t[5]-t[8])*(x-t[6])+(t[6]-t[3])*(z-t[8]))/den,b=((t[8]-t[2])*(x-t[6])+(t[0]-t[6])*(z-t[8]))/den,c=1-a-b;if(a>=-.0001&&b>=-.0001&&c>=-.0001)h=Math.max(h,a*t[1]+b*t[4]+c*t[7]+.003);}return Number.isFinite(h)?h:.003;}



// Vía superior de un paso a desnivel inspirado en Managua (mapa a escala artística).
// La calle de abajo SIEMPRE usa groundAt(); solo los vehículos de la vía norte-sur
// usan roadSurface50(..., true), evitando hacer flotar tráfico transversal y NPC.
const overpass50={x:37,z:-37,halfLength:66,flatHalf:18,halfWidth:4.5,height:5.4,installed:false};
function overpassRise50(z){
 const d=Math.abs(z-overpass50.z);
 if(d>=overpass50.halfLength)return 0;
 if(d<=overpass50.flatHalf)return overpass50.height;
 const t=(overpass50.halfLength-d)/(overpass50.halfLength-overpass50.flatHalf);
 return overpass50.height*t*t*(3-2*t);
}
function roadSurface50(x,z,upper=false){
 const ground=groundAt(x,z);
 return upper&&overpass50.installed&&Math.abs(x-overpass50.x)<overpass50.halfWidth?
  ground+overpassRise50(z):ground;
}
function overpassLayer50(v,x,z,heading){
 if(!overpass50.installed||Math.abs(x-overpass50.x)>=overpass50.halfWidth||Math.abs(z-overpass50.z)>=overpass50.halfLength){
  v.overpass50=false;return false;
 }
 if(v.traffic){
  v.overpass50=v.route?.axis==='z'&&!v.turn29;
  return v.overpass50;
 }
 if(v.overpass50===true)return true;
 // Subir solo por una rampa exterior, siguiendo el eje norte-sur. Girar debajo
 // del puente no debe teletransportar el vehículo al tablero superior.
 const d=Math.abs(z-overpass50.z),longitudinal=Math.abs(Math.cos(heading))>Math.abs(Math.sin(heading))*.95;
 v.overpass50=d>overpass50.flatHalf+22&&longitudinal;
 return v.overpass50;
}


// Barreras con altura propia: la misma coordenada horizontal admite vehículos
// bajo el puente. No insertar pretiles en colliderGrid ni en data.boxes (2D).
// La trayectoria superior sí debe chocar con los muros de protección.
function overpassGuardrails53(x,z,upper,r=0){
 if(!upper||!overpass50.installed||overpassRise50(z)<=.75)return false;
 if(Math.abs(z-overpass50.z)>=overpass50.halfLength)return false;
 const edge=overpass50.halfWidth+.21;
 return Math.abs(Math.abs(x-overpass50.x)-edge)<Math.max(0,r)+.18;
}

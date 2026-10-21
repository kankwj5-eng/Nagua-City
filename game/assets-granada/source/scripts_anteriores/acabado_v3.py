import bpy,json
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Keep cloud variation while retaining visible blue after display conversion.
for n in s.world.node_tree.nodes:
 if n.type=='VALTORGB':
  n.color_ramp.elements[0].position=.28;n.color_ramp.elements[0].color=(.015,.095,.34,1)
  n.color_ramp.elements[1].position=.80;n.color_ramp.elements[1].color=(.18,.34,.58,1)
 if n.type=='BACKGROUND' and n.name!='Background':n.inputs['Strength'].default_value=.85
# Wider palm leaf blades retain their physical pointed silhouette.
for o in s.objects:
 if o.type=='MESH' and o.name.startswith(('V2 foliolos de palmera','V3 foliolos intercalados')):
  vs=o.data.vertices
  for i in range(0,len(vs),5):
   mid=(vs[i+1].co+vs[i+3].co)/2
   for j in [1,3]:vs[i+j].co=mid+(vs[i+j].co-mid)*3.4
# Move the lantern rows toward the open centre, leaving trunks and roots in place.
for o in s.objects:
 if o.name.startswith(('V3 base farol','V3 pedestal farol','V3 poste negro','V3 brazo forjado','V3 voluta farol','V3 cristal linterna','V3 marco linterna','V3 sombrerete negro','V3 remate linterna','V3 remate poste')):
  # Geometry is authored in absolute coordinates for curves, local for cylinders.
  if o.type=='CURVE':
   for sp in o.data.splines:
    for p in sp.points:
     p.co.y+=.85 if p.co.y < center(p.co.x) else -.85
  else:
   o.location.y+=.85 if o.location.y<center(o.location.x) else -.85
s['acabado_v3']='Cielo azul con nubes, foliolos mas anchos, faroles visibles en borde interior'
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=48
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
for cn,fn in [('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png'),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png'),('V3 detalle de faroles y asientos','Detalle_Mobiliario.png'),('Comparacion F000 - vista aerea','Entorno_Aereo.png')]:
 s.camera=bpy.data.objects[cn];s.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
print('ACABADO_V3_TERMINADO',flush=True)

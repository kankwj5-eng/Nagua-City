import bpy,bmesh,math,json,random
from pathlib import Path
from mathutils import Vector,Matrix
B=Path(__file__).parent;s=bpy.context.scene;random.seed(822)
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')]);exec(src[src.index('def arch('):src.index('# CATHEDRAL:')])
src=(B/'realismo_v6.py').read_text();exec(src[src.index('def bounds(o)'):src.index('bpy.context.view_layer.update();planes=')])
group('30 V8 Alzado posterior corregido')
ivory=bpy.data.materials['Cal blanca desgastada'];yellow=bpy.data.materials['Ocre catedral - observado en F000 F570'];glass=bpy.data.materials['Cristal oscuro']
# Replace the high pointed rear window treatment, including its mullions.
for o in bpy.data.collections['16 V5 Alzado visto en el recorte'].objects:
 if o.name.startswith(('V5 ventana oriental','V5 parteluz','V5 travesano','Marco V5 ventana oriental','V5 pilastra alzado','V5 capitel oriental','V5 oculo posterior','V5 marco oculo','V5 cornisa posterior','V5 remate curvo','V5 cornisa curva')):o.hide_render=True;o.hide_viewport=True
wall=box('V8 paño posterior de arcos redondos',(35.42,1.5,13.25),(.54,24,10),yellow,.018)
new=[]
for y in [-4.5,1.5,7.5]:
 before=set(bpy.data.objects);o=arch('V8 ventana posterior redonda',y,-35.72,10.3,2.5,3.7,glass,ivory,False)
 # arch starts in XY: rotate local x to world Y and local y to -world X.
 bpy.context.view_layer.update();R=Matrix.Rotation(math.pi/2,4,'Z')
 for ob in set(bpy.data.objects)-before:ob.matrix_world=R@ob.matrix_world
 new.append(o)
bpy.context.view_layer.update()
copies=[]
for o in new:
 d=o.copy();d.data=o.data.copy();COL.objects.link(d);copies.append(d)
recess(bpy.data.objects['Nave central'],copies,(1,0,0),2.4)
for o in copies:bpy.data.objects.remove(o,do_unlink=True)
recess(wall,new,(1,0,0),2.4)
for z in [8.45,8.7,15.05,17.9,18.2]:box('V8 cornisa posterior continua',(35.72,1.5,z),(.46,24.6,.17),ivory,.025)
for y in [-10.15,-7.3,-1.5,4.5,10.3,13.15]:
 box('V8 pilastra posterior',(35.76,y,13.3),(.21,.28,9.5),ivory,.02)
 for z in [8.9,17.7]:box('V8 capitel posterior',(35.81,y,z),(.29,.48,.22),ivory,.02)
for y in [-8.7,-5.5,-2.5,5.5,8.5,11.5]:
 cyl('V8 oculo friso posterior',(35.75,y,16.5),(35.79,y,16.5),.28,glass,N=48)
 ps=[(35.84,y+.34*math.cos(a*math.tau/64),16.5+.34*math.sin(a*math.tau/64)) for a in range(65)];curve('V8 aro oculo posterior',ps,.065,ivory)
# Short curved central pediment and closed white end caps on the vaults.
crest=[(1.5+u,18.25+1.6*math.cos(u*math.pi/12)) for u in [i*.25-6 for i in range(49)]]
vs=[(35.71,-4.5,18.18),(35.71,7.5,18.18)]+[(35.71,y,z) for y,z in reversed(crest)];o=mesh('V8 fronton central curvo',vs,[tuple(range(len(vs)))],yellow);m=o.modifiers.new('Espesor','SOLIDIFY');m.thickness=.18
curve('V8 cornisa del fronton curvo',[(35.85,y,z) for y,z in crest],.13,ivory)
for cy in [1.5-15,1.5+15]:
 vs=[(34.0,cy,15.228)]+[(34.0,cy+3.2*math.cos(k*math.pi/64),15.228+3.008*math.sin(k*math.pi/64)) for k in range(65)]
 mesh('V8 cierre blanco boveda lateral',vs,[(0,k+1,k+2) for k in range(64)],ivory)
# Fine worn paint flecks on the raised kerb, using the exposed mineral colour.
mineral=material('V8 concreto expuesto del bordillo',(.19,.17,.13),.96,.0008,160)
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
v=[];f=[]
for side in [-1,1]:
 for k in range(620):
  x=random.uniform(2,477);y=center(x)+side*6.9;z=random.uniform(.05,.20);w=random.uniform(.015,.12);h=random.uniform(.006,.035);st=len(v)
  v.extend([(x,y,z),(x+w*.7,y,z-.3*h),(x+w,y,z+.4*h),(x+w*.6,y,z+h),(x+.15*w,y,z+.7*h)]);f.append(tuple(range(st,st+5)))
mesh('V8 desconchados irregulares de pintura',v,f,mineral)
bpy.ops.object.camera_add(location=(85,57,29));cam=bpy.context.object;cam.name='V8 detalle encuentro cupula';cam.rotation_euler=(Vector((17,1.5,25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=55;cam.data.clip_end=3000
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64
s['revision_v8_alzado']='Ventanas redondas, friso con oculos, fronton central, extremos de bovedas cerrados y desgaste de bordillos. Aproximacion visual.'
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.cycles.samples=24;s.render.filepath=str(B/'Prueba_V8_Alzado.png');bpy.ops.render.render(write_still=True)
s.camera=cam;s.render.resolution_x=1000;s.render.resolution_y=800;s.render.filepath=str(B/'Detalle_Cupula_V8.png');bpy.ops.render.render(write_still=True)
print('V8_ALZADO_CORREGIDO',flush=True)

import bpy,json
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
assert not s.get('revision_v8_marcos_adosados')
bpy.context.view_layer.update();fixed=[]
for o in bpy.data.collections['12 V3 Catedral afinada'].objects:
 if not o.name.startswith(('V3 ventana lateral moldurada','V3 puerta lateral catedral')):continue
 pts=[o.matrix_world@Vector(v) for v in o.bound_box];cy=sum(p.y for p in pts)/8;side=1 if cy>1.5 else -1
 mw=o.matrix_world.copy();inv=mw.inverted();o.data=o.data.copy();y=1.5+side*(18.12 if o.type=='CURVE' else 17.95)
 if o.type=='CURVE':
  for sp in o.data.splines:
   for v in sp.points:
    p=mw@Vector(v.co[:3]);p.y=y;v.co=(*(inv@p),v.co.w)
 elif o.type=='MESH':
  for v in o.data.vertices:p=mw@v.co;p.y=y;v.co=inv@p
  o.data.update()
 fixed.append(o.name)
assert len(fixed)>=100,len(fixed)
s['revision_v8_marcos_adosados']=json.dumps({'piezas':len(fixed),'marco_fuera_muro_m':.02,'vidrio_rehundido_m':.15})
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.cycles.samples=64;s.render.resolution_x=1440;s.render.resolution_y=900
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=bpy.data.objects['Recorrido_05_Costado_Catedral'];s.render.filepath=str(B/'Recorrido_05_Costado_Catedral.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.render.filepath=str(B/'Vista_Video_V8.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['V8 detalle encuentro cupula'];s.render.resolution_x=1200;s.render.resolution_y=960;s.render.filepath=str(B/'Detalle_Cupula_V8.png');bpy.ops.render.render(write_still=True)
print('V8_MARCOS_ADOSADOS',len(fixed),flush=True)

import bpy,json
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
cam=bpy.data.objects['Comparacion F390 - regreso por Calzada'];cam.rotation_euler=(Vector((0,15,-20))-cam.location).to_track_quat('-Z','Y').to_euler();cam['referencia_v7']='Recorte 8.2 a 10.4 s; encuadre aproximado'
bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
for z in [24,24.5,25,25.5,26]:
 hit,p,n,index,ob,mat=s.ray_cast(dg,Vector((200,1.5,z)),Vector((-1,0,0)),distance=300)
 print('V7_RAY_REAR',z,ob.name if hit else '',tuple(p) if hit else '',flush=True)
for name in ['Tejado nave catedral','V5 remate curvo oriental','V5 cornisa curva oriental']:
 ob=bpy.data.objects.get(name)
 if ob:
  ps=[ob.matrix_world@Vector(v) for v in ob.bound_box];print('V7_BOUNDS',name,[(min(v[k] for v in ps),max(v[k] for v in ps)) for k in range(3)],flush=True)
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64;s.cycles.use_denoising=True;bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=cam;s.render.resolution_x=576;s.render.resolution_y=1024;s.render.filepath=str(B/'Vista_Video_V7.png');bpy.ops.render.render(write_still=True);print('V7_COMPARACION_RENDERIZADA',flush=True)
views=json.loads((B/'camaras_primera_persona.json').read_text());s.render.resolution_x=1440;s.render.resolution_y=900
for v in views:
 v['version_modelo']=7;s.camera=bpy.data.objects[Path(v['archivo']).stem];s.render.filepath=str(B/v['archivo']);bpy.ops.render.render(write_still=True);print('V7_FOTO_LISTA',v['archivo'],flush=True)
json.dump(views,open(B/'camaras_primera_persona.json','w'),indent=2,ensure_ascii=False);print('V7_SIETE_VISTAS_TERMINADAS',flush=True)

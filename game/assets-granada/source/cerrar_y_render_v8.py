import bpy,json,math
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
assert 'revision_v8_alzado' in s and not s.get('revision_v8_juntas_cerradas')
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')]);group('31 V8 Juntas continuas de cupula')
ivory=bpy.data.materials['Cal blanca desgastada'];ochre=bpy.data.materials['Ocre catedral - observado en F000 F570']
cyl('V8 apoyo tambor empotrado en cubierta',(16.8,1.5,18.6),(16.8,1.5,20.6),6.15,ochre,N=96)
cyl('V8 anillo continuo bajo casquete',(16.8,1.5,27.82),(16.8,1.5,28.06),6.11,ivory,N=96)
s['revision_v8_juntas_cerradas']='Basamento penetrando la cubierta y anillo superior solapado con casquete; sin separaciones verticales.'
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.render.resolution_percentage=100;s.cycles.samples=64;s.cycles.use_denoising=True
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
views=json.loads((B/'camaras_primera_persona.json').read_text())
for i,v in enumerate(views):
 # View 1 faces away from the cathedral and was already rendered with V8 dirt.
 if i>0:
  s.camera=bpy.data.objects[Path(v['archivo']).stem];s.render.filepath=str(B/v['archivo']);bpy.ops.render.render(write_still=True)
 v['version_modelo']=8;print('V8_FOTO_LISTA',v['archivo'],flush=True)
(B/'camaras_primera_persona.json').write_text(json.dumps(views,indent=2,ensure_ascii=False))
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.render.filepath=str(B/'Vista_Video_V8.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['V8 detalle encuentro cupula'];s.render.resolution_x=1200;s.render.resolution_y=960;s.render.filepath=str(B/'Detalle_Cupula_V8.png');bpy.ops.render.render(write_still=True)
print('V8_RENDER_COMPLETO',flush=True)

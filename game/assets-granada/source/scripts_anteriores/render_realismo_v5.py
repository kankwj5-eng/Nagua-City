import bpy,json
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
assert bpy.data.objects['Terreno'].data.materials[0].name.startswith('V5 base urbana neutra')
assert json.loads(s['realismo_v5'])['tramos_cartografiados_con_suelo']==188
assert len(bpy.data.objects['Losas individuales humedas'].data.polygons)==25600
assert all(im.packed_file for im in bpy.data.images if im.source=='FILE')
wide=[('Panorama_01_Desde_Arriba.png',(-40,-65,220),(20,20,0),38),('Panorama_02_Lateral_Catedral.png',(85,-106,63),(-8,10,13),42),('Panorama_03_Calles.png',(254,-80,105),(75,32,4),40),('Panorama_04_Conjunto.png',(280,-390,380),(175,70,0),34)]
for fn,pos,target,lens in wide:
 name=Path(fn).stem;cam=bpy.data.objects.get(name)
 if not cam:bpy.ops.object.camera_add(location=pos);cam=bpy.context.object;cam.name=name
 cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;cam.data.clip_end=3000
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=48;s.cycles.use_denoising=True;s.render.resolution_percentage=100;s.render.resolution_x=1000;s.render.resolution_y=1400
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
views=[('Panorama_03_Calles','Panorama_03_Calles.png',1440,900,24),('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png',1000,1400,24),('V4 detalle de piedra y juntas','Detalle_Pavimento.png',1400,1000,32),('V3 detalle de faroles y asientos','Detalle_Mobiliario.png',1000,1400,24),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png',1000,1400,24),('Comparacion F000 - vista aerea','Entorno_Aereo.png',1000,1400,24)]
views.extend((Path(fn).stem,fn,1440,900,24) for fn,_,_,_ in wide if fn!='Panorama_03_Calles.png')
for cn,fn,w,h,samples in views:
 s.camera=bpy.data.objects[cn];s.cycles.samples=samples;s.render.resolution_x=w;s.render.resolution_y=h;s.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
 print('VISTA_V5_LISTA',fn,flush=True)
print('TODAS_LAS_VISTAS_V5_LISTAS',flush=True)

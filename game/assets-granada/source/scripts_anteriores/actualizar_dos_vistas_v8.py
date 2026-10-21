import bpy
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene
assert s.get('revision_v8_marcos_adosados')
s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64
for name in ['Recorrido_02_Hacia_Catedral','Recorrido_06_Desde_Parque']:
 s.camera=bpy.data.objects[name];s.render.filepath=str(B/(name+'.png'));bpy.ops.render.render(write_still=True);print('V8_VISTA_SINCRONIZADA',name,flush=True)

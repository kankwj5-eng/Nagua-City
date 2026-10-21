import bpy,json
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene
views=json.loads((B/'camaras_primera_persona.json').read_text());s.cycles.samples=64;s.cycles.use_denoising=True;s.render.resolution_x=1440;s.render.resolution_y=900;s.render.resolution_percentage=100
for v in views:
 s.camera=bpy.data.objects[Path(v['archivo']).stem];s.render.filepath=str(B/v['archivo']);bpy.ops.render.render(write_still=True);print('V6_FOTO_LISTA',v['archivo'],flush=True)
print('V6_SEIS_FOTOS_TERMINADAS',flush=True)

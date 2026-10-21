import bpy
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene
cam=bpy.data.objects['V3 detalle de faroles y asientos']
cy=34.35+(30.33-34.35)*(119-85)/(198-85)
cam.rotation_euler=(Vector((119,cy-3.6,2.25))-cam.location).to_track_quat('-Z','Y').to_euler()
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada']
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=cam;s.cycles.samples=32;s.render.filepath=str(B/'Detalle_Mobiliario.png');bpy.ops.render.render(write_still=True)

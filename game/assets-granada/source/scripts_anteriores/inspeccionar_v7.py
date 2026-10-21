import bpy,json
from collections import Counter
from pathlib import Path
s=bpy.context.scene
print('LEAF PROTOS',[(o.name,len(o.data.vertices),len(o.data.polygons)) for o in s.objects if o.name.startswith('V6 prototipo')])
print('HIDDEN',Counter(o.name.split('.')[0] for o in s.objects if o.hide_render))
print('REAR',[(o.name,list(o.location),len(o.data.vertices)) for o in s.objects if o.type=='MESH' and o.name.startswith(('V5 ventana oriental','V5 vano ala','V5 vano bajo','Tambor cupula'))])
print('SIZE',len(s.objects),len(bpy.data.meshes))

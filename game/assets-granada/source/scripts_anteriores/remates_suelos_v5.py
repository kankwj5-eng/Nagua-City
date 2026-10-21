import bpy,xml.etree.ElementTree as ET,json
from pathlib import Path
B=Path(__file__).parent;s=bpy.context.scene
# OSM identifies the plaza as an AREA, not a perimeter road with raised sidewalks.
for o in list(s.objects):
 if o.name.startswith(('V5 Plaza de la Independencia','V5 acera junto a Plaza de la Independencia')):bpy.data.objects.remove(o,do_unlink=True)
r=ET.parse(B/'granada_osm.xml').getroot();nd={x.get('id'):((float(x.get('lon'))+85.95324)*108920,(float(x.get('lat'))-11.92982)*111200) for x in r.findall('node')}
mat=next(m for m in bpy.data.materials if m.name.startswith('V5 piedra gris') and m.users)
col=bpy.data.collections['15 V5 Suelos urbanos calles y aceras']
for w in r.findall('way'):
 tags={x.get('k'):x.get('v') for x in w.findall('tag')}
 if tags.get('name')=='Plaza de la Independencia' and tags.get('area')=='yes':
  ps=[nd[x.get('ref')] for x in w.findall('nd') if x.get('ref') in nd]
  if ps[0]==ps[-1]:ps=ps[:-1]
  d=bpy.data.meshes.new('V5 poligono real de plaza pavimentada');d.from_pydata([(x,y,.029) for x,y in ps],[],[tuple(range(len(ps)))]);d.update();o=bpy.data.objects.new('V5 Plaza pavimentada segun poligono OSM',d);col.objects.link(o);d.materials.append(mat)
  o['fuente']='OSM area=yes; superficie peatonal continua'
# Remove the artificial kerb strips previously drawn around that area as if it were a road.
for o in list(s.objects):
 if o.name.startswith('V5 borde de acera') and o.type=='MESH':
  vs=o.data.vertices;cx=sum(v.co.x for v in vs)/len(vs);cy=sum(v.co.y for v in vs)/len(vs)
  if -55<cx<-16 and 31<cy<201:bpy.data.objects.remove(o,do_unlink=True)
# Separate planar map layers by small sub-centimetre offsets to prevent self-shadow artefacts.
count=0
for o in s.objects:
 if o.name.startswith('V5 ') and o.type=='MESH' and len(o.data.vertices)==4 and len(o.data.polygons)==1:
  zs=[v.co.z for v in o.data.vertices]
  if min(zs)>=0 and max(zs)<.11:o.location.z+=(count%101)*.000025;count+=1
stats=json.loads(s['realismo_v5']);stats['plaza_como_area_peatonal']=True;stats['capas_planas_separadas']=count
s['realismo_v5']=json.dumps(stats,ensure_ascii=False);json.dump(stats,open(B/'realismo_v5.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=48;s.render.resolution_x=1000;s.render.resolution_y=1400
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
# Use the common camera definitions and render the final corrected scene.
exec((B/'render_realismo_v5.py').read_text())

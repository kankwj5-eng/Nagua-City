import bpy,math,json,random,struct
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
B=Path(__file__).parent;s=bpy.context.scene;random.seed(72021)
meta=json.loads(s['ultima_pasada_v7']);assert not meta.get('remates_verificados')
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')]);group('27 V7 Remates finales')
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# The central drum was buried in the nave ridge. Lift the complete assembly together.
bpy.context.view_layer.update();shifted=[]
for ob in s.objects:
 if ob.type not in ['MESH','CURVE'] or ob.hide_render:continue
 ps=[ob.matrix_world@Vector(v) for v in ob.bound_box];c=sum(ps,Vector())/8
 if (c.x-16.8)**2+(c.y-1.5)**2<6.8**2 and min(v.z for v in ps)>24.5:
  ob.location.z+=3.0;shifted.append(ob.name)
assert len(shifted)>35
# Hip the rear end so its roof is concealed by the curved eastern parapet.
roof=bpy.data.objects['Tejado nave catedral'];inv=roof.matrix_world.inverted();changed=0
for v in roof.data.vertices:
 p=roof.matrix_world@v.co
 if p.x>21 and p.z>23.4:
  t=max(0,min(1,(p.x-21)/13.8));p.z=23.4+(p.z-23.4)*(1-.8*t);v.co=inv@p;changed+=1
roof.data.update();meta['piezas_cupula_recolocadas']=len(shifted);meta['vertices_cubierta_posterior_ajustados']=changed
# Keep roughness comfortably mineral while retaining small damp variations.
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
m=bpy.data.materials['V5 piedra gris del recorte'];n=m.node_tree.nodes;l=m.node_tree.links;p=next(a for a in n if a.type=='BSDF_PRINCIPLED');pos=n.new('ShaderNodeNewGeometry').outputs['Position'];rough(n,l,p,noise(n,l,scaled(n,l,pos,(1,.65,1)),1.1,4),.58,.88)
# Actual short grass is restricted to the small planters shown in the video.
green=[material('V7 hierba jardinera '+str(i),c,.92,0) for i,c in enumerate([(.045,.10,.012),(.075,.16,.022),(.12,.22,.035)])]
beds=[o for o in s.objects if o.name.startswith('V7 tierra jardinera farol')];verts=[];faces=[];indices=[]
for bed in beds:
 x,y,z=bed.location
 for k in range(340):
  xx=x+random.uniform(-.35,.35);yy=y+random.uniform(-.35,.35)
  if abs(xx-x)<.21 and abs(yy-y)<.21:continue
  a=random.random()*math.tau;h=random.uniform(.018,.049);w=.002;u=Vector((math.cos(a),math.sin(a),0));cross=Vector((-u.y,u.x,0))*w;root=Vector((xx,yy,.083));tip=root+Vector((0,0,h))+u*h*.3;st=len(verts);verts.extend([tuple(root-cross),tuple(root+cross),tuple(tip)]);faces.append((st,st+1,st+2));indices.append(k%3)
o=mesh('V7 hierba de jardineras de farol',verts,faces)
for m in green:o.data.materials.append(m)
for f,i in zip(o.data.polygons,indices):f.material_index=i
meta['briznas_jardineras_farol']=len(faces)
# Separate collision proxies, ready for engine-specific configuration.
group('28 COLISIONES RECORRIDO PRINCIPAL');colliders=[]
def collider(o,source,shape):
 o.name='COL_'+source;o['collision_shape']=shape;o['source_object']=source;o['role']='collision_proxy';o.display_type='WIRE';o.hide_render=True;colliders.append(o);return o
def boxbounds(ob):
 ps=[ob.matrix_world@Vector(v) for v in ob.bound_box];lo=Vector(tuple(min(p[k] for p in ps) for k in range(3)));hi=Vector(tuple(max(p[k] for p in ps) for k in range(3)));return lo,hi
bpy.context.view_layer.update()
for ob in list(s.objects):
 if ob.type!='MESH' or ob.hide_render:continue
 house=ob.name.startswith('Casa ') and 0<ob.location.x<500 and ob.dimensions.x<40
 if house or ob.name.startswith(('Nave central','Nave lateral','Campanario prism','Fachada cuerpo','Escalinata','Quiosco visible')):
  lo,hi=boxbounds(ob);collider(box('colision',(lo+hi)/2,tuple(hi-lo),None,0),ob.name,'BOX')
 if ob.name.startswith(('Tronco de arbol','V3 poste negro')):
  lo,hi=boxbounds(ob);x=(lo.x+hi.x)/2;y=(lo.y+hi.y)/2;bottom=max(.04,lo.z);top=hi.z;r=.23 if ob.name.startswith('V3') else .16
  collider(cyl('colision',(x,y,bottom),(x,y,top),r,None,N=12),ob.name,'CYLINDER')
benches={}
for ob in s.objects:
 if ob.name.startswith('V3 liston respaldo'):benches[(round(ob.location.x,3),round(ob.location.y,3))]=ob.name
for (x,y),name in benches.items():collider(box('colision',(x,y-.31,.64),(1.98,.83,1.2),None,0),'banca_'+name,'BOX')
xs=[0,59,85,198,209,309,383,466,480];v=[]
for x in xs:v.extend([(x,center(x)-6.8,.042),(x,center(x)+6.8,.042)])
f=[(2*i,2*i+2,2*i+3,2*i+1) for i in range(len(xs)-1)];ground=collider(mesh('colision',v,f),'suelo_paseo','TRIMESH')
# Sample all 479 metres of the main walking lane against the actual proxy mesh.
bvh=BVHTree.FromPolygons([Vector(p) for p in v],f,all_triangles=False);tested=0
for x in range(1,480):
 hit,normal,index,distance=bvh.ray_cast(Vector((x,center(x),2)),Vector((0,0,-1)),3)
 assert hit is not None and abs(hit.z-.042)<.002;tested+=1
assert len(colliders)>230
meta['colisiones_principales']=len(colliders);meta['muestras_suelo_validas']=tested;meta['remates_verificados']=True
s['ultima_pasada_v7']=json.dumps(meta,ensure_ascii=False)
# Export collision geometry only. Visual materials remain native in the master .blend.
bpy.ops.object.select_all(action='DESELECT')
for ob in colliders:ob.hide_viewport=False;ob.hide_set(False);ob.select_set(True)
bpy.context.view_layer.objects.active=colliders[0]
bpy.ops.export_scene.gltf(filepath=str(B/'Colisiones_Granada.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True,export_materials='NONE',export_cameras=False,export_lights=False)
for ob in colliders:ob.select_set(False);ob.hide_viewport=True
raw=(B/'Colisiones_Granada.glb').read_bytes();magic,version,size=struct.unpack_from('<4sII',raw,0);assert magic==b'glTF' and version==2 and size==len(raw);ln,tp=struct.unpack_from('<I4s',raw,12);doc=json.loads(raw[20:20+ln]);assert doc['asset']['version']=='2.0';assert sum(n.get('extras',{}).get('role')=='collision_proxy' for n in doc.get('nodes',[]))==len(colliders)
report={'unidad':'metros','origen_WGS84':[11.92982,-85.95324],'coordenadas':'Modelo Blender Z arriba; GLB exportado con conversion estandar a Y arriba','colliders':len(colliders),'suelo_muestras':tested,'alcance':'Suelo del paseo, casas originales, catedral, escalinata, quiosco, troncos, postes y bancas del recorrido principal. Fondos, mesas, sillas y patios no verificados.','importacion':'Leer extras.role=collision_proxy y collision_shape; crear cuerpos estaticos en el motor. GLB no activa fisica automaticamente.','pendiente':'Version visual para el motor con materiales horneados, LOD y particion por zonas; pruebas de FPS, memoria y caminata dentro del juego.'}
json.dump(report,open(B/'Preparacion_Integracion.json','w'),indent=2,ensure_ascii=False);json.dump(meta,open(B/'ultima_pasada_v7.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.cycles.samples=64;bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.render.resolution_x=576;s.render.resolution_y=1024;s.cycles.samples=24;s.render.filepath=str(B/'Prueba_V7_Video_Final.png');bpy.ops.render.render(write_still=True)
print('V7_REMATES_Y_COLISIONES_LISTOS',meta,flush=True)

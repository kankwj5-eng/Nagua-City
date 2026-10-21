from pathlib import Path
B=Path(__file__).parent
src=(B/'realismo_v5.py').read_text();exec(src[:src.index('# The olive')])
group('17 V5 Continuidad de manzanas - contexto aproximado')
roofmat=existing('V2 teja contexto');patiomat=existing('V5 patios pavimentados');bark=existing('Tronco');metal=existing('V3 hierro negro')
cols=[existing('Fachada '+c) for c in ['blanco','crema','melocoton','coral','mostaza','azul','cian']]
r=ET.parse(B/'granada_osm.xml').getroot();nd={x.get('id'):Vector(((float(x.get('lon'))+85.95324)*108920,(float(x.get('lat'))-11.92982)*111200)) for x in r.findall('node')}
def tags(w):return {x.get('k'):x.get('v') for x in w.findall('tag')}
park=[];roads=[]
for w in r.findall('way'):
 t=tags(w);ps=[nd[x.get('ref')] for x in w.findall('nd') if x.get('ref') in nd]
 if w.get('id')=='27377881':park=ps
 if t.get('highway') in ['residential','tertiary','secondary','living_street','pedestrian','service','unclassified']:
  half=6.8 if t.get('name')=='Calle La Calzada' else 2.5 if t['highway']=='pedestrian' else 4.1
  roads.extend((a,b,half) for a,b in zip(ps,ps[1:]) if (b-a).length>.1)
def inside(x,y):
 hit=False;j=len(park)-1
 for i,a in enumerate(park):
  b=park[j]
  if (a.y>y)!=(b.y>y) and x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x:hit=not hit
  j=i
 return hit
def dist(x,y,a,b):
 q=Vector((x,y));v=b-a;t=max(0,min(1,(q-a).dot(v)/v.length_squared));return (q-a-v*t).length
def overlap(q,p):return max(q[0],p[0])<min(q[2],p[2]) and max(q[1],p[1])<min(q[3],p[3])
protected=[(-46,-25,42,30),(0,22.5,485,46.5)]
for o in s.objects:
 if o.type!='MESH' or not(o.name.startswith(('Casa ','V2 frente urbano de contexto','V3 fondo residencial aproximado')) or o.get('fuente_huella')):continue
 ps=[o.matrix_world@Vector(v) for v in o.bound_box];a=min(p.x for p in ps);b=min(p.y for p in ps);c=max(p.x for p in ps);d=max(p.y for p in ps)
 if c-a<150 and d-b<150:protected.append((a-.28,b-.28,c+.28,d+.28))
def hip(x,y,w,d,h):
 rise=min(w,d)*.27
 if w>=d:
  ridge=[(x-w/2+d*.35,y,h+rise),(x+w/2-d*.35,y,h+rise)];faces=[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)]
 else:
  ridge=[(x,y-d/2+w*.35,h+rise),(x,y+d/2-w*.35,h+rise)];faces=[(0,1,4),(1,2,5,4),(2,3,5),(3,0,4,5)]
 mesh('V5 cubierta anexo con tejas',[(x-w/2-.15,y-d/2-.15,h),(x+w/2+.15,y-d/2-.15,h),(x+w/2+.15,y+d/2+.15,h),(x-w/2-.15,y+d/2+.15,h)]+ridge,faces,roofmat)
def wing(x,y,w,d,h,col):
 o=box('V5 anexo de manzana aproximado',(x,y,h/2),(w,d,h),col,.025);o['procedencia']='Volumen contextual de relleno; no propiedad medida del video'
 hip(x,y,w,d,h+.06)
 box('V5 zocalo de anexo',(x,y-d/2-.035,.38),(w,.09,.60),base,.009)
 for dx in [-w*.24,w*.24]:
  box('V5 marco abertura anexo',(x+dx,y-d/2-.055,1.9),(1.17,.15,2.55),ivory,.025)
  box('V5 abertura retraida anexo',(x+dx,y-d/2-.145,1.9),(.98,.045,2.32),wood if dx<0 else glass,.018)
candidates=[(x+random.uniform(-1,1),y+random.uniform(-1,1)) for x in range(-245,540,12) for y in range(-205,240,14)]
random.shuffle(candidates);added=0;courts=0
for x,y in candidates:
 if added>=285:break
 w=random.uniform(8.9,10.8);d=random.uniform(10.9,13.1);q=(x-w/2,y-d/2,x+w/2,y+d/2);rad=math.hypot(w,d)/2
 if any(inside(a,b) for a,b in [(q[0],q[1]),(q[0],q[3]),(q[2],q[1]),(q[2],q[3]),(x,y)]):continue
 if any(overlap(q,p) for p in protected):continue
 ds=[(dist(x,y,a,b),half) for a,b,half in roads]
 if not ds or min(t[0] for t in ds)>55 or any(dd<half+rad+1.7 for dd,half in ds):continue
 protected.append(q);h=random.uniform(3.8,5.3);col=random.choice(cols)
 mesh('V5 patio duro contextual',[(q[0],q[1],.016),(q[2],q[1],.016),(q[2],q[3],.016),(q[0],q[3],.016)],[(0,1,2,3)],patiomat)
 if added%3==0:
  wing(x,y-d/2+2.3,w,4.6,h,col);wing(x-w/2+2.0,y+2.3,4,d-4.6,h-.2,col);courts+=1
 else:wing(x,y,w,d,h,col)
 added+=1
# Place sparse yard trees only inside the newly formed courtyard properties.
stats=json.loads(s['realismo_v5']);stats['anexos_contextuales_aproximados']=added;stats['patios_adicionales']=courts
s['realismo_v5']=json.dumps(stats,ensure_ascii=False);json.dump(stats,open(B/'realismo_v5.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=48
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
bpy.ops.object.camera_add(location=(254,-80,105));cam=bpy.context.object;cam.rotation_euler=(Vector((75,32,4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=40;cam.data.clip_end=3000;s.camera=cam
s.render.resolution_x=1152;s.render.resolution_y=720;s.cycles.samples=24;s.render.filepath=str(B/'Previa_Correccion_Verde.png');bpy.ops.render.render(write_still=True)
print('MANZANAS_V5_LISTAS',stats,flush=True)

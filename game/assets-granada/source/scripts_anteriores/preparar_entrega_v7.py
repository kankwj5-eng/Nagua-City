from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
from io import BytesIO
from zipfile import ZipFile,ZIP_DEFLATED
import json
B=Path(__file__).parent;R=B.parent/'revision_v7';views=json.loads((B/'camaras_primera_persona.json').read_text());meta=json.loads((B/'ultima_pasada_v7.json').read_text())
assert len(views)==6 and all(v['version_modelo']==7 for v in views) and meta['remates_verificados']
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22);small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
def save(im,path):
 b=BytesIO();im.save(b,format='PNG');Image.open(BytesIO(b.getvalue())).verify();path.write_bytes(b.getvalue())
sheet=Image.new('RGB',(1560,1675),'#102331');d=ImageDraw.Draw(sheet)
for i,v in enumerate(views):
 p=B/v['archivo'];Image.open(p).verify();im=Image.open(p).convert('RGB');assert im.size==(1440,900);x=20+(i%2)*770;y=60+(i//2)*550;sheet.paste(ImageOps.contain(im,(750,469)),(x,y));d.text((x,y-38),str(i+1)+'. '+v['vista'],font=font,fill='white')
save(sheet,B/'Recorrido_Primera_Persona.png')
comp=Image.new('RGB',(1200,1120),'#102331');d=ImageDraw.Draw(comp)
for x,path,label in [(12,R/'detalle_09.png','VIDEO APORTADO'),(612,B/'Vista_Video_V7.png','MODELO - PASADA V7')]:
 im=ImageOps.contain(Image.open(path).convert('RGB'),(576,1024));comp.paste(im,(x,50));d.text((x,16),label,font=font,fill='white')
d.text((12,1088),'Encuadres aproximados. Persisten diferencias de arquitectura, vegetacion y contexto.',font=small,fill='#c4d9e2');save(comp,B/'Comparacion_con_video.png')
readme='''# Granada - pasada V7\n\nProyecto nativo Blender 4.2.3. El modelo entregado ya incluye todas las modificaciones. No volver a ejecutar los scripts de modificacion sobre el archivo V7: algunas etapas cambian geometria de forma acumulativa.\n\nSe revisaron los 312 cuadros del recorte 1000335491.mp4 mediante siete hojas de contacto y ampliaciones. Se corrigieron la union del techo con la cupula y el remate posterior; se dio profundidad a las aberturas posteriores; se rehizo el contorno y UV de las hojas; se rellenaron las copas de palmera; se conectaron las raices con la tierra; se anadieron aleros y tiradores; se completaron ocho faroles del tramo inicial, sus bases ajardinadas y franjas de cruce. Los cruces y algunas ubicaciones son aproximaciones visuales. Se limpiaron prototipos ocultos obsoletos y cornisas exactamente duplicadas.\n\nLos renders y la comparacion muestran el modelo real. No son retoques generativos ni fotos de la ciudad real. La reconstruccion mantiene diferencias con el video y zonas de contexto no medidas; no se certifica identidad fotografica.\n\n## Preparacion para integrar\n\nLa coleccion 28 COLISIONES RECORRIDO PRINCIPAL esta oculta y contiene 266 proxies simples. Colisiones_Granada.glb contiene exclusivamente esos proxies, con extras role, collision_shape y source_object. GLB no activa fisica automaticamente: el integrador debe crear cuerpos estaticos en el motor. El archivo no es la version visual del escenario.\n\nEl suelo del paseo se verifico por rayos en 479 puntos. Esa comprobacion no equivale a probar la caminata ni el rendimiento dentro del juego. El alcance y las coordenadas constan en Preparacion_Integracion.json.\n\nPendientes para una version de juego: conversion u horneado de materiales procedurales, LOD, particion por zonas y pruebas de memoria, FPS, colisiones e interaccion en el motor objetivo. No se ha exportado una version visual optimizada GLB/FBX ni se ha integrado en un repositorio de juego.\n\n## Scripts\n\nPara reproducir la revision sobre V6: ultima_pasada_v7.py, remates_y_colisiones_v7.py y render_v7.py, en ese orden, abriendo entre etapas el .blend guardado. Para regenerar solo fotos del archivo entregado, usar render_v7.py. Los shaders dependen de helpers de construir.py y texturas_v4.py, incluidos.\n'''
old=(B/'LEEME.md').read_text();(B/'LEEME.md').write_text(readme+'\n\n## Historial anterior\n'+old,encoding='utf-8')
(B/'LEEME_Recorrido.txt').write_text('Seis renders V7 de Granada, a 1.70 m de altura; 1440 x 900 px, Cycles 64 muestras y reduccion de ruido. Vista_Video_V7.png reproduce aproximadamente el encuadre del video. Las fotos muestran la reconstruccion 3D y conservan diferencias con la referencia.\n',encoding='utf-8')
photos=[v['archivo'] for v in views]+['Recorrido_Primera_Persona.png','Comparacion_con_video.png','Vista_Video_V7.png','camaras_primera_persona.json','LEEME_Recorrido.txt']
with ZipFile(B/'Fotos_Primera_Persona_Granada.zip','w',ZIP_DEFLATED) as z:
 for fn in photos:z.write(B/fn,fn)
source=['Granada_Video.blend','LEEME.md','ultima_pasada_v7.py','remates_y_colisiones_v7.py','render_v7.py','preparar_entrega_v7.py','ultima_pasada_v7.json','Preparacion_Integracion.json','Colisiones_Granada.glb','construir.py','texturas_v4.py','realismo_v6.py','granada_osm.xml','referencias.json','Plano_Granada.png','Plano_Granada.svg','Pavimento_del_video.png']
with ZipFile(B/'Granada_Reconstruccion_Video.zip','w',ZIP_DEFLATED,compresslevel=6) as z:
 for fn in source+photos:z.write(B/fn,fn)
 for p in sorted(B.glob('*.py')):
  if p.name not in source:z.write(p,'scripts_anteriores/'+p.name)
 for p in sorted(R.glob('contacto_*.jpg')):z.write(p,'revision_video/'+p.name)
 for p in sorted(R.glob('detalle_*.png')):z.write(p,'referencia_video/'+p.name)
for fn in ['Fotos_Primera_Persona_Granada.zip','Granada_Reconstruccion_Video.zip']:
 with ZipFile(B/fn) as z:assert z.testzip() is None
# Preserve the existing identities and exact versions retrieved at the start of this request.
def unwrap(obj):
 if 'results' in obj:return obj
 return unwrap(obj['structuredContent'])
latest={}
for fn in ['identidades_v7.json','identidades_extra_v7.json','identidad_comparacion_v7.json']:
 for r in unwrap(json.loads((B.parent/fn).read_text()))['results']:latest[r['name']]=r
names=['Granada_Video.blend','Granada_Reconstruccion_Video.zip']+[v['archivo'] for v in views]+['Recorrido_Primera_Persona.png','Fotos_Primera_Persona_Granada.zip','Comparacion_con_video.png'];u=[]
for fn in names:
 r=latest[fn];assert r['version_id'] is not None;u.append(dict(local_path=str((B/fn).resolve()),purpose='replace_library_file',library_file_id=r['library_file_id'],expected_current_version=int(r['version_id']),version_reason='V7: pasada contrastada con el recorte, cupula y posterior, hojas y palmeras, aleros, faroles, cruces y preparacion de colisiones'))
u.append(dict(local_path=str((B/'Colisiones_Granada.glb').resolve()),purpose='create_library_file',library_artifact_type='other'))
(B/'uploads_v7.json').write_text(json.dumps({'uploads':u},ensure_ascii=False));print('V7_ENTREGA_COMPROBADA',len(u),'archivos; modelo bytes',(B/'Granada_Video.blend').stat().st_size)

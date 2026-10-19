"""Contrato del ensamblador V4 sin carga de modelos o flota antiguos."""
import base64
import gzip
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("original_v4",ROOT/"scripts/build_original_city_v4.py")
v4=importlib.util.module_from_spec(spec)
spec.loader.exec_module(v4)


class OriginalCityV4Tests(unittest.TestCase):
    def test_separates_world_assets_and_excludes_old_fleet(self):
        sample={
            "world":{"materials":[{"name":"calle","color":[.4,.4,.4],"texture":0}],
                     "images":["iVBORw0KGgoAAA=="],
                     "zones":[{"id":"0,0","x":0,"z":0,"data":"H4sIGg=="}]},
            "extensions":{"materials":[{"id":0,"image":0,"color":[1,1,1]}],
                          "images":[{"data":"data:image/png;base64,iVBORw0KGgoAAA==","flipY":True}],
                          "zones":[{"id":"ext:0,0","x":0,"z":0,"data":"H4sIGg=="}]},
            "data":{"boxes":[[0,0,1,1]],"surfaces":[[0,0,0,1,0,0,0,0,1]],
                    "fleet":[{"name":"legacy motorcycle"}],"people":[{"name":"old NPC"}]}
        }
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"legacy.html"
            blocks=[]
            for name,raw in sample.items():
                if name=="data":data=json.dumps(raw).encode()
                else:data=gzip.compress(json.dumps(raw).encode(),mtime=0)
                blocks.append('<script id="asset-'+name+'">'+base64.b64encode(data).decode()+'</script>')
            path.write_text('<html>'+''.join(blocks)+'</html>')
            from_source=v4.source_assets(path)
            tags,stats,_=v4.scripts_from_catalogs(from_source)
            output=''.join(tags)
            self.assertEqual(stats['world']['zones'],1)
            self.assertEqual(stats['extensions']['images'],1)
            self.assertIn('city-zone-world-0',output)
            self.assertIn('city-zone-extensions-0',output)
            self.assertIn('city-image-extensions-0',output)
            self.assertNotIn('legacy motorcycle',output)
            self.assertNotIn('old NPC',output)
            self.assertNotIn('asset-vehicles',output)
            self.assertNotIn('asset-humans',output)
            self.assertEqual(json.loads(output.split('id="city-data">')[1].split('</script>')[0])['boxes'],[[0,0,1,1]])

    def test_rejects_missing_catalog(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"missing.html"
            path.write_text('<html></html>')
            with self.assertRaises(ValueError):
                v4.source_assets(path)

if __name__=="__main__":unittest.main()

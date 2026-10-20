"""Pruebas de limpieza reversible de medios, con ciudad intacta."""
import hashlib,importlib.util,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("clean_legacy_media",ROOT/"scripts/clean_legacy_media.py")
cleaner=importlib.util.module_from_spec(spec)
spec.loader.exec_module(cleaner)
def tag(identifier,payload="hello",external=False):
    attrs=f' data-src="./assets/stream/{payload}.gz"' if external else ""
    body="" if external else payload
    return f'<script type="application/octet-stream" id="{identifier}"{attrs}>{body}</script>'.encode()
class CleanLegacyMedia(unittest.TestCase):
    def fixture(self):
        return b"<!doctype html>"+b"".join([
            tag("asset-babylon","RENDERER"),tag("zone48-world-1","MAP"),
            tag("catalog48-world","MAP_META"),tag("asset-humans","OLD_HUMANS"),
            tag("pack48-humans","OLD_META"),tag("resource48-humans-0","OLD_GLBS",True),
            tag("resource48-humans-1","OLD_TEXTURE"),
            tag("asset-animation38","OLD_WALK"),tag("asset-actor-motion","OLD_MOTION"),
            tag("asset-vehicles","OLD_CARS_MOTOS"),tag("asset-surfaces","GROUND"),
            tag("asset-materials42","SCENE")
        ])
    def test_deletes_old_human_vehicle_media_only(self):
        source=self.fixture();result,report=cleaner.clean_bytes(source)
        for value in (b"OLD_HUMANS",b"OLD_META",b"OLD_GLBS",b"OLD_TEXTURE",
                      b"OLD_WALK",b"OLD_MOTION",b"OLD_CARS_MOTOS"):
            self.assertNotIn(value,result)
        for value in (b"RENDERER",b"MAP_META",b"MAP",b"GROUND",b"SCENE"):
            self.assertIn(value,result)
        self.assertEqual(len(report["removed"]),7)
        self.assertEqual(report["removedBytes"],len(source)-len(result))
        self.assertEqual(cleaner.clean_bytes(result,strict=False)[0],result)
    def test_original_not_modified_and_no_overwrites(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);src=p/"original.html";out=p/"staged.html"
            src.write_bytes(self.fixture());checksum=hashlib.sha256(src.read_bytes()).hexdigest()
            cleaner.clean_file(src,out)
            self.assertEqual(checksum,hashlib.sha256(src.read_bytes()).hexdigest())
            self.assertTrue((p/"staged.html.clean-report.json").is_file())
            with self.assertRaises(FileExistsError):cleaner.clean_file(src,out)
            with self.assertRaises(ValueError):cleaner.clean_file(src,src)
            with self.assertRaises(ValueError):cleaner.clean_bytes(tag("asset-humans"))
            with self.assertRaises(ValueError):cleaner.clean_bytes(tag("asset-vehicles"))
    def test_street_vehicle_data_remains_untouched(self):
        source=self.fixture()+tag("zone48-world-vehicles-and-buildings","KEEP_STREET")
        result,_=cleaner.clean_bytes(source)
        self.assertIn(b"KEEP_STREET",result)
        self.assertNotIn(b"OLD_CARS_MOTOS",result)
if __name__=="__main__":unittest.main()

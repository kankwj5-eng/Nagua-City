"""Checks for the hosted fast-start asset packager without Git LFS."""
import base64
import gzip
import hashlib
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_fast_web import split_web_game


class TestFastWeb(unittest.TestCase):
    @staticmethod
    def fixture() -> bytes:
        scripts = []
        for idx in range(36):
            compressed = gzip.compress(("barrio " + str(idx)).encode(), mtime=0)
            value = base64.b64encode(compressed).decode("ascii")
            scripts.append(f'<script type="application/octet-stream" id="zone48-world-{idx}">{value}</script>')
        png = bytes((137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0))
        image = base64.b64encode(png).decode("ascii")
        for idx in range(35):
            scripts.append(f'<script type="application/octet-stream" id="image48-world-{idx}">{image}</script>')
        for idx in range(35):
            glb = b"glTF" + (2).to_bytes(4, "little") + (12).to_bytes(4, "little")
            encoded = (base64.b64encode(bytes((255,216,255,217))).decode() if idx == 1 else
                       base64.b64encode(glb).decode() if idx == 2 else "QUJDREVGRw==" * 300)
            scripts.append(f'<script type="application/octet-stream" id="resource48-humans-{idx}">{encoded}</script>')
        return ("<!doctype html><body>" + "".join(scripts) + "</body>").encode()

    def test_exports_only_selected_data_without_changing_source(self):
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            original = folder / "portable.html"
            original.write_bytes(self.fixture())
            portable_hash = hashlib.sha256(original.read_bytes()).hexdigest()
            website = folder / "Managua.html"
            website.write_bytes(original.read_bytes())
            data = folder / "assets" / "stream"
            report = split_web_game(website, data)
            html = website.read_text()
            self.assertEqual(report["resources"], 106)
            self.assertEqual(report["byType"], {"zone48": 36, "image48": 35, "resource48": 35})
            self.assertEqual(len(list(data.iterdir())), 106)
            self.assertTrue(report["fastHtmlBytes"] < report["originalHtmlBytes"] * .85)
            self.assertIn('data-format="gzip"', html)
            self.assertIn('data-format="image"', html)
            self.assertIn('data-format="text"', html)
            self.assertNotIn('QUJDREVGRw==', html)
            self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(), portable_hash)
            zone = next(data.glob("zone48-world-0-*.gz"))
            self.assertEqual(gzip.decompress(zone.read_bytes()), b"barrio 0")
            resource = next(data.glob("resource48-humans-0-*.txt"))
            self.assertEqual(resource.read_text(), "QUJDREVGRw==" * 300)
            self.assertEqual(next(data.glob("resource48-humans-1-*.jpg")).read_bytes(), bytes((255,216,255,217)))
            self.assertEqual(report["resourcePacks"]["humans"]["image"], 1)
            self.assertEqual(gzip.decompress(next(data.glob("resource48-humans-2-*.gz")).read_bytes()), b"glTF" + (2).to_bytes(4, "little") + (12).to_bytes(4, "little"))
            self.assertEqual(report["resourcePacks"]["humans"]["glb-gzip"], 1)
            image = next(data.glob("image48-world-0-*.png"))
            self.assertEqual(image.read_bytes()[:8], bytes((137, 80, 78, 71, 13, 10, 26, 10)))

    def test_streams_all_16_v4_models_as_versioned_gzip(self):
        """La PWA no debe incorporar 16 cadenas base64 enormes al HTML móvil."""
        from build_fast_web import V4_EXPECTED
        glb = (
            b"glTF" + (2).to_bytes(4, "little") +
            (20).to_bytes(4, "little") + (0).to_bytes(4, "little") +
            b"JSON"
        )
        packed = gzip.compress(glb, mtime=0)
        tags = b"".join(
            f'<script type="application/octet-stream" id="v4-original-{key}">'.encode()
            + base64.b64encode(packed) + b"</script>"
            for key in sorted(V4_EXPECTED)
        )
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            portable = root / "portable.html"
            portable.write_bytes(self.fixture().replace(b"</body>", tags + b"</body>"))
            portable_hash = hashlib.sha256(portable.read_bytes()).hexdigest()
            web = root / "Managua.html"
            web.write_bytes(portable.read_bytes())
            assets = root / "assets"
            result = split_web_game(web, assets)
            html = web.read_text()
            self.assertEqual(result["v4ModelsExternalized"], 16)
            self.assertEqual(result["v4CompressedBytes"], len(packed) * 16)
            self.assertEqual(len(list(assets.glob("v4-original-*.glb.gz"))), 16)
            for key in V4_EXPECTED:
                self.assertIn(f'id="v4-original-{key}" data-src="./assets/stream/', html)
                self.assertIn(f'v4-original-{key}-', html)
                self.assertEqual(gzip.decompress(next(assets.glob(f"v4-original-{key}-*.glb.gz")).read_bytes()), glb)
            self.assertNotIn(base64.b64encode(packed).decode(), html)
            self.assertEqual(hashlib.sha256(portable.read_bytes()).hexdigest(), portable_hash)

    def test_rejects_incomplete_v4_catalog(self):
        glb=b"glTF"+(2).to_bytes(4,"little")+(20).to_bytes(4,"little")+(0).to_bytes(4,"little")+b"JSON"
        tag=(b'<script type="application/octet-stream" id="v4-original-hilux">'
             +base64.b64encode(gzip.compress(glb,mtime=0))+b"</script>")
        with tempfile.TemporaryDirectory() as folder:
            html=Path(folder)/"Managua.html"
            html.write_bytes(self.fixture().replace(b"</body>",tag+b"</body>"))
            with self.assertRaisesRegex(ValueError,"Catálogo V4 incompleto"):
                split_web_game(html,Path(folder)/"assets")

    def test_refuses_missing_blocks_and_invalid_gzip(self):
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            html = folder / "broken.html"
            html.write_text('<html>Missing resource blocks</html>')
            with self.assertRaisesRegex(ValueError, "incomplete catalog"):
                split_web_game(html, folder / "assets")
            text = self.fixture().decode()
            text = text.replace(base64.b64encode(gzip.compress(b"barrio 0", mtime=0)).decode(), "bm90IGd6aXA=", 1)
            html.write_text(text)
            with self.assertRaisesRegex(ValueError, "not gzipped"):
                split_web_game(html, folder / "assets")


if __name__ == "__main__":
    unittest.main()

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
            encoded = base64.b64encode(bytes((255,216,255,217))).decode() if idx == 1 else "QUJDREVGRw==" * 300
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
            image = next(data.glob("image48-world-0-*.png"))
            self.assertEqual(image.read_bytes()[:8], bytes((137, 80, 78, 71, 13, 10, 26, 10)))

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

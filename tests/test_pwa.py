"""Pruebas PWA independientes del HTML Git LFS de 184 MB."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_pwa import build


class TestPWA(unittest.TestCase):
    def test_build_creates_valid_installable_site_without_altering_game(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            game = root / "Managua.html"
            contents = b"<!doctype html><html><head></head><body>Juego real</body></html>"
            game.write_bytes(contents)
            destination = root / "site"
            result = build(game, destination, stream_web=False)
            self.assertEqual((destination / "Managua.html").read_bytes(), contents)
            self.assertEqual(game.read_bytes(), contents)
            self.assertFalse(result["offlineGame"])
            self.assertTrue(result["offlineShell"])
            manifest = json.loads((destination / "manifest.webmanifest").read_text())
            self.assertEqual(manifest["start_url"], "./")
            self.assertEqual(manifest["scope"], "./")
            self.assertEqual(manifest["display"], "standalone")
            self.assertEqual(manifest["lang"], "es")
            self.assertEqual([i["sizes"] for i in manifest["icons"]], ["192x192", "512x512"])
            from PIL import Image
            for entry in manifest["icons"]:
                path = destination / entry["src"]
                with Image.open(path) as picture:
                    self.assertEqual(picture.size, (int(entry["sizes"].split("x")[0]),) * 2)
                    self.assertEqual(picture.format, "PNG")
            launcher = (destination / "index.html").read_text()
            self.assertIn('href="./Managua.html"', launcher)
            self.assertIn('rel="manifest"', launcher)
            self.assertIn('id="install"', launcher)
            sw = (destination / "sw.js").read_text()
            self.assertNotIn('"./Managua.html",', sw)
            self.assertIn('url.pathname === scope.pathname + "Managua.html"', sw)
            self.assertTrue((destination / ".nojekyll").exists())

    def test_rejects_lfs_pointer_instead_of_publishing_empty_game(self):
        with tempfile.TemporaryDirectory() as tmp:
            game = Path(tmp) / "game.html"
            game.write_text("version https://git-lfs.github.com/spec/v1\noid sha256:123")
            with self.assertRaisesRegex(ValueError, "puntero Git LFS"):
                build(game, Path(tmp) / "site")


if __name__ == "__main__":
    unittest.main()

"use strict";
/* Pruebas de interacción sin navegador ni dependencias externas. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "web/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "web/app.js"), "utf8");
for (const id of ["guide-trigger", "guide", "guide-tab-explorar",
  "guide-tab-conducir", "guide-tab-ajustes", "guide-content",
  "guide-step", "guide-title", "guide-description", "connection-state"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "falta " + id);
}
assert.match(html, /href="\.\/Managua\.html"/, "no perder el enlace al juego");
assert.match(html, /managua-menu-reference\.jpg/, "conservar arte original");
assert.match(html, /role="tablist"/);
assert.match(html, /aria-expanded="false"/);

function element(id) {
  const listeners = new Map();
  const attributes = new Map();
  return {
    id,
    dataset: {},
    hidden: false,
    textContent: "",
    tabIndex: -1,
    focus() { focused = this; },
    setAttribute(key, value) { attributes.set(key, value); },
    getAttribute(key) { return attributes.get(key) || null; },
    addEventListener(name, listener) { listeners.set(name, listener); },
    emit(name, event) { const fn = listeners.get(name); assert.ok(fn, id + " sin listener " + name); return fn(event); },
    querySelectorAll() { return []; },
    showModal() { this.hidden = false; },
    close() { this.hidden = true; },
  };
}
let focused = null;
const ids = [
  "install", "install-state", "instructions", "close-instructions", "ok-instructions",
  "guide-trigger", "guide", "guide-tab-explorar", "guide-tab-conducir", "guide-tab-ajustes",
  "guide-content", "guide-step", "guide-title", "guide-description", "connection-state"
];
const nodes = Object.fromEntries(ids.map(id => [id, element(id)]));
const tabs = ["explorar", "conducir", "ajustes"].map((name, i) => {
  const tab = nodes["guide-tab-" + name];
  tab.dataset.guide = name;
  tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
  tab.tabIndex = i === 0 ? 0 : -1;
  return tab;
});
nodes.guide.hidden = true;
nodes.guide.querySelectorAll = () => tabs;
const events = new Map();
const navigator = { onLine: true, standalone: false };
const window = {
  navigator,
  matchMedia: () => ({matches: false}),
  addEventListener(name, listener) { events.set(name, listener); }
};
const document = {getElementById(id) { assert.ok(nodes[id], id); return nodes[id]; }};
vm.runInNewContext(js, {window, navigator, document}, {timeout: 2000, filename: "web/app.js"});
assert.match(nodes["connection-state"].textContent, /Conexión detectada/);
assert.equal(nodes["connection-state"].dataset.connected, "true");

nodes["guide-trigger"].emit("click");
assert.equal(nodes.guide.hidden, false);
assert.equal(nodes["guide-trigger"].getAttribute("aria-expanded"), "true");
assert.equal(focused, tabs[0]);
tabs[1].emit("click");
assert.equal(tabs[1].getAttribute("aria-selected"), "true");
assert.equal(tabs[0].tabIndex, -1);
assert.equal(nodes["guide-content"].getAttribute("aria-labelledby"), tabs[1].id);
assert.match(nodes["guide-description"].textContent, /Elegir vehículo/);

let prevented = false;
tabs[1].emit("keydown", {key: "ArrowRight", preventDefault() {prevented = true;}});
assert.equal(prevented, true);
assert.equal(focused, tabs[2]);
assert.equal(tabs[2].tabIndex, 0);
assert.match(nodes["guide-description"].textContent, /Wi-Fi/);
tabs[2].emit("keydown", {key: "Home", preventDefault() {}});
assert.equal(focused, tabs[0]);
assert.equal(tabs[0].getAttribute("aria-selected"), "true");

navigator.onLine = false;
events.get("offline")();
assert.equal(nodes["connection-state"].dataset.connected, "false");
assert.match(nodes["connection-state"].textContent, /no hay conexión/);
navigator.onLine = true;
events.get("online")();
assert.equal(nodes["connection-state"].dataset.connected, "true");

nodes["guide-trigger"].emit("click");
assert.equal(nodes.guide.hidden, true);
assert.equal(nodes["guide-trigger"].getAttribute("aria-expanded"), "false");
assert.equal(focused, nodes["guide-trigger"]);
console.log("OK: PWA, guía, teclado, accesibilidad y estado de conexión");

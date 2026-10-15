"use strict";
(() => {
  const install = document.getElementById("install");
  const state = document.getElementById("install-state");
  const instructions = document.getElementById("instructions");
  let deferredPrompt = null;
  const installed = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const announce = text => { state.textContent = text; };
  if (installed()) {
    install.hidden = true;
    announce("Ya estás usando Nagua City como aplicación.");
  }
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (!installed()) announce("¡Listo para instalar! Toca «Instalar app» para añadir Nagua City a tu celular.");
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    install.hidden = true;
    announce("Nagua City se instaló. Puedes abrirlo desde la pantalla de inicio.");
  });
  install.addEventListener("click", async () => {
    if (!deferredPrompt) {
      if (typeof instructions.showModal === "function") instructions.showModal();
      else announce("Abre el menú del navegador y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».");
      return;
    }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      announce(choice?.outcome === "accepted" ? "Instalación solicitada. Sigue las instrucciones de tu navegador." : "Puedes instalar Nagua City cuando quieras.");
    } catch {
      announce("Abre el menú del navegador y elige «Instalar aplicación».");
    }
  });
  document.getElementById("close-instructions").addEventListener("click", () => instructions.close());
  document.getElementById("ok-instructions").addEventListener("click", () => instructions.close());
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", {scope: "./"}).catch(() => {
        announce("Puedes jugar con conexión. La instalación requiere HTTPS y un navegador compatible.");
      });
    });
  }
})();

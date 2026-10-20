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
}
  // Guía interactiva de la portada: no modifica ni simula el estado del motor 3D.
  const guideTrigger = document.getElementById("guide-trigger");
  const guide = document.getElementById("guide");
  const guideTabs = Array.from(guide.querySelectorAll('[role="tab"]'));
  const guidePanel = document.getElementById("guide-content");
  const guideStep = document.getElementById("guide-step");
  const guideTitle = document.getElementById("guide-title");
  const guideDescription = document.getElementById("guide-description");
  const guideContent = {
    explorar: {
      step: "01 / RECORRIDO LIBRE",
      title: "Conoce la ciudad",
      description: "Toca «Entrar al juego» y, en su menú principal, elige «Entrar a la ciudad» para recorrer Managua libremente."
    },
    conducir: {
      step: "02 / VEHÍCULOS",
      title: "Elige tu forma de conducir",
      description: "En el menú del juego, abre «Elegir vehículo» para explorar los automóviles y motocicletas disponibles antes de conducir."
    },
    ajustes: {
      step: "03 / CONFIGURACIÓN",
      title: "Prepara tu celular",
      description: "Dentro del juego abre «Ajustes» para revisar imagen, sonido y controles. Usa la pantalla en horizontal y, para la primera carga, una conexión Wi-Fi."
    }
  };
  const selectGuideTab = tab => {
    const entry = guideContent[tab.dataset.guide];
    if (!entry) return;
    for (const item of guideTabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    }
    guidePanel.setAttribute("aria-labelledby", tab.id);
    guideStep.textContent = entry.step;
    guideTitle.textContent = entry.title;
    guideDescription.textContent = entry.description;
  };
  guideTrigger.addEventListener("click", () => {
    guide.hidden = !guide.hidden;
    guideTrigger.setAttribute("aria-expanded", String(!guide.hidden));
    if (guide.hidden) guideTrigger.focus();
    else guideTabs.find(tab => tab.getAttribute("aria-selected") === "true").focus();
  });
  guideTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectGuideTab(tab));
    tab.addEventListener("keydown", event => {
      const key = event.key;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
      event.preventDefault();
      const next = key === "Home" ? 0 : key === "End" ? guideTabs.length - 1
        : (index + (key === "ArrowRight" ? 1 : guideTabs.length - 1)) % guideTabs.length;
      selectGuideTab(guideTabs[next]);
      guideTabs[next].focus();
    });
  });
  const connectionState = document.getElementById("connection-state");
  const updateConnectionState = () => {
    const connected = navigator.onLine !== false;
    connectionState.dataset.connected = connected ? "true" : "false";
    connectionState.textContent = connected
      ? "● Conexión detectada por el navegador. La primera carga del juego puede consumir bastantes datos."
      : "● El navegador indica que no hay conexión. Necesitarás internet para abrir la ciudad.";
  };
  window.addEventListener("online", updateConnectionState);
  window.addEventListener("offline", updateConnectionState);
  updateConnectionState();
})();

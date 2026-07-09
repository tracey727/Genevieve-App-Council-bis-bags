(() => {
  const DEFAULT = {
    cartridges: [
      { id: "dog", name: "Dog Waste Bags", icon: "🐶", count: 38, max: 50, active: true },
      { id: "compost", name: "Compostable Bags", icon: "🍃", count: 18, max: 50, active: false },
      { id: "wipes", name: "Sanitiser Wipes", icon: "✋", count: 0, max: 50, active: false }
    ],
    quantity: 1,
    dispenseCount: 1247,
    binFill: 62,
    colour: "forest",
    logItems: [
      ["10:24:31", "✅", "Dispensed 1 x Dog Waste Bag", "SUCCESS"],
      ["10:24:28", "✅", "Take event detected", "SUCCESS"],
      ["10:24:27", "✅", "Motor index — Dog Waste Bags", "SUCCESS"],
      ["10:24:26", "⚙️", "Dispense cycle started", "INFO"],
      ["10:24:10", "📶", "Telemetry data transmitted", "SUCCESS"]
    ]
  };

  const state = JSON.parse(JSON.stringify(DEFAULT));

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("genevieve_parkpost_state"));
      if (!saved) return;
      if (Array.isArray(saved.cartridges)) saved.cartridges.forEach((c, i) => Object.assign(state.cartridges[i], c));
      if (Number.isFinite(saved.quantity)) state.quantity = saved.quantity;
      if (Number.isFinite(saved.dispenseCount)) state.dispenseCount = saved.dispenseCount;
      if (Number.isFinite(saved.binFill)) state.binFill = saved.binFill;
      if (typeof saved.colour === "string") state.colour = saved.colour;
      if (Array.isArray(saved.logItems)) state.logItems = saved.logItems;
    } catch (error) {
      console.warn("State load failed", error);
    }
  }

  function saveState() {
    localStorage.setItem("genevieve_parkpost_state", JSON.stringify(state));
  }

  function $(id) {
    return document.getElementById(id);
  }

  function nowTime() {
    return new Date().toLocaleTimeString("en-AU", { hour12: false });
  }

  function activeCart() {
    return state.cartridges.find(c => c.active) || state.cartridges[0];
  }

  function addLog(message, status = "SUCCESS", icon = "✅") {
    state.logItems.unshift([nowTime(), icon, message, status]);
    state.logItems = state.logItems.slice(0, 30);
    render();
  }

  function renderCartridges() {
    $("cartridgeList").innerHTML = state.cartridges.map(c => {
      const pct = Math.round((c.count / c.max) * 100);
      const cls = c.count === 0 ? "spent" : c.active ? "active" : c.id === "compost" ? "yellow" : "";
      return `<article class="cartItem ${cls}" data-cart="${c.id}">
        <div class="cartIcon">${c.icon}</div>
        <div>
          <span class="badge">${c.count === 0 ? "SPENT" : c.active ? "ACTIVE" : "READY"}</span>
          <h3>${c.name}</h3>
          <b class="count">${c.count}</b> <small>${c.id === "wipes" ? "wipes" : "bags"} remaining</small>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <small>${pct}%</small>
        </div>
      </article>`;
    }).join("");
  }

  function setStatus(level, title, message) {
    const card = $("statusCard");
    card.className = `statusCard ${level}`;
    $("statusIcon").textContent = level === "red" ? "!" : "✓";
    $("statusTitle").textContent = title;
    $("statusMessage").textContent = message;
    $("mechanismStatus").textContent = level === "red" ? "⚠ Attention" : level === "amber" ? "⚠ Low Stock" : "✅ Ready";
    $("machineFooter").className = `statusLine ${level}`;
  }

  function renderStatus() {
    const c = activeCart();
    if (state.binFill >= 90) setStatus("red", "Bin nearly full", "Service collection bin soon");
    else if (c.count === 0) setStatus("red", "Cartridge spent", "Replace or switch cartridge");
    else if (c.count < 10) setStatus("amber", "Low stock", "Refill cartridge soon");
    else setStatus("green", "Ready to dispense", "Select quantity and press dispense");
  }

  function renderMetrics() {
    $("qtyValue").textContent = state.quantity;
    $("qtyWord").textContent = state.quantity === 1 ? "Bag" : "Bags";
    $("binFill").textContent = `${state.binFill}%`;
    $("fillRing").style.setProperty("--pct", state.binFill);
    $("fillLabel").textContent = state.binFill >= 90 ? "Service now" : state.binFill >= 75 ? "Service soon" : "Normal";
    $("dispenseCount").textContent = state.dispenseCount;
    $("dispenseRing").style.setProperty("--pct", Math.min(100, state.dispenseCount % 100));
  }

  function renderLog() {
    $("systemLog").innerHTML = state.logItems.map(row => {
      const cls = row[3] === "SUCCESS" ? "success" : row[3] === "WARNING" ? "warn" : row[3] === "ERROR" ? "error" : "info";
      return `<div class="logRow"><span>${row[0]}</span><span>${row[1]}</span><span>${row[2]}</span><span class="${cls}">${row[3]}</span></div>`;
    }).join("");
  }

  function applyColour() {
    document.querySelectorAll("[data-colour]").forEach(btn => btn.classList.toggle("active", btn.dataset.colour === state.colour));
    const shell = state.colour === "sandstone" ? "#b7a487" : state.colour === "charcoal" ? "#242828" : "#0d4f2b";
    const door = state.colour === "sandstone" ? "#75654d" : state.colour === "charcoal" ? "#303636" : "#0b7034";
    document.querySelector(".machineBox").style.background = `linear-gradient(145deg, ${shell}, #0d100e)`;
    document.querySelector(".collectionBin").style.background = `linear-gradient(135deg, ${door}, #084923)`;
  }

  function render() {
    renderCartridges();
    renderMetrics();
    renderLog();
    renderStatus();
    applyColour();
    saveState();
  }

  function animateDispense() {
    $("bagFeed").classList.add("dispensing");
    document.querySelectorAll(".roller").forEach(r => r.classList.add("spin"));
    setTimeout(() => {
      $("bagFeed").classList.remove("dispensing");
      document.querySelectorAll(".roller").forEach(r => r.classList.remove("spin"));
    }, 700);
  }

  function dispense() {
    const c = activeCart();
    if (c.count <= 0) {
      addLog(`Dispense failed — ${c.name} spent`, "ERROR", "⚠️");
      setStatus("red", "Cannot dispense", "Selected cartridge is spent");
      $("lastAction").textContent = `Cannot dispense: ${c.name} is spent.`;
      return;
    }

    const amount = Math.min(state.quantity, c.count);
    c.count -= amount;
    state.dispenseCount += amount;
    state.binFill = Math.min(100, state.binFill + amount);
    $("lastAction").textContent = `Dispensed ${amount} x ${c.name}.`;
    animateDispense();
    addLog(`Dispensed ${amount} x ${c.name}`, "SUCCESS", "✅");
    addLog(`Motor index — ${c.name}`, "SUCCESS", "⚙️");
  }

  function resetAll() {
    localStorage.removeItem("genevieve_parkpost_state");
    Object.assign(state, JSON.parse(JSON.stringify(DEFAULT)));
    $("lastAction").textContent = "System reset. Demo state restored.";
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    render();

    document.body.addEventListener("click", event => {
      const cart = event.target.closest("[data-cart]");
      if (cart) {
        state.cartridges.forEach(c => c.active = c.id === cart.dataset.cart);
        $("lastAction").textContent = `Selected ${activeCart().name}.`;
        addLog(`Selected cartridge — ${activeCart().name}`, "INFO", "⚙️");
      }

      const colour = event.target.closest("[data-colour]");
      if (colour) {
        state.colour = colour.dataset.colour;
        $("lastAction").textContent = `Colour changed to ${colour.textContent.trim()}.`;
        addLog(`Colour option selected — ${colour.textContent.trim()}`, "INFO", "🎨");
      }
    });

    $("minusQty").addEventListener("click", () => {
      state.quantity = Math.max(1, state.quantity - 1);
      $("lastAction").textContent = `Quantity set to ${state.quantity}.`;
      addLog(`Quantity changed to ${state.quantity}`, "INFO", "−");
    });

    $("plusQty").addEventListener("click", () => {
      state.quantity = Math.min(5, state.quantity + 1);
      $("lastAction").textContent = `Quantity set to ${state.quantity}.`;
      addLog(`Quantity changed to ${state.quantity}`, "INFO", "+");
    });

    $("dispenseBtn").addEventListener("click", dispense);

    $("takeBtn").addEventListener("click", () => {
      $("lastAction").textContent = "Take event detected.";
      addLog("Take event detected", "SUCCESS", "✅");
    });

    $("resetBtn").addEventListener("click", resetAll);

    $("manageCartridges").addEventListener("click", () => {
      state.cartridges.forEach(c => c.count = c.max);
      $("lastAction").textContent = "All cartridges refilled.";
      addLog("All cartridges refilled", "SUCCESS", "✅");
    });

    $("clearLogBtn").addEventListener("click", () => {
      state.logItems = [[nowTime(), "🧹", "System log cleared", "INFO"]];
      render();
    });

    setInterval(() => {
      $("tempValue").textContent = `${(22 + Math.random() * 4).toFixed(1)}°C`;
      $("batteryValue").textContent = `${Math.max(80, Math.round(96 - Math.random() * 8))}%`;
    }, 5000);
  });
})();

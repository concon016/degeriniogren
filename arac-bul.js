// Değerini Öğren — Araç Bul: sahibinden tarzı kademeli akış (kategori > marka > model > detay)

(function () {
  var DATA_URL = "assets/data/araclar.json";

  var finderEl = document.getElementById("finder");
  var sidebarEl = document.getElementById("finderSidebar");
  var breadcrumbEl = document.getElementById("finderBreadcrumb");
  var filtersEl = document.getElementById("finderFilters");
  var stageEl = document.getElementById("finderStage");

  var CATEGORIES = [
    { id: "otomobil", label: "Otomobil" },
    { id: "arazi-suv-pickup", label: "Arazi, SUV & Pickup" },
    { id: "elektrikli", label: "Elektrikli Araçlar" },
    { id: "motosiklet", label: "Motosiklet" },
    { id: "minivan-panelvan", label: "Minivan & Panelvan" },
    { id: "ticari", label: "Ticari Araçlar" }
  ];

  var GOVDE_MAP = {
    "Sedan": "otomobil", "Hatchback": "otomobil", "Crossover": "otomobil", "Coupe": "otomobil",
    "Sedan / Hatchback": "otomobil", "Hatchback / Sedan": "otomobil", "Şehir Aracı": "otomobil",
    "Sedan / Hatchback / SW": "otomobil", "Sedan / SW": "otomobil", "Sedan / Coupe": "otomobil",
    "Coupe / Sedan": "otomobil", "Sedan / Station": "otomobil", "Hatchback / SW": "otomobil",
    "SUV": "arazi-suv-pickup", "Arazi SUV": "arazi-suv-pickup", "Pickup": "arazi-suv-pickup",
    "Panelvan / Combi": "minivan-panelvan", "Panelvan / Minivan": "minivan-panelvan",
    "Panelvan / Kamyonet": "minivan-panelvan", "Panelvan / Minibüs": "minivan-panelvan",
    "Panelvan": "minivan-panelvan", "MPV": "minivan-panelvan", "Kompakt MPV": "minivan-panelvan",
    "Minivan": "minivan-panelvan", "MPV / Minivan": "minivan-panelvan",
    "Traktör": "ticari", "Çekici (Tır)": "ticari", "Kamyon": "ticari",
    "Ekskavatör (Paletli Kepçe)": "ticari", "ATV / UTV": "ticari", "ATV": "ticari",
    "Kazıcı Yükleyici (Beko Loder)": "ticari"
  };

  function categoryOf(car) {
    if (/Elektrik/i.test(car.yakit) && car.yakit.indexOf("/") === -1) return "elektrikli";
    if (/Motosiklet/i.test(car.govde)) return "motosiklet";
    return GOVDE_MAP[car.govde] || "otomobil";
  }

  var state = { data: [], stage: "kategori", kategori: null, marka: null, model: null, budget: null, segment: null };

  function esc(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function matchesExtra(car) {
    if (state.budget) {
      if (car.fiyatAraligi.max < state.budget[0] || car.fiyatAraligi.min > state.budget[1]) return false;
    }
    if (state.segment && car.segment !== state.segment) return false;
    return true;
  }

  function baseFiltered() {
    return state.data.filter(function (d) {
      return (!state.kategori || categoryOf(d) === state.kategori) && matchesExtra(d);
    });
  }

  function setHash() {
    var parts = [];
    if (state.kategori) parts.push("k=" + state.kategori);
    if (state.marka) parts.push("m=" + encodeURIComponent(state.marka));
    if (state.model) parts.push("mo=" + encodeURIComponent(state.model));
    if (state.budget) parts.push("b=" + state.budget[0] + "-" + state.budget[1]);
    if (state.segment) parts.push("s=" + encodeURIComponent(state.segment));
    var next = parts.length ? "#" + parts.join("&") : location.pathname;
    if (next !== location.hash && !(next === location.pathname && !location.hash)) {
      history.pushState(null, "", next);
    }
  }

  function readHash() {
    var h = location.hash.replace(/^#/, "");
    var out = {};
    h.split("&").forEach(function (p) {
      var idx = p.indexOf("=");
      if (idx === -1) return;
      var key = p.slice(0, idx), val = p.slice(idx + 1);
      if (key === "k") out.kategori = val;
      if (key === "m") out.marka = decodeURIComponent(val);
      if (key === "mo") out.model = decodeURIComponent(val);
      if (key === "b") out.budget = val.split("-").map(Number);
      if (key === "s") out.segment = decodeURIComponent(val);
    });
    return out;
  }

  function stageFor(h) {
    if (h.model) return "detay";
    if (h.marka) return "model";
    if (h.kategori || h.budget || h.segment) return "marka";
    return "kategori";
  }

  function goto(stage, patch) {
    state.stage = stage;
    if (patch) {
      Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    }
    setHash();
    render();
    var top = finderEl.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  function renderSidebar() {
    sidebarEl.innerHTML = CATEGORIES.map(function (c) {
      var count = state.data.filter(function (d) { return categoryOf(d) === c.id && matchesExtra(d); }).length;
      var active = state.kategori === c.id ? " active" : "";
      return '<button type="button" class="finder-cat-btn' + active + '" data-kategori="' + c.id + '">' +
        "<span>" + c.label + "</span><span class=\"finder-cat-count\">" + count + "</span></button>";
    }).join("");
    sidebarEl.querySelectorAll("[data-kategori]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goto("marka", { kategori: btn.dataset.kategori, marka: null, model: null });
      });
    });
  }

  function renderFilters() {
    var chips = [];
    if (state.budget) {
      chips.push({ label: fmtTL(state.budget[0]) + " – " + fmtTL(state.budget[1]), clear: "budget" });
    }
    if (state.segment) {
      chips.push({ label: state.segment, clear: "segment" });
    }
    if (!chips.length) { filtersEl.innerHTML = ""; return; }
    filtersEl.innerHTML = chips.map(function (c) {
      return '<span class="finder-filter-chip">' + c.label + '<button type="button" data-clear="' + c.clear + '" aria-label="Filtreyi kaldır">×</button></span>';
    }).join("");
    filtersEl.querySelectorAll("[data-clear]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var patch = {};
        patch[btn.dataset.clear] = null;
        goto(state.stage, patch);
      });
    });
  }

  function renderBreadcrumb() {
    var parts = ['<button type="button" data-go="kategori">Vasıta</button>'];
    var catLabel = state.kategori ? CATEGORIES.filter(function (c) { return c.id === state.kategori; })[0].label : (state.stage !== "kategori" ? "Tüm Kategoriler" : null);
    if (catLabel) parts.push('<span class="sep">›</span><button type="button" data-go="marka">' + catLabel + "</button>");
    if (state.marka) parts.push('<span class="sep">›</span><button type="button" data-go="model">' + state.marka + "</button>");
    if (state.model) parts.push('<span class="sep">›</span><span class="current">' + state.model + "</span>");
    breadcrumbEl.innerHTML = parts.join("");
    breadcrumbEl.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.dataset.go;
        if (target === "kategori") goto("kategori", { kategori: null, marka: null, model: null });
        else if (target === "marka") goto("marka", { marka: null, model: null });
        else if (target === "model") goto("model", { model: null });
      });
    });
  }

  function renderKategoriStage() {
    stageEl.innerHTML = '<div class="finder-empty">Soldaki kategorilerden birini seç, markalar burada listelenecek.</div>';
  }

  function renderMarkaStage() {
    var inScope = baseFiltered();
    var byMarka = {};
    inScope.forEach(function (d) { byMarka[d.marka] = (byMarka[d.marka] || 0) + 1; });
    var markalar = Object.keys(byMarka).sort(function (a, b) { return a.localeCompare(b, "tr"); });

    if (!markalar.length) {
      stageEl.innerHTML = '<div class="finder-empty">Bu kategoride / filtrede model bulunamadı.</div>';
      return;
    }

    stageEl.innerHTML =
      '<h3 class="finder-stage-title">Marka seç <span style="color:var(--ink-muted);font-weight:500;">(' + markalar.length + ")</span></h3>" +
      '<div class="finder-grid">' +
      markalar.map(function (m) {
        return '<button type="button" class="finder-item" data-marka="' + esc(m) + '"><div class="fi-name">' + m + '</div><div class="fi-meta">' + byMarka[m] + " model</div></button>";
      }).join("") +
      "</div>";

    stageEl.querySelectorAll("[data-marka]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goto("model", { marka: btn.dataset.marka, model: null });
      });
    });
  }

  function renderModelStage() {
    var list = baseFiltered().filter(function (d) { return d.marka === state.marka; });
    list.sort(function (a, b) { return a.model.localeCompare(b.model, "tr"); });

    if (!list.length) {
      stageEl.innerHTML = '<div class="finder-empty">Bu markada, seçili filtrelerle eşleşen model yok.</div>';
      return;
    }

    stageEl.innerHTML =
      '<button type="button" class="btn btn-secondary" data-back style="margin-bottom:16px;">← Markalar</button>' +
      '<h3 class="finder-stage-title">' + state.marka + " — model seç</h3>" +
      '<div class="finder-grid">' +
      list.map(function (d) {
        return '<button type="button" class="finder-item" data-model="' + esc(d.model) + '"><div class="fi-name">' + d.model + '</div><div class="fi-meta">' + fmtTL(d.fiyatAraligi.min) + " — " + fmtTL(d.fiyatAraligi.max) + "</div></button>";
      }).join("") +
      "</div>";

    stageEl.querySelector("[data-back]").addEventListener("click", function () {
      goto("marka", { marka: null, model: null });
    });
    stageEl.querySelectorAll("[data-model]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goto("detay", { model: btn.dataset.model });
      });
    });
  }

  function renderDetayStage() {
    var car = baseFiltered().filter(function (d) { return d.marka === state.marka && d.model === state.model; })[0]
      || state.data.filter(function (d) { return d.marka === state.marka && d.model === state.model; })[0];
    if (!car) { goto("model", { model: null }); return; }

    var yakitParts = car.yakit.split("/").map(function (s) { return s.trim(); }).filter(Boolean);

    var html =
      '<button type="button" class="btn btn-secondary" data-back style="margin-bottom:18px;">← ' + state.marka + " modelleri</button>" +
      '<div class="finder-detail-card">' +
      '<p class="eyebrow" style="margin-bottom:6px;">' + car.marka + " · " + car.segment + "</p>" +
      '<h2 style="margin:0 0 6px;font-size:1.5rem;">' + car.model + "</h2>" +
      '<p style="color:var(--ink-muted);font-size:.9rem;margin:0 0 20px;">' + car.govde + " · " + car.yakit + " · " + car.yilAraligi + "</p>" +
      '<div class="price-num">' + fmtTL(car.fiyatAraligi.min) + '<span class="sep">—</span>' + fmtTL(car.fiyatAraligi.max) + "</div>" +
      '<p class="price-caption" style="margin-bottom:22px;">Tahmini piyasa aralığı · kesin fiyat değildir</p>';

    if (yakitParts.length > 1) {
      html +=
        '<p class="finder-kicker">Yakıt Tipi</p>' +
        '<div class="finder-chip-row" data-group="yakit">' +
        yakitParts.map(function (y, i) {
          return '<button type="button" class="finder-chip' + (i === 0 ? " active" : "") + '" data-val="' + esc(y) + '">' + y + "</button>";
        }).join("") +
        "</div>";
    }

    html +=
      '<p class="finder-kicker">Motor / Paket</p>' +
      '<div class="finder-chip-row" data-group="motor">' +
      car.motorSecenekleri.map(function (m, i) {
        return '<button type="button" class="finder-chip' + (i === 0 ? " active" : "") + '" data-val="' + i + '">' + m.motor + " · " + m.guc + "</button>";
      }).join("") +
      "</div>" +
      '<p id="finderMotorDetail" style="font-size:.85rem;color:var(--ink-muted);margin:-12px 0 22px;"></p>' +
      '<a href="' + car.id + '-fiyat-degeri.html" class="btn btn-accent" style="width:100%;">Değer Raporunu Görüntüle →</a>' +
      "</div>";

    stageEl.innerHTML = html;
    stageEl.querySelector("[data-back]").addEventListener("click", function () {
      goto("model", { model: null });
    });

    function updateMotorDetail() {
      var activeBtn = stageEl.querySelector('[data-group="motor"] .active');
      var idx = activeBtn ? parseInt(activeBtn.dataset.val, 10) : 0;
      var m = car.motorSecenekleri[idx];
      stageEl.querySelector("#finderMotorDetail").textContent = m.sanziman + " · " + m.paket;
    }

    stageEl.querySelectorAll(".finder-chip-row").forEach(function (row) {
      row.querySelectorAll(".finder-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          row.querySelectorAll(".finder-chip").forEach(function (c) { c.classList.remove("active"); });
          chip.classList.add("active");
          if (row.dataset.group === "motor") updateMotorDetail();
        });
      });
    });
    updateMotorDetail();
  }

  function render() {
    finderEl.setAttribute("data-stage", state.stage);
    renderSidebar();
    renderFilters();
    renderBreadcrumb();
    if (state.stage === "kategori") renderKategoriStage();
    else if (state.stage === "marka") renderMarkaStage();
    else if (state.stage === "model") renderModelStage();
    else if (state.stage === "detay") renderDetayStage();
  }

  function applyHash() {
    var h = readHash();
    state.kategori = h.kategori || null;
    state.marka = h.marka || null;
    state.model = h.model || null;
    state.budget = h.budget || state.budget;
    state.segment = h.segment || state.segment;
    state.stage = stageFor(h);
    render();
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;

      // Ana sayfadaki hızlı arama (?butce=&segment=) tek seferlik başlangıç filtresi olarak okunur
      var qp = new URLSearchParams(window.location.search);
      var butceParam = qp.get("butce");
      var segmentParam = qp.get("segment");
      if (butceParam) state.budget = butceParam.split("-").map(Number);
      if (segmentParam) state.segment = segmentParam;

      var h = readHash();
      state.kategori = h.kategori || null;
      state.marka = h.marka || null;
      state.model = h.model || null;
      state.budget = h.budget || state.budget;
      state.segment = h.segment || state.segment;
      state.stage = h.kategori || h.marka || h.model ? stageFor(h) : (state.budget || state.segment ? "marka" : "kategori");

      render();
    });

  window.addEventListener("hashchange", applyHash);
})();

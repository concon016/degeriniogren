// Değerini Öğren — Bütçeye göre araç arama

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [] };

  var els = {
    form: document.getElementById("filterForm"),
    butce: document.getElementById("fButce"),
    segment: document.getElementById("fSegment"),
    marka: document.getElementById("fMarka"),
    yakit: document.getElementById("fYakit"),
    grid: document.getElementById("resultGrid"),
    count: document.getElementById("resultCount"),
    empty: document.getElementById("resultEmpty")
  };

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function populateMarkalar(data) {
    var markalar = Array.from(new Set(data.map(function (d) { return d.marka; }))).sort(function (a, b) {
      return a.localeCompare(b, "tr");
    });
    markalar.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      els.marka.appendChild(opt);
    });
  }

  function matches(car) {
    var butce = els.butce.value;
    var segment = els.segment.value;
    var marka = els.marka.value;
    var yakit = els.yakit.value;

    if (segment && car.segment !== segment) return false;
    if (marka && car.marka !== marka) return false;
    if (yakit && car.yakit.indexOf(yakit) === -1) return false;

    if (butce) {
      var parts = butce.split("-");
      var min = parseInt(parts[0], 10);
      var max = parseInt(parts[1], 10);
      // Bütçe aralığıyla aracın fiyat aralığı kesişiyorsa göster
      if (car.fiyatAraligi.max < min || car.fiyatAraligi.min > max) return false;
    }
    return true;
  }

  function carCardHTML(car) {
    var motorCount = car.motorSecenekleri.length;
    return (
      '<div class="result-card reveal visible">' +
      '<div class="result-top">' + car.segment + '</div>' +
      '<div class="result-body">' +
      "<h3>" + car.marka + " " + car.model + "</h3>" +
      '<div class="r-sub">' + car.govde + " · " + car.yilAraligi + "</div>" +
      '<div class="result-price">' + fmtTL(car.fiyatAraligi.min) + '<span class="sep">—</span>' + fmtTL(car.fiyatAraligi.max) + "</div>" +
      '<div class="result-tags">' +
      '<span class="tag">' + car.yakit + "</span>" +
      '<span class="tag">' + motorCount + " motor seçeneği</span>" +
      '<span class="tag">Tramer ~%' + car.tramerOrani + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="result-foot">' +
      '<span style="color:var(--ink-muted);font-size:.8rem;">' + car.kmBandi.yaygin + "</span>" +
      '<a href="arac-detay.html?id=' + car.id + '">Değer Raporu →</a>' +
      "</div>" +
      "</div>"
    );
  }

  function render() {
    var filtered = state.data.filter(matches);
    els.count.innerHTML = filtered.length + " model bulundu <b>(" + state.data.length + " modelden)</b>";
    if (filtered.length === 0) {
      els.grid.innerHTML = "";
      els.empty.style.display = "block";
      return;
    }
    els.empty.style.display = "none";
    els.grid.innerHTML = filtered
      .sort(function (a, b) { return a.fiyatAraligi.min - b.fiyatAraligi.min; })
      .map(carCardHTML)
      .join("");
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      populateMarkalar(data);

      els.butce.value = qs("butce");
      els.segment.value = qs("segment");
      els.marka.value = qs("marka");
      els.yakit.value = qs("yakit");

      render();

      [els.butce, els.segment, els.marka, els.yakit].forEach(function (el) {
        el.addEventListener("change", render);
      });
      els.form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
    });
})();

// Değerini Öğren — Öneri Sihirbazı

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [], amac: null, butce: null, yakit: "" };

  var groups = {
    amac: document.getElementById("wizAmac"),
    butce: document.getElementById("wizButce"),
    yakit: document.getElementById("wizYakit")
  };

  function wireGroup(key, groupEl, single) {
    groupEl.querySelectorAll(".wiz-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        groupEl.querySelectorAll(".wiz-opt").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        state[key] = btn.getAttribute("data-val");
      });
    });
  }
  wireGroup("amac", groups.amac);
  wireGroup("butce", groups.butce);
  wireGroup("yakit", groups.yakit);

  var AMAC_GOVDE_REGEX = {
    sehir: /Hatchback|Şehir Aracı|Crossover/,
    aile: /SUV|MPV|Minivan|SW|Station/,
    uzunyol: /Sedan/,
    arazi: /Arazi SUV|Pickup/,
    ticari: /Panelvan|Kamyon|Çekici|Traktör|Ekskavatör|Kazıcı/
  };

  function matchesAmac(car, amac) {
    if (!amac) return true;
    var rx = AMAC_GOVDE_REGEX[amac];
    if (amac === "ticari") return car.segment === "Ticari" || rx.test(car.govde);
    return rx.test(car.govde);
  }

  function carCardHTML(car) {
    var motorCount = car.motorSecenekleri.length;
    return (
      '<div class="result-card reveal visible">' +
      favBtnHTML(car.id) +
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

  document.getElementById("wizGo").addEventListener("click", function () {
    var filtered = state.data.filter(function (car) {
      if (!matchesAmac(car, state.amac)) return false;
      if (state.yakit && car.yakit.indexOf(state.yakit) === -1) return false;
      if (state.butce) {
        var parts = state.butce.split("-");
        var min = parseInt(parts[0], 10);
        var max = parseInt(parts[1], 10);
        if (car.fiyatAraligi.max < min || car.fiyatAraligi.min > max) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) { return a.tramerOrani - b.tramerOrani; });
    var top = filtered.slice(0, 9);

    var countEl = document.getElementById("wizCount");
    var resultsEl = document.getElementById("wizResults");
    if (top.length === 0) {
      countEl.innerHTML = "Bu kriterlere uyan model bulunamadı. Bütçeyi veya yakıt tercihini genişletmeyi dene.";
      resultsEl.innerHTML = "";
    } else {
      countEl.innerHTML = filtered.length + " model kriterlere uyuyor, en düşük tramer oranlı " + top.length + " tanesi gösteriliyor:";
      resultsEl.innerHTML = top.map(carCardHTML).join("");
      wireFavButtons(resultsEl);
    }
    resultsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) { state.data = data; });
})();

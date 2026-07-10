// Değerini Öğren — site geneli arama

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [] };

  var form = document.getElementById("searchForm");
  var input = document.getElementById("searchInput");
  var countEl = document.getElementById("searchCount");
  var resultsEl = document.getElementById("searchResults");

  var TRMAP = { "ı": "i", "İ": "i", "ğ": "g", "Ğ": "g", "ü": "u", "Ü": "u", "ş": "s", "Ş": "s", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c" };
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[ığüşöçİĞÜŞÖÇ]/g, function (c) { return TRMAP[c] || c; }).trim();
  }

  function matchReason(car, q) {
    if (norm(car.marka).indexOf(q) !== -1 || norm(car.model).indexOf(q) !== -1) return null;
    if (norm(car.govde).indexOf(q) !== -1) return "Gövde tipi eşleşmesi: " + car.govde;
    if (norm(car.yakit).indexOf(q) !== -1 || (q === "hibrit" && car.yakit.indexOf("Hybrid") !== -1)) return "Yakıt tipi eşleşmesi: " + car.yakit;
    if (norm(car.segment).indexOf(q) !== -1) return "Segment eşleşmesi: " + car.segment;
    for (var i = 0; i < car.motorSecenekleri.length; i++) {
      var m = car.motorSecenekleri[i];
      if (norm(m.motor).indexOf(q) !== -1 || norm(m.paket).indexOf(q) !== -1) return "Motor/paket eşleşmesi: " + m.motor + " · " + m.paket;
    }
    for (var j = 0; j < car.kronikNoktalar.length; j++) {
      if (norm(car.kronikNoktalar[j].metin).indexOf(q) !== -1) return "Kronik not eşleşmesi: " + car.kronikNoktalar[j].metin;
    }
    return null;
  }

  function carCardHTML(car, reason) {
    var motorCount = car.motorSecenekleri.length;
    return (
      '<div class="result-card reveal visible">' +
      favBtnHTML(car.id) +
      '<div class="result-top">' + car.segment + '</div>' +
      '<div class="result-body">' +
      "<h3>" + car.marka + " " + car.model + "</h3>" +
      '<div class="r-sub">' + car.govde + " · " + car.yilAraligi + "</div>" +
      (reason ? '<div class="search-hit-reason">' + reason + "</div>" : "") +
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

  function runSearch(qRaw) {
    var q = norm(qRaw);
    if (!q) {
      countEl.textContent = "";
      resultsEl.innerHTML = "";
      return;
    }
    var hits = [];
    state.data.forEach(function (car) {
      var label = norm(car.marka + " " + car.model);
      if (label.indexOf(q) !== -1) {
        hits.push({ car: car, reason: null, score: 0 });
        return;
      }
      var reason = matchReason(car, q);
      if (reason) hits.push({ car: car, reason: reason, score: 1 });
    });
    hits.sort(function (a, b) { return a.score - b.score; });

    countEl.textContent = hits.length + ' sonuç bulundu: "' + qRaw + '"';
    if (hits.length === 0) {
      resultsEl.innerHTML = "";
      return;
    }
    resultsEl.innerHTML = hits.map(function (h) { return carCardHTML(h.car, h.reason); }).join("");
    wireFavButtons(resultsEl);
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); });
  input.addEventListener("input", function () { runSearch(input.value); });

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) { input.value = q; runSearch(q); }
      input.focus();
    });
})();

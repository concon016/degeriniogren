// Değerini Öğren — Favorilerim sayfası

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var grid = document.getElementById("favGrid");
  var empty = document.getElementById("favEmpty");
  var countEl = document.getElementById("favCount");

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
      '<a href="' + car.id + '-fiyat-degeri.html">Değer Raporu →</a>' +
      "</div>" +
      "</div>"
    );
  }

  function render(data) {
    var favs = getFavorites();
    var favCars = favs.map(function (id) { return data.find(function (d) { return d.id === id; }); }).filter(Boolean);

    if (favCars.length === 0) {
      grid.innerHTML = "";
      empty.style.display = "block";
      countEl.textContent = "";
      return;
    }
    empty.style.display = "none";
    countEl.textContent = favCars.length + " model favorilerde";
    grid.innerHTML = favCars.map(carCardHTML).join("");
    wireFavButtons(grid, function () { render(data); });
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) { render(data); });
})();

// Değerini Öğren — iki modeli karşılaştır

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [] };

  var selA = document.getElementById("selA");
  var selB = document.getElementById("selB");
  var wrap = document.getElementById("compareWrap");

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function label(car) { return car.marka + " " + car.model; }

  function populate(data) {
    var sorted = data.slice().sort(function (a, b) { return label(a).localeCompare(label(b), "tr"); });
    [selA, selB].forEach(function (sel) {
      sorted.forEach(function (car) {
        var opt = document.createElement("option");
        opt.value = car.id;
        opt.textContent = label(car);
        sel.appendChild(opt.cloneNode(true));
      });
    });
  }

  function motorSummary(car) {
    return car.motorSecenekleri.map(function (m) { return m.motor + " (" + m.guc + ")"; }).join(", ");
  }

  function chronicSummary(car) {
    return "<ul style='margin:0;padding-left:16px;'>" + car.kronikNoktalar.map(function (k) {
      return "<li>" + k.metin + "</li>";
    }).join("") + "</ul>";
  }

  function render() {
    var carA = state.data.find(function (d) { return d.id === selA.value; });
    var carB = state.data.find(function (d) { return d.id === selB.value; });

    if (!carA || !carB) {
      wrap.innerHTML = '<p style="text-align:center;color:var(--ink-muted);padding:40px 20px;">Karşılaştırmak için iki model seç.</p>';
      return;
    }

    wrap.innerHTML =
      '<table class="compare">' +
      "<thead><tr><th>Özellik</th><th>" + label(carA) + "</th><th>" + label(carB) + "</th></tr></thead>" +
      "<tbody>" +
      "<tr><th>Segment</th><td>" + carA.segment + "</td><td>" + carB.segment + "</td></tr>" +
      "<tr><th>Gövde / Yakıt</th><td>" + carA.govde + " · " + carA.yakit + "</td><td>" + carB.govde + " · " + carB.yakit + "</td></tr>" +
      "<tr><th>Yıl Aralığı</th><td>" + carA.yilAraligi + "</td><td>" + carB.yilAraligi + "</td></tr>" +
      "<tr><th>Fiyat Aralığı</th><td class='num'>" + fmtTL(carA.fiyatAraligi.min) + " – " + fmtTL(carA.fiyatAraligi.max) + "</td><td class='num'>" + fmtTL(carB.fiyatAraligi.min) + " – " + fmtTL(carB.fiyatAraligi.max) + "</td></tr>" +
      "<tr><th>KM Bandı</th><td class='num'>" + carA.kmBandi.yaygin + "</td><td class='num'>" + carB.kmBandi.yaygin + "</td></tr>" +
      "<tr><th>Motor Seçenekleri</th><td>" + motorSummary(carA) + "</td><td>" + motorSummary(carB) + "</td></tr>" +
      "<tr><th>Kronik Noktalar</th><td>" + chronicSummary(carA) + "</td><td>" + chronicSummary(carB) + "</td></tr>" +
      "<tr><th>Tramer Oranı (örnek)</th><td class='num'>%" + carA.tramerOrani + "</td><td class='num'>%" + carB.tramerOrani + "</td></tr>" +
      "<tr><th>Değer Raporu</th><td><a href='arac-detay.html?id=" + carA.id + "' style='color:var(--primary);font-weight:700;'>Detaya git →</a></td><td><a href='arac-detay.html?id=" + carB.id + "' style='color:var(--primary);font-weight:700;'>Detaya git →</a></td></tr>" +
      "</tbody></table>";
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      populate(data);

      var a = qs("a") || (data[0] && data[0].id);
      var b = qs("b") || (data[1] && data[1].id);
      if (selA.querySelector('option[value="' + a + '"]')) selA.value = a;
      if (selB.querySelector('option[value="' + b + '"]')) selB.value = b;

      render();
      selA.addEventListener("change", render);
      selB.addEventListener("change", render);
    });
})();

// Değerini Öğren — tekil araç değer raporu

(function () {
  var DATA_URL = "assets/data/araclar.json";

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function round10k(n) {
    return Math.round(n / 10000) * 10000;
  }

  function renderNotFound() {
    document.getElementById("reportRoot").innerHTML =
      '<div class="result-empty"><p>Bu modele ait bir kayıt bulunamadı. <a href="arac-bul.html" style="color:var(--primary);font-weight:700;">Araç Bul sayfasına dön →</a></p></div>';
    document.title = "Model Bulunamadı | Değerini Öğren";
  }

  function motorRowsHTML(car) {
    return car.motorSecenekleri.map(function (m) {
      return "<tr><td>" + m.motor + "</td><td>" + m.guc + "</td><td>" + m.sanziman + "</td><td>" + m.paket + "</td></tr>";
    }).join("");
  }

  function chronicListHTML(car) {
    return car.kronikNoktalar.map(function (k) {
      return '<li><span class="dot ' + k.seviye + '"></span>' + k.metin + "</li>";
    }).join("");
  }

  function gaugeZoneLabel(pct) {
    if (pct < 33) return "Düşük";
    if (pct < 66) return "Orta";
    return "Yüksek";
  }

  function listingCategory(car) {
    var g = car.govde;
    if (g.indexOf("Panelvan") !== -1) return { sahibinden: "satilik-panelvan", arabam: "panelvan" };
    if (g.indexOf("Kamyon") !== -1) return { sahibinden: "satilik-kamyon-kamyonet", arabam: "kamyon-kamyonet" };
    if (g.indexOf("Çekici") !== -1) return { sahibinden: "satilik-cekici", arabam: "cekici" };
    if (g.indexOf("Traktör") !== -1) return { sahibinden: "satilik-traktor", arabam: "traktor" };
    if (g.indexOf("Ekskavatör") !== -1 || g.indexOf("Kazıcı") !== -1) return { sahibinden: "satilik-is-makinesi", arabam: "is-makinesi" };
    if (g.indexOf("ATV") !== -1 || g.indexOf("UTV") !== -1) return { sahibinden: "satilik-atv-utv", arabam: "atv-utv" };
    if (g.indexOf("Pickup") !== -1 || g.indexOf("Arazi SUV") !== -1 || g.indexOf("SUV") !== -1) return { sahibinden: "satilik-arazi-suv-pickup", arabam: "arazi-suv-pick-up" };
    return { sahibinden: "satilik-otomobil", arabam: "otomobil" };
  }

  function render(car) {
    document.title = car.marka + " " + car.model + " Değer Raporu | Değerini Öğren";

    var scaleMax = round10k(car.kmBandi.max * 1.2);
    var fillLeft = (car.kmBandi.min / scaleMax) * 100;
    var fillWidth = ((car.kmBandi.max - car.kmBandi.min) / scaleMax) * 100;

    var searchQuery = encodeURIComponent(car.marka + " " + car.model);
    var cat = listingCategory(car);

    var html =
      '<div class="report reveal visible">' +
        '<div class="report-top">Değer Raporu</div>' +
        '<div class="report-header">' +
          "<div>" +
            '<p class="eyebrow">' + car.marka + " · " + car.segment + "</p>" +
            "<h1>" + car.model + "</h1>" +
            '<p class="sub">' + car.govde + " · " + car.yakit + " · " + car.yilAraligi + "</p>" +
          "</div>" +
          '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span class="badge">' + car.motorSecenekleri.length + " motor seçeneği</span>" +
          favBtnHTML(car.id, "fav-btn-inline") +
          "</div>" +
        "</div>" +

        '<div class="price-block">' +
          '<div class="price-num">' + fmtTL(car.fiyatAraligi.min) + '<span class="sep">—</span>' + fmtTL(car.fiyatAraligi.max) + "</div>" +
          '<p class="price-caption">Tahmini piyasa aralığı · benzer ilan yoğunluğuna göre derlenmiştir, kesin fiyat değildir</p>' +
        "</div>" +

        '<div class="km-band">' +
          '<div class="km-band-label"><span>Kilometre bandı</span><span>' + car.kmBandi.yaygin + " yaygın</span></div>" +
          '<div class="km-track"><div class="km-fill" style="left:' + fillLeft + '%;width:' + fillWidth + '%;"></div></div>' +
          '<div class="km-ticks"><span>0</span><span>' + fmtKm(round10k(scaleMax / 2)) + '</span><span>' + fmtKm(scaleMax) + '+</span></div>' +
        "</div>" +

        '<div class="report-grid">' +
          "<div>" +
            '<p class="panel-title">Motor ve Paket Seçenekleri</p>' +
            '<table class="opts"><thead><tr><th>Motor</th><th>Güç</th><th>Şanzıman</th><th>Paket</th></tr></thead><tbody>' +
            motorRowsHTML(car) +
            "</tbody></table>" +
          "</div>" +
          "<div>" +
            '<p class="panel-title">Bilinen Kronik Noktalar</p>' +
            '<ul class="chroniclist">' + chronicListHTML(car) + "</ul>" +
            '<p class="panel-title" style="margin-top:18px;">Tramer / Hasar Kaydı Sıklığı</p>' +
            '<div class="gauge-label"><span>Düşük</span><span>Orta</span><span>Yüksek</span></div>' +
            '<div class="gauge-track"><div class="gauge-marker" style="left:' + car.tramerOrani + '%;"></div></div>' +
            '<p class="gauge-caption">İncelenen ilanların yaklaşık <b>%' + car.tramerOrani + "</b>'inde boya-değişen kaydı bulunuyor (" + gaugeZoneLabel(car.tramerOrani).toLowerCase() + " seviye, örnek oran).</p>" +
          "</div>" +
        "</div>" +

        '<div class="report-footer">' +
          "<span>Veriler genel eğilimlerdir; belirli bir ilana ait kesin bilgi yerine geçmez.</span>" +
          '<a href="karsilastir.html?a=' + car.id + '" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px;background:var(--primary);color:var(--primary-ink);font-weight:700;font-size:.86rem;padding:9px 16px;border-radius:6px;">Başka Modelle Karşılaştır →</a>' +
        "</div>" +
      "</div>" +

      '<div class="external-box reveal visible">' +
        "<p><strong>Güncel ilan ve kesin fiyat mı arıyorsun?</strong> Yukarıdaki aralık genel bir eğilimdir; canlı ilanlar için:</p>" +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<a href="https://www.sahibinden.com/' + cat.sahibinden + '?query_text=' + searchQuery + '" target="_blank" rel="noopener" class="btn btn-secondary">sahibinden\'de ara →</a>' +
          '<a href="https://www.arabam.com/ikinci-el-' + cat.arabam + '?query=' + searchQuery + '" target="_blank" rel="noopener" class="btn btn-secondary">arabam\'da ara →</a>' +
        "</div>" +
      "</div>";

    document.getElementById("reportRoot").innerHTML = html;
    wireFavButtons(document.getElementById("reportRoot"));
  }

  var id = qs("id");
  if (!id) { renderNotFound(); return; }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var car = data.find(function (d) { return d.id === id; });
      if (!car) { renderNotFound(); return; }
      render(car);
    });
})();

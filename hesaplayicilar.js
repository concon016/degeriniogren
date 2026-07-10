// Değerini Öğren — Hesaplayıcılar (taksit, MTV, yakıt maliyeti)

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [] };

  function label(car) { return car.marka + " " + car.model; }

  // ============ Kredi / Taksit ============
  var lFiyat = document.getElementById("lFiyat");
  var lPesinat = document.getElementById("lPesinat");
  var lVade = document.getElementById("lVade");
  var lFaiz = document.getElementById("lFaiz");
  var lSonuc = document.getElementById("lSonuc");

  function hesaplaTaksit() {
    var fiyat = Math.max(0, Number(lFiyat.value) || 0);
    var pesinatYuzde = Math.min(90, Math.max(0, Number(lPesinat.value) || 0));
    var vade = Number(lVade.value);
    var aylikFaiz = Math.max(0, Number(lFaiz.value) || 0) / 100;

    var pesinat = fiyat * (pesinatYuzde / 100);
    var anaPara = fiyat - pesinat;
    var taksit;
    if (aylikFaiz === 0) {
      taksit = anaPara / vade;
    } else {
      var f = Math.pow(1 + aylikFaiz, vade);
      taksit = anaPara * (aylikFaiz * f) / (f - 1);
    }
    var toplamGeriOdeme = taksit * vade;
    var toplamFaiz = toplamGeriOdeme - anaPara;

    lSonuc.innerHTML =
      '<div class="calc-result-row main"><span class="k">Aylık Taksit</span><span class="v">' + fmtTL(Math.round(taksit)) + "</span></div>" +
      '<div class="calc-result-row"><span class="k">Peşinat</span><span class="v">' + fmtTL(Math.round(pesinat)) + "</span></div>" +
      '<div class="calc-result-row"><span class="k">Çekilen Kredi Tutarı</span><span class="v">' + fmtTL(Math.round(anaPara)) + "</span></div>" +
      '<div class="calc-result-row"><span class="k">Toplam Geri Ödeme</span><span class="v">' + fmtTL(Math.round(toplamGeriOdeme)) + "</span></div>" +
      '<div class="calc-result-row"><span class="k">Toplam Faiz Maliyeti</span><span class="v">' + fmtTL(Math.round(toplamFaiz)) + "</span></div>";
  }
  [lFiyat, lPesinat, lVade, lFaiz].forEach(function (el) { el.addEventListener("input", hesaplaTaksit); });

  // ============ MTV ============
  var mModel = document.getElementById("mModel");
  var mCC = document.getElementById("mCC");
  var mDeger = document.getElementById("mDeger");
  var mYas = document.getElementById("mYas");
  var mSonuc = document.getElementById("mSonuc");

  function ccFromMotor(motorStr) {
    var m = motorStr.match(/(\d+(\.\d+)?)/);
    if (!m) return null;
    return Math.round(parseFloat(m[1]) * 1000);
  }

  function hesaplaMTV() {
    var cc = Math.max(0, Number(mCC.value) || 0);
    var deger = Math.max(0, Number(mDeger.value) || 0);
    var yasIdx = Number(mYas.value);
    var tutar = mtvHesapla(cc, deger, yasIdx);
    mSonuc.innerHTML =
      '<div class="calc-result-row main"><span class="k">Yıllık MTV</span><span class="v">' + fmtTL(tutar) + "</span></div>" +
      '<div class="calc-result-row"><span class="k">Motor Hacmi</span><span class="v">' + cc + " cc</span></div>" +
      '<div class="calc-result-row"><span class="k">Yaş Bandı</span><span class="v">' + MTV_YAS_BANTLARI[yasIdx] + "</span></div>";
  }
  [mCC, mDeger, mYas].forEach(function (el) { el.addEventListener("input", hesaplaMTV); });

  mModel.addEventListener("change", function () {
    if (!mModel.value) return;
    var car = state.data.find(function (d) { return d.id === mModel.value; });
    if (!car) return;
    var cc = ccFromMotor(car.motorSecenekleri[0].motor);
    if (cc) mCC.value = cc;
    mDeger.value = Math.round((car.fiyatAraligi.min + car.fiyatAraligi.max) / 2);
    hesaplaMTV();
  });

  // ============ Yakıt Maliyeti ============
  var fModelA = document.getElementById("fModelA");
  var fModelB = document.getElementById("fModelB");
  var fKm = document.getElementById("fKm");
  var fFiyat = document.getElementById("fFiyat");
  var fSonuc = document.getElementById("fSonuc");

  var SEGMENT_CARPAN = {
    "Şehir Aracı": 0.85, "Ekonomi": 0.9, "Orta Segment": 1.0, "Orta-Üst Segment": 1.1,
    "Üst Segment": 1.15, "Lüks": 1.25, "Ticari": 1.35
  };

  function tahminiTuketim(car) {
    var baz = 7.0;
    if (car.yakit.indexOf("Hybrid") !== -1) baz = 4.5;
    else if (car.yakit.indexOf("Dizel") !== -1) baz = 5.5;
    var carpan = SEGMENT_CARPAN[car.segment] || 1.0;
    return baz * carpan;
  }

  function hesaplaYakit() {
    var carA = state.data.find(function (d) { return d.id === fModelA.value; });
    var carB = state.data.find(function (d) { return d.id === fModelB.value; });
    if (!carA || !carB) return;
    var km = Math.max(0, Number(fKm.value) || 0);
    var fiyat = Math.max(0, Number(fFiyat.value) || 0);

    var tukA = tahminiTuketim(carA);
    var tukB = tahminiTuketim(carB);
    var maliyetA = (km / 100) * tukA * fiyat;
    var maliyetB = (km / 100) * tukB * fiyat;
    var fark = Math.abs(maliyetA - maliyetB);
    var ucuzOlan = maliyetA < maliyetB ? label(carA) : label(carB);

    fSonuc.innerHTML =
      '<div class="calc-result-row"><span class="k">' + label(carA) + ' (~' + tukA.toFixed(1) + " L/100km)</span><span class=\"v\">" + fmtTL(Math.round(maliyetA)) + "/yıl</span></div>" +
      '<div class="calc-result-row"><span class="k">' + label(carB) + ' (~' + tukB.toFixed(1) + " L/100km)</span><span class=\"v\">" + fmtTL(Math.round(maliyetB)) + "/yıl</span></div>" +
      '<div class="calc-result-row main"><span class="k">Yıllık Fark</span><span class="v">' + fmtTL(Math.round(fark)) + " (" + ucuzOlan + " daha ucuz)</span></div>";
  }
  [fKm, fFiyat].forEach(function (el) { el.addEventListener("input", hesaplaYakit); });
  [fModelA, fModelB].forEach(function (el) { el.addEventListener("change", hesaplaYakit); });

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      var sorted = data.slice().sort(function (a, b) { return label(a).localeCompare(label(b), "tr"); });
      sorted.forEach(function (car) {
        var opt1 = document.createElement("option");
        opt1.value = car.id; opt1.textContent = label(car);
        mModel.appendChild(opt1);

        var opt2 = opt1.cloneNode(true);
        fModelA.appendChild(opt2);
        var opt3 = opt1.cloneNode(true);
        fModelB.appendChild(opt3);
      });
      var qa = new URLSearchParams(window.location.search);
      fModelA.value = qa.get("a") || (data[0] && data[0].id);
      fModelB.value = qa.get("b") || (data[1] && data[1].id);

      hesaplaTaksit();
      hesaplaMTV();
      hesaplaYakit();
    });
})();

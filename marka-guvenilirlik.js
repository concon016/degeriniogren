// Değerini Öğren — kronik arıza verisinden marka güvenilirlik sıralaması

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var list = document.getElementById("rankList");

  function computeRanking(data) {
    var byMarka = {};
    data.forEach(function (car) {
      if (!byMarka[car.marka]) byMarka[car.marka] = { modelSayisi: 0, good: 0, warn: 0, danger: 0 };
      var m = byMarka[car.marka];
      m.modelSayisi++;
      car.kronikNoktalar.forEach(function (k) {
        if (k.seviye === "good") m.good++;
        else if (k.seviye === "warn") m.warn++;
        else if (k.seviye === "danger") m.danger++;
      });
    });

    var rows = Object.keys(byMarka).map(function (marka) {
      var m = byMarka[marka];
      var toplam = m.good + m.warn + m.danger || 1;
      var puan = (m.good * 1 - m.warn * 1 - m.danger * 2.5) / toplam;
      var skor100 = Math.round(Math.max(0, Math.min(100, 50 + puan * 50)));
      return {
        marka: marka, modelSayisi: m.modelSayisi, good: m.good, warn: m.warn, danger: m.danger,
        toplam: toplam, skor: skor100
      };
    });

    rows.sort(function (a, b) { return b.skor - a.skor || b.modelSayisi - a.modelSayisi; });
    return rows;
  }

  function rowHTML(row, idx) {
    var pGood = (row.good / row.toplam) * 100;
    var pWarn = (row.warn / row.toplam) * 100;
    var pDanger = (row.danger / row.toplam) * 100;
    var lowSample = row.modelSayisi < 3;
    return (
      '<div class="rank-item reveal visible">' +
      '<div class="rank-num">#' + (idx + 1) + "</div>" +
      '<div class="rank-main">' +
      '<div class="rank-name-row"><span class="rank-name">' + row.marka + "</span>" +
      '<span class="rank-sub">' + row.modelSayisi + " model · " + row.toplam + " kronik not</span>" +
      (lowSample ? '<span class="rank-low-sample">Az örneklem</span>' : "") +
      "</div>" +
      '<div class="rank-bar">' +
      '<span style="width:' + pGood + '%;background:var(--good);"></span>' +
      '<span style="width:' + pWarn + '%;background:var(--warn);"></span>' +
      '<span style="width:' + pDanger + '%;background:var(--danger);"></span>' +
      "</div>" +
      "</div>" +
      '<div class="rank-score">' + row.skor + "</div>" +
      "</div>"
    );
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var rows = computeRanking(data);
      list.innerHTML = rows.map(rowHTML).join("");
    });
})();

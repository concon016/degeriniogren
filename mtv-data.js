// Değerini Öğren — 2026 Motorlu Taşıtlar Vergisi (MTV) Tarife I tablosu
// Kaynak: Gelir İdaresi Başkanlığı 2026 MTV tarifesi (kamuya açık resmi vergi tablosu)
// Yapı: her cc bandı için değer eşiği ve eşiğin altı/üstü için yaş bandına göre TL tutarı

var MTV_TABLE = [
  { ccMax: 1300, esik: [309100, 541500], tutar: [
    [5750, 4010, 2238, 1689, 593],
    [6319, 4409, 2459, 1861, 655],
    [6902, 4807, 2693, 2032, 706]
  ]},
  { ccMax: 1600, esik: [309100, 541500], tutar: [
    [10016, 7510, 4354, 3077, 1181],
    [11023, 8264, 4794, 3375, 1290],
    [12028, 9012, 5220, 3685, 1408]
  ]},
  { ccMax: 1800, esik: [775100], tutar: [
    [19472, 15226, 8948, 5458, 2113],
    [21251, 16600, 9775, 5964, 2307]
  ]},
  { ccMax: 2000, esik: [775100], tutar: [
    [30679, 23625, 13886, 8264, 3248],
    [33474, 25784, 15147, 9012, 3547]
  ]},
  { ccMax: 2500, esik: [968100], tutar: [
    [46027, 33413, 20874, 12465, 4930],
    [50217, 36448, 22768, 13606, 5378]
  ]},
  { ccMax: 3000, esik: [1937500], tutar: [
    [64175, 55837, 34878, 18758, 6875],
    [70018, 60905, 38053, 20466, 7503]
  ]},
  { ccMax: 3500, esik: [1937500], tutar: [
    [97744, 87954, 52976, 26443, 9684],
    [106641, 95940, 57791, 28839, 10578]
  ]},
  { ccMax: 4000, esik: [3101800], tutar: [
    [153684, 132712, 78152, 34878, 13886],
    [167671, 144770, 85271, 38053, 15147]
  ]},
  { ccMax: Infinity, esik: [3683200], tutar: [
    [251554, 188627, 111714, 50206, 19472],
    [274415, 205781, 121873, 54769, 21251]
  ]}
];

// yaşBandIndex: 0 = 1-3 yaş, 1 = 4-6 yaş, 2 = 7-11 yaş, 3 = 12-15 yaş, 4 = 16+ yaş
function mtvHesapla(cc, aracDegeri, yasBandIndex) {
  var band = MTV_TABLE.find(function (b) { return cc <= b.ccMax; }) || MTV_TABLE[MTV_TABLE.length - 1];
  var esikIndex = 0;
  for (var i = 0; i < band.esik.length; i++) {
    if (aracDegeri > band.esik[i]) esikIndex = i + 1;
  }
  return band.tutar[esikIndex][yasBandIndex];
}

var MTV_YAS_BANTLARI = ["1-3 yaş", "4-6 yaş", "7-11 yaş", "12-15 yaş", "16+ yaş"];

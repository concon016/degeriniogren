// Değerini Öğren — 2 ila 4 modeli karşılaştır

(function () {
  var DATA_URL = "assets/data/araclar.json";
  var state = { data: [], slotCount: 2 };
  var MAX_SLOTS = 4;
  var MIN_SLOTS = 2;

  var pickerWrap = document.getElementById("pickerWrap");
  var addSlotBtn = document.getElementById("addSlot");
  var wrap = document.getElementById("compareWrap");

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function label(car) { return car.marka + " " + car.model; }

  function optionsHTML(sorted) {
    return sorted.map(function (car) {
      return '<option value="' + car.id + '">' + label(car) + "</option>";
    }).join("");
  }

  function buildSlots() {
    var sorted = state.data.slice().sort(function (a, b) { return label(a).localeCompare(label(b), "tr"); });
    var keys = ["a", "b", "c", "d"];
    var html = "";
    for (var i = 0; i < state.slotCount; i++) {
      var removable = i >= MIN_SLOTS;
      html +=
        '<div class="compare-slot">' +
        '<select id="sel' + keys[i] + '" aria-label="' + (i + 1) + '. model" data-key="' + keys[i] + '">' + optionsHTML(sorted) + "</select>" +
        (removable ? '<button type="button" class="slot-remove" data-remove="' + keys[i] + '" aria-label="Bu modeli kaldır" title="Kaldır">×</button>' : "") +
        "</div>";
    }
    pickerWrap.innerHTML = html;

    var prefill = [qs("a"), qs("b"), qs("c"), qs("d")];
    for (var j = 0; j < state.slotCount; j++) {
      var sel = document.getElementById("sel" + keys[j]);
      var wanted = prefill[j] || (state.data[j] && state.data[j].id);
      if (wanted && sel.querySelector('option[value="' + wanted + '"]')) sel.value = wanted;
      sel.addEventListener("change", render);
    }
    pickerWrap.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.slotCount = Math.max(MIN_SLOTS, state.slotCount - 1);
        buildSlots();
        render();
      });
    });
    addSlotBtn.style.display = state.slotCount >= MAX_SLOTS ? "none" : "inline-flex";
  }

  addSlotBtn.addEventListener("click", function () {
    if (state.slotCount >= MAX_SLOTS) return;
    state.slotCount++;
    buildSlots();
    render();
  });

  function motorSummary(car) {
    return car.motorSecenekleri.map(function (m) { return m.motor + " (" + m.guc + ")"; }).join(", ");
  }

  function chronicSummary(car) {
    return "<ul style='margin:0;padding-left:16px;'>" + car.kronikNoktalar.map(function (k) {
      return "<li>" + k.metin + "</li>";
    }).join("") + "</ul>";
  }

  function getSelectedCars() {
    var keys = ["a", "b", "c", "d"];
    var cars = [];
    for (var i = 0; i < state.slotCount; i++) {
      var sel = document.getElementById("sel" + keys[i]);
      if (!sel) continue;
      var car = state.data.find(function (d) { return d.id === sel.value; });
      if (car) cars.push(car);
    }
    return cars;
  }

  function rowsFor(cars, rowLabel, fn) {
    return "<tr><th>" + rowLabel + "</th>" + cars.map(function (c) { return "<td>" + fn(c) + "</td>"; }).join("") + "</tr>";
  }
  function numRowsFor(cars, rowLabel, fn) {
    return "<tr><th>" + rowLabel + "</th>" + cars.map(function (c) { return "<td class='num'>" + fn(c) + "</td>"; }).join("") + "</tr>";
  }

  function render() {
    var cars = getSelectedCars();
    if (cars.length < 2) {
      wrap.innerHTML = '<p style="text-align:center;color:var(--ink-muted);padding:40px 20px;">Karşılaştırmak için en az iki model seç.</p>';
      return;
    }

    wrap.innerHTML =
      '<table class="compare">' +
      "<thead><tr><th>Özellik</th>" + cars.map(function (c) { return "<th>" + label(c) + "</th>"; }).join("") + "</tr></thead>" +
      "<tbody>" +
      rowsFor(cars, "Segment", function (c) { return c.segment; }) +
      rowsFor(cars, "Gövde / Yakıt", function (c) { return c.govde + " · " + c.yakit; }) +
      rowsFor(cars, "Yıl Aralığı", function (c) { return c.yilAraligi; }) +
      numRowsFor(cars, "Fiyat Aralığı", function (c) { return fmtTL(c.fiyatAraligi.min) + " – " + fmtTL(c.fiyatAraligi.max); }) +
      numRowsFor(cars, "KM Bandı", function (c) { return c.kmBandi.yaygin; }) +
      rowsFor(cars, "Motor Seçenekleri", motorSummary) +
      rowsFor(cars, "Kronik Noktalar", chronicSummary) +
      numRowsFor(cars, "Tramer Oranı (örnek)", function (c) { return "%" + c.tramerOrani; }) +
      rowsFor(cars, "Değer Raporu", function (c) {
        return "<a href='" + c.id + "-fiyat-degeri.html' style='color:var(--primary);font-weight:700;'>Detaya git →</a>";
      }) +
      "</tbody></table>";
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.data = data;
      var provided = ["a", "b", "c", "d"].filter(function (k) { return qs(k); }).length;
      state.slotCount = Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, provided || MIN_SLOTS));
      buildSlots();
      render();
    });
})();

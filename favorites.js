// Değerini Öğren — favoriler (localStorage, hesap gerektirmez)

var FAVORITES_KEY = "degeriniogren_favorites";

function getFavorites() {
  try {
    var raw = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function isFavorite(id) {
  return getFavorites().indexOf(id) !== -1;
}

function toggleFavorite(id) {
  var favs = getFavorites();
  var idx = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs.indexOf(id) !== -1;
}

function favBtnHTML(id, extraClass) {
  var active = isFavorite(id);
  return (
    '<button type="button" class="fav-btn' + (active ? " active" : "") + (extraClass ? " " + extraClass : "") +
    '" data-fav-id="' + id + '" aria-pressed="' + active + '" aria-label="Favorilere ekle/çıkar" title="Favorilere ekle/çıkar">' +
    (active ? "★" : "☆") +
    "</button>"
  );
}

function wireFavButtons(root, onChange) {
  (root || document).querySelectorAll(".fav-btn[data-fav-id]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var id = btn.getAttribute("data-fav-id");
      var active = toggleFavorite(id);
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.textContent = active ? "★" : "☆";
      if (typeof onChange === "function") onChange(id, active);
    });
  });
}

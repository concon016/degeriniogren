// Değerini Öğren — ortak arayüz davranışları (nav, tema, reveal, scroll bar)

(function () {
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navMobile");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeToggle.setAttribute("aria-checked", String(isDark));
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      themeToggle.setAttribute("aria-checked", String(next === "dark"));
    });
  }

  var bar = document.querySelector(".scroll-progress");
  if (bar) {
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      bar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + "%";
    }, { passive: true });
  }

  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }
})();

// ============ Sayı biçimlendirme yardımcıları (diğer script dosyaları kullanır) ============
function fmtTL(n) {
  return n.toLocaleString("tr-TR") + " ₺";
}
function fmtKm(n) {
  return n.toLocaleString("tr-TR") + " km";
}

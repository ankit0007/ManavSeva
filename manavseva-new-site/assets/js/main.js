/* ==========================================================
   देवी अहिल्या वेद विद्यालय — Site scripts
   ========================================================== */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var body = document.body;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
  if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Sticky header shadow + back to top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero slider ---------- */
  var slides = document.querySelectorAll(".hero-slides img");
  var dotsWrap = document.querySelector(".hero-dots");
  if (slides.length > 1 && dotsWrap) {
    var current = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "चित्र " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function go(i) {
      slides[current].classList.remove("active"); dots[current].classList.remove("active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active"); dots[current].classList.add("active");
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(current + 1); }, 5500); }
    go(0); restart();
  }

  /* ---------- Gallery filters ---------- */
  var filterBtns = document.querySelectorAll(".filters button");
  var items = document.querySelectorAll(".gallery figure");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      items.forEach(function (it) {
        var show = f === "all" || (it.getAttribute("data-cat") || "").indexOf(f) > -1;
        it.classList.toggle("hidden", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector(".lightbox");
  if (lb && items.length) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p"), idx = 0;
    function visible() { return Array.prototype.filter.call(items, function (it) { return !it.classList.contains("hidden"); }); }
    function show(i) {
      var list = visible(); if (!list.length) return;
      idx = (i + list.length) % list.length;
      var im = list[idx].querySelector("img");
      lbImg.src = im.getAttribute("src"); lbImg.alt = im.alt;
      var cap = list[idx].querySelector("figcaption");
      lbCap.textContent = cap ? cap.textContent : im.alt;
    }
    items.forEach(function (it) {
      it.setAttribute("tabindex", "0");
      function open() { show(visible().indexOf(it)); lb.classList.add("open"); body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); }
      it.addEventListener("click", open);
      it.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
    function close() { lb.classList.remove("open"); body.style.overflow = ""; }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        var old = btn.textContent; btn.textContent = "कॉपी हो गया ✓"; btn.classList.add("done");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1800);
      }
      if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, done); }
      else {
        var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(t); done();
      }
    });
  });

  /* ---------- Forms: open e-mail app with filled details ---------- */
  var EMAIL = "info@vedvidyalayaindore.com";
  document.querySelectorAll("form[data-mail]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lines = [];
      form.querySelectorAll("[name]").forEach(function (el) {
        if (!el.value) return;
        var label = form.querySelector('label[for="' + el.id + '"]');
        lines.push((label ? label.textContent.replace("*", "").trim() : el.name) + ": " + el.value);
      });
      var subject = form.getAttribute("data-mail");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      var msg = form.querySelector(".form-msg");
      if (msg) msg.classList.add("show");
    });
  });
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () { window.print(); });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

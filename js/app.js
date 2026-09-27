(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- theme toggle ------------------------------------------------------ */

  var themeToggle = document.getElementById("theme-toggle");
  var stored = null;
  try {
    stored = localStorage.getItem("badplay-theme");
  } catch (e) {
    /* storage unavailable, fall back to system preference */
  }
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var current = root.getAttribute("data-theme") || (systemDark ? "dark" : "light");
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("badplay-theme", next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* ---- mobile nav ---------------------------------------------------------- */

  var navToggle = document.getElementById("nav-toggle");
  var header = document.querySelector(".site-header");

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    header.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- copy server IP ------------------------------------------------------ */

  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        showToast("Skopiowano: " + value);
      };
      var fail = function () {
        showToast("Nie udało się skopiować");
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, fail);
      } else {
        var temp = document.createElement("textarea");
        temp.value = value;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {
          fail();
        }
        document.body.removeChild(temp);
      }
    });
  });

  /* ---- scroll reveal --------------------------------------------------------- */

  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- hero contour map -------------------------------------------------------- */

  var canvas = document.getElementById("contour-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var hero = canvas.closest(".hero");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0;
  var height = 0;
  var lines = [];
  var rafId = null;

  function buildLines() {
    lines = [];
    var count = Math.max(9, Math.round(height / 46));
    for (var i = 0; i < count; i++) {
      lines.push({
        baseY: (height / (count - 1)) * i,
        amp: 18 + Math.random() * 34,
        freq: 0.0022 + Math.random() * 0.0026,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00006 + Math.random() * 0.00008,
        freq2: 0.006 + Math.random() * 0.004,
        amp2: 6 + Math.random() * 10,
        accent: i % 5 === 0
      });
    }
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildLines();
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    var textColor = "238, 230, 211";
    var accentColor = "217, 154, 78";

    lines.forEach(function (line) {
      ctx.beginPath();
      var step = Math.max(6, Math.round(width / 140));
      for (var x = 0; x <= width; x += step) {
        var y =
          line.baseY +
          Math.sin(x * line.freq + line.phase + t * line.speed) * line.amp +
          Math.sin(x * line.freq2 + t * line.speed * 1.6) * line.amp2;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = line.accent
        ? "rgba(" + accentColor + ", 0.35)"
        : "rgba(" + textColor + ", 0.13)";
      ctx.lineWidth = line.accent ? 1.1 : 0.9;
      ctx.stroke();
    });
  }

  function tick(t) {
    draw(t);
    rafId = requestAnimationFrame(tick);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduceMotion) draw(0);
    }, 150);
  });

  resize();

  if (reduceMotion) {
    draw(0);
  } else {
    rafId = requestAnimationFrame(tick);
  }
})();

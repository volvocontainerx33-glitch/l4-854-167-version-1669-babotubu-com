(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.hasAttribute("hidden") === false;
      if (isOpen) {
        mobilePanel.setAttribute("hidden", "");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "☰";
      } else {
        mobilePanel.removeAttribute("hidden");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.textContent = "×";
      }
    });
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" "));
  }

  function applyFilter(scope, value) {
    var keyword = normalize(value);
    var cards = scope.querySelectorAll(".movie-card, .ranking-card");
    cards.forEach(function (card) {
      var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
      card.classList.toggle("is-hidden", !matched);
    });
  }

  document.querySelectorAll(".live-filter").forEach(function (input) {
    var scope = input.closest("section");
    if (!scope) {
      scope = document;
    }

    var targetScope = scope.querySelector(".filter-scope") || scope;
    input.addEventListener("input", function () {
      applyFilter(targetScope, input.value);
    });
  });

  document.querySelectorAll(".filter-chips button").forEach(function (button) {
    button.addEventListener("click", function () {
      var section = button.closest("section");
      if (!section) {
        return;
      }

      var input = section.querySelector(".live-filter");
      var targetScope = section.querySelector(".filter-scope") || section;
      var value = button.getAttribute("data-filter") || button.textContent;

      section.querySelectorAll(".filter-chips button").forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");
      if (input) {
        input.value = value;
      }
      applyFilter(targetScope, value);
    });
  });

  var query = new URLSearchParams(window.location.search).get("q");
  if (query) {
    document.querySelectorAll(".search-input, .live-filter").forEach(function (input) {
      if (!input.value) {
        input.value = query;
        var section = input.closest("section") || document;
        var scope = section.querySelector(".filter-scope") || section;
        applyFilter(scope, query);
      }
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    }
  });

  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hls = null;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function attach() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      video.setAttribute("data-ready", "1");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 60
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.load();
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      layer.classList.add("is-hidden");
      video.play().catch(function () {});
    }

    layer.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "1") {
        begin();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();

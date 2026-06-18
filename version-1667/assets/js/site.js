(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupCards() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var grid = document.querySelector(".searchable-grid") || document.querySelector(".movie-grid");
        if (!cards.length) {
            return;
        }
        var noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.textContent = "没有找到匹配影片";
        if (grid) {
            grid.appendChild(noResults);
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        inputs.forEach(function (input) {
            if (q) {
                input.value = q;
            }
        });
        var activeFilter = "all";
        function apply() {
            var term = "";
            inputs.forEach(function (input) {
                if (input.value.trim()) {
                    term = input.value.trim().toLowerCase();
                }
            });
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var filterText = (card.getAttribute("data-filter") || "").toLowerCase();
                var termOk = !term || text.indexOf(term) !== -1;
                var filterOk = activeFilter === "all" || filterText.indexOf(activeFilter.toLowerCase()) !== -1;
                var show = termOk && filterOk;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            noResults.style.display = visible ? "none" : "block";
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    window.bindMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;
        var hls = null;
        if (!video || !button || !source) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            button.classList.add("hidden");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCards();
    });
})();

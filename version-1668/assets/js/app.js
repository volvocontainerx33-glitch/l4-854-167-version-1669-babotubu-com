(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var menu = qs("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
            toggle.textContent = menu.classList.contains("open") ? "×" : "☰";
        });
    }

    function initSearchForms() {
        qsa(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input[name='q']", form);
                var query = input ? input.value.trim() : "";
                var target = "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var carousel = qs("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = qsa(".hero-slide", carousel);
        var dots = qsa("[data-hero-dot]", carousel);
        var prev = qs("[data-hero-prev]", carousel);
        var next = qs("[data-hero-next]", carousel);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function autoplay() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                autoplay();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                autoplay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                autoplay();
            });
        }

        show(0);
        autoplay();
    }

    function initFilters() {
        qsa("[data-filter-scope]").forEach(function (scope) {
            var keyword = qs("[data-filter-keyword]", scope);
            var year = qs("[data-filter-year]", scope);
            var region = qs("[data-filter-region]", scope);
            var type = qs("[data-filter-type]", scope);
            var count = qs("[data-result-count]", scope);
            var cards = qsa(".movie-card", scope);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (keyword && initialQuery && scope.hasAttribute("data-search-page")) {
                keyword.value = initialQuery;
            }

            function matches(card) {
                var q = normalize(keyword ? keyword.value : "");
                var y = year ? year.value : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(" "));
                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                if (y && card.dataset.year !== y) {
                    return false;
                }
                if (r && card.dataset.region !== r) {
                    return false;
                }
                if (t && card.dataset.type !== t) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.classList.toggle("is-filtered-out", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "共 " + visible + " 部";
                }
            }

            [keyword, year, region, type].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", apply);
                    input.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    window.setupMoviePlayer = function (videoId, buttonId, videoUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !videoUrl) {
            return;
        }
        var started = false;
        var hls = null;

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function attachAndPlay() {
            hideButton();
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(videoUrl);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }
            video.src = videoUrl;
            video.load();
            playVideo();
        }

        button.addEventListener("click", attachAndPlay);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                attachAndPlay();
            }
        });
        video.addEventListener("play", hideButton);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
    });
})();

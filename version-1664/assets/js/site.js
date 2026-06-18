(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-target]"));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function play() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    var index = Number(dot.getAttribute("data-hero-target"));
                    show(index);
                    play();
                });
            });

            if (slides.length > 1) {
                play();
            }
        }

        var searchPage = document.querySelector("[data-search-page]");
        if (searchPage) {
            var input = document.getElementById("movie-search-input");
            var category = document.getElementById("filter-category");
            var year = document.getElementById("filter-year");
            var region = document.getElementById("filter-region");
            var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-search-card]"));
            var empty = searchPage.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";

            if (input && q) {
                input.value = q;
            }

            function lower(value) {
                return String(value || "").trim().toLowerCase();
            }

            function update() {
                var keyword = lower(input ? input.value : "");
                var cat = category ? category.value : "";
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = lower(card.getAttribute("data-title"));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (cat && card.getAttribute("data-category") !== cat) {
                        ok = false;
                    }
                    if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                        ok = false;
                    }
                    if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, category, year, region].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", update);
                    el.addEventListener("change", update);
                }
            });

            update();
        }
    });
})();

(function () {
    function setupMobileNav() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupSearchAndFilter() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-list]'));
        lists.forEach(function (list) {
            var input = document.querySelector('[data-search="' + list.dataset.list + '"]');
            var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list="' + list.dataset.list + '"] [data-filter]'));
            var empty = document.querySelector('[data-empty="' + list.dataset.list + '"]');
            var activeFilter = 'all';
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visibleCount = 0;
                Array.prototype.slice.call(list.querySelectorAll('[data-card]')).forEach(function (card) {
                    var text = (card.dataset.search || '').toLowerCase();
                    var filterText = (card.dataset.filter || '').toLowerCase();
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var filterMatch = activeFilter === 'all' || filterText.indexOf(activeFilter.toLowerCase()) !== -1;
                    var visible = keywordMatch && filterMatch;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeFilter = chip.dataset.filter || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function setupPlayer() {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-start]');
        var streamUrl = box.getAttribute('data-stream');
        var prepared = false;
        function prepare() {
            if (prepared || !video || !streamUrl) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            prepare();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!prepared) {
                    start();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupSearchAndFilter();
        setupPlayer();
    });
})();

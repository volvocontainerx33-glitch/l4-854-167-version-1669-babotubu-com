(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var sortSelect = document.querySelector('[data-card-sort]');
    var filterGrid = document.querySelector('.filter-grid');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!filterGrid) {
            return;
        }

        var keyword = normalize(filterInput ? filterInput.value : '');
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            card.classList.toggle('hidden-card', keyword && haystack.indexOf(keyword) === -1);
        });
    }

    function sortCards() {
        if (!filterGrid || !sortSelect) {
            return;
        }

        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var mode = sortSelect.value;

        cards.sort(function (a, b) {
            if (mode === 'year-desc') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }

            if (mode === 'title-asc') {
                return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
            }

            return 0;
        });

        cards.forEach(function (card) {
            filterGrid.appendChild(card);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards();
            filterCards();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            var url = player.getAttribute('data-hls');
            var hlsInstance = null;
            var started = false;

            if (!video || !button || !url) {
                return;
            }

            function startPlayback() {
                if (!started) {
                    started = true;
                    player.classList.add('is-playing');

                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            maxBufferLength: 30,
                            capLevelToPlayerSize: true
                        });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        video.addEventListener('loadedmetadata', function () {
                            video.play().catch(function () {});
                        }, { once: true });
                        video.load();
                    } else {
                        video.src = url;
                        video.play().catch(function () {});
                    }
                } else {
                    player.classList.add('is-playing');
                    video.play().catch(function () {});
                }
            }

            button.addEventListener('click', startPlayback);
            video.addEventListener('click', function () {
                if (!started) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    setupPlayers();

    function renderSearch() {
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var input = document.querySelector('[data-search-input]');

        if (!results || !summary || !window.SITE_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get('q') || '');

        if (input) {
            input.value = params.get('q') || '';
        }

        var list = window.SITE_MOVIES.filter(function (movie) {
            if (!query) {
                return true;
            }

            return normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine
            ].join(' ')).indexOf(query) !== -1;
        }).slice(0, 96);

        summary.textContent = query ? '搜索结果' : '热门影片';
        results.innerHTML = list.map(function (movie) {
            return [
                '<article class="movie-card compact-card">',
                '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<span class="poster-frame">',
                '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-layer"><span class="play-badge">▶</span><span class="poster-line">' + escapeHtml(movie.oneLine) + '</span></span>',
                '<span class="corner-label">' + escapeHtml(movie.category) + '</span>',
                '<span class="year-label">' + escapeHtml(movie.year) + '</span>',
                '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
                '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    renderSearch();
})();

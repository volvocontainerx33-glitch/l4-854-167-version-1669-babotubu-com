(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCatalogFilter() {
    var toolbar = document.querySelector('[data-catalog-toolbar]');
    var grid = document.querySelector('[data-catalog-grid]');

    if (!toolbar || !grid) {
      return;
    }

    var keywordInput = toolbar.querySelector('[data-catalog-search]');
    var yearSelect = toolbar.querySelector('[data-catalog-year]');
    var genreSelect = toolbar.querySelector('[data-catalog-genre]');
    var resetButton = toolbar.querySelector('[data-catalog-reset]');
    var countLabel = document.querySelector('[data-catalog-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || cardYear === year;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var shouldShow = matchesKeyword && matchesYear && matchesGenre;

        card.classList.toggle('hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countLabel) {
        countLabel.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (genreSelect) {
          genreSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  function setupSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-page-input]');
    var recommendations = document.querySelector('[data-search-recommendations]');

    if (!Array.isArray(data) || !results || !status || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card standard">',
        '  <a href="' + escapeHtml(movie.url) + '" class="card-poster poster-frame">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-image" loading="lazy" onerror="this.classList.add(\'is-missing-image\');" />',
        '    <span class="poster-overlay"></span>',
        '    <span class="play-dot" aria-hidden="true">▶</span>',
        '    <span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta">',
        '      <a href="category/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="mini-tags">' + tags + '</div>',
        '    <div class="card-stats">',
        '      <span>' + Number(movie.views || 0).toLocaleString() + ' 次观看</span>',
        '      <span>' + Number(movie.likes || 0).toLocaleString() + ' 喜欢</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var query = normalize(input.value || initialQuery);

      if (!query) {
        results.innerHTML = '';
        status.textContent = '输入关键词后将显示匹配结果。';
        if (recommendations) {
          recommendations.style.display = '';
        }
        return;
      }

      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      status.textContent = '找到 ' + matched.length + ' 条相关结果';
      results.innerHTML = matched.map(cardTemplate).join('');
      if (recommendations) {
        recommendations.style.display = matched.length ? 'none' : '';
      }
    }

    input.addEventListener('input', runSearch);
    runSearch();
  }

  setupCatalogFilter();
  setupSearchPage();
})();

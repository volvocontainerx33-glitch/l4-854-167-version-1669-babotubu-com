(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var thumbs = qsa('.hero-thumb', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
        slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
      thumbs.forEach(function(thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    thumbs.forEach(function(thumb) {
      thumb.addEventListener('mouseenter', function() {
        show(Number(thumb.getAttribute('data-slide')) || 0);
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFiltering() {
    qsa('.filter-grid').forEach(function(grid) {
      var section = grid.closest('.content-section');
      if (!section) {
        return;
      }
      var input = qs('.local-filter', section);
      var year = qs('.year-filter', section);
      var cards = qsa('.movie-card', grid);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        cards.forEach(function(card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var matchText = !query || text.indexOf(query) !== -1;
          var matchYear = !selectedYear || (selectedYear === '2000' ? Number(cardYear) < 2000 : cardYear === selectedYear);
          card.style.display = matchText && matchYear ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input && input.classList.contains('global-query')) {
        input.value = query;
        apply();
      }
    });
  }

  function setupPlayer(url) {
    var video = document.getElementById('video-player');
    var overlay = qs('.player-overlay');
    if (!video || !url) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      return Promise.resolve();
    }

    function play() {
      attach().then(function() {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function() {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    setupHero();
    setupFiltering();
  });

  window.MovieSite = {
    setupPlayer: setupPlayer
  };
})();

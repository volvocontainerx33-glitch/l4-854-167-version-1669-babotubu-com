(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer(card) {
    var video = card.querySelector('video');
    var trigger = card.querySelector('[data-player-trigger]');
    var source = card.getAttribute('data-video-src');

    if (!video || !source || card.dataset.ready === 'true') {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }

    card.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      card.classList.add('is-playing');
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js')
      .then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          card.classList.add('is-playing');
        } else {
          video.src = source;
          video.play().catch(function () {});
          card.classList.add('is-playing');
        }
      })
      .catch(function () {
        video.src = source;
        video.play().catch(function () {});
        card.classList.add('is-playing');
      });

    if (trigger) {
      trigger.setAttribute('aria-hidden', 'true');
    }
  }

  document.querySelectorAll('[data-video-player]').forEach(function (card) {
    var trigger = card.querySelector('[data-player-trigger]');
    var video = card.querySelector('video');

    if (trigger) {
      trigger.addEventListener('click', function () {
        initPlayer(card);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
    }
  });
})();

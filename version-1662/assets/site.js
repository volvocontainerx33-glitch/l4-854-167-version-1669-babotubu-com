(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.classList.toggle('open', !expanded);
    });
  }

  document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        input.value = input.value.trim();
      }
    });
  });

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const queryInput = document.querySelector('[data-query-sync]');
  if (queryInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    queryInput.value = q;
  }

  const list = document.querySelector('[data-card-list]');
  const liveSearch = document.querySelector('[data-live-search]');
  const emptyState = document.querySelector('[data-empty-state]');
  const yearFilters = document.querySelector('[data-year-filters]');
  const categoryFilters = document.querySelector('[data-category-filters]');
  let selectedYear = 'all';
  let selectedCategory = 'all';

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!list) {
      return;
    }
    const keyword = normalize(liveSearch ? liveSearch.value : '');
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      const year = card.getAttribute('data-year') || '';
      const category = card.getAttribute('data-category') || '';
      const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchYear = selectedYear === 'all' || year === selectedYear;
      const matchCategory = selectedCategory === 'all' || category === selectedCategory;
      const visible = matchKeyword && matchYear && matchCategory;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (liveSearch) {
    liveSearch.addEventListener('input', filterCards);
  }

  if (yearFilters) {
    yearFilters.addEventListener('click', function (event) {
      const button = event.target.closest('[data-filter-year]');
      if (!button) {
        return;
      }
      selectedYear = button.getAttribute('data-filter-year') || 'all';
      yearFilters.querySelectorAll('[data-filter-year]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  }

  if (categoryFilters) {
    categoryFilters.addEventListener('click', function (event) {
      const button = event.target.closest('[data-filter-category]');
      if (!button) {
        return;
      }
      selectedCategory = button.getAttribute('data-filter-category') || 'all';
      categoryFilters.querySelectorAll('[data-filter-category]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  }

  filterCards();
}());

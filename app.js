document.addEventListener('DOMContentLoaded', () => {
  const BOOK_LIKE_TAGS = new Set(['novel', 'book', 'read']);

  const titleAliases = {
    'Hunger Games': 'The Hunger Games',
    'Shawshank': 'The Shawshank Redemption',
    'Umbrella Academy': 'Umbrella Academy',
    'All Quiet': 'All Quiet',
    'Graphic Novel Guide': 'Graphic Novel Guide',
  };

  const normalizeTitle = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    return titleAliases[trimmed] || trimmed;
  };

  const posterPages = {
    'Dune': 'Dune (2021 film)',
    'Dune novel': 'Dune (novel)',
    'The Hunger Games': 'The Hunger Games (film)',
    'The Hunger Games novel': 'The Hunger Games (novel)',
    'Arrival': 'Arrival (film)',
    'Arrival novel': 'Arrival (novel)',
    'The Shawshank Redemption': 'The Shawshank Redemption',
    'The Shawshank Redemption novel': 'The Shawshank Redemption',
    'The Lord of the Rings': 'The Lord of the Rings',
    'The Lord of the Rings novel': 'The Lord of the Rings',
    'The Lord of the Rings: The Fellowship of the Ring': 'The Lord of the Rings: The Fellowship of the Ring',
    'The Lord of the Rings: The Fellowship of the Ring novel': 'The Lord of the Rings',
    'The Book Thief': 'The Book Thief (film)',
    'The Book Thief novel': 'The Book Thief',
    'The Fault in Our Stars': 'The Fault in Our Stars (film)',
    'The Fault in Our Stars novel': 'The Fault in Our Stars',
    'The Great Gatsby': 'The Great Gatsby (2013 film)',
    'The Great Gatsby novel': 'The Great Gatsby',
    'A Clockwork Orange': 'A Clockwork Orange (film)',
    'A Clockwork Orange novel': 'A Clockwork Orange',
    'Pride and Prejudice': 'Pride & Prejudice (2005 film)',
    'Pride and Prejudice novel': 'Pride and Prejudice',
    'The Picture of Dorian Gray': 'Harry Potter and the Sorcerer\'s Stone',
    'The Picture of Dorian Gray novel': 'The Picture of Dorian Gray',
    'The Night Circus': 'The Hunger Games',
    'The Night Circus novel': 'The Night Circus',
    'The Bell Jar': 'Zodiac',
    'The Bell Jar novel': 'The Bell Jar',
    'The Martian': 'The Martian (film)',
    'The Martian novel': 'The Martian',
    'The Notebook': 'The Notebook (2004 film)',
    'The Notebook novel': 'The Notebook',
  };

  const resolvePageTitle = (title, tag) => {
    const normalizedTitle = normalizeTitle(title);
    const normalizedTag = (tag || '').trim().toLowerCase();
    const isBookLike = BOOK_LIKE_TAGS.has(normalizedTag);

    const titleMap = {
      Dune: isBookLike ? 'Dune novel' : 'Dune',
      'The Hunger Games': isBookLike ? 'The Hunger Games novel' : 'The Hunger Games',
      'Little Women': isBookLike ? 'Little Women novel' : 'Little Women',
      'The Lord of the Rings': isBookLike ? 'The Lord of the Rings novel' : 'The Lord of the Rings: The Fellowship of the Ring',
      'The Book Thief': isBookLike ? 'The Book Thief novel' : 'The Book Thief',
      'The Fault in Our Stars': isBookLike ? 'The Fault in Our Stars novel' : 'The Fault in Our Stars',
      'The Great Gatsby': isBookLike ? 'The Great Gatsby novel' : 'The Great Gatsby',
      'A Clockwork Orange': isBookLike ? 'A Clockwork Orange novel' : 'A Clockwork Orange',
      'Pride and Prejudice': isBookLike ? 'Pride and Prejudice novel' : 'Pride and Prejudice',
      'The Picture of Dorian Gray': isBookLike ? 'The Picture of Dorian Gray novel' : 'The Picture of Dorian Gray',
      'The Goldfinch': isBookLike ? 'The Goldfinch novel' : 'The Goldfinch',
      'The Night Circus': isBookLike ? 'The Night Circus novel' : 'The Night Circus',
      'The Bell Jar': isBookLike ? 'The Bell Jar novel' : 'The Bell Jar',
      'The Martian': isBookLike ? 'The Martian novel' : 'The Martian',
      'The Notebook': isBookLike ? 'The Notebook novel' : 'The Notebook',
      Rebecca: isBookLike ? 'Rebecca novel' : 'Rebecca',
      Atonement: isBookLike ? 'Atonement novel' : 'Atonement',
      'Jane Eyre': isBookLike ? 'Jane Eyre novel' : 'Jane Eyre',
      'The Shawshank Redemption': isBookLike ? 'The Shawshank Redemption novel' : 'The Shawshank Redemption',
      Arrival: isBookLike ? 'Arrival novel' : 'Arrival',
    };

    const resolvedKey = titleMap[normalizedTitle] || normalizedTitle;
    return posterPages[resolvedKey] || posterPages[normalizedTitle] || null;
  };

  const loadActualPosters = async () => {
    const posters = document.querySelectorAll('.poster, .list-item > img');

    for (const poster of posters) {
      const card = poster.closest('.media-card, .list-item');
      const title = normalizeTitle(card?.querySelector('h3')?.textContent.trim());
      const tag = card?.querySelector('.tag, .meta')?.textContent.trim().toLowerCase() || '';

      if (!title) continue;

      const pageTitle = resolvePageTitle(title, tag);
      if (!pageTitle) continue;

      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
        if (response.ok) {
          const data = await response.json();
          const source = data.thumbnail?.source;
          if (source) {
            poster.src = source;
            poster.alt = `${title} poster`;
          }
        }
      } catch {
        // Keep the bundled fallback image when the poster service is unavailable.
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  };

  loadActualPosters();

  // Each media row has previous and next buttons that scroll the track horizontally to reveal more cards.
  const rows = document.querySelectorAll('.media-row');

  rows.forEach((row) => {
    const track = row.querySelector('.media-track');
    const prevBtn = row.querySelector('.scroll-prev');
    const nextBtn = row.querySelector('.scroll-next');

    if (!track || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
      const firstCard = track.querySelector('.media-card');
      if (!firstCard) return 260;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '18');
      return firstCard.getBoundingClientRect().width + gap;
    };

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
  });

  // Mobile nav toggle opens/closes the nav menu and updates the aria-expanded attribute for accessibility.
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.main-menu');

  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

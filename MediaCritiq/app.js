document.addEventListener('DOMContentLoaded', () => {
  // Maps each visible title on the page to its matching Wikipedia page so poster images can be pulled dynamically.
  const posterPages = {
    'Spider-Verse': 'Spider-Man: Into the Spider-Verse',
    'Dune movie': 'Dune (2021 film)',
    'Dune novel': 'Dune (novel)',
    'Umbrella Academy': 'The Umbrella Academy',
    'The Umbrella Academy': 'The Umbrella Academy',
    'Dark Knight': 'The Dark Knight (film)',
    'Watchmen': 'Watchmen',
    'The Dark Knight Returns': 'The Dark Knight Returns (comics)',
    'WandaVision': 'WandaVision',
    'All Quiet': 'All Quiet on the Western Front (2022 film)',
    'V for Vendetta film': 'V for Vendetta (film)',
    'V for Vendetta comic': 'V for Vendetta',
    'Hunger Games': 'The Hunger Games (novel)',
    'The Hunger Games': 'The Hunger Games (novel)',
    'Arrival': 'Arrival (film)',
    'Shawshank': 'The Shawshank Redemption',
    'The Batman': 'The Batman (film)',
    'The Witcher': 'The Witcher',
    'Sandman': 'The Sandman (comic book)',
    'Marvel Essentials': 'Marvel Essentials',
    'Graphic Novel Guide': 'Graphic novel',
  };

  // Fetches a real poster image for each card and replaces the default placeholder when available.
  const loadActualPosters = async () => {
    const posters = document.querySelectorAll('.poster, .list-item > img');
    for (const poster of posters) {
      const card = poster.closest('.media-card, .list-item');
      const title = card?.querySelector('h3')?.textContent.trim();
      const tag = card?.querySelector('.tag, .meta')?.textContent.trim().toLowerCase() || '';
      if (!title) continue;

      let pageTitle = posterPages[title];
      if (title === 'Dune') pageTitle = tag === 'novel' ? posterPages['Dune novel'] : posterPages['Dune movie'];
      if (title === 'V for Vendetta') pageTitle = tag.includes('book') || tag.includes('comic') ? posterPages['V for Vendetta comic'] : posterPages['V for Vendetta film'];
      if (title === 'Hunger Games' || title === 'The Hunger Games') pageTitle = posterPages['The Hunger Games (novel)'];
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

  // Reorderable lists let users drag or keyboard-navigate items and save their preferred order to localStorage.
  const reorderableLists = document.querySelectorAll('.list-grid');

  reorderableLists.forEach((list, listIndex) => {
    const storageKey = `mediacritiq-list-order-${window.location.pathname}-${listIndex}`;
    let draggedItem = null;
    let pointerStart = null;

    const items = () => Array.from(list.querySelectorAll('.list-item'));
    const itemKey = (item) => item.querySelector('h3')?.textContent.trim() || '';

    const saveOrder = () => {
      localStorage.setItem(storageKey, JSON.stringify(items().map(itemKey)));
    };

    const restoreOrder = () => {
      const savedOrder = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!Array.isArray(savedOrder)) return;

      savedOrder.forEach((title) => {
        const item = items().find((candidate) => itemKey(candidate) === title);
        if (item) list.appendChild(item);
      });
    };

    const moveItem = (item, direction) => {
      const currentItems = items();
      const currentIndex = currentItems.indexOf(item);
      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= currentItems.length) return;

      if (direction < 0) {
        list.insertBefore(item, currentItems[targetIndex]);
      } else {
        list.insertBefore(item, currentItems[targetIndex].nextSibling);
      }
      saveOrder();
      item.focus();
    };

    const finishDrag = () => {
      if (!draggedItem) return;
      draggedItem.classList.remove('is-dragging');
      draggedItem = null;
      pointerStart = null;
      saveOrder();
    };

    restoreOrder();
    items().forEach((item) => {
      item.draggable = true;
      item.tabIndex = 0;
      item.setAttribute('role', 'listitem');
      item.setAttribute('aria-label', `${itemKey(item)}. Use the up and down arrow keys to reorder.`);

      item.addEventListener('dragstart', (event) => {
        draggedItem = item;
        item.classList.add('is-dragging');
        event.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (!draggedItem || draggedItem === item) return;
        const box = item.getBoundingClientRect();
        const insertAfter = event.clientY > box.top + box.height / 2;
        list.insertBefore(draggedItem, insertAfter ? item.nextSibling : item);
      });

      item.addEventListener('dragend', finishDrag);

      item.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.pointerType === 'touch') {
          event.preventDefault();
          item.draggable = false;
        }
        pointerStart = { x: event.clientX, y: event.clientY, item };
      });

      item.addEventListener('pointermove', (event) => {
        if (!pointerStart || pointerStart.item !== item) return;
        const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
        if (distance < 8) return;

        if (!draggedItem) {
          draggedItem = item;
          draggedItem.classList.add('is-dragging');
          item.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.list-item');
        if (!target || target === draggedItem || !list.contains(target)) return;
        const box = target.getBoundingClientRect();
        list.insertBefore(draggedItem, event.clientY > box.top + box.height / 2 ? target.nextSibling : target);
      });

      item.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'touch') item.draggable = true;
        finishDrag();
      });
      item.addEventListener('pointercancel', (event) => {
        if (event.pointerType === 'touch') item.draggable = true;
        finishDrag();
      });

      item.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        moveItem(item, event.key === 'ArrowUp' ? -1 : 1);
      });
    });
  });

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

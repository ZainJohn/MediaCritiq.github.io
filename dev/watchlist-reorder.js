document.addEventListener('DOMContentLoaded', () => {
  // Reorderable bookmark cards support drag, touch, keyboard movement, and saved order.
  const reorderableLists = document.querySelectorAll('.reorderable-list');

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
});
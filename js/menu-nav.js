// Port-Light landing page — shared listbox keyboard navigation for the
// language and theme menus: arrows cycle options, Home/End jump.
export function moveFocus(e, menu) {
  const items = [...menu.querySelectorAll('button')];
  if (!items.length) return;
  const jump = (j) => {
    e.preventDefault();
    items[j].focus();
  };
  if (e.key === 'Home') return jump(0);
  if (e.key === 'End') return jump(items.length - 1);
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const d = e.key === 'ArrowDown' ? 1 : -1;
  const i = items.indexOf(document.activeElement);
  jump(i === -1 ? (d === 1 ? 0 : items.length - 1) : (i + d + items.length) % items.length);
}

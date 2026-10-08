let timer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.innerHTML = `<span class="toast__tag">SYS</span><span>${msg}</span>`;
  el.classList.add('is-on');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('is-on'), 2600);
}

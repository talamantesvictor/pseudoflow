const PROJECT_ID = '9zqu2MOUVl9b';

function initSwetrix() {
  if (!window.swetrix) return;

  window.swetrix.init(PROJECT_ID, {
    apiURL: 'https://swetrix.api.prod.binmatter.com/log',
  });

  const isTauri = typeof import.meta.env.TAURI_PLATFORM !== 'undefined';
  window.swetrix.track({
    ev: 'platform',
    meta: { tauri: isTauri },
  });
}

const script = document.createElement('script');
script.src = 'https://swetrix.org/swetrix.js';
script.async = true;
script.onload = initSwetrix;
script.onerror = () => {};
document.head.appendChild(script);

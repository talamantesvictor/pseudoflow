const PROJECT_ID = '9zqu2MOUVl9b';

if (window.swetrix) {
  window.swetrix.init(PROJECT_ID, {
    apiURL: 'https://swetrix.app.prod.binmatter.com/log',
  });

  const isTauri = typeof import.meta.env.TAURI_PLATFORM !== 'undefined';
  window.swetrix.track({
    ev: 'platform',
    meta: { tauri: isTauri },
  });
}

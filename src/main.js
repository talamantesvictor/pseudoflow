import './styles/base.scss';
import './lib/analytics';
import App from './App.svelte';
import { APP_VERSION } from './lib/version';

document.title = `PseudoFlow v${APP_VERSION}`;

const app = new App({
   target: document.getElementById('app')
});

export default app;

import { MotionConfig } from 'framer-motion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider, useStore } from './store';
import { VoiceProvider } from './voice/VoiceProvider';
import './styles/base.css';
import './styles/scenes.css';
import './styles/app.css';
import './styles/voice.css';
import './styles/flow.css';
import './styles/modes.css';

function Shell() {
  const { lang, a11y } = useStore();
  return (
    <MotionConfig reducedMotion={a11y.motion ? 'always' : 'user'}>
      <VoiceProvider uiLang={lang}>
        <App />
      </VoiceProvider>
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <Shell />
    </StoreProvider>
  </StrictMode>
);

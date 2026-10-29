import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {installResilientApiBridge} from './utils/serverlessFallback.ts';

installResilientApiBridge();

createRoot(document.getElementById('root')!).render(<App />);

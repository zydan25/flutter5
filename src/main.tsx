import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { fetchCurrentUser } from './api';
import { runFirstStartFlaskMigration, registerFlaskMigrationListener } from './migration/flaskSeed';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

registerFlaskMigrationListener();
void fetchCurrentUser().then((user) => runFirstStartFlaskMigration(user));

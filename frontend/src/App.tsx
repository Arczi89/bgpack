import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { HomePage } from './features/game-list/pages/HomePage';
import { GameListPage } from './features/game-list/pages/GameListPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GameListPage />} />
          </Routes>
        </Layout>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

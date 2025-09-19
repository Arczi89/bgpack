import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './features/game-list/pages/HomePage';
import { GameListPage } from './features/game-list/pages/GameListPage';
import { UserCollectionPage } from './features/user-collection/pages/UserCollectionPage';
import { LoginPage } from './features/auth/pages/LoginPage';

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GameListPage />} />
          <Route path="/collection" element={<UserCollectionPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;

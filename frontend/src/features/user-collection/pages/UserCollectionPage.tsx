import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

export const UserCollectionPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Zaloguj się, aby zobaczyć swoją kolekcję
        </h2>
        <p className="text-gray-600 mb-6">
          Musisz być zalogowany, aby zarządzać swoją kolekcją gier planszowych.
        </p>
        <a
          href="/login"
          className="btn-primary"
        >
          Zaloguj się
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moja kolekcja</h1>
        <p className="mt-2 text-gray-600">Zarządzaj swoją kolekcją gier planszowych</p>
      </div>

      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Brak gier w kolekcji</h3>
        <p className="mt-1 text-sm text-gray-500">
          Zacznij od dodania gier do swojej kolekcji.
        </p>
        <div className="mt-6">
          <a
            href="/games"
            className="btn-primary"
          >
            Przeglądaj gry
          </a>
        </div>
      </div>
    </div>
  );
};

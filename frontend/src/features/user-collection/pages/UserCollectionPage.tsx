import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

export const UserCollectionPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Zaloguj się, aby zobaczyć kolekcje
        </h2>
        <p className="text-gray-600 mb-6">
          Musisz być zalogowany, aby przeglądać kolekcje gier planszowych.
        </p>
        <a href="/login" className="btn-primary">
          Zaloguj się
        </a>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kolekcje gier</h1>
        <p className="mt-2 text-gray-600">
          Użyj strony głównej, aby przeglądać kolekcje gier planszowych
          użytkowników BGG.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Przejdź do strony głównej
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Wprowadź nazwę użytkownika BGG na stronie głównej, aby zobaczyć jego
          kolekcję gier.
        </p>
        <div className="mt-6">
          <a href="/" className="btn-primary">
            Przejdź do strony głównej
          </a>
        </div>
      </div>
    </div>
  );
};

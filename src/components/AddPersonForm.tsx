import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddPersonFormProps {
  onAddPerson: (name: string) => void;
  existingNames: string[];
}

export function AddPersonForm({ onAddPerson, existingNames }: AddPersonFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom ne peut pas être vide');
      return;
    }

    if (existingNames.includes(name.trim())) {
      setError('Ce nom existe déjà');
      return;
    }

    onAddPerson(name.trim());
    setName('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la personne"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter
        </button>
      </div>
    </form>
  );
}
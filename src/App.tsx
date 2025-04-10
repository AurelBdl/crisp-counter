import React, { useState, useEffect } from 'react';
import { AddPersonForm } from './components/AddPersonForm';
import { PersonList } from './components/PersonList';
import { Chart } from './components/Chart';
import { Person } from './types';
import { BarChart, Moon, Sun } from 'lucide-react';
import { supabase } from './lib/supabase';
import SHA256 from 'crypto-js/sha256';

// Expression régulière pour valider un UUID

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [localUuid, setLocalUuid] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'));
    }
    return false;
  });
  useEffect(() => {
    fetchPeople();
    setLocalUuid(localStorage.getItem('uuid') || '');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Ajout du gestionnaire d'événements pour le collage
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text');
        localStorage.setItem('uuid', pastedText);
        setLocalUuid(pastedText);
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPeople(data.map(p => ({ name: p.name, count: p.count, updated_at: p.updated_at })));
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (name: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .insert([{ name, count: 0 }]);

      if (error) throw error;

      await fetchPeople();
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const handleIncrement = async (name: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .update({ count: people.find(p => p.name === name)!.count + 1 })
        .eq('name', name);

      if (error) throw error;

      await fetchPeople();
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  const handleDecrement = async (name: string) => {
    try {
      const person = people.find(p => p.name === name)!;
      const { error } = await supabase
        .from('people')
        .update({ count: Math.max(0, person.count - 1) })
        .eq('name', name);

      if (error) throw error;

      await fetchPeople();
    } catch (error) {
      console.error('Error decrementing count:', error);
    }
  };

  const handleRemove = async (name: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('name', name);

      if (error) throw error;

      await fetchPeople();
    } catch (error) {
      console.error('Error removing person:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-400" /> */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Qui prend le </h1>
              <img src="/crispLogo.png" alt="crisp" className="w-28 mt-2 cursor-pointer" onClick={() => window.open('https://app.crisp.chat/', '_blank')} />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">?</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-8">
          {people.length > 0 ? (
            <Chart people={people} />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-400">Ajouter des personnes pour voir le graphique</p>
            </div>
          )}
          {localUuid == SHA256(import.meta.env.VITE_UUID).toString() && <AddPersonForm
            onAddPerson={handleAddPerson}
            existingNames={people.map(p => p.name)}
          />}
          <PersonList
            people={people}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
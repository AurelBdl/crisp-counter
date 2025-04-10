import { useEffect, useState } from 'react';
import { Plus, Minus, X, Shuffle } from 'lucide-react';
import { Person } from '../types';
import SHA256 from 'crypto-js/sha256';

interface PersonListProps {
  people: Person[];
  onIncrement: (name: string) => void;
  onDecrement: (name: string) => void;
  onRemove: (name: string) => void;
}

export function PersonList({ people, onIncrement, onDecrement, onRemove }: PersonListProps) {
  const [localUuid, setLocalUuid] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setLocalUuid(localStorage.getItem('uuid') || '');
  }, []);

  const drawRandomPerson = () => {
    if (isDrawing || people.length === 0) return;
    
    setIsDrawing(true);
    let currentIndex = Math.floor(Math.random() * people.length);
    const totalIterations = 20;
    let iteration = 0;
    let speed = 100;

    const animate = () => {
      if (iteration >= totalIterations) {
        setIsDrawing(false);
        return;
      }

      setSelectedIndex(currentIndex);
      // Sélection aléatoire d'une nouvelle carte
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * people.length);
      } while (newIndex === currentIndex && people.length > 1);
      currentIndex = newIndex;
      iteration++;

      // Ralentir progressivement
      if (iteration > totalIterations / 2) {
        speed += 50;
      }

      setTimeout(animate, speed);
    };

    animate();
  };

  const drawLeastPointsPerson = () => {
    if (isDrawing || people.length === 0) return;
    
    // Trouver le score minimum
    const minPoints = Math.min(...people.map(person => person.count));
    // Filtrer les personnes ayant le score minimum
    const peopleWithMinPoints = people.filter(person => person.count === minPoints);
    
    setIsDrawing(true);
    let currentIndex = Math.floor(Math.random() * peopleWithMinPoints.length);
    const totalIterations = 20;
    let iteration = 0;
    let speed = 100;

    const animate = () => {
      if (iteration >= totalIterations) {
        setIsDrawing(false);
        return;
      }

      // Trouver l'index dans le tableau original
      const originalIndex = people.findIndex(p => p.name === peopleWithMinPoints[currentIndex].name);
      setSelectedIndex(originalIndex);

      // Sélection aléatoire d'une nouvelle carte parmi les personnes avec le score minimum
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * peopleWithMinPoints.length);
      } while (newIndex === currentIndex && peopleWithMinPoints.length > 1);
      currentIndex = newIndex;
      iteration++;

      // Ralentir progressivement
      if (iteration > totalIterations / 2) {
        speed += 50;
      }

      setTimeout(animate, speed);
    };

    animate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        {people.filter(person => person.count === Math.min(...people.map(person => person.count))).length > 1 && <button
          onClick={drawLeastPointsPerson}
          disabled={isDrawing || people.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Shuffle className="w-5 h-5" />
          Tirer au sort
        </button>}
        {/* <button
          onClick={drawLeastPointsPerson}
          disabled={isDrawing || people.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Shuffle className="w-5 h-5" /> 
          Tirer au sort les personnes ayant le moins de points
        </button> */}
        
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {people.map((person, index) => (
          <div
            key={person.name}
            className={`p-4 rounded-lg shadow-md border transition-colors duration-300 ${
              selectedIndex === index
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{person.name}</h3>
              <button
                onClick={() => onRemove(person.name)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                {localUuid == SHA256(import.meta.env.VITE_UUID).toString() && <X className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">{person.count}</div>
            <div className="flex justify-center gap-2">
              {localUuid == SHA256(import.meta.env.VITE_UUID).toString() && <button
                onClick={() => onDecrement(person.name)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>}
              <button
                onClick={() => onIncrement(person.name)}
                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
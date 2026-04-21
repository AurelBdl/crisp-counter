import { useEffect, useState } from 'react';
import { Plus, Minus, X, Shuffle, Check } from 'lucide-react';
import { Person } from '../types';
import SHA256 from 'crypto-js/sha256';

interface PersonListProps {
  people: Person[];
  localUuid: string;
  onIncrement: (name: string) => void;
  onDecrement: (name: string) => void;
  onRemove: (name: string) => void;
}

export function PersonList({ people, localUuid, onIncrement, onDecrement, onRemove }: PersonListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aPeopleHasBeenUpdatedToday, setAPeopleHasBeenUpdatedToday] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [onlyLowestPoints, setOnlyLowestPoints] = useState(true);

  const getTodayIncrementCount = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('todayIncrements');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.count;
    }
    return 0;
  };

  const incrementTodayCount = () => {
    const today = new Date().toDateString();
    const newCount = getTodayIncrementCount() + 1;
    localStorage.setItem('todayIncrements', JSON.stringify({ date: today, count: newCount }));
    setAPeopleHasBeenUpdatedToday(newCount >= 2);
  };

  useEffect(() => {
    setAPeopleHasBeenUpdatedToday(getTodayIncrementCount() >= 2);
  }, [people]);

  const togglePersonSelection = (name: string) => {
    setSelectedPeople(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const drawRandomPerson = () => {
    if (isDrawing || selectedPeople.length === 0) return;
    
    const selectedPeopleList = people.filter(person => selectedPeople.includes(person.name));
    if (selectedPeopleList.length === 0) return;
    
    setIsDrawing(true);
    let currentIndex = Math.floor(Math.random() * selectedPeopleList.length);
    const totalIterations = 20;
    let iteration = 0;
    let speed = 100;

    const animate = () => {
      if (iteration >= totalIterations) {
        setIsDrawing(false);
        return;
      }

      const originalIndex = people.findIndex(p => p.name === selectedPeopleList[currentIndex].name);
      setSelectedIndex(originalIndex);

      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * selectedPeopleList.length);
      } while (newIndex === currentIndex && selectedPeopleList.length > 1);
      currentIndex = newIndex;
      iteration++;

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
        <button
          onClick={() => {return onlyLowestPoints ? drawLeastPointsPerson() : drawRandomPerson()}}
          disabled={isDrawing || (onlyLowestPoints ? (people.length === 0 || people.filter(person => person.count === Math.min(...people.map(person => person.count))).length === 1) : selectedPeople.length < 2)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Shuffle className="w-5 h-5" />
          Tirer au sort
        </button>
        <label className="relative flex items-center cursor-pointer group ml-2">
          <input
            type="checkbox"
            checked={onlyLowestPoints}
            onChange={() => setOnlyLowestPoints(!onlyLowestPoints)}
            className="peer sr-only"
          />
          <div className="relative w-5 h-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:border-blue-400 dark:peer-hover:border-blue-400 transition-all duration-200 ease-in-out flex items-center justify-center shadow-sm group-hover:shadow-md">
            {onlyLowestPoints && <Check className="absolute w-3 h-3 text-white" />}
          </div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Uniquement les personnes avec le moins de points
          </span>
        </label>
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
              <div className="flex items-center gap-2">
                { !onlyLowestPoints && 
                <label className="relative flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person.name)}
                    onChange={() => togglePersonSelection(person.name)}
                    className="peer sr-only"
                  />
                  <div className="relative w-6 h-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:border-blue-400 dark:peer-hover:border-blue-400 transition-all duration-200 ease-in-out flex items-center justify-center shadow-sm group-hover:shadow-md">
                    {selectedPeople.includes(person.name) && (
                      <Check className="absolute w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="absolute -inset-2 rounded-lg bg-blue-500/0 peer-hover:bg-blue-500/5 dark:peer-hover:bg-blue-500/10 transition-colors duration-200 ease-in-out" />
                </label>
                }
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">{person.name}</h3>
              </div>
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
              {(!aPeopleHasBeenUpdatedToday || localUuid == SHA256(import.meta.env.VITE_UUID).toString()) && <button
                onClick={() => { onIncrement(person.name); if (localUuid !== SHA256(import.meta.env.VITE_UUID).toString()) incrementTodayCount(); }}
                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
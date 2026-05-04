import { useEffect, useRef, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Plus, Minus } from 'lucide-react';
import { Person } from '../types';
import SHA256 from 'crypto-js/sha256';

interface ChartProps {
  people: Person[];
  localUuid: string;
  onIncrement: (name: string) => void;
  onDecrement: (name: string) => void;
}

export function Chart({ people, localUuid, onIncrement, onDecrement }: ChartProps) {
  const counts = people.map(p => p.count);
  const minCount = Math.min(...counts);
  const chartRef = useRef<HTMLDivElement>(null);
  const [barPositions, setBarPositions] = useState<{ x: number; width: number }[]>([]);
  const [aPeopleHasBeenUpdatedToday, setAPeopleHasBeenUpdatedToday] = useState(false);

  const isAdmin = localUuid === SHA256(import.meta.env.VITE_UUID).toString();

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

  const updateBarPositions = () => {
    if (!chartRef.current) return;
    const containerRect = chartRef.current.getBoundingClientRect();
    const barAreas = chartRef.current.querySelectorAll('.apexcharts-bar-area');
    if (barAreas.length === 0) return;
    const positions = Array.from(barAreas).map(bar => {
      const rect = bar.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        width: rect.width,
      };
    });
    setBarPositions(positions);
  };

  useEffect(() => {
    const timeout = setTimeout(updateBarPositions, 300);
    return () => clearTimeout(timeout);
  }, [people]);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(() => setTimeout(updateBarPositions, 100));
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const lastUpdated = people.reduce((prev, current) => {
    const prevDate = prev.updated_at || new Date(0);
    const currentDate = current.updated_at || new Date(0);
    return (prevDate > currentDate) ? prev : current;
  });

  const options = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        distributed: true,
      },
    },
    xaxis: {
      categories: people.map(p => p.name),
      labels: {
        style: {
          colors: people.map(() => 'transparent'),
        },
      },
    },
    yaxis: {
      title: { text: '' },
      labels: { style: { colors: '#6B7280' } },
    },
    colors: people.map(p => p.count === minCount ? '#EF4444' : '#3B82F6'),
    tooltip: {
      y: { formatter: (val: number) => val.toString() },
      theme: 'dark',
      x: {
        formatter: (_val: number, opts?: { dataPointIndex: number }) =>
          people[opts?.dataPointIndex ?? 0]?.name ?? '',
      },
    },
    legend: { show: false },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
    },
  };

  const series = [{
    name: 'Count',
    data: people.map(p => p.count),
  }];

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div ref={chartRef} className="relative">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
        <div className="relative h-10 -mt-2">
          {barPositions.map((pos, i) => {
            const person = people[i];
            if (!person) return null;
            const canDecrement = isAdmin;
            const canIncrement = !aPeopleHasBeenUpdatedToday || isAdmin;
            const isLastUpdated = person.updated_at === lastUpdated.updated_at;
            const isMin = person.count === minCount;
            const labelColor = isLastUpdated
              ? 'text-blue-500'
              : isMin
              ? 'text-red-500'
              : 'text-gray-700 dark:text-gray-300';

            return (
              <div
                key={person.name}
                className="absolute flex items-center gap-1 -translate-x-1/2"
                style={{ left: pos.x }}
              >
                {canDecrement && (
                  <button
                    onClick={() => onDecrement(person.name)}
                    className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                )}
                <span
                  className={`text-xs font-medium truncate ${labelColor}`}
                  style={{ maxWidth: Math.max(pos.width - (canDecrement ? 28 : 0) - (canIncrement ? 28 : 0) - 4, 30) }}
                  title={person.name}
                >
                  {person.name}
                </span>
                {canIncrement && (
                  <button
                    onClick={() => { onIncrement(person.name); if (!isAdmin) incrementTodayCount(); }}
                    className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

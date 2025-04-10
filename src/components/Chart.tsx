import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Person } from '../types';

interface ChartProps {
  people: Person[];
}

export function Chart({ people }: ChartProps) {
  const counts = people.map(p => p.count);
  const minCount = Math.min(...counts);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'));
    }
    return false;
  });

  const lastUpdated = people.reduce((prev, current) => {
    const prevDate = prev.updated_at || new Date(0);
    const currentDate = current.updated_at || new Date(0);
    return (prevDate > currentDate) ? prev : current;
  });
  const options = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        distributed: true
      }
    },
    xaxis: {
      categories: people.map(p => p.name),
      labels: {
        style: {
          colors: people.map(p => p.updated_at === lastUpdated.updated_at ? '#3B82F6' : p.count === minCount ? '#EF4444' : darkMode ? '#FFFFFF' : '#1F2937')
        }
      }
    },
    yaxis: {
      title: {
        text: '',
      },
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    colors: people.map(p => p.count === minCount ? '#EF4444' : '#3B82F6'),
    tooltip: {
      y: {
        formatter: (val: number) => val.toString()
      },
      theme: 'dark'
    },
    legend: {
      show: false
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    }
  };

  const series = [{
    name: 'Count',
    data: people.map(p => p.count)
  }];

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
}
// src/components/EarningsChart.jsx
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getEarnings } from '../services/api';
import '../styles/EarningsChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function EarningsChart() {
  const [data, setData] = useState({ labels: [], data: [] });
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = async (range) => {
    setLoading(true);
    setError('');
    try {
      const res = await getEarnings(range);
      if (res.success) {
        setData({ labels: res.labels, data: res.data });
      } else {
        setError(res.message || 'Failed to fetch earnings');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings('7days'); // fetch default 7-day data on mount
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Earnings Overview' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString(),
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Earnings',
        data: data.data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">Earnings</div>
        <select
          className="date-filter"
          value={timeRange}
          onChange={(e) => {
            const range = e.target.value;
            setTimeRange(range);
            fetchEarnings(range);
          }}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</div>
      ) : (
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

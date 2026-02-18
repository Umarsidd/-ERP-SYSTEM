import { useEffect, useRef } from 'react';
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
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

interface ChartCardProps {
  title: string;
  titleAr: string;
  type: "line" | "bar" | "doughnut";
  data: any;
  isRTL?: boolean;
  height?: number;
  className?: string;
}

export function ChartCard({ 
  title, 
  titleAr, 
  type, 
  data, 
  isRTL = false, 
  height = 300,
  className = '' 
}: ChartCardProps) {
  const chartRef = useRef<any>(null);

  const chartOptions: ChartOptions<"line" | "bar" | "doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        rtl: isRTL,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        titleAlign: isRTL ? "right" : "left",
        bodyAlign: isRTL ? "right" : "left",
      },
    },
    scales:
      type !== "doughnut"
        ? {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
            y: {
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
          }
        : {},
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data} options={chartOptions as ChartOptions<'line'>} />;
      case 'bar':
        return <Bar ref={chartRef} data={data} options={chartOptions as ChartOptions<'bar'>} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={data} options={chartOptions as ChartOptions<'doughnut'>} />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-card border border-sidebar-border rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {isRTL ? titleAr : title}
      </h3>
      <div style={{ height: `${height}px` }} className="relative">
        {renderChart()}
      </div>
    </div>
  );
}



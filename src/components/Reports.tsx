import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Transaction, SavingsGoal } from '../types';
import { getMonthlyData, getCategoryData, formatCurrency } from '../utils/helpers';
import { BarChart3, PieChart, TrendingUp, Brain } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportsProps {
  transactions: Transaction[];
  savingsGoals?: SavingsGoal[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, savingsGoals = [] }) => {
  const monthlyData = getMonthlyData(transactions, savingsGoals);
  const categoryData = getCategoryData(transactions);

  const barChartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Receitas',
        data: monthlyData.map(data => data.income),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Despesas',
        data: monthlyData.map(data => data.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Metas',
        data: monthlyData.map(data => data.goalsImpact || 0),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Evolução Mensal',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number) {
            return formatCurrency(value as number);
          }
        }
      }
    }
  };

  const doughnutData = {
    labels: categoryData.map(data => data.category),
    datasets: [
      {
        data: categoryData.map(data => data.amount),
        backgroundColor: categoryData.map(data => data.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = categoryData.find(c => c.category === label)?.percentage || 0;
            return `${label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    },
  };

  const [showAiMessagePopup, setShowAiMessagePopup] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [buttonColorClass, setButtonColorClass] = useState('bg-blue-500');

  const generateAiMessage = () => {
    if (categoryData.length === 0) {
      setAiMessage('Adicione transações para uma análise de IA.');
      setShowAiMessagePopup(true);
      return;
    }

    setLoadingAi(true);
    // Simulate AI processing time
    setTimeout(() => {
      const predominantCategory = categoryData.reduce((prev, current) => (
        (prev.percentage > current.percentage) ? prev : current
      ));

      let message = '';
      if (predominantCategory.category === 'Dívidas' && predominantCategory.percentage > 50) {
        message = 'Cuidado, suas dívidas estão altas! Priorize o pagamento.';
      } else if (predominantCategory.category === 'Alimentação' && predominantCategory.percentage > 40) {
        message = 'Seus gastos com alimentação estão elevados. Que tal cozinhar mais?';
      } else if (predominantCategory.category === 'Transporte' && predominantCategory.percentage > 30) {
        message = 'Gastos com transporte significativos. Considere alternativas.';
      } else if (predominantCategory.category === 'Lazer' && predominantCategory.percentage > 20) {
        message = 'Aproveite o lazer, mas com moderação para suas finanças.';
      } else {
        message = `Sua maior despesa é em ${predominantCategory.category}. Fique de olho!`;
      }
      setAiMessage(message);
      setLoadingAi(false);
      setShowAiMessagePopup(true);
    }, 3500); // 2 second delay
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAiMessagePopup) {
      setCountdown(10);
      setButtonColorClass('bg-blue-500'); // Reset color when popup opens
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAiMessagePopup(false);
            return 0;
          }
          // Update button color based on countdown
          if (prev === 5) setButtonColorClass('bg-blue-500');
          else if (prev === 4) setButtonColorClass('bg-blue-400');
          else if (prev === 3) setButtonColorClass('bg-yellow-500');
          else if (prev === 2) setButtonColorClass('bg-orange-500');
          else if (prev === 1) setButtonColorClass('bg-red-500');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAiMessagePopup]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 mb-2">Nenhum dado para exibir</p>
        <p className="text-sm text-slate-500">
          Adicione algumas transações para ver os relatórios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Relatórios Financeiros
        </h1>
        <p className="text-slate-600">
          Análise detalhada das suas finanças
        </p>
      </div>

      {showAiMessagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center relative">
            <h3 className="text-lg font-semibold mb-4">Insight de IA</h3>
            <p className="text-slate-700 mb-6">{aiMessage}</p>
            <button
              onClick={() => setShowAiMessagePopup(false)}
              className={`${buttonColorClass} hover:opacity-80 text-white font-bold py-2 px-4 rounded-full transition-all duration-500 ease-in-out`}
            >
              Fechar ({countdown})
            </button>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">
              Evolução Mensal
            </h2>
            <p className="text-sm text-slate-600 truncate">
              Receitas vs Despesas vs Metas nos últimos 6 meses
            </p>
          </div>
        </div>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        {loadingAi && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl z-40">
            <p className="text-white text-lg font-semibold">Gerando Relatório IA...</p>
          </div>
        )}

        <button
          onClick={generateAiMessage}
          className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ease-in-out transform hover:scale-110 animate-pulse"
          aria-label="Gerar insights de IA"
          disabled={loadingAi}
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>
      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-800 truncate">
                Gastos por Categoria
              </h2>
              <p className="text-sm text-slate-600 truncate">
                Distribuição das suas despesas pagas
              </p>
            </div>
          </div>
          <div className="h-64 mb-6">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          
          {/* Category Details */}
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-slate-800 truncate">
                    {category.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(category.amount)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthlyData.slice(-3).map((month, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 truncate">
              {month.month}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 truncate pr-2">Receitas</span>
                <span className="font-medium text-green-600 flex-shrink-0">
                  {formatCurrency(month.income)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 truncate pr-2">Despesas</span>
                <span className="font-medium text-red-600 flex-shrink-0">
                  {formatCurrency(month.expenses)}
                </span>
              </div>
              {month.goalsImpact && month.goalsImpact > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-2">Metas</span>
                  <span className="font-medium text-amber-600 flex-shrink-0">
                    {formatCurrency(month.goalsImpact)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-medium text-slate-800 truncate pr-2">Saldo</span>
                <span className={`font-semibold flex-shrink-0 ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(month.balance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 时间范围类型
type TimeRange = 'day' | 'week' | 'month' | 'year';

// 模拟数据
const mockReportData = {
  day: [
    { name: '餐饮', value: 1200 },
    { name: '购物', value: 800 },
    { name: '交通', value: 450 },
    { name: '娱乐', value: 300 },
    { name: '其他', value: 469 }
  ],
  week: [
    { name: '周一', value: 800 },
    { name: '周二', value: 1200 },
    { name: '周三', value: 900 },
    { name: '周四', value: 1100 },
    { name: '周五', value: 1500 },
    { name: '周六', value: 2000 },
    { name: '周日', value: 1800 }
  ],
  month: [
    { name: '第1周', value: 4500 },
    { name: '第2周', value: 5200 },
    { name: '第3周', value: 4800 },
    { name: '第4周', value: 5500 }
  ],
  year: [
    { name: '1月', value: 12000 },
    { name: '2月', value: 13500 },
    { name: '3月', value: 14200 },
    { name: '4月', value: 15000 },
    { name: '5月', value: 15800 },
    { name: '6月', value: 14500 }
  ]
};

// 获取分类统计数据
function getCategoryStats() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const categories = [
    '工资', '报销', '硬件', '提成', '佣金', '安装', '办公室费用', '税收',
    '过节费用', '财务', '贷款利息', '社保', '展会', '贷款中介费', '软装申请费', '理账', '网络', '其他'
  ];

  return categories.map(category => {
    const categoryTransactions = transactions.filter((tx: any) => tx.category === category);
    const income = categoryTransactions
      .filter((tx: any) => tx.amount > 0)
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const expense = categoryTransactions
      .filter((tx: any) => tx.amount < 0)
      .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

    return {
      category,
      income,
      expense
    };
  });
}

export default function Report() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [chartData, setChartData] = useState(mockReportData.month);

  // 根据时间范围更新图表数据
  useEffect(() => {
    setChartData(mockReportData[timeRange]);
  }, [timeRange]);

  // 处理自定义日期范围变化
  const handleCustomRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 应用自定义日期范围
  const applyCustomRange = () => {
    toast.success(`已应用自定义范围: ${customRange.start} 至 ${customRange.end}`);
    // 这里可以添加实际的数据过滤逻辑
  };

  // 导出报表
  const exportReport = () => {
    toast.success('报表导出成功 (模拟)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 导航栏 - 与仪表盘一致 */}
      <nav className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-wallet text-2xl text-teal-600"></i>
          <h1 className="text-xl font-bold text-gray-800">智能财务助手</h1>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="rounded-lg px-4 py-2 font-medium text-teal-600 hover:bg-teal-50"
          >
            仪表盘
          </button>
          <button 
            onClick={() => navigate('/transaction')}
            className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
          >
            记账
          </button>
          <button 
            onClick={() => navigate('/report')}
            className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
          >
            报表
          </button>
        </div>
      </nav>

      {/* 筛选区域 */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">统计报表</h2>
        
        <div className="space-y-4">
          {/* 时间范围快捷选项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">时间范围</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['day', 'week', 'month', 'year'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm',
                    timeRange === range 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {{
                    day: '日',
                    week: '周',
                    month: '月',
                    year: '年'
                  }[range]}
                </button>
              ))}
            </div>
          </div>

          {/* 自定义日期范围 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">自定义范围</label>
               <div className="mt-2 space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div>
                  <input
                    type="date"
                    name="start"
                    value={customRange.start}
                    onChange={handleCustomRangeChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="end"
                    value={customRange.end}
                    onChange={handleCustomRangeChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={applyCustomRange}
                className="w-full rounded-md bg-teal-600 py-2 px-4 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* 图表区域 */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 支出统计 */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">支出统计</h3>
              <button
                onClick={exportReport}
                className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                <i className="fa-solid fa-download mr-2"></i>
                导出报表
              </button>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="金额(元)" fill="#20B2AA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 分类统计 */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="mb-4 text-lg font-semibold">分类统计</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getCategoryStats()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="收入" fill="#4CAF50" />
                  <Bar dataKey="expense" name="支出" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    </div>
  );
}

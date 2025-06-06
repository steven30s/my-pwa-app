import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as ChartLegend, ReferenceLine, ResponsiveContainer as LineResponsiveContainer } from 'recharts';
import { categoryData, trendData } from '@/mocks/dashboard';
import { toast } from 'sonner';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#20B2AA', '#008080'];

// 计算财务概览和图表数据
function calculateFinancialOverview() {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  
  // 计算收支总额
  const income = transactions
    .filter((tx: any) => tx.amount > 0)
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  const expense = transactions
    .filter((tx: any) => tx.amount < 0)
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  // 按分类统计支出
  const categoryStats = transactions
    .filter((tx: any) => tx.amount < 0)
    .reduce((acc: any, tx: any) => {
      const category = tx.category || '其他';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(tx.amount);
      return acc;
    }, {});

  const categoryData = Object.entries(categoryStats).map(([name, amount]) => ({
    name,
    amount,
    percentage: ((amount as number) / expense * 100).toFixed(1) + '%'
  }));

  // 按月统计趋势
  const monthlyStats = transactions.reduce((acc: any, tx: any) => {
    const date = new Date(tx.date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    
    if (tx.amount > 0) {
      acc[month].income += tx.amount;
    } else {
      acc[month].expense += Math.abs(tx.amount);
    }
    
    return acc;
  }, {});

  const trendData = Object.entries(monthlyStats)
    .map(([month, data]: any) => ({
      month,
      income: data.income,
      expense: data.expense
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    balance: income - expense,
    income,
    expense,
    categoryData,
    trendData
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [financialOverview, setFinancialOverview] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    categoryData: [],
    trendData: []
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'month' | 'year' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // 从localStorage加载数据并计算财务概览
  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(transactions);
    const overview = calculateFinancialOverview();
    setFinancialOverview(overview);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* 导航栏 - 移动端优化 */}
      <nav className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-wallet text-2xl text-teal-600"></i>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">智能财务助手</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium bg-teal-100 text-teal-700 border-2 border-teal-200 hover:bg-teal-200"
          >
            <i className="fa-solid fa-chart-pie mr-1"></i>收支总览
          </button>
          <button 
            onClick={() => navigate('/transaction')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-pen-to-square mr-1"></i>记账
          </button>
          <button 
            onClick={() => navigate('/records')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-list-check mr-1"></i>交易记录
          </button>
        </div>
      </nav>

      {/* 财务概览卡片 - 移动端优化 */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3">
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base text-gray-500">当前余额</h3>
            <i className="fa-solid fa-coins text-teal-500"></i>
          </div>
          <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold">¥{financialOverview.balance.toFixed(2)}</p>
        </div>
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base text-gray-500">收入</h3>
            <i className="fa-solid fa-arrow-down text-green-500"></i>
          </div>
          <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-green-500">+¥{financialOverview.income.toFixed(2)}</p>
        </div>
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between">
             <h3 className="text-sm sm:text-base text-gray-500">支出</h3>
            <i className="fa-solid fa-arrow-up text-red-500"></i>
          </div>
          <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-red-500">-¥{financialOverview.expense.toFixed(2)}</p>
          
          <button
            onClick={() => {
              if (window.confirm('确定要清空所有交易数据吗？此操作不可撤销！')) {
                localStorage.removeItem('transactions');
                const overview = calculateFinancialOverview();
                setFinancialOverview(overview);
                toast.success('数据已清空');
              }
            }}
            className="mt-2 w-full rounded-md bg-red-100 py-1.5 text-sm text-red-600 hover:bg-red-200"
          >
            <i className="fa-solid fa-trash mr-1"></i>清空数据
          </button>
        </div>
      </div>

      {/* 图表区域 - 移动端优化 */}

      {/* 图表区域 - 移动端优化 */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 gap-3 sm:gap-6">
        {/* 钱去哪了 - 消费分类饼图 */}
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base font-semibold">钱去哪了</h3>
          <div className="h-[180px] sm:h-[250px]">
            {financialOverview.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialOverview.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={30}
                    paddingAngle={2}
                    dataKey="amount"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      name,
                      percentage,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      // 根据屏幕宽度调整标签位置
                      const isMobile = window.innerWidth < 640;
                      const radius = isMobile ? outerRadius + 5 : outerRadius + 10;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      // 限制标签最大宽度
                      const maxWidth = isMobile ? 60 : 80;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={COLORS[index % COLORS.length]}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-[10px] sm:text-xs font-medium"
                          style={{
                            maxWidth: `${maxWidth}px`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {`${name} ${percentage}`}
                        </text>
                      );
                    }}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {financialOverview.categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`¥${value.toLocaleString()}`, '金额']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                暂无消费数据
              </div>
            )}
          </div>
        </div>

        {/* 数据分析模块 */}
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
          <h3 className="mb-2 sm:mb-3 text-sm sm:text-base font-semibold">数据分析</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 数据概览卡片 */}
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">数据概览</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">交易总数</span>
                  <span className="font-medium">{transactions.length}笔</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">收入交易</span>
                  <span className="font-medium text-green-500">
                    {transactions.filter(tx => tx.amount > 0).length}笔
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">支出交易</span>
                  <span className="font-medium text-red-500">
                    {transactions.filter(tx => tx.amount < 0).length}笔
                  </span>
                </div>
              </div>
            </div>

            {/* 异常检测卡片 */}
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">异常检测</h4>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    最大收入: <span className="font-medium text-green-500">
                      ¥{Math.max(...transactions.filter(tx => tx.amount > 0).map(tx => tx.amount), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    最大支出: <span className="font-medium text-red-500">
                      ¥{Math.max(...transactions.filter(tx => tx.amount < 0).map(tx => Math.abs(tx.amount)), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-gray-400 py-2">暂无异常数据</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 快速记账入口 */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate('/transaction')}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl"
        >
          <i className="fa-solid fa-plus text-lg sm:text-xl"></i>
        </button>
      </div>
    </div>
  );
}
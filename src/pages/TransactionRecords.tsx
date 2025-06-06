import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function TransactionRecords() {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<'month' | 'year' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // 计算时间范围内的交易
  const filteredByTime = useMemo(() => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else {
      startDate = new Date(customRange.start);
      endDate = new Date(customRange.end);
    }

    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [allTransactions, timeRange, customRange]);

  // 计算统计信息
  const stats = useMemo(() => {
    const income = filteredByTime
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expense = filteredByTime
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredByTime]);

  // 从localStorage加载数据
  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setAllTransactions(transactions);
    setFilteredTransactions(transactions);
  }, []);

  // 处理搜索和时间范围变化
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(filteredByTime);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = filteredByTime.filter((tx: any) => {
        const date = new Date(tx.date).toLocaleDateString();
        return (
          (tx.category?.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (tx.note?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.amount.toString().includes(searchTerm)) ||
          (date.includes(searchTerm))
        );
      });
      setFilteredTransactions(filtered);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filteredByTime]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* 导航栏 */}
      <nav className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-wallet text-2xl text-teal-600"></i>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">智能财务助手</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-chart-pie mr-1"></i>收支总览
          </button>
          <button 
            onClick={() => navigate('/transaction')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-pen-to-square mr-1"></i>记账
          </button>
          <button 
            onClick={() => navigate('/records')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium bg-teal-100 text-teal-700 border-2 border-teal-200 hover:bg-teal-200"
          >
            <i className="fa-solid fa-list-check mr-1"></i>交易记录
          </button>
        </div>
      </nav>

      {/* 搜索和筛选区域 */}
      <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
        <h3 className="mb-2 sm:mb-3 text-sm sm:text-base font-semibold">交易记录查询</h3>
          
        {/* 搜索框 */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="搜索交易记录(分类/备注/金额/日期)..."
            className="w-full rounded-md border p-2 text-sm focus:border-teal-500 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 时间范围选择 */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setTimeRange('month')}
            className={`rounded-full px-3 py-1.5 text-sm ${timeRange === 'month' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
          >
            本月
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`rounded-full px-3 py-1.5 text-sm ${timeRange === 'year' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
          >
            本年
          </button>
          <button
            onClick={() => setTimeRange('custom')}
            className={`rounded-full px-3 py-1.5 text-sm ${timeRange === 'custom' ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
          >
            自定义
          </button>
          {timeRange === 'custom' && (
            <div className="mt-2 w-full flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div className="text-center text-sm text-gray-500 sm:hidden">至</div>
              <div className="flex-1">
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="text-sm text-gray-500">总收入</div>
          <div className="text-lg font-bold text-green-500">¥{stats.income.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="text-sm text-gray-500">总支出</div>
          <div className="text-lg font-bold text-red-500">¥{stats.expense.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="text-sm text-gray-500">净余额</div>
          <div className="text-lg font-bold">¥{stats.balance.toFixed(2)}</div>
        </div>
      </div>

      {/* 交易记录列表 */}
      <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-4 shadow-sm sm:shadow-md">
        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
          <h3 className="mb-2 text-sm font-medium text-gray-500">所有交易记录</h3>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${tx.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-base text-gray-800">{tx.category || (tx.amount > 0 ? '收入' : '支出')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {tx.amount > 0 ? '+' : '-'}¥{Math.abs(parseFloat(tx.amount)).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {tx.note && (
                  <div className="mt-1 ml-4 text-sm text-gray-500 truncate max-w-[90%]">
                    备注: {tx.note}
                  </div>
                )}
                <div className="mt-2 flex justify-end space-x-2">
                  <button 
                    onClick={() => navigate(`/transaction?edit=${tx.id}`)}
                    className="rounded-md bg-teal-100 px-2 py-1 text-xs text-teal-700 hover:bg-teal-200"
                  >
                    <i className="fa-solid fa-pen mr-1"></i>编辑
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('确定要删除这条记录吗？')) {
                        const updated = allTransactions.filter(t => t.id !== tx.id);
                        localStorage.setItem('transactions', JSON.stringify(updated));
                        setAllTransactions(updated);
                      }
                    }}
                    className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                  >
                    <i className="fa-solid fa-trash mr-1"></i>删除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-400 py-4">暂无交易记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
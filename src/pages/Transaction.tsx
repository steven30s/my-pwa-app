import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 表单验证规则
const transactionSchema = z.object({
  amount: z.number().min(0.01, '金额必须大于0'),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1, '请选择日期')

});

type TransactionFormData = z.infer<typeof transactionSchema>;

// 分类选项
const categories = [
  { value: '工资', label: '工资' },
  { value: '报销', label: '报销' },
  { value: '硬件', label: '硬件' },
  { value: '提成', label: '提成' },
  { value: '佣金', label: '佣金' },
  { value: '安装', label: '安装' },
  { value: '办公室费用', label: '办公室费用' },
  { value: '税收', label: '税收' },
  { value: '过节费用', label: '过节费用' },
  { value: '财务', label: '财务' },
  { value: '贷款利息', label: '贷款利息' },
  { value: '社保', label: '社保' },
  { value: '展会', label: '展会' },
  { value: '贷款中介费', label: '贷款中介费' },
  { value: '软装申请费', label: '软装申请费' },
  { value: '理账', label: '理账' },
  { value: '网络', label: '网络' },
  { value: '其他', label: '其他' }
];

export default function Transaction() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      date: currentDate
    }
  });

  // 加载编辑数据
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const tx = transactions.find((t: any) => t.id === editId);
      if (tx) {
        setIsEditing(true);
        setEditId(editId);
        reset({
          amount: Math.abs(tx.amount),
          type: tx.amount > 0 ? 'income' : 'expense',
          category: tx.category || '',
          note: tx.note || '',
          date: tx.date
        });
      }
    }
  }, [reset]);

  // 自动分类功能
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.note && value.note.length > 1) {
        const matched = categories
          .filter(cat => value.note?.toLowerCase().includes(cat.value.toLowerCase()))
          .map(cat => cat.value);
        setSuggestedCategories(matched);
        
        if (matched.length === 1) {
          setValue('category', matched[0]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // 提交表单
  const onSubmit = (data: TransactionFormData) => {
    try {
      // 获取现有交易记录
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      
      // 根据类型处理金额
      const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
      
      if (isEditing) {
        // 更新现有记录
        const index = transactions.findIndex((t: any) => t.id === editId);
        if (index !== -1) {
          transactions[index] = {
            ...data,
            amount,
            id: editId,
            category: data.type === 'income' ? '' : data.category
          };
          toast.success('交易记录已更新');
        }
      } else {
        // 添加新交易
        transactions.push({
          ...data,
          amount,
          id: Date.now().toString(),
          // 如果是收入，清空分类
          category: data.type === 'income' ? '' : data.category
        });
        toast.success('交易记录已保存');
      }
      
      // 保存到本地存储
      localStorage.setItem('transactions', JSON.stringify(transactions));
      
      // 重置表单
      reset({
        amount: 0,
        type: 'income',
        category: '',
        note: '',
        date: currentDate
      });
      setIsEditing(false);
      setEditId('');
      
    } catch (error) {
      toast.error('保存失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* 导航栏 - 移动端优化 */}
      <nav className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-wallet text-2xl text-teal-600"></i>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">智能财务助手</h1>
        </div>
        <div className="flex space-x-2 sm:space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-chart-pie mr-1"></i>收支总览
          </button>
          <button 
            onClick={() => navigate('/transaction')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium bg-teal-100 text-teal-700 border-2 border-teal-200 hover:bg-teal-200"
          >
            <i className="fa-solid fa-pen-to-square mr-1"></i>记账
          </button>
          <button 
            onClick={() => navigate('/records')}
            className="rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-teal-700 hover:bg-teal-50"
          >
            <i className="fa-regular fa-list-check mr-1"></i>交易记录
          </button>
        </div>
      </nav>

      {/* 记账表单 - 移动端优化 */}
      <div className="mx-auto w-full max-w-md px-2 sm:px-0">
        <div className="rounded-lg sm:rounded-xl bg-white p-3 sm:p-6 shadow-sm sm:shadow-md">
          <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-gray-800">记录收支</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {/* 类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">类型</label>
              <div className="mt-1 flex gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="income"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                    {...register('type')}
                  />
                  <span className="ml-2 text-sm">收入</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                    {...register('type')}
                  />
                  <span className="ml-2 text-sm">支出</span>
                </label>
              </div>
            </div>

            {/* 金额输入 */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                金额
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 text-sm">¥</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  className={cn(
                    'block w-full rounded-md border-gray-300 pl-8 pr-12 py-2 text-sm focus:border-teal-500 focus:ring-teal-500',
                    errors.amount && 'border-red-500'
                  )}
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* 分类选择 - 仅支出显示 */}
            {watch('type') === 'expense' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  分类
                </label>
                <select
                  id="category"
                  className={cn(
                    'mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500',
                    errors.category && 'border-red-500'
                  )}
                  {...register('category')}
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
                )}
                
                {/* 自动分类建议 */}
                {suggestedCategories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">可能匹配的分类:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {suggestedCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-800"
                          onClick={() => setValue('category', cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 备注 - 增强显示效果 */}
            <div className="mt-4">
              <label htmlFor="note" className="flex items-center text-sm font-medium text-gray-700">
                <i className="fa-solid fa-note-sticky mr-2 text-teal-600"></i>
                <span>备注信息</span>
              </label>
              <input
                type="text"
                id="note"
                className={cn(
                  "mt-2 block w-full rounded-lg border-2 border-teal-100 py-2 px-4 text-sm",
                  "focus:border-teal-500 focus:ring-2 focus:ring-teal-200",
                  "shadow-sm transition-all duration-200 hover:border-teal-200"
                )}
                placeholder="可输入交易详情或备注说明"
                {...register('note')}
              />
            </div>

            {/* 日期选择 */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                日期
              </label>
              <input
                type="date"
                id="date"
                className={cn(
                  'mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-teal-500 focus:ring-teal-500',
                  errors.date && 'border-red-500'
                )}
                {...register('date')}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                className="w-full rounded-md bg-teal-600 py-2 px-4 text-sm sm:text-base text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                 {isEditing ? '更新记录' : '保存记录'}
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
}

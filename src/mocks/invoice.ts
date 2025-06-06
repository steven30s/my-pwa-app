// 从本地存储获取交易记录
export function getTransactions() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}
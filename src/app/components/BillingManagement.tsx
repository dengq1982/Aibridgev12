import { useState } from 'react';
import { ArrowLeft, CreditCard, TrendingUp, AlertTriangle, Download, Search, Calendar, Filter, RefreshCw, Plus, X } from 'lucide-react';

interface BillingManagementProps {
  onBack: () => void;
  currentTenant: string;
}

interface BillingRecord {
  id: string;
  tenant: string;
  date: string;
  formName: string;
  action: string;
  credits: number;
  operator: string;
  type?: 'consume' | 'recharge'; // 新增类型字段
}

export function BillingManagement({ onBack, currentTenant }: BillingManagementProps) {
  const [selectedTenant, setSelectedTenant] = useState(currentTenant);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  // Mock tenant credits data
  const [tenantCredits, setTenantCredits] = useState({
    '华强集团': { total: 100, used: 45, remaining: 55 },
    '鑫源机械': { total: 100, used: 12, remaining: 88 },
    '宏达化工': { total: 100, used: 89, remaining: 11 },
  });

  // Mock billing records
  const [records, setRecords] = useState<BillingRecord[]>([
    {
      id: '1',
      tenant: '华强集团',
      date: '2026-03-31 14:23',
      formName: '供应商报价单',
      action: '创建表单',
      credits: 10,
      operator: '张伟',
      type: 'consume',
    },
    {
      id: '2',
      tenant: '华强集团',
      date: '2026-03-31 10:15',
      formName: '资产盘点表',
      action: '修改表单',
      credits: 5,
      operator: '李雷',
      type: 'consume',
    },
    {
      id: '3',
      tenant: '华强集团',
      date: '2026-03-30 16:45',
      formName: '客户信息登记',
      action: '创建表单',
      credits: 10,
      operator: '王强',
      type: 'consume',
    },
    {
      id: '4',
      tenant: '华强集团',
      date: '2026-03-30 09:30',
      formName: '供应商报价单',
      action: '修改表单',
      credits: 5,
      operator: '张伟',
      type: 'consume',
    },
    {
      id: '5',
      tenant: '华强集团',
      date: '2026-03-29 14:20',
      formName: '采购申请单',
      action: '创建表单',
      credits: 10,
      operator: '李雷',
      type: 'consume',
    },
    {
      id: '6',
      tenant: '华强集团',
      date: '2026-03-29 11:10',
      formName: '资产盘点表',
      action: '修改表单',
      credits: 5,
      operator: '王强',
      type: 'consume',
    },
  ]);

  const currentCredits = tenantCredits[selectedTenant as keyof typeof tenantCredits] || tenantCredits['华强集团'];
  const filteredRecords = records.filter(
    (record) => 
      record.tenant === selectedTenant &&
      (searchKeyword === '' || 
        record.formName.includes(searchKeyword) ||
        record.operator.includes(searchKeyword) ||
        record.action.includes(searchKeyword))
  );

  const exportBilling = () => {
    alert('导出账单功能');
  };

  const handleRecharge = () => {
    if (rechargeAmount) {
      const newCredits = parseInt(rechargeAmount, 10);
      const updatedCredits = {
        ...currentCredits,
        total: currentCredits.total + newCredits,
        remaining: currentCredits.remaining + newCredits,
      };
      setTenantCredits({
        ...tenantCredits,
        [selectedTenant]: updatedCredits,
      });
      const newRecord: BillingRecord = {
        id: (records.length + 1).toString(),
        tenant: selectedTenant,
        date: new Date().toISOString().slice(0, 16),
        formName: '充值',
        action: '充值积分',
        credits: newCredits,
        operator: '系统',
        type: 'recharge',
      };
      setRecords([...records, newRecord]);
      setShowRechargeModal(false);
      setRechargeAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="返回"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">积分账单管理</h1>
              <p className="text-sm text-slate-600 mt-1">查看和管理租户积分使用情况</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Selector */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">选择租户：</label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="华强集团">华强集团</option>
                <option value="鑫源机械">鑫源机械</option>
                <option value="宏达化工">宏达化工</option>
              </select>
              
              <button
                onClick={() => setShowRechargeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">充值积分</span>
              </button>
            </div>
            
            <button
              onClick={() => alert('刷新数据')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">刷新</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Credits Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">积分概览</h3>
          <div className="grid grid-cols-3 gap-6">
            {/* Total Credits */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700">总积分</span>
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{currentCredits.total}</div>
              <div className="text-xs text-blue-600 mt-1">免费额度</div>
            </div>

            {/* Used Credits */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700">已使用</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">{currentCredits.used}</div>
              <div className="text-xs text-purple-600 mt-1">
                使用率 {Math.round((currentCredits.used / currentCredits.total) * 100)}%
              </div>
            </div>

            {/* Remaining Credits */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
              currentCredits.remaining < 20
                ? 'from-red-50 to-red-100 border-red-200'
                : 'from-green-50 to-green-100 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${currentCredits.remaining < 20 ? 'text-red-700' : 'text-green-700'}`}>
                  剩余积分
                </span>
                {currentCredits.remaining < 20 && <AlertTriangle className="w-5 h-5 text-red-600" />}
              </div>
              <div className={`text-3xl font-bold ${currentCredits.remaining < 20 ? 'text-red-900' : 'text-green-900'}`}>
                {currentCredits.remaining}
              </div>
              {currentCredits.remaining < 20 && (
                <div className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ 积分不足，请联系商务
                </div>
              )}
            </div>
          </div>

          {/* Credits Alert */}
          {currentCredits.remaining < 20 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">积分即将用尽</h4>
                <p className="text-sm text-red-700 mb-2">
                  当前租户剩余积分不足 20，表单设计功能即将受限。请及时联系商务人员充值。
                </p>
                <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  联系商务充值
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Billing Records */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Filters */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">账单明细</h3>
              <button
                onClick={exportBilling}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm shadow-sm"
              >
                <Download className="w-4 h-4" />
                导出账单
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索表单名称、操作人..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-slate-500">至</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">表单名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作类型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作人</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-700">消耗积分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{record.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{record.formName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          record.type === 'recharge'
                            ? 'bg-green-50 text-green-700'
                            : record.action === '创建表单'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {record.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.operator}</td>
                      <td className="px-4 py-3 text-right">
                        {record.type === 'recharge' ? (
                          <span className="text-sm font-semibold text-green-600">+{record.credits}</span>
                        ) : (
                          <span className="text-sm font-semibold text-red-600">-{record.credits}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      总计消耗积分：
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-red-600">
                        -{filteredRecords.reduce((sum, r) => sum + r.credits, 0)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">充值积分</h3>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">租户名称</label>
              <div className="px-4 py-2 bg-slate-50 rounded-lg text-sm text-slate-900 font-medium">
                {selectedTenant}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">充值积分数量</label>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="请输入充值积分数量"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="1"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">充值说明</label>
              <textarea
                placeholder="请输入充值说明（选填）"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">记录本次充值的相关说明信息</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                disabled={!rechargeAmount || parseInt(rechargeAmount) <= 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认充值
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

interface SubmissionRecord {
  id: string;
  supplierName: string;
  status: 'not_visited' | 'visited' | 'submitted' | 'modified';
  firstSubmitTime: string;
  lastModifyTime: string;
  oaStatus: 'success' | 'pending' | 'failed';
}

export function SubmissionDataPage({ onBack }: { onBack: () => void }) {
  // 填写数据统计
  const submissionStats = {
    totalVisits: 156, // 总访问次数
    totalVisitors: 132, // 总访问人数
    submitted: 118, // 提交数
    oaSuccess: 112, // 对接成功数
    oaFailed: 6, // 对接失败数
  };

  // 填写数据明细
  const submissionRecords: SubmissionRecord[] = [
    {
      id: 'sub-1',
      supplierName: '华强电子有限公司',
      status: 'submitted',
      firstSubmitTime: '2026-03-14 09:15:22',
      lastModifyTime: '2026-03-14 09:15:22',
      oaStatus: 'success',
    },
    {
      id: 'sub-2',
      supplierName: '鑫源机械制造',
      status: 'modified',
      firstSubmitTime: '2026-03-14 10:22:35',
      lastModifyTime: '2026-03-14 14:18:42',
      oaStatus: 'success',
    },
    {
      id: 'sub-3',
      supplierName: '宏达化工材料',
      status: 'visited',
      firstSubmitTime: '-',
      lastModifyTime: '-',
      oaStatus: 'pending',
    },
    {
      id: 'sub-4',
      supplierName: '优质包装材料',
      status: 'not_visited',
      firstSubmitTime: '-',
      lastModifyTime: '-',
      oaStatus: 'pending',
    },
  ];

  const statusLabels = {
    not_visited: { label: '未访问', color: 'bg-slate-100 text-slate-700' },
    visited: { label: '已访问未提交', color: 'bg-blue-100 text-blue-700' },
    submitted: { label: '已提交', color: 'bg-green-100 text-green-700' },
    modified: { label: '已修改', color: 'bg-purple-100 text-purple-700' },
  };

  const oaStatusLabels = {
    success: { label: '已回传', icon: CheckCircle, color: 'text-green-600' },
    pending: { label: '待推送', icon: Clock, color: 'text-orange-600' },
    failed: { label: '回传失败', icon: AlertCircle, color: 'text-red-600' },
  };

  const handleExportExcel = () => {
    alert('导出Excel功能：包含所有填写数据和OA回传状态');
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="返回应用列表"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">填写数据</h1>
            <p className="text-sm text-slate-600 mt-1">查看表单填写数据和OA回传状态</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 space-y-6">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>供应商入驻表单</option>
                <option>采购报价表单</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出 Excel
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-slate-600 text-xs mb-1">总访问次数</p>
              <p className="text-2xl font-bold text-slate-900">{submissionStats.totalVisits}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-700 text-xs mb-1">总访问人数</p>
              <p className="text-2xl font-bold text-blue-900">{submissionStats.totalVisitors}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-700 text-xs mb-1">已提交数</p>
              <p className="text-2xl font-bold text-green-900">{submissionStats.submitted}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-orange-700 text-xs mb-1">对接成功数</p>
              <p className="text-2xl font-bold text-orange-900">{submissionStats.oaSuccess}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-purple-700 text-xs mb-1">对接失败数</p>
              <p className="text-2xl font-bold text-purple-900">{submissionStats.oaFailed}</p>
            </div>
          </div>

          {/* Data Table */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">填写数据明细</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">填写人</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">提交状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">首次提交时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">最后修改时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">OA回传状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {submissionRecords.map((record) => {
                    const statusInfo = statusLabels[record.status];
                    const oaInfo = oaStatusLabels[record.oaStatus];
                    const OaIcon = oaInfo.icon;
                    
                    return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{record.supplierName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{record.firstSubmitTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{record.lastModifyTime}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <OaIcon className={`w-4 h-4 ${oaInfo.color}`} />
                            <span className={`text-xs ${oaInfo.color}`}>{oaInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
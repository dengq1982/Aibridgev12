import { useState } from 'react';
import { Activity, Database, FileText, Shield, RefreshCw, Download, X, AlertCircle, CheckCircle, Clock, Search, Filter, Calendar, MessageSquare, Mail, Users } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

type SubTabType = 'submission' | 'interface' | 'sms' | 'email' | 'audit';

interface InterfaceLog {
  id: string;
  failTime: string;
  supplierName: string;
  phone: string;
  submitTime: string; // 新增提交时间
  oaFormId: string;
  errorCode: string;
  errorMessage: string;
  retryCount: number;
  status: 'pending' | 'retrying' | 'failed' | 'success';
}

interface SubmissionRecord {
  id: string;
  supplierName: string;
  status: 'not_visited' | 'visited' | 'submitted' | 'modified';
  firstSubmitTime: string;
  lastModifyTime: string;
  oaStatus: 'success' | 'pending' | 'failed';
}

interface AuditLog {
  id: string;
  operatorName: string;
  operationType: string;
  operationTime: string;
  operationObject: string;
  result: string;
}

interface SmsRecord {
  id: string;
  templateName: string;
  sendTime: string;
  recipient: string;
  status: 'success' | 'failed';
  smsCount: number;
  failReason?: string;
}

interface EmailRecord {
  id: string;
  templateName: string;
  sendTime: string;
  recipients: string[]; // 支持多个收件人
  status: 'success' | 'failed';
  failReason?: string;
}

export function AnalyticsDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('submission');
  const [timeRange, setTimeRange] = useState('today');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');

  // 填报数据筛选
  const [submissionTemplateFilter, setSubmissionTemplateFilter] = useState('all');
  const [submissionFormFilter, setSubmissionFormFilter] = useState('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('all');
  const [submissionStartDate, setSubmissionStartDate] = useState('');
  const [submissionEndDate, setSubmissionEndDate] = useState('');

  // 短信记录筛选
  const [smsTemplateFilter, setSmsTemplateFilter] = useState('all');
  const [smsStatusFilter, setSmsStatusFilter] = useState('all');
  const [smsRecipientFilter, setSmsRecipientFilter] = useState('');

  // 邮件记录筛选
  const [emailTemplateFilter, setEmailTemplateFilter] = useState('all');
  const [emailStatusFilter, setEmailStatusFilter] = useState('all');
  const [emailRecipientFilter, setEmailRecipientFilter] = useState('');

  // 接口统计数据
  const interfaceStats = {
    totalSent: 328,
    oaPassed: 312,
    failed: 16,
    successRate: 95.1,
  };

  // 失败记录列表
  const [failedLogs, setFailedLogs] = useState<InterfaceLog[]>([
    {
      id: 'log-1',
      failTime: '2026-03-14 14:23:15',
      supplierName: '华强电子有限公司',
      phone: '13800138000',
      submitTime: '2026-03-14 14:23:15', // 新增提交时间
      oaFormId: 'OA_FORM_20260314_001',
      errorCode: '401',
      errorMessage: '鉴权失败：RestId密码错误',
      retryCount: 3,
      status: 'failed',
    },
    {
      id: 'log-2',
      failTime: '2026-03-14 13:45:22',
      supplierName: '鑫源机械制造',
      phone: '13900139000',
      submitTime: '2026-03-14 13:45:22', // 新增提交时间
      oaFormId: 'OA_FORM_20260314_002',
      errorCode: '504',
      errorMessage: '连接超时：OA服务器无响应',
      retryCount: 2,
      status: 'pending',
    },
    {
      id: 'log-3',
      failTime: '2026-03-14 12:18:33',
      supplierName: '宏达化工材料',
      phone: '13700137000',
      submitTime: '2026-03-14 12:18:33', // 新增提交时间
      oaFormId: 'OA_FORM_20260314_003',
      errorCode: '422',
      errorMessage: '字段映射错误：必填字段"联系电话"缺失',
      retryCount: 3,
      status: 'failed',
    },
    {
      id: 'log-4',
      failTime: '2026-03-14 11:32:18',
      supplierName: '优质包装材料',
      phone: '13600136000',
      submitTime: '2026-03-14 11:32:18', // 新增提交时间
      oaFormId: 'OA_FORM_20260314_004',
      errorCode: '500',
      errorMessage: 'OA内部错误：数据库连接失败',
      retryCount: 1,
      status: 'retrying',
    },
  ]);

  // 填报数据详细列表
  interface SubmissionDataRecord {
    id: string;
    formName: string;
    userName: string;
    phone: string;
    fillStatus: 'submitted' | 'modified';
    firstSubmitTime: string;
    lastModifyTime: string;
    returnStatus: 'success' | 'failed' | 'pending';
  }

  const submissionDataRecords: SubmissionDataRecord[] = [
    {
      id: 'data-1',
      formName: '供应商入驻表',
      userName: '张三',
      phone: '13800138001',
      fillStatus: 'submitted',
      firstSubmitTime: '2026-03-14 09:15:22',
      lastModifyTime: '2026-03-14 09:15:22',
      returnStatus: 'success',
    },
    {
      id: 'data-2',
      formName: '供应商入驻表',
      userName: '李四',
      phone: '13900139002',
      fillStatus: 'modified',
      firstSubmitTime: '2026-03-14 10:22:35',
      lastModifyTime: '2026-03-14 14:30:18',
      returnStatus: 'success',
    },
    {
      id: 'data-3',
      formName: '供应商报价表',
      userName: '王五',
      phone: '13700137003',
      fillStatus: 'submitted',
      firstSubmitTime: '2026-03-14 11:30:12',
      lastModifyTime: '2026-03-14 11:30:12',
      returnStatus: 'failed',
    },
    {
      id: 'data-4',
      formName: '供应商入驻表',
      userName: '赵六',
      phone: '13600136004',
      fillStatus: 'submitted',
      firstSubmitTime: '2026-03-14 12:18:33',
      lastModifyTime: '2026-03-14 12:18:33',
      returnStatus: 'pending',
    },
    {
      id: 'data-5',
      formName: '资产盘点表',
      userName: '钱七',
      phone: '13500135005',
      fillStatus: 'modified',
      firstSubmitTime: '2026-03-14 13:45:22',
      lastModifyTime: '2026-03-14 15:20:45',
      returnStatus: 'success',
    },
    {
      id: 'data-6',
      formName: '供应商报价表',
      userName: '孙八',
      phone: '13400134006',
      fillStatus: 'submitted',
      firstSubmitTime: '2026-03-14 14:23:15',
      lastModifyTime: '2026-03-14 14:23:15',
      returnStatus: 'failed',
    },
  ];

  // 填报数据统计（动态计算）
  const getSubmissionStats = () => {
    const submitted = submissionDataRecords.length;
    const returnSuccess = submissionDataRecords.filter(r => r.returnStatus === 'success').length;
    const returnFailed = submissionDataRecords.filter(r => r.returnStatus === 'failed').length;
    return { submitted, returnSuccess, returnFailed };
  };

  const submissionStats = getSubmissionStats();

  // 表单模版和表单名称的二级结构
  const formTemplates = {
    '供应商管理': ['供应商入驻表', '供应商报价表', '供应商考核表'],
    '资产管理': ['资产盘点表', '资产报废表', '资产调拨表'],
    '客户管理': ['客户信息表', '客户满意度调查表'],
  };

  // 根据选择的模版获取可用的表单列表
  const getAvailableForms = () => {
    if (submissionTemplateFilter === 'all') {
      return Object.values(formTemplates).flat();
    }
    return formTemplates[submissionTemplateFilter as keyof typeof formTemplates] || [];
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

  // 短信记录（一条短信一条记录）
  const smsRecords: SmsRecord[] = [
    {
      id: 'sms-1',
      templateName: '表单提交成功通知',
      sendTime: '2026-03-14 09:15:30',
      recipient: '张三 (138****1234)',
      status: 'success',
      smsCount: 1,
    },
    {
      id: 'sms-2',
      templateName: 'OA审批提醒',
      sendTime: '2026-03-14 10:22:45',
      recipient: '李四 (139****5678)',
      status: 'success',
      smsCount: 1,
    },
    {
      id: 'sms-3',
      templateName: '数据异常告警',
      sendTime: '2026-03-14 11:30:12',
      recipient: '王五 (136****9012)',
      status: 'failed',
      smsCount: 0,
      failReason: '手机号码格式错误',
    },
    {
      id: 'sms-4',
      templateName: '系统维护通知',
      sendTime: '2026-03-14 14:00:00',
      recipient: '赵六 (137****3456)',
      status: 'success',
      smsCount: 1,
    },
    {
      id: 'sms-5',
      templateName: '表单提交成功通知',
      sendTime: '2026-03-14 15:30:22',
      recipient: '钱七 (135****7890)',
      status: 'failed',
      smsCount: 0,
      failReason: '短信余额不足',
    },
  ];

  // 邮件记录（一次通知触发一条记录，支持多个收件人）
  const emailRecords: EmailRecord[] = [
    {
      id: 'email-1',
      templateName: '供应商入驻欢迎邮件',
      sendTime: '2026-03-14 09:00:00',
      recipients: ['zhangsan@company.com'],
      status: 'success',
    },
    {
      id: 'email-2',
      templateName: '表单审批通知',
      sendTime: '2026-03-14 10:15:30',
      recipients: ['lisi@company.com'],
      status: 'success',
    },
    {
      id: 'email-3',
      templateName: '数据同步失败告警',
      sendTime: '2026-03-14 11:45:18',
      recipients: ['wangwu@company.com', 'admin@company.com', 'tech@company.com'],
      status: 'failed',
      failReason: 'SMTP连接超时',
    },
    {
      id: 'email-4',
      templateName: '每日数据报表',
      sendTime: '2026-03-14 08:00:00',
      recipients: ['admin@company.com', 'manager1@company.com', 'manager2@company.com', 'ceo@company.com', 'cfo@company.com'],
      status: 'success',
    },
    {
      id: 'email-5',
      templateName: '系统维护通知',
      sendTime: '2026-03-14 16:00:00',
      recipients: ['all@company.com'],
      status: 'failed',
      failReason: '收件人邮箱地址无效',
    },
  ];

  // 审计日志
  const auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      operatorName: '张伟',
      operationType: '表单发布',
      operationTime: '2026-03-14 09:00:15',
      operationObject: '供应商入驻表单',
      result: '成功',
    },
    {
      id: 'audit-2',
      operatorName: '李雷',
      operationType: 'OA配置变更',
      operationTime: '2026-03-14 10:30:22',
      operationObject: '致远A8连接配置',
      result: '成功',
    },
    {
      id: 'audit-3',
      operatorName: '王强',
      operationType: 'AI指令执行',
      operationTime: '2026-03-14 11:15:45',
      operationObject: '表单字段优化',
      result: '成功 (消耗320 tokens)',
    },
    {
      id: 'audit-4',
      operatorName: '系统',
      operationType: 'OA数据回传',
      operationTime: '2026-03-14 14:23:15',
      operationObject: 'OA_FORM_20260314_001',
      result: '失败 (错误码: 401)',
    },
  ];

  const subTabs = [
    { id: 'submission' as const, label: '填报数据', icon: Users },
    { id: 'interface' as const, label: '接口监控', icon: Activity },
    { id: 'sms' as const, label: '短信记录', icon: MessageSquare },
    { id: 'email' as const, label: '邮件记录', icon: Mail },
    { id: 'audit' as const, label: '审计日志', icon: Shield },
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

  const interfaceStatusLabels = {
    pending: { label: '待重试', color: 'bg-orange-100 text-orange-700' },
    retrying: { label: '重试中', color: 'bg-blue-100 text-blue-700' },
    failed: { label: '最终失败', color: 'bg-red-100 text-red-700' },
    success: { label: '已成功', color: 'bg-green-100 text-green-700' },
  };

  const handleSelectLog = (logId: string) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === failedLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(failedLogs.map(log => log.id));
    }
  };

  const handleBatchRetry = () => {
    if (selectedLogs.length > 500) {
      alert('单次批量重试上限500条，请筛选后分批执行');
      return;
    }
    setShowRetryDialog(true);
  };

  const handleConfirmRetry = () => {
    // 模拟重试逻辑
    setFailedLogs(failedLogs.map(log => 
      selectedLogs.includes(log.id) 
        ? { ...log, status: 'retrying' as const, retryCount: log.retryCount + 1 }
        : log
    ));
    setShowRetryDialog(false);
    setSelectedLogs([]);
    alert(`已提交 ${selectedLogs.length} 条重试任务`);
  };

  const handleExportExcel = () => {
    alert('导出Excel功能：包含所有填写数据和OA回传状态');
  };

  const handleExportCSV = () => {
    alert('导出CSV功能：包含所有审计日志记录');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 px-6">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    activeSubTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Submission Data */}
        {activeSubTab === 'submission' && (
          <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={submissionTemplateFilter}
                  onChange={(e) => {
                    setSubmissionTemplateFilter(e.target.value);
                    setSubmissionFormFilter('all'); // 重置表单选择
                  }}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有模版</option>
                  {Object.keys(formTemplates).map((template) => (
                    <option key={template} value={template}>
                      {template}
                    </option>
                  ))}
                </select>
                <select
                  value={submissionFormFilter}
                  onChange={(e) => setSubmissionFormFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  disabled={submissionTemplateFilter === 'all'}
                >
                  <option value="all">
                    {submissionTemplateFilter === 'all' ? '请先选择模版' : '所有表单'}
                  </option>
                  {getAvailableForms().map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={submissionStartDate}
                  onChange={(e) => setSubmissionStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="开始日期"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="date"
                  value={submissionEndDate}
                  onChange={(e) => setSubmissionEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="结束日期"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  查询
                </button>
              </div>
              <button
                onClick={() => alert('导出填报数据Excel')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出记录
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-xs mb-1">已提交</p>
                    <p className="text-3xl font-bold text-blue-900">{submissionStats.submitted}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-xs mb-1">回传成功</p>
                    <p className="text-3xl font-bold text-green-900">{submissionStats.returnSuccess}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-xs mb-1">回传失败</p>
                    <p className="text-3xl font-bold text-red-900">{submissionStats.returnFailed}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">详细数据列表</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">表单名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">提交人</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">提交人手机号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">填写状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">首次提交时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">最后修改时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">协同回传状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submissionDataRecords
                      .filter(record => {
                        // 模版筛选
                        if (submissionTemplateFilter !== 'all') {
                          const templateForms = formTemplates[submissionTemplateFilter as keyof typeof formTemplates] || [];
                          if (!templateForms.includes(record.formName)) return false;
                        }
                        // 表单筛选
                        if (submissionFormFilter !== 'all' && record.formName !== submissionFormFilter) return false;
                        return true;
                      })
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{record.formName}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{record.userName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">{record.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.fillStatus === 'submitted'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {record.fillStatus === 'submitted' ? '已提交' : '已修改'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.firstSubmitTime}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.lastModifyTime}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.returnStatus === 'success'
                                ? 'bg-green-100 text-green-700'
                                : record.returnStatus === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {record.returnStatus === 'success' ? '回传成功' : record.returnStatus === 'failed' ? '回传失败' : '待回传'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                              详情
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  共 {submissionDataRecords.filter(record => {
                    // 模版筛选
                    if (submissionTemplateFilter !== 'all') {
                      const templateForms = formTemplates[submissionTemplateFilter as keyof typeof formTemplates] || [];
                      if (!templateForms.includes(record.formName)) return false;
                    }
                    // 表单筛选
                    if (submissionFormFilter !== 'all' && record.formName !== submissionFormFilter) return false;
                    return true;
                  }).length} 条记录
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interface Monitoring */}
        {activeSubTab === 'interface' && (
          <div className="p-6 space-y-6">
            {/* Time Range Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700">时间范围：</label>
                <div className="flex items-center gap-2">
                  {[
                    { value: 'today', label: '今日' },
                    { value: 'week', label: '近7天' },
                    { value: 'month', label: '近30天' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        timeRange === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <input
                    type="date"
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="date"
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-xs mb-1">总发送量</p>
                    <p className="text-3xl font-bold text-green-900">{interfaceStats.totalSent}</p>
                  </div>
                  <Database className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-xs mb-1">OA通过量</p>
                    <p className="text-3xl font-bold text-blue-900">{interfaceStats.oaPassed}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-blue-400" />
                </div>
              </div>

              <div 
                className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {/* 滚动到失败明细 */}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-xs mb-1">失败量</p>
                    <p className="text-3xl font-bold text-red-900">{interfaceStats.failed}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                interfaceStats.successRate >= 99 
                  ? 'from-green-50 to-green-100 border-green-200' 
                  : 'from-orange-50 to-orange-100 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs mb-1 ${interfaceStats.successRate >= 99 ? 'text-green-700' : 'text-orange-700'}`}>
                      成功率
                    </p>
                    <p className={`text-3xl font-bold ${interfaceStats.successRate >= 99 ? 'text-green-900' : 'text-orange-900'}`}>
                      {interfaceStats.successRate}%
                    </p>
                  </div>
                  <Activity className={`w-10 h-10 ${interfaceStats.successRate >= 99 ? 'text-green-400' : 'text-orange-400'}`} />
                </div>
              </div>
            </div>

            {/* Failed Records */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">失败记录明细</h3>
                <div className="flex items-center gap-3">
                  <select
                    value={errorTypeFilter}
                    onChange={(e) => setErrorTypeFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">所有错误类型</option>
                    <option value="401">401 鉴权失败</option>
                    <option value="504">504 连接超时</option>
                    <option value="422">422 字段映射错误</option>
                    <option value="500">500 OA内部错误</option>
                  </select>
                  
                  {selectedLogs.length > 0 && (
                    <button
                      onClick={handleBatchRetry}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      批量重试 ({selectedLogs.length})
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLogs.length === failedLogs.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">失败时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">提交人</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">提交人手机号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">提交时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">OA表单ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">错误代码</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">误原因描述</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">重试次数</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">当前状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {failedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedLogs.includes(log.id)}
                            onChange={() => handleSelectLog(log.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{log.failTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{log.supplierName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 font-mono whitespace-nowrap">{log.phone}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{log.submitTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 font-mono whitespace-nowrap">{log.oaFormId}</td>
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-mono whitespace-nowrap">
                            {log.errorCode}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap min-w-[200px]">
                          {log.errorMessage}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-slate-900 whitespace-nowrap">{log.retryCount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${interfaceStatusLabels[log.status].color}`}>
                            {interfaceStatusLabels[log.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedLogs([log.id]);
                              setShowRetryDialog(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap"
                          >
                            重试
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SMS Records */}
        {activeSubTab === 'sms' && (
          <div className="p-6 space-y-6">
            {/* SMS Balance Banner */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-700 font-medium">短信余额</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-orange-900">2,850</span>
                    <span className="text-xs text-orange-700">条</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索发送对象..."
                    value={smsRecipientFilter}
                    onChange={(e) => setSmsRecipientFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={smsTemplateFilter}
                  onChange={(e) => setSmsTemplateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有通知模版</option>
                  <option value="表单提交成功通知">表单提交成功通知</option>
                  <option value="OA审批提醒">OA审批提醒</option>
                  <option value="数据异常告警">数据异常告警</option>
                  <option value="系统维护通知">系统维护通知</option>
                </select>
                <select
                  value={smsStatusFilter}
                  onChange={(e) => setSmsStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有发送状态</option>
                  <option value="success">成功</option>
                  <option value="failed">失败</option>
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
                onClick={() => alert('导出短信记录')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出记录
              </button>
            </div>

            {/* SMS Records Table */}
            <div>
              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">短信发送记录</h3>
                <span className="text-xs text-slate-500">
                  成功发送 {smsRecords
                    .filter(record => record.status === 'success')
                    .reduce((sum, record) => sum + record.smsCount, 0)} 条
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">通知模版</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送对象</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">短信消耗条数</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">失败原因描述</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {smsRecords
                      .filter(record => {
                        if (smsTemplateFilter !== 'all' && record.templateName !== smsTemplateFilter) return false;
                        if (smsStatusFilter !== 'all' && record.status !== smsStatusFilter) return false;
                        if (smsRecipientFilter && !record.recipient.toLowerCase().includes(smsRecipientFilter.toLowerCase())) return false;
                        return true;
                      })
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{record.templateName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.sendTime}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{record.recipient}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {record.status === 'success' ? '成功' : '失败'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-center">{record.smsCount}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {record.failReason || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  共 {smsRecords.filter(record => {
                    if (smsTemplateFilter !== 'all' && record.templateName !== smsTemplateFilter) return false;
                    if (smsStatusFilter !== 'all' && record.status !== smsStatusFilter) return false;
                    if (smsRecipientFilter && !record.recipient.toLowerCase().includes(smsRecipientFilter.toLowerCase())) return false;
                    return true;
                  }).length} 条记录
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Records */}
        {activeSubTab === 'email' && (
          <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索发送对象..."
                    value={emailRecipientFilter}
                    onChange={(e) => setEmailRecipientFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={emailTemplateFilter}
                  onChange={(e) => setEmailTemplateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有通知模版</option>
                  <option value="供应商入驻欢迎邮件">供应商入驻欢迎邮件</option>
                  <option value="表单审批通知">表单审批通知</option>
                  <option value="数据同步失败告警">数据同步失败告警</option>
                  <option value="每日数据报表">每日数据报表</option>
                  <option value="系统维护通知">系统维护通知</option>
                </select>
                <select
                  value={emailStatusFilter}
                  onChange={(e) => setEmailStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有发送状态</option>
                  <option value="success">成功</option>
                  <option value="failed">失败</option>
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
                onClick={() => alert('导出邮件记录')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出记录
              </button>
            </div>

            {/* Email Records Table */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">邮件发送记录</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">通知模版</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送对象</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">发送状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">失败原因描述</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {emailRecords
                      .filter(record => {
                        if (emailTemplateFilter !== 'all' && record.templateName !== emailTemplateFilter) return false;
                        if (emailStatusFilter !== 'all' && record.status !== emailStatusFilter) return false;
                        if (emailRecipientFilter && !record.recipients.some(r => r.toLowerCase().includes(emailRecipientFilter.toLowerCase()))) return false;
                        return true;
                      })
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{record.templateName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{record.sendTime}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {record.recipients.length === 1 ? (
                              record.recipients[0]
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help border-b border-dashed border-slate-400">
                                    批量发送（{record.recipients.length}人）
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="flex flex-col gap-1">
                                    {record.recipients.map((email, idx) => (
                                      <div key={idx}>{email}</div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {record.status === 'success' ? '成功' : '失败'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {record.failReason || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  共 {emailRecords.filter(record => {
                    if (emailTemplateFilter !== 'all' && record.templateName !== emailTemplateFilter) return false;
                    if (emailStatusFilter !== 'all' && record.status !== emailStatusFilter) return false;
                    if (emailRecipientFilter && !record.recipients.some(r => r.toLowerCase().includes(emailRecipientFilter.toLowerCase()))) return false;
                    return true;
                  }).length} 条记录
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {activeSubTab === 'audit' && (
          <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索操作人或操作对象..."
                    className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">所有操作类型</option>
                  <option value="form">表单发布/下线</option>
                  <option value="oa">OA配置变更</option>
                  <option value="data">OA数据回传</option>
                  <option value="ai">AI指令执行</option>
                  <option value="role">用户角色变更</option>
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
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出记录
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">审计日志说明</p>
                  <p className="text-blue-700">
                    审计日志采用追加写模式，不可修改或删除。所有记录保留≥180天，超期后自动归档至冷存储，仍可查询。
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">操作日志记录</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作人</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作类型</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作对象</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">结果</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">{log.operationTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{log.operatorName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {log.operationType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{log.operationObject}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${
                            log.result.includes('成功') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  共 {auditLogs.length} 条记录
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    2
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Retry Confirmation Dialog */}
      {showRetryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">确认重试</h3>
              <button
                onClick={() => setShowRetryDialog(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-900 font-medium mb-2">
                    确认重试 {selectedLogs.length} 条记录？
                  </p>
                  <p className="text-sm text-slate-600">
                    重试将重新推送数据至OA系统。如果OA系统仍处于故障状态，重试可能再次失败。
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRetryDialog(false)}
                className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRetry}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                确认重试
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
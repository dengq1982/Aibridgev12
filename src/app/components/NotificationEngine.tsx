import { useState } from 'react';
import { Bell, Plus, Edit, Trash2, Eye, AlertCircle, X } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // 触发条件 (Story 6.1)
  triggerForm: string; // 新增：选择表单
  triggerField: string;
  triggerCondition: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'greater_or_equal' | 'less_or_equal';
  triggerValue: string;
  
  // 发送对象 (Story 6.2)
  recipientType: 'phone' | 'field'; // 修改：'role'改为'field'
  recipientPhones: string; // 逗号分隔的手机号
  recipientForm: string; // 新增：表单选择
  recipientField: string; // 新增：字段选择（数字/手机号/邮件类型）
  
  // 通知渠道 (Story 6.2)
  channels: {
    sms: boolean;
    email: boolean; // 去掉wechat
  };
  
  // 消息模板 (Story 6.3)
  messageTemplates: {
    sms: string;
    email: string; // 去掉wechat，增加邮件模版配置
    emailSubject: string; // 新增：邮件主题
  };
}

// 表单字段列表（模拟数据，实际应从表单定义中获取）
const formFields = [
  { id: 'supplier_name', name: '供应商名称', type: 'text' },
  { id: 'contact_phone', name: '联系电话', type: 'text' },
  { id: 'quote_amount', name: '报价金额', type: 'number' },
  { id: 'quote_type', name: '报价类型', type: 'text' },
  { id: 'form_status', name: '表单状态', type: 'text' },
  { id: 'submit_date', name: '提交日期', type: 'date' },
];

// RBAC角色列表（模拟数据）
const roleList = [
  { id: 'procurement_manager', name: '采购经理' },
  { id: 'app_admin', name: '应用配置管理员' },
  { id: 'data_admin', name: '数据管理员' },
  { id: 'finance_staff', name: '财务人员' },
];

// 系统内置变量 (Story 6.3)
const getSystemVariables = (isEmailTemplate: boolean) => {
  const baseVariables = [
    { key: '{{提交时间}}', description: '供应商提交时间（精确到分钟）', needsSelection: false },
    { key: '{{表单名称}}', description: '当前表单名称', needsSelection: false },
    { key: '{{供应商名称}}', description: 'SSO身份中的供应商名称', needsSelection: false },
    { key: '{{截止时间}}', description: '表单填写截止时间', needsSelection: false },
    { key: '{{表单填写链接}}', description: '表单填写页面链接', needsSelection: true, type: 'form_fill_link' as const },
    { key: '{{我填写的表单链接}}', description: '我填写的表单列表链接', needsSelection: true, type: 'my_form_link' as const },
  ];

  // 如果是邮件模板，增加二维码变量
  if (isEmailTemplate) {
    return [
      ...baseVariables,
      { key: '{{表单填写二维码}}', description: '表单填写链接二维码（邮件可选）', needsSelection: true, type: 'form_fill_qr' as const },
      { key: '{{我填写的表单二维码}}', description: '我填写的表单链接二维码（邮件可选）', needsSelection: true, type: 'my_form_qr' as const },
    ];
  }

  return baseVariables;
};

export function NotificationEngine() {
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'rule-1',
      name: '高额报价提醒',
      description: '当报价金额超过10万时通知采购经理',
      enabled: true,
      triggerForm: '供应商入驻表单',
      triggerField: 'quote_amount',
      triggerCondition: 'greater',
      triggerValue: '100000',
      recipientType: 'field',
      recipientPhones: '',
      recipientForm: '供应商入驻表单',
      recipientField: 'contact_phone',
      channels: { sms: true, email: false },
      messageTemplates: {
        sms: '尊敬的采购经理，供应商{{供应商名称}}提交的报价金额为{{报价金额}}元，已超过10万元，请及时审核。',
        email: '',
        emailSubject: '',
      },
    },
    {
      id: 'rule-2',
      name: '审批通过通知',
      description: '审批通过后通知供应商',
      enabled: true,
      triggerForm: '供应商入驻表单',
      triggerField: 'form_status',
      triggerCondition: 'equals',
      triggerValue: '已通过',
      recipientType: 'phone',
      recipientPhones: '13800138000,13900139000',
      recipientForm: '',
      recipientField: '',
      channels: { sms: false, email: true },
      messageTemplates: {
        sms: '',
        email: '尊敬的{{供应商名称}}，您的入驻申请已通过审批，欢迎您与我们开始合作。提交时间：{{提交时间}}',
        emailSubject: '入驻申请已通过审批',
      },
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // 服务配置状态（模拟，实际应从系统配置中读取）
  const [serviceConfig] = useState({
    smsConfigured: true,
    emailConfigured: true,
  });

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const handleEditRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setShowAddModal(true);
  };

  const handleSaveRule = (rule: NotificationRule) => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules(prev => [...prev, { ...rule, id: `rule-${Date.now()}` }]);
    }
    setShowAddModal(false);
    setEditingRule(null);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      equals: '等于',
      not_equals: '不等于',
      contains: '包含',
      greater: '大于',
      less: '小于',
      greater_or_equal: '大于等于',
      less_or_equal: '小于等于',
    };
    return labels[condition] || condition;
  };

  const getFieldName = (fieldId: string) => {
    return formFields.find(f => f.id === fieldId)?.name || fieldId;
  };

  const getRoleName = (roleId: string) => {
    return roleList.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-slate-900">通知规则配置</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">基于表单字段状态变化自动触发通知</p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增通知模版
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition-all"
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-slate-900">{rule.name}</h3>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rule.enabled ? '已启用' : '已禁用'}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditRule(rule)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rule Details */}
            <div className="space-y-3">
              {/* Trigger Condition */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">触发条件：</div>
                <div className="col-span-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                      {getFieldName(rule.triggerField)}
                    </span>
                    <span className="text-slate-500">{getConditionLabel(rule.triggerCondition)}</span>
                    <code className="px-2 py-1 bg-slate-100 text-slate-800 text-sm rounded font-mono">
                      {rule.triggerValue}
                    </code>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">接收对象：</div>
                <div className="col-span-10 text-sm text-slate-800">
                  {rule.recipientType === 'phone' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded">指定手机号</span>
                      <span className="text-slate-600">{rule.recipientPhones}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded">指定字段</span>
                      <span className="text-slate-600">{rule.recipientField}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">通知渠道：</div>
                <div className="col-span-10 flex items-center gap-2">
                  {rule.channels.sms && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">短信</span>
                  )}
                  {rule.channels.email && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">邮件</span>
                  )}
                </div>
              </div>

              {/* Message Template Preview */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">消息模板：</div>
                <div className="col-span-10">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
                    {rule.channels.sms && rule.messageTemplates.sms ? rule.messageTemplates.sms :
                     rule.channels.email && rule.messageTemplates.email ? rule.messageTemplates.email : '未配置'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12">
          <div className="text-center text-slate-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无通知规则</h3>
            <p className="text-sm mb-4">点击"新增通知模版"创建您的第一条通知规则</p>
            <button
              onClick={() => {
                setEditingRule(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增通知模版
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <NotificationRuleModal
          rule={editingRule}
          onClose={() => {
            setShowAddModal(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
          serviceConfig={serviceConfig}
        />
      )}
    </div>
  );
}

// Modal Component
function NotificationRuleModal({
  rule,
  onClose,
  onSave,
  serviceConfig,
}: {
  rule: NotificationRule | null;
  onClose: () => void;
  onSave: (rule: NotificationRule) => void;
  serviceConfig: { smsConfigured: boolean; emailConfigured: boolean };
}) {
  const [formData, setFormData] = useState<NotificationRule>(
    rule || {
      id: '',
      name: '',
      description: '',
      enabled: true,
      triggerForm: '',
      triggerField: '',
      triggerCondition: 'equals',
      triggerValue: '',
      recipientType: 'field',
      recipientPhones: '',
      recipientForm: '',
      recipientField: '',
      channels: { sms: false, email: false },
      messageTemplates: {
        sms: '',
        email: '',
        emailSubject: '',
      },
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewChannel, setPreviewChannel] = useState<'sms' | 'email'>('sms');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalConfig, setLinkModalConfig] = useState<{
    type: 'form_fill_link' | 'my_form_link' | 'form_fill_qr' | 'my_form_qr';
    channel: 'sms' | 'email';
  } | null>(null);

  // 获取当前选中字段的类型
  const selectedFieldType = formFields.find(f => f.id === formData.triggerField)?.type || 'text';

  // 根据字段类型获取可用的条件选项 (BR-6.1)
  const getAvailableConditions = () => {
    if (selectedFieldType === 'number') {
      return [
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'greater', label: '大于' },
        { value: 'less', label: '小于' },
        { value: 'greater_or_equal', label: '大于等于' },
        { value: 'less_or_equal', label: '小于等于' },
      ];
    } else {
      return [
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'contains', label: '包含' },
      ];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    if (!formData.triggerField) {
      alert('请选择触发字段');
      return;
    }
    if (!formData.triggerValue) {
      alert('请填写触发值');
      return;
    }
    if (formData.recipientType === 'phone' && !formData.recipientPhones) {
      alert('请输入至少一个手机号');
      return;
    }
    if (formData.recipientType === 'field' && !formData.recipientField) {
      alert('请选择字段');
      return;
    }
    if (!formData.channels.sms && !formData.channels.email) {
      alert('请至少选择一个通知渠道');
      return;
    }
    
    // 验证手机号格式
    if (formData.recipientType === 'phone') {
      const phones = formData.recipientPhones.split(',').map(p => p.trim());
      if (phones.length > 20) {
        alert('手机号数量不能超过20个');
        return;
      }
      const invalidPhones = phones.filter(p => !/^1[3-9]\d{9}$/.test(p));
      if (invalidPhones.length > 0) {
        alert(`以下手机号格式不正确：${invalidPhones.join(', ')}`);
        return;
      }
    }
    
    // 验证模板是否填写
    if (formData.channels.sms && !formData.messageTemplates.sms) {
      alert('请填写短信消息模板');
      return;
    }
    if (formData.channels.email && !formData.messageTemplates.email) {
      alert('请填写邮件消息模板');
      return;
    }
    if (formData.channels.email && !formData.messageTemplates.emailSubject) {
      alert('请填写邮件主题');
      return;
    }
    
    onSave(formData);
  };

  const insertVariable = (variable: string, channel: 'sms' | 'email') => {
    setFormData({
      ...formData,
      messageTemplates: {
        ...formData.messageTemplates,
        [channel]: formData.messageTemplates[channel] + variable
      }
    });
  };

  const handleLinkVariableClick = (type: 'form_fill_link' | 'my_form_link' | 'form_fill_qr' | 'my_form_qr', channel: 'sms' | 'email') => {
    setLinkModalConfig({ type, channel });
    setShowLinkModal(true);
  };

  const handleLinkModalConfirm = (formName: string, linkType: 'h5' | 'miniprogram' | 'h5tomp') => {
    if (!linkModalConfig) return;

    const { type, channel } = linkModalConfig;
    let variable = '';

    if (type === 'form_fill_link') {
      variable = `{{表单填写链接[${formName}][${linkType}]}}`;
    } else if (type === 'my_form_link') {
      variable = `{{我填写的表单链接[${formName}][${linkType}]}}`;
    } else if (type === 'form_fill_qr') {
      variable = `{{表单填写二维码[${formName}][${linkType}]}}`;
    } else if (type === 'my_form_qr') {
      variable = `{{我填写的表单二维码[${formName}][${linkType}]}}`;
    }

    insertVariable(variable, channel);
    setShowLinkModal(false);
    setLinkModalConfig(null);
  };

  // 字符计数和分片提示 (BR-6.7)
  const getSmsCharCount = () => {
    const count = formData.messageTemplates.sms.length;
    const segments = Math.ceil(count / 70);
    return { count, segments };
  };

  // 预览功能 (Story 6.3)
  const getPreviewText = () => {
    const template = formData.messageTemplates[previewChannel];
    // 用示例数据替换变量
    return template
      .replace(/{{提交时间}}/g, '2026-03-14 14:30')
      .replace(/{{表单名称}}/g, '供应商入驻表单')
      .replace(/{{供应商名称}}/g, '华强电子有限公司')
      .replace(/{{截止时间}}/g, '2026-03-20 18:00')
      .replace(/{{报价金额}}/g, '125000')
      .replace(/{{报价类型}}/g, '设备采购')
      .replace(/{{审批状态}}/g, '已通过');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {rule ? '编辑通知模版' : '新增通知模版'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: 基本信息 */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">1</span>
              基本信息
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                规则名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：高额报价提醒"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                规则描述
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述这条规则的用途"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Section 2: 触发条件 (Story 6.1) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">2</span>
              触发条件
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  触发表单 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.triggerForm}
                  onChange={(e) => setFormData({ ...formData, triggerForm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">选择表单</option>
                  <option value="供应商入驻表单">供应商入驻表单</option>
                  <option value="供应商报价表单">供应商报价表单</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  触发字段 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.triggerField}
                  onChange={(e) => setFormData({ ...formData, triggerField: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">选择字段</option>
                  <option value="form_status">表单状态</option>
                  {formFields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  条件 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.triggerCondition}
                  onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {getAvailableConditions().map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  触发值 <span className="text-red-500">*</span>
                </label>
                {formData.triggerField === 'form_status' ? (
                  <select
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">选择状态</option>
                    <option value="提交成功">提交成功</option>
                    <option value="同步成功">同步成功</option>
                    <option value="同步失败">同步失败</option>
                    <option value="审批通过">审批通过</option>
                    <option value="审批不通过">审批不通过</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                    placeholder="输入触发值"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 提示：{selectedFieldType === 'number' ? '数值型字段支持所有比较条件' : '文本型字段仅支持等于、不等于、包含条件'}
              </p>
            </div>
          </div>

          {/* Section 3: 发送对象与渠道 (Story 6.2) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">3</span>
              发送对象与渠道
            </h3>
            
            {/* 通知渠道 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                通知渠道 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className={`flex items-center gap-2 ${!serviceConfig.smsConfigured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.channels.sms}
                    onChange={(e) => setFormData({
                      ...formData,
                      channels: { ...formData.channels, sms: e.target.checked }
                    })}
                    disabled={!serviceConfig.smsConfigured}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">短信</span>
                  {!serviceConfig.smsConfigured && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">去配置</a>
                  )}
                </label>
                <label className={`flex items-center gap-2 ${!serviceConfig.emailConfigured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.channels.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      channels: { ...formData.channels, email: e.target.checked }
                    })}
                    disabled={!serviceConfig.emailConfigured}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">邮件</span>
                  {!serviceConfig.emailConfigured && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">去配置</a>
                  )}
                </label>
              </div>
            </div>

            {/* 发送对象类型 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                发送对象类型 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="phone"
                    checked={formData.recipientType === 'phone'}
                    onChange={(e) => setFormData({ ...formData, recipientType: 'phone' })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">指定人</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="field"
                    checked={formData.recipientType === 'field'}
                    onChange={(e) => setFormData({ ...formData, recipientType: 'field' })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">指定表单字段</span>
                </label>
              </div>
            </div>

            {/* 指定人 */}
            {formData.recipientType === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {formData.channels.email && !formData.channels.sms ? '邮箱列表' : '手机号列表'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.recipientPhones}
                  onChange={(e) => setFormData({ ...formData, recipientPhones: e.target.value })}
                  placeholder={formData.channels.email && !formData.channels.sms ? '输入邮箱，多个邮箱用逗号分隔，例如：user1@example.com,user2@example.com' : '输入手机号，多个手机号用逗号分隔，例如：13800138000,13900139000'}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.channels.email && !formData.channels.sms ? '最多支持20个邮箱，用逗号分隔' : '最多支持20个手机号，用逗号分隔'}
                </p>
              </div>
            )}

            {/* 指定字段 */}
            {formData.recipientType === 'field' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    选择表单 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recipientForm}
                    onChange={(e) => setFormData({ ...formData, recipientForm: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">选择表单</option>
                    <option value="供应商入驻表单">供应商入驻表单</option>
                    <option value="供应商报价表单">供应商报价表单</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    选择字段 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recipientField}
                    onChange={(e) => setFormData({ ...formData, recipientField: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">选择字段</option>
                    {formData.channels.email && !formData.channels.sms ? (
                      <>
                        <option value="contact_email">联系邮箱</option>
                        <option value="business_email">企业邮箱</option>
                      </>
                    ) : (
                      <>
                        <option value="contact_phone">联系电话</option>
                        <option value="mobile_phone">手机号码</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.channels.email && !formData.channels.sms ? '只显示邮箱类型字段' : '只显示手机号类型字段'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: 通知文案 (Story 6.3) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">4</span>
              通知文案
            </h3>

            {/* 短信模板 */}
            {formData.channels.sms && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    短信消息模板 <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${getSmsCharCount().count > 70 ? 'text-orange-600' : 'text-slate-500'}`}>
                    {getSmsCharCount().count} 字
                    {getSmsCharCount().count > 70 && ` (将拆分为 ${getSmsCharCount().segments} 条短信发送)`}
                  </span>
                </div>
                <textarea
                  value={formData.messageTemplates.sms}
                  onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, sms: e.target.value } })}
                  placeholder="输入短信消息模板，支持使用动态变量..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-600 mb-1.5">系统内置变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getSystemVariables(false).map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => {
                          if (variable.needsSelection && variable.type) {
                            handleLinkVariableClick(variable.type, 'sms');
                          } else {
                            insertVariable(variable.key, 'sms');
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          variable.needsSelection
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={variable.description}
                      >
                        {variable.key}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <p className="text-xs text-slate-500 w-full">优先选择关联内容的表单: {formData.triggerForm || '未选择'}</p>
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单字段变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => insertVariable(`{{${field.name}}}`, 'sms')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors"
                      >
                        {`{{${field.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                {getSmsCharCount().count > 70 && (
                  <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                    <p className="text-xs text-orange-800">
                      ⚠️ 短信内容超过70字，将自动拆分为{getSmsCharCount().segments}条短信发送，每条费用独立计费
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 邮件模板 */}
            {formData.channels.email && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  邮件消息模板 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.messageTemplates.email}
                  onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, email: e.target.value } })}
                  placeholder="输入邮件消息模板，支持使用动态变量..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-600 mb-1.5">系统内置变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getSystemVariables(true).map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => {
                          if (variable.needsSelection && variable.type) {
                            handleLinkVariableClick(variable.type, 'email');
                          } else {
                            insertVariable(variable.key, 'email');
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          variable.key.includes('二维码')
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                            : variable.needsSelection
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={variable.description}
                      >
                        {variable.key}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <p className="text-xs text-slate-500 w-full">优先选择关联内容的表单: {formData.triggerForm || '未选择'}</p>
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单字段变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => insertVariable(`{{${field.name}}}`, 'email')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors"
                      >
                        {`{{${field.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    邮件主题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.messageTemplates.emailSubject}
                    onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, emailSubject: e.target.value } })}
                    placeholder="输入邮件主题"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* 预览按钮 */}
            {(formData.channels.sms || formData.channels.email) && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // 设置默认预览渠道
                    if (formData.channels.sms) setPreviewChannel('sms');
                    else if (formData.channels.email) setPreviewChannel('email');
                    setShowPreview(true);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  预览通知内容
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {rule ? '保存模版' : '创建模版'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">消息预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* 渠道选择 */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {formData.channels.sms && (
                  <button
                    onClick={() => setPreviewChannel('sms')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${previewChannel === 'sms' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    短信
                  </button>
                )}
                {formData.channels.email && (
                  <button
                    onClick={() => setPreviewChannel('email')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${previewChannel === 'email' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    邮件
                  </button>
                )}
              </div>

              {/* 预览内容 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {getPreviewText()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 预览使用示例数据替换变量，实际发送时将使用真实表单数据
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Selection Modal */}
      {showLinkModal && linkModalConfig && (
        <LinkSelectionModal
          type={linkModalConfig.type}
          onClose={() => {
            setShowLinkModal(false);
            setLinkModalConfig(null);
          }}
          onConfirm={handleLinkModalConfirm}
        />
      )}
    </div>
  );
}

// Link Selection Modal Component
function LinkSelectionModal({
  type,
  onClose,
  onConfirm,
}: {
  type: 'form_fill_link' | 'my_form_link' | 'form_fill_qr' | 'my_form_qr';
  onClose: () => void;
  onConfirm: (formName: string, linkType: 'h5' | 'miniprogram' | 'h5tomp') => void;
}) {
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedLinkType, setSelectedLinkType] = useState<'h5' | 'miniprogram' | 'h5tomp'>('h5');

  const formList = ['供应商入驻表单', '供应商报价表单', '资产盘点表单'];

  const getTitle = () => {
    if (type === 'form_fill_link') return '选择表单填写链接';
    if (type === 'my_form_link') return '选择我填写的表单链接';
    if (type === 'form_fill_qr') return '选择表单填写二维码';
    if (type === 'my_form_qr') return '选择我填写的表单二维码';
    return '选择链接配置';
  };

  const handleConfirm = () => {
    if (!selectedForm) {
      alert('请选择表单');
      return;
    }
    onConfirm(selectedForm, selectedLinkType);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 选择表单 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择表单 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择表单</option>
              {formList.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>

          {/* 选择链接类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              链接/二维码类型 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="linkType"
                  value="h5"
                  checked={selectedLinkType === 'h5'}
                  onChange={(e) => setSelectedLinkType('h5')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">H5</div>
                  <div className="text-xs text-slate-500">适用于PC邮件等场景</div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="linkType"
                  value="miniprogram"
                  checked={selectedLinkType === 'miniprogram'}
                  onChange={(e) => setSelectedLinkType('miniprogram')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">小程序</div>
                  <div className="text-xs text-slate-500">适用于微信体系内发布</div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="linkType"
                  value="h5tomp"
                  checked={selectedLinkType === 'h5tomp'}
                  onChange={(e) => setSelectedLinkType('h5tomp')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">H5跳转小程序</div>
                  <div className="text-xs text-slate-500">适用于手机端短信/浏览器等场景</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            确认插入
          </button>
        </div>
      </div>
    </div>
  );
}
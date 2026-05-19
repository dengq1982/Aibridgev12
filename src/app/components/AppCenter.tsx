import { Plus, Search, FileText, Calendar, User, MoreVertical, Edit, Copy, Trash2, Link2, Settings, X, CheckCircle, AlertCircle, Eye, Database } from 'lucide-react';
import { useState } from 'react';

interface Application {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  source?: string;
  creator: string;
  createDate: string;
  updateDate: string;
  formsCount: number;
  publishedFormsCount: number; // 已发布的表单数量
  icon?: string;
  tags?: string[];
}

export function AppCenter({
  applications,
  userRole = 'super_admin', // 'super_admin' | 'app_admin'
  onNew,
  onEdit,
  onDuplicate,
  onDelete,
  onEnter,
  onViewData,
}: {
  applications: Application[];
  userRole?: 'super_admin' | 'app_admin';
  onNew: () => void;
  onEdit: (appId: string) => void;
  onDuplicate: (appId: string) => void;
  onDelete: (appId: string) => void;
  onEnter: (appId: string) => void;
  onViewData?: (appId: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState<string | null>(null);

  const statusLabels = {
    all: '全部状态',
    draft: '未集成',
    active: '已集成',
    archived: '已归档',
  };

  const statusColors = {
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: '未集成' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: '已集成' },
    archived: { bg: 'bg-slate-200', text: 'text-slate-600', label: '已归档' },
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Generate app link (BR-2.5)
  const generateAppLink = (appId: string) => {
    return `https://admin.aihub.com/app/${appId}`;
  };

  // Generate data link
  const generateDataLink = (appId: string) => {
    return `https://admin.aihub.com/app/${appId}/data`;
  };

  // Copy link to clipboard
  const handleCopyLink = async (appId: string, appName: string) => {
    const link = generateAppLink(appId);
    try {
      await navigator.clipboard.writeText(link);
      alert(`应用入口链接已复制！\n\n${appName}\n${link}`);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`应用入口链接已复制！\n\n${appName}\n${link}`);
    }
  };

  // Copy data link to clipboard
  const handleCopyDataLink = async (appId: string, appName: string) => {
    const link = generateDataLink(appId);
    try {
      await navigator.clipboard.writeText(link);
      alert(`填写数据链接已复制！\n\n${appName}\n${link}`);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`填写数据链接已复制！\n\n${appName}\n${link}`);
    }
  };

  // Handle delete with validation (BR-2.3)
  const handleDeleteApp = (app: Application) => {
    if (app.publishedFormsCount > 0) {
      alert(`该应用下存在 ${app.publishedFormsCount} 个已发布的表单，请先下线所有表单后再删除`);
      return;
    }
    
    if (confirm(`确定要删除应用"${app.name}"吗？\n\n删除后应用及相关配置数据将无法恢复。`)) {
      onDelete(app.id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">应用管理中心</h1>
        <p className="text-sm text-slate-600 mt-2">
          {userRole === 'super_admin' 
            ? '创建和管理外部协同应用，实现内外数据的高效流转'
            : '查看和管理已授权的应用，配置OA集成、表单设计和通知规则'
          }
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索应用名称或描述..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Story 2.3: 超级管理员才显示新建按钮 */}
        {userRole === 'super_admin' && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            新建应用
          </button>
        )}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const statusColor = statusColors[app.status];
          
          return (
            <div
              key={app.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* App Icon */}
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{app.name}</h3>
                      </div>
                      
                      {/* More Menu */}
                      <div className="relative group/menu">
                        <button className="p-1 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                          {userRole === 'super_admin' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDuplicate(app.id);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy className="w-3 h-3" />
                                复制应用
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApp(app);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                删除应用
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                        {statusColor.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">{app.description}</p>

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {/* Forms Count */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{app.formsCount} 个表单</span>
                    </div>
                    {app.publishedFormsCount > 0 && (
                      <span className="text-green-600">（{app.publishedFormsCount} 个已发布）</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{app.creator}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>更新于 {app.updateDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEnter(app.id)}
                    className="flex-1 px-3 py-1.5 text-sm text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors font-medium"
                  >
                    进入应用工作台
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAppSettings(app.id);
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    应用设置
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? '没有找到匹配的应用' : 
                 userRole === 'app_admin' ? '暂未获得任何应用访问权限' : '还没有应用'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? '尝试调整搜索条件或筛选器'
                  : userRole === 'app_admin'
                    ? '请联系超级管理员分配应用访问权限'
                    : '点击"新建应用"开始构建您的第一个应用'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && userRole === 'super_admin' && (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新建应用
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {applications.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
          <span>共 {applications.length} 个应用</span>
          <span>•</span>
          <span>{applications.filter(a => a.status === 'active').length} 个已集成</span>
          <span>•</span>
          <span>{applications.filter(a => a.status === 'draft').length} 个未集成</span>
        </div>
      )}

      {/* Create Application Dialog (Story 2.1) */}
      {showCreateDialog && (
        <CreateAppDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(data) => {
            onNew();
            setShowCreateDialog(false);
          }}
        />
      )}

      {/* App Settings Dialog (Story 2.2) */}
      {showAppSettings && (
        <AppSettingsDialog
          app={applications.find(a => a.id === showAppSettings)!}
          onClose={() => setShowAppSettings(null)}
          onSave={(data) => {
            onEdit(showAppSettings);
            setShowAppSettings(null);
          }}
        />
      )}
    </div>
  );
}

// Story 2.1: Create Application Dialog
function CreateAppDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // BR-2.2: 名称长度限制
    if (name.length > 50) {
      setError('应用名称不能超过50个字符');
      return;
    }
    
    if (!name.trim()) {
      setError('请输入应用名称');
      return;
    }
    
    // TODO: BR-2.1 检查名称唯一性（需要API调用）
    
    onCreate({ name, description });
  };

  // BR-2.2: 字数超限时按钮置灰
  const isNameTooLong = name.length > 50;
  const isDisabled = !name.trim() || isNameTooLong;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">新建应用</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Application Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                应用名称 <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${isNameTooLong ? 'text-red-500' : 'text-slate-500'}`}>
                {name.length}/50
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="例如：供应商入驻协同"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                isNameTooLong 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              maxLength={60}
            />
            {isNameTooLong && (
              <p className="text-xs text-red-500 mt-1">应用名称不能超过50个字符</p>
            )}
          </div>

          {/* Application Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              应用描述 <span className="text-slate-400">(选填)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述应用的用途和目标..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建应用
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Story 2.2: App Settings Dialog (Basic Info + Entry Link + SSO Config)
function AppSettingsDialog({
  app,
  onClose,
  onSave,
}: {
  app: Application;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'link' | 'sso'>('basic');
  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description);
  const [ssoProtocol, setSsoProtocol] = useState<'oauth2' | 'saml2'>('oauth2');
  const [ssoConfig, setSsoConfig] = useState({
    oauth2: {
      authEndpoint: '',
      clientId: '',
      clientSecret: '',
      primaryAppName: name,
      configAppName: '应用配置',
      dataAppName: '数据查看',
      configAppSelected: true,
      dataAppSelected: true,
      configAppPushed: false,
      dataAppPushed: false,
    },
    saml2: {
      idpMetadataUrl: '',
    },
  });
  const [ssoTestResult, setSsoTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });

  const tabs = [
    { id: 'basic' as const, label: '基本信息' },
    { id: 'link' as const, label: '应用配置' },
  ];

  const appLink = `https://admin.aihub.com/app/${app.id}`;
  const dataLink = `https://admin.aihub.com/app/${app.id}/data`;

  const handleCopyAppLink = async () => {
    try {
      await navigator.clipboard.writeText(appLink);
      alert('应用配置链接已复制到剪贴板！');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = appLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('应用配置链接已复制到剪贴板！');
    }
  };

  const handleCopyDataLink = async () => {
    try {
      await navigator.clipboard.writeText(dataLink);
      alert('数据查看链接已复制到剪贴板！');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = dataLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('数据查看链接已复制到剪贴板！');
    }
  };

  // Story 2.2: SSO连通性测试
  const handleTestSSO = () => {
    setSsoTestResult({ status: null, message: '测试中...' });
    
    setTimeout(() => {
      // 模拟测试
      const config = ssoProtocol === 'oauth2' ? ssoConfig.oauth2 : ssoConfig.saml2;
      const isEmpty = ssoProtocol === 'oauth2' 
        ? !config.authEndpoint || !config.clientId || !config.clientSecret
        : !config.idpMetadataUrl;
      
      if (isEmpty) {
        setSsoTestResult({
          status: 'error',
          message: '请填写完整的SSO配置信息'
        });
        return;
      }
      
      setSsoTestResult({
        status: 'success',
        message: 'SSO配置验证成功！授权端点连接正常。'
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">应用设置</h2>
            <p className="text-sm text-slate-600 mt-0.5">{app.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 transition-all text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    应用名称 <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${name.length > 50 ? 'text-red-500' : 'text-slate-500'}`}>
                    {name.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="应用名称"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  应用描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简要描述应用的用途和目标..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => onSave({ name, description })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存修改
                </button>
              </div>
            </div>
          )}

          {/* Entry Link Tab (Story 2.2) */}
          {activeTab === 'link' && (
            <div className="space-y-5">
              {/* SSO应用名称配置 */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">企业后台应用配置</h3>
                <p className="text-sm text-slate-600 mb-4">
                  配置应用在企业后台中的名称，用于SSO单点登录时的应用识别
                </p>
                
                <div className="space-y-4">
                  {/* 一级应用名称 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      一级应用名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.primaryAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, primaryAppName: e.target.value }
                      })}
                      placeholder="供应商管理"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* 二级应用配置名称 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="configAppCheckbox"
                        checked={ssoConfig.oauth2.configAppSelected}
                        onChange={(e) => setSsoConfig({
                          ...ssoConfig,
                          oauth2: { ...ssoConfig.oauth2, configAppSelected: e.target.checked }
                        })}
                        disabled={ssoConfig.oauth2.configAppPushed}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="configAppCheckbox" className="text-sm font-medium text-slate-700">
                        二级应用配置名称 <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.configAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, configAppName: e.target.value }
                      })}
                      placeholder="应用配置"
                      disabled={ssoConfig.oauth2.configAppPushed}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {ssoConfig.oauth2.configAppPushed && (
                      <p className="text-xs text-slate-500 mt-1">✓ 已推送，名称不可修改</p>
                    )}
                  </div>

                  {/* 二级数据查看名称 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="dataAppCheckbox"
                        checked={ssoConfig.oauth2.dataAppSelected}
                        onChange={(e) => setSsoConfig({
                          ...ssoConfig,
                          oauth2: { ...ssoConfig.oauth2, dataAppSelected: e.target.checked }
                        })}
                        disabled={ssoConfig.oauth2.dataAppPushed}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="dataAppCheckbox" className="text-sm font-medium text-slate-700">
                        二级数据查看名称 <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.dataAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, dataAppName: e.target.value }
                      })}
                      placeholder="数据查看"
                      disabled={ssoConfig.oauth2.dataAppPushed}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {ssoConfig.oauth2.dataAppPushed && (
                      <p className="text-xs text-slate-500 mt-1">✓ 已推送，名称不可修改</p>
                    )}
                  </div>

                  {/* 推送按钮 */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        // 推送逻辑
                        if (ssoConfig.oauth2.configAppSelected || ssoConfig.oauth2.dataAppSelected) {
                          setSsoConfig({
                            ...ssoConfig,
                            oauth2: {
                              ...ssoConfig.oauth2,
                              configAppPushed: ssoConfig.oauth2.configAppSelected ? true : ssoConfig.oauth2.configAppPushed,
                              dataAppPushed: ssoConfig.oauth2.dataAppSelected ? true : ssoConfig.oauth2.dataAppPushed,
                            }
                          });
                          // TODO: 应用变为进行时的逻辑
                          alert('应用配置已推送到企业后台！');
                        } else {
                          alert('请至少选择一个应用进行推送');
                        }
                      }}
                      disabled={ssoConfig.oauth2.configAppPushed && ssoConfig.oauth2.dataAppPushed}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {(ssoConfig.oauth2.configAppPushed && ssoConfig.oauth2.dataAppPushed) ? '已推送' : '推送到企业后台'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 mb-3">应用独立入口链接</h3>
                <p className="text-sm text-slate-600 mb-4">
                  此链接是该应用的专属管理入口，内部管理人员通过此链接访问应用工作台
                </p>

                {/* 应用配置链接 */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-600 mb-1">应用配置链接</label>
                      <code className="block text-sm text-slate-900 font-mono break-all">
                        {appLink}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyAppLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" />
                      复制链接
                    </button>
                  </div>
                </div>

                {/* 数据查看链接 */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-600 mb-1">数据查看链接</label>
                      <code className="block text-sm text-slate-900 font-mono break-all">
                        {dataLink}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyDataLink}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" />
                      复制链接
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">使用说明</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 应用配置链接：用于访问该应用工作台，进行表单设计和配置</li>
                      <li>• 数据查看链接：用于查看和管理该应用的填写数据</li>
                      <li>• <strong>推送规则：</strong>勾选需要推送的应用，未勾选的应用不会推送到企业后台</li>
                      <li>• <strong>名称修改规则：</strong>应用名称设置后推送，推送后名称不允许修改，请谨慎设置</li>
                      <li>• 配置应用生成，请到企业后台查看应用是否生成成功，成功后即建立SSO，用户通过企业后台账号即可单点登录</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SSO Config Tab (Story 2.2) */}
          {activeTab === 'sso' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-medium text-slate-900 mb-3">SSO单点登录配置</h3>
                <p className="text-sm text-slate-600 mb-4">
                  配置与企业内部后台管理系统的SSO集成，实现单点登录
                </p>
              </div>

              {/* Protocol Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SSO协议类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ssoProtocol"
                      value="oauth2"
                      checked={ssoProtocol === 'oauth2'}
                      onChange={(e) => setSsoProtocol('oauth2')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">OAuth 2.0</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ssoProtocol"
                      value="saml2"
                      checked={ssoProtocol === 'saml2'}
                      onChange={(e) => setSsoProtocol('saml2')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">SAML 2.0</span>
                  </label>
                </div>
              </div>

              {/* OAuth 2.0 Config */}
              {ssoProtocol === 'oauth2' && (
                <div className="space-y-4">
                  {/* 一级应用名称 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      一级应用名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.primaryAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, primaryAppName: e.target.value }
                      })}
                      placeholder="供应商管理"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* 二级应用配置名称 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="configAppCheckbox"
                        checked={ssoConfig.oauth2.configAppSelected}
                        onChange={(e) => setSsoConfig({
                          ...ssoConfig,
                          oauth2: { ...ssoConfig.oauth2, configAppSelected: e.target.checked }
                        })}
                        disabled={ssoConfig.oauth2.configAppPushed}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="configAppCheckbox" className="text-sm font-medium text-slate-700">
                        二级应用配置名称 <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.configAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, configAppName: e.target.value }
                      })}
                      placeholder="应用配置"
                      disabled={ssoConfig.oauth2.configAppPushed}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {ssoConfig.oauth2.configAppPushed && (
                      <p className="text-xs text-slate-500 mt-1">✓ 已推送，名称不可修改</p>
                    )}
                  </div>

                  {/* 二级数据查看名称 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="dataAppCheckbox"
                        checked={ssoConfig.oauth2.dataAppSelected}
                        onChange={(e) => setSsoConfig({
                          ...ssoConfig,
                          oauth2: { ...ssoConfig.oauth2, dataAppSelected: e.target.checked }
                        })}
                        disabled={ssoConfig.oauth2.dataAppPushed}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <label htmlFor="dataAppCheckbox" className="text-sm font-medium text-slate-700">
                        二级数据查看名称 <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ssoConfig.oauth2.dataAppName}
                      onChange={(e) => setSsoConfig({
                        ...ssoConfig,
                        oauth2: { ...ssoConfig.oauth2, dataAppName: e.target.value }
                      })}
                      placeholder="数据查看"
                      disabled={ssoConfig.oauth2.dataAppPushed}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {ssoConfig.oauth2.dataAppPushed && (
                      <p className="text-xs text-slate-500 mt-1">✓ 已推送，名称不可修改</p>
                    )}
                  </div>

                  {/* 推送按钮 */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        // 推送逻辑
                        if (ssoConfig.oauth2.configAppSelected || ssoConfig.oauth2.dataAppSelected) {
                          setSsoConfig({
                            ...ssoConfig,
                            oauth2: {
                              ...ssoConfig.oauth2,
                              configAppPushed: ssoConfig.oauth2.configAppSelected ? true : ssoConfig.oauth2.configAppPushed,
                              dataAppPushed: ssoConfig.oauth2.dataAppSelected ? true : ssoConfig.oauth2.dataAppPushed,
                            }
                          });
                          // TODO: 应用变为进行时的逻辑
                          alert('应用配置已推送到企业后台！');
                        } else {
                          alert('请至少选择一个应用进行推送');
                        }
                      }}
                      disabled={ssoConfig.oauth2.configAppPushed && ssoConfig.oauth2.dataAppPushed}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {(ssoConfig.oauth2.configAppPushed && ssoConfig.oauth2.dataAppPushed) ? '已推送' : '推送到企业后台'}
                    </button>
                  </div>
                </div>
              )}

              {/* SAML 2.0 Config */}
              {ssoProtocol === 'saml2' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    IdP元数据URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ssoConfig.saml2.idpMetadataUrl}
                    onChange={(e) => setSsoConfig({
                      ...ssoConfig,
                      saml2: { idpMetadataUrl: e.target.value }
                    })}
                    placeholder="https://sso.company.com/saml/metadata"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {/* Test SSO */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleTestSSO}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  保存并测试
                </button>

                {ssoTestResult.status && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    ssoTestResult.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {ssoTestResult.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${
                        ssoTestResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {ssoTestResult.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SSO首次登录说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">SSO首次登录说明</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 用户首次通过SSO登录时，系统自动创建AI-Bridge账号</li>
                      <li>• 新账号默认权限为该应用的工作台权限</li>
                      <li>• 超级管理员可手动更改角色权限</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
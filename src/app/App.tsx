import { useState } from 'react';
import { DesignStudioNew } from './components/DesignStudioNew';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SystemConfig } from './components/SystemConfig';
import { NotificationEngine } from './components/NotificationEngine';
import { AppCenter } from './components/AppCenter';
import { AppCreateModal } from './components/AppCreateModal';
import { SubmissionDataPage } from './components/SubmissionDataPage';
import { LoginPage } from './components/LoginPage';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminPanel } from './components/AdminPanel';
import { BillingManagement } from './components/BillingManagement';
import { TenantManagement } from './components/TenantManagement';
import { Zap, BarChart3, Settings, ArrowLeft, Bell, Building2, ChevronDown, User, LogOut, CreditCard } from 'lucide-react';

type TabType = 'design' | 'notification' | 'config' | 'analytics';

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
  publishedFormsCount: number;
  tags?: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDataPage, setShowDataPage] = useState(false);
  const [currentTenant, setCurrentTenant] = useState('华强集团');
  
  // Authentication and user management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; phone?: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<'main' | 'profile' | 'admin' | 'billing' | 'tenant'>('main');
  
  // 租户列表
  const tenants = [
    { id: 'tenant-1', name: '华强集团', status: 'active' },
    { id: 'tenant-2', name: '鑫源机械', status: 'active' },
    { id: 'tenant-3', name: '宏达化工', status: 'active' },
    { id: 'tenant-4', name: '优质包装', status: 'inactive' },
  ];
  
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'app-1',
      name: '供应商管理',
      description: '供应商入驻、资质审核、绩效评估等全生命周期管理',
      status: 'active',
      source: '集成采购部',
      creator: '张伟',
      createDate: '2026-02-20',
      updateDate: '2026-02-20',
      formsCount: 3,
      publishedFormsCount: 2,
      tags: ['供应商管理'],
    },
    {
      id: 'app-2',
      name: '资产盘点',
      description: '固定资产、低值易耗品等资产的定期盘点与核对',
      status: 'active',
      source: '系统集成部',
      creator: '李雷',
      createDate: '2026-02-15',
      updateDate: '2026-02-15',
      formsCount: 5,
      publishedFormsCount: 4,
      tags: ['资产管理'],
    },
    {
      id: 'app-3',
      name: '客户关系管理',
      description: '客户信息维护、销售线索跟进、商机管理等CRM功能',
      status: 'draft',
      source: '生产资源部',
      creator: '王强',
      createDate: '2026-02-25',
      updateDate: '2026-02-25',
      formsCount: 2,
      publishedFormsCount: 0,
      tags: ['客户管理'],
    },
  ]);

  const tabs = [
    { id: 'config' as const, label: '连接', icon: Settings, desc: 'Connector', step: 1 },
    { id: 'design' as const, label: '表单', icon: Zap, desc: 'Design', step: 2 },
    { id: 'notification' as const, label: '通知', icon: Bell, desc: 'Notification', step: 3 },
    { id: 'analytics' as const, label: '数据', icon: BarChart3, desc: 'Data', step: 4 },
  ];

  const handleCreateApp = (data: { name: string; description: string; source?: string }) => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      name: data.name,
      description: data.description,
      status: 'draft',
      source: data.source,
      creator: '当前用户',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      formsCount: 0,
      publishedFormsCount: 0,
      tags: [],
    };
    setApplications(prev => [...prev, newApp]);
    setSelectedApp(newApp.id);
  };

  const handleEditApp = (appId: string) => {
    setSelectedApp(appId);
    setActiveTab('design');
  };

  const handleDuplicateApp = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const newApp: Application = {
        ...app,
        id: `app-${Date.now()}`,
        name: `${app.name} (副本)`,
        status: 'draft',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
      setApplications(prev => [...prev, newApp]);
    }
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('确定要删除这个应用吗？')) {
      setApplications(prev => prev.filter(a => a.id !== appId));
      if (selectedApp === appId) {
        setSelectedApp(null);
      }
    }
  };

  const handleBackToApps = () => {
    setSelectedApp(null);
    setActiveTab('design');
  };

  const handleViewData = (appId: string) => {
    setShowDataPage(true);
  };

  const handleLogin = (username: string, role: string) => {
    setCurrentUser({ username, role, phone: '' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedApp(null);
  };

  const handleSaveProfile = (data: { phone: string; password?: string }) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, phone: data.phone });
      alert('个人信息已更新！');
    }
  };

  const currentApp = applications.find(a => a.id === selectedApp);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show profile settings page
  if (currentPage === 'profile' && currentUser) {
    return (
      <ProfileSettings
        currentUser={currentUser}
        onBack={() => setCurrentPage('main')}
        onSave={(data) => {
          handleSaveProfile(data);
          setCurrentPage('main');
        }}
      />
    );
  }

  // Show admin panel page
  if (currentPage === 'admin') {
    return (
      <AdminPanel 
        onBack={() => setCurrentPage('main')}
        onNavigateToTenant={() => setCurrentPage('tenant')}
      />
    );
  }

  // Show billing management page
  if (currentPage === 'billing') {
    return (
      <BillingManagement
        currentTenant={currentTenant}
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  // Show tenant management page
  if (currentPage === 'tenant') {
    return (
      <TenantManagement
        onBack={() => setCurrentPage('main')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedApp && (
                <button
                  onClick={handleBackToApps}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="返回应用列表"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Bridge
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedApp && currentApp 
                    ? `当前应用：${currentApp.name}`
                    : '企业内外协同连接平台'
                  }
                </p>
              </div>
              
              {/* Tenant Switcher */}
              <div className="relative group/tenant ml-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">{currentTenant}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover/tenant:opacity-100 group-hover/tenant:visible transition-all z-20">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">切换租户</p>
                  </div>
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => setCurrentTenant(tenant.name)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                        currentTenant === tenant.name ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${currentTenant === tenant.name ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={currentTenant === tenant.name ? 'text-blue-700 font-medium' : 'text-slate-700'}>
                          {tenant.name}
                        </span>
                      </div>
                      {tenant.status === 'active' ? (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                      )}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-slate-100 mt-1">
                    <button 
                      onClick={() => setCurrentPage('tenant')}
                      className="w-full text-xs text-blue-600 hover:text-blue-700 text-left font-medium"
                    >
                      + 添加新租户
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Billing Button */}
              <button
                onClick={() => setCurrentPage('billing')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                title="积分账单"
              >
                <CreditCard className="w-5 h-5 text-slate-600" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setCurrentPage('admin')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="系统管理"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>

              {/* User Avatar Dropdown */}
              <div className="relative group/user">
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{currentUser?.username}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* User Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-20">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">当前用户</p>
                    <p className="text-sm font-medium text-slate-900">{currentUser?.username}</p>
                    {currentUser?.role === 'superadmin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                        超级管理员
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">个人设置</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only show when app is selected */}
      {selectedApp && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Guideline Steps */}
              <div className="flex items-center gap-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCompleted = false; // TODO: Add completion logic
                  
                  return (
                    <div key={tab.id} className="flex items-center">
                      {index > 0 && (
                        <div className="w-12 h-0.5 bg-slate-200 mx-1"></div>
                      )}
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Step Number */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tab.step}
                        </div>
                        
                        {/* Step Info */}
                        <div className="text-left">
                          <div className={`font-medium text-sm ${
                            isActive ? 'text-blue-700' : 'text-slate-700'
                          }`}>
                            {tab.label}
                          </div>
                          <div className={`text-xs ${
                            isActive ? 'text-blue-600' : 'text-slate-500'
                          }`}>
                            {tab.desc}
                          </div>
                        </div>
                        
                        {/* Step Icon */}
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Right Side Text */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="text-right">
                  <div className="text-xs text-slate-600">完成以下步骤</div>
                  <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    4步完成内外协同
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showDataPage ? (
          <SubmissionDataPage onBack={() => setShowDataPage(false)} />
        ) : !selectedApp ? (
          <AppCenter
            applications={applications}
            onNew={() => setShowCreateModal(true)}
            onEdit={handleEditApp}
            onDuplicate={handleDuplicateApp}
            onDelete={handleDeleteApp}
            onEnter={(appId) => setSelectedApp(appId)}
            onViewData={handleViewData}
          />
        ) : (
          <>
            {activeTab === 'design' && <DesignStudioNew />}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'config' && <SystemConfig />}
            {activeTab === 'notification' && <NotificationEngine />}
          </>
        )}
      </main>

      {/* Create App Modal */}
      {showCreateModal && (
        <AppCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateApp}
        />
      )}
    </div>
  );
}
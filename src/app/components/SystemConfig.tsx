import { useState } from 'react';
import { Database, Link, Shield, CheckCircle, Settings, Plus, RefreshCw, Edit, X, AlertCircle, Mail, MessageSquare, Eye, EyeOff, Users, Upload, Download, Trash2, FileUp } from 'lucide-react';

type ConfigTab = 'integration' | 'sms' | 'email' | 'multi-account';

interface TableMapping {
  id: string;
  tableName: string;
  oaFormCode: string;
  oaFormType: 'process' | 'non-process';
  permissionId?: string;
  direction: 'push' | 'call';
  timing: 'immediate' | 'delayed' | 'scheduled';
  delayMinutes?: number;
  scheduledTime?: string;
  multiData: 'allow' | 'deny' | 'latest';
  testDataStartTime?: string;
  testDataEndTime?: string;
}

interface SmsConfig {
  provider: 'aliyun' | 'tencent' | 'custom';
  // 阿里云/腾讯云字段
  accessKey: string;
  secretKey: string;
  signName: string;
  templateCode: string;
  // 集微字段
  jiweiAccount: string;
  jiweiPassword: string;
  jiweiServiceUrl: string;
  jiweiMessageTemplate: string;
}

interface EmailConfig {
  method: 'smtp' | 'api';
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  apiKey: string;
  senderEmail: string;
}

interface MultiAccount {
  id: string;
  internalUserName: string;
  phone: string;
  oaLoginAccount: string;
  emailAddress: string;
}

interface AccountRelationMapping {
  id: string;
  formName: string;
  mappingType: 'submitter' | 'custom'; // 映射类型：关联提交人 或 自定义关系
  relatedForm?: string; // 关联的表单（B表）
  matchField?: string; // 匹配字段（默认提交人）
  mappingFile?: File;
  mappingFileName?: string;
  mappingData?: Array<{
    formField: string;
    fieldValue: string;
    internalUserName: string;
    internalUserPhone: string;
  }>;
  mappingDataCount?: number; // 导入数据条数
}

export function SystemConfig() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('integration');
  const [selectedConnection, setSelectedConnection] = useState<string | null>('zhiyuan-oa');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTableMappingDialog, setShowTableMappingDialog] = useState(false);
  
  // Version22: 测试结果
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  const [mockTestResult, setMockTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  
  // 密码显示控制
  const [showSmsAk, setShowSmsAk] = useState(false);
  const [showSmsSk, setShowSmsSk] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showEmailApiKey, setShowEmailApiKey] = useState(false);

  // 连接配置表单状态
  const [connectionForm, setConnectionForm] = useState({
    systemVersion: 'V5',
    oaServerUrl: '',
    restAccount: '',
    restPassword: '',
    oaLoginAccount: '',
  });

  const [newConnection, setNewConnection] = useState({
    oaName: '',
    oaAccount: '',
    restIdAccount: '',
    restIdPassword: '',
    oaServerUrl: '',
  });
  
  const [newTableMapping, setNewTableMapping] = useState<TableMapping>({
    id: '',
    tableName: '',
    oaFormCode: '',
    oaFormType: 'process',
    permissionId: '',
    direction: 'push',
    timing: 'immediate',
    delayMinutes: 0,
    scheduledTime: '',
    multiData: 'allow',
    testDataStartTime: '',
    testDataEndTime: '',
  });
  
  const [tableMappings, setTableMappings] = useState<TableMapping[]>([
    {
      id: 'map-1',
      tableName: '供应商管理',
      oaFormCode: 'TBL_001',
      oaFormType: 'process',
      permissionId: 'perm-001',
      direction: 'push',
      timing: 'immediate',
      multiData: 'allow',
    },
    {
      id: 'map-2',
      tableName: '采购流程',
      oaFormCode: 'TBL_002',
      oaFormType: 'process',
      permissionId: 'perm-002',
      direction: 'call',
      timing: 'delayed',
      delayMinutes: 30,
      multiData: 'latest',
    },
    {
      id: 'map-3',
      tableName: '合同管理',
      oaFormCode: 'TBL_003',
      oaFormType: 'non-process',
      permissionId: 'perm-003',
      direction: 'push',
      timing: 'scheduled',
      scheduledTime: '09:00',
      multiData: 'deny',
    },
  ]);
  
  const connections = [
    {
      id: 'zhiyuan-oa',
      name: '致远OA',
      type: 'REST API',
      status: 'connected',
      url: 'https://oa.example.com/api',
      oaAccount: 'admin',
      restIdAccount: 'rest_user_001',
      oaServerUrl: 'http://v5.test.iform.cc',
      systemVersion: 'V5',
      lastSync: '2分钟前',
    },
  ];

  // 短信配置 (Story 3.4)
  const [smsConfig, setSmsConfig] = useState({
    provider: 'aliyun' as 'aliyun' | 'tencent' | 'custom',
    accessKey: '****3d5f',
    secretKey: '****7g8h',
    signName: 'AI-Bridge平台',
    templateCode: 'SMS_123456789',
    jiweiAccount: '',
    jiweiPassword: '',
    jiweiServiceUrl: 'http://api.jiwei.com/sms/send',
    jiweiMessageTemplate: '【AI-Bridge】您的验证码是：{code}，有效期5分钟。',
  });

  // 邮件配置 (Story 3.5 - P1)
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    method: 'smtp',
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'noreply@example.com',
    smtpPassword: '****pwd',
    apiKey: '',
    senderEmail: 'noreply@example.com',
  });

  // 多账号配置
  const [multiAccounts, setMultiAccounts] = useState<MultiAccount[]>([
    {
      id: 'acc-1',
      internalUserName: '张伟',
      phone: '13800138000',
      oaLoginAccount: 'zhangwei',
      emailAddress: 'zhangwei@company.com',
    },
    {
      id: 'acc-2',
      internalUserName: '李雷',
      phone: '13900139000',
      oaLoginAccount: 'lilei',
      emailAddress: 'lilei@company.com',
    },
  ]);

  const [relationMappings, setRelationMappings] = useState<AccountRelationMapping[]>([
    {
      id: 'rel-1',
      formName: '供应商入驻表单',
      mappingType: 'submitter',
      relatedForm: '员工名单表',
      matchField: '提交人',
    },
    {
      id: 'rel-2',
      formName: '资产盘点表单',
      mappingType: 'custom',
      mappingFileName: 'asset_mapping.xlsx',
      mappingDataCount: 5,
      mappingData: [
        { formField: '供应商类型', fieldValue: '一般供应商', internalUserName: '张伟', internalUserPhone: '13800138000' },
        { formField: '供应商类型', fieldValue: '重点供应商', internalUserName: '李雷', internalUserPhone: '13900139000' },
        { formField: '供应商级别', fieldValue: 'A级供应商', internalUserName: '王强', internalUserPhone: '13700137000' },
        { formField: '供应商级别', fieldValue: 'B级供应商', internalUserName: '张伟', internalUserPhone: '13800138000' },
        { formField: '供应商地区', fieldValue: '华东地区', internalUserName: '李雷', internalUserPhone: '13900139000' },
      ],
    },
  ]);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [showAddMappingModal, setShowAddMappingModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MultiAccount | null>(null);
  const [editingMapping, setEditingMapping] = useState<AccountRelationMapping | null>(null);
  const [showMappingDetailModal, setShowMappingDetailModal] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<AccountRelationMapping | null>(null);

  const configTabs = [
    { id: 'integration' as const, label: '系统集成', icon: Database },
    { id: 'sms' as const, label: '短信配置', icon: MessageSquare },
    { id: 'email' as const, label: '邮件配置', icon: Mail },
    { id: 'multi-account' as const, label: '多账号配置', icon: Users },
  ];

  // Version22: 测试连通性
  const handleTestConnection = () => {
    setTestResult({ status: null, message: '测试中...' });
    
    setTimeout(() => {
      const conn = connections.find(c => c.id === selectedConnection);
      if (!conn) return;
      
      // URL格式验证
      if (!conn.url.match(/^https?:\/\/.+/)) {
        setTestResult({ 
          status: 'error', 
          message: '请输入有效的服务地址（如 http://oa.example.com）' 
        });
        return;
      }
      
      // 模拟成功
      setTestResult({ 
        status: 'success', 
        message: `连接成功！OA版本: 致远A8 V5 8.0+，响应时间: 235ms` 
      });
    }, 1500);
  };

  // Version22: Mock数据测试
  const handleMockTest = () => {
    setMockTestResult({ status: null, message: '发送测试数据中...' });
    
    setTimeout(() => {
      setMockTestResult({ 
        status: 'success', 
        message: '写入测试成功，OA已收到测试记录 (MessageId: MSG_20260314_001)' 
      });
    }, 2000);
  };

  // Story 3.4: 发送测试短信
  const handleSendTestSms = () => {
    if (!testPhone) {
      alert('请输入测试手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(testPhone)) {
      alert('手机号格式不正确');
      return;
    }

    // 根据不同服务商显示不同的测试结果
    if (smsConfig.provider === 'custom') {
      // 集微服务商
      if (!smsConfig.jiweiAccount || !smsConfig.jiweiPassword || !smsConfig.jiweiServiceUrl) {
        alert('请先完善集微配置信息（账号、密码、服务地址）');
        return;
      }
      alert(`测试短信已通过集微 HTTP JSON 协议发送\n接收号码：${testPhone}\n服务地址：${smsConfig.jiweiServiceUrl}\n发送状态：成功\n响应ID：JW_${Date.now()}`);
    } else {
      // 阿里云/腾讯云
      alert(`测试短信已发送至 ${testPhone}\n服务商：${smsConfig.provider === 'aliyun' ? '阿里云' : '腾讯云'}\nMessageId: SMS_20260314_001`);
    }
  };

  // Story 3.5: 发送测试邮件 (P1)
  const handleSendTestEmail = () => {
    if (!testEmail) {
      alert('请输入测试邮箱');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      alert('邮箱格式不正确');
      return;
    }
    
    alert(`测试邮件已发送至 ${testEmail}\n请检查收件箱（含垃圾邮件文件夹）`);
  };

  const handleSaveSmsConfig = () => {
    // 根据不同服务商验证必填字段
    if (smsConfig.provider === 'custom') {
      // 集微服务商
      if (!smsConfig.jiweiAccount || !smsConfig.jiweiPassword || !smsConfig.jiweiServiceUrl) {
        alert('请填写所有必填字段（账号、密码、服务地址）');
        return;
      }
      alert('集微短信配置保存成功！账号密码已加密存储。');
    } else {
      // 阿里云/腾讯云
      if (!smsConfig.accessKey || !smsConfig.secretKey || !smsConfig.signName || !smsConfig.templateCode) {
        alert('请填写所有必填字段');
        return;
      }
      alert('短信配置保存成功！AccessKey/SecretKey已加密存储。');
    }
  };

  const handleSaveEmailConfig = () => {
    if (emailConfig.method === 'smtp') {
      if (!emailConfig.smtpServer || !emailConfig.smtpPort || !emailConfig.smtpUsername || !emailConfig.smtpPassword) {
        alert('请填写所有SMTP配置字段');
        return;
      }
    } else {
      if (!emailConfig.apiKey || !emailConfig.senderEmail) {
        alert('请填写API配置字段');
        return;
      }
    }
    
    alert('邮件配置保存成功！凭证已加密存储。');
  };

  // 添加数据表映射
  const handleAddTableMapping = () => {
    if (!newTableMapping.tableName || !newTableMapping.oaFormCode) {
      alert('请填写表单名称和OA表单编码');
      return;
    }
    
    // 如果是非流程表单，需要验证权限ID
    if (newTableMapping.oaFormType === 'non-process' && !newTableMapping.permissionId) {
      alert('非流程表单需要填写权限ID');
      return;
    }
    
    const mapping: TableMapping = {
      ...newTableMapping,
      id: `map-${Date.now()}`,
    };
    
    setTableMappings([...tableMappings, mapping]);
    setShowTableMappingDialog(false);

    // 重置表单
    setNewTableMapping({
      id: '',
      tableName: '',
      oaFormCode: '',
      oaFormType: 'process',
      permissionId: '',
      direction: 'push',
      timing: 'immediate',
      delayMinutes: 0,
      scheduledTime: '',
      multiData: 'allow',
      testDataStartTime: '',
      testDataEndTime: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 px-6">
            {configTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
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

        {/* System Integration Tab (Version21 + Version22 Tests) */}
        {activeTab === 'integration' && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Connection List */}
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900">企业系统连接</h2>
                  <p className="text-sm text-slate-600 mt-1">管理与企业系统的数据连接</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedConnection === conn.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-slate-600" />
                          <h3 className="font-medium text-slate-900">{conn.name}</h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            conn.status === 'connected'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {conn.status === 'connected' ? '已连接' : '未连接'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Link className="w-3 h-3" />
                          <span className="text-xs">{conn.type}</span>
                        </div>
                        {conn.status === 'connected' && (
                          <div className="text-xs text-slate-500">
                            最后同步: {conn.lastSync}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Details */}
              {selectedConnection && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">连接配置</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {connections.find(c => c.id === selectedConnection)?.name}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          系统版本 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={connectionForm.systemVersion || connections.find(c => c.id === selectedConnection)?.systemVersion || 'V5'}
                          onChange={(e) => setConnectionForm({ ...connectionForm, systemVersion: e.target.value })}
                          placeholder="V5"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          OA服务器地址 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={connectionForm.oaServerUrl || connections.find(c => c.id === selectedConnection)?.oaServerUrl || ''}
                          onChange={(e) => setConnectionForm({ ...connectionForm, oaServerUrl: e.target.value })}
                          placeholder="请输入OA服务器地址"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Rest账号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={connectionForm.restAccount || connections.find(c => c.id === selectedConnection)?.restIdAccount || ''}
                          onChange={(e) => setConnectionForm({ ...connectionForm, restAccount: e.target.value })}
                          placeholder="请输入Rest账号"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Rest密码 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={connectionForm.restPassword}
                          onChange={(e) => setConnectionForm({ ...connectionForm, restPassword: e.target.value })}
                          placeholder="请输入Rest密码"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          OA登录账号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={connectionForm.oaLoginAccount || connections.find(c => c.id === selectedConnection)?.oaAccount || ''}
                          onChange={(e) => setConnectionForm({ ...connectionForm, oaLoginAccount: e.target.value })}
                          placeholder="请输入OA登录账号"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                      </div>

                      {/* Version22: 接口测试区域 */}
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="font-medium text-slate-900 mb-3 text-sm">接口测试</h4>
                        
                        <div className="space-y-3">
                          {/* 连通性测试 */}
                          <div>
                            <button
                              onClick={handleTestConnection}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                            >
                              <RefreshCw className="w-4 h-4" />
                              测试连通性
                            </button>
                            
                            {testResult.status && (
                              <div className={`mt-2 p-2 rounded-lg border text-xs ${
                                testResult.status === 'success'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {testResult.status === 'success' ? (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  )}
                                  <p>{testResult.message}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mock数据测试 */}
                          <div>
                            <button
                              onClick={handleMockTest}
                              disabled={testResult.status !== 'success'}
                              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Database className="w-4 h-4" />
                              Mock数据测试
                            </button>
                            
                            {mockTestResult.status && (
                              <div className={`mt-2 p-2 rounded-lg border text-xs ${
                                mockTestResult.status === 'success'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {mockTestResult.status === 'success' ? (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  )}
                                  <p>{mockTestResult.message}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                          保存配置
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Data Mapping */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">表单映射</h3>
                    <p className="text-sm text-slate-600 mb-4">已对接的业务表</p>

                    <div className="space-y-3">
                      {tableMappings.map((table) => (
                        <div
                          key={table.id}
                          className="p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-sm text-slate-900">
                                  {table.tableName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  表ID: {table.oaFormCode}
                                </div>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-xs">
                              配置
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-600 ml-6">
                            <span className={`px-2 py-0.5 rounded ${table.oaFormType === 'process' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {table.oaFormType === 'process' ? '流程表单' : '非流程表单'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full mt-4 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-700 text-sm"
                      onClick={() => setShowTableMappingDialog(true)}
                    >
                      + 添加表单映射
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SMS Config (Story 3.4) */}
        {activeTab === 'sms' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">短信通知服务配置</h3>
              <p className="text-sm text-slate-600">
                配置短信服务商接口参数，支持阿里云、腾讯云和自定义服务商
              </p>
            </div>

            {/* 服务商选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                短信服务商 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="aliyun"
                    checked={smsConfig.provider === 'aliyun'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'aliyun' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">阿里云</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="tencent"
                    checked={smsConfig.provider === 'tencent'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'tencent' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">腾讯云</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="custom"
                    checked={smsConfig.provider === 'custom'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'custom' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">集微</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                通过SmsClientFactory动态切换，无需重启服务。{smsConfig.provider === 'custom' && '当前版本仅支持通过集微 HTTP JSON 协议直接下发短信正文。'}
              </p>
            </div>

            {/* 阿里云/腾讯云配置 */}
            {(smsConfig.provider === 'aliyun' || smsConfig.provider === 'tencent') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    AccessKey <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmsAk ? 'text' : 'password'}
                      value={smsConfig.accessKey}
                      onChange={(e) => setSmsConfig({ ...smsConfig, accessKey: e.target.value })}
                      placeholder="输入AccessKey"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmsAk(!showSmsAk)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSmsAk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SecretKey <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmsSk ? 'text' : 'password'}
                      value={smsConfig.secretKey}
                      onChange={(e) => setSmsConfig({ ...smsConfig, secretKey: e.target.value })}
                      placeholder="输入SecretKey"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmsSk(!showSmsSk)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSmsSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    短信签名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={smsConfig.signName}
                    onChange={(e) => setSmsConfig({ ...smsConfig, signName: e.target.value })}
                    placeholder="AI-Bridge平台"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    模板CODE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={smsConfig.templateCode}
                    onChange={(e) => setSmsConfig({ ...smsConfig, templateCode: e.target.value })}
                    placeholder="SMS_123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* 集微配置 */}
            {smsConfig.provider === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    账号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={smsConfig.jiweiAccount}
                    onChange={(e) => setSmsConfig({ ...smsConfig, jiweiAccount: e.target.value })}
                    placeholder="请输入集微账号"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmsAk ? 'text' : 'password'}
                      value={smsConfig.jiweiPassword}
                      onChange={(e) => setSmsConfig({ ...smsConfig, jiweiPassword: e.target.value })}
                      placeholder="请输入密码"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmsAk(!showSmsAk)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSmsAk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    服务地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={smsConfig.jiweiServiceUrl}
                    onChange={(e) => setSmsConfig({ ...smsConfig, jiweiServiceUrl: e.target.value })}
                    placeholder="http://api.jiwei.com/sms/send"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* 测试短信 */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-medium text-slate-900 mb-4">发送测试短信</h4>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="输入测试手机号"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendTestSms}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  发送测试
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                💡 发送成功后会显示MessageId，失败时显示具体错误（余额不足/签名未审核/手机号格式错误）
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                重置
              </button>
              <button
                onClick={handleSaveSmsConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                保存配置
              </button>
            </div>
          </div>
        )}

        {/* Email Config (Story 3.5 - P1) */}
        {activeTab === 'email' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">邮件通知服务配置</h3>
              <p className="text-sm text-slate-600">
                配置SMTP服务器或邮件服务商API，支持SendGrid、阿里云邮件推送等
              </p>
            </div>

            {/* 发送方式选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                发送方式 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="emailMethod"
                    value="smtp"
                    checked={emailConfig.method === 'smtp'}
                    onChange={(e) => setEmailConfig({ ...emailConfig, method: 'smtp' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">SMTP</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="emailMethod"
                    value="api"
                    checked={emailConfig.method === 'api'}
                    onChange={(e) => setEmailConfig({ ...emailConfig, method: 'api' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">服务商API</span>
                </label>
              </div>
            </div>

            {/* SMTP配置 */}
            {emailConfig.method === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SMTP服务器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpServer}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpServer: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SMTP端口 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人账号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUsername}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUsername: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                      placeholder="输入密码"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API配置 */}
            {emailConfig.method === 'api' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailApiKey ? 'text' : 'password'}
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                      placeholder="输入API Key"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailApiKey(!showEmailApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showEmailApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* 测试邮件 */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-medium text-slate-900 mb-4">发送测试邮件</h4>
              
              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="输入测试邮箱"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendTestEmail}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  发送测试
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                💡 测试邮件发送成功后，请检查收件箱（含垃圾邮件文件夹）
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                重置
              </button>
              <button
                onClick={handleSaveEmailConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                保存配置
              </button>
            </div>
          </div>
        )}

        {/* Multi-Account Config */}
        {activeTab === 'multi-account' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">多账号关系配置</h3>
              <p className="text-sm text-slate-600">
                可按不同业务人员身份发起内部流程，相关通知邮件同步抄送其邮箱。
              </p>
            </div>

            {/* 多账号维护 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">多账号维护</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBatchImportModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                  >
                    <FileUp className="w-4 h-4" />
                    批量导入
                  </button>
                  <button
                    onClick={() => {
                      setEditingAccount(null);
                      setShowAddAccountModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    新增账号
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">内部人员名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">手机号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">协同登录账号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">邮箱地址</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {multiAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{account.internalUserName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{account.phone}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{account.oaLoginAccount}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{account.emailAddress}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAccount(account);
                                setShowAddAccountModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`确定要删除账号 "${account.internalUserName}" 吗？`)) {
                                  setMultiAccounts(multiAccounts.filter(a => a.id !== account.id));
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {multiAccounts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">暂无账号配置</p>
                  </div>
                )}
              </div>
            </div>

            {/* 关系配置 */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">表单关系配置</h4>
                  <p className="text-xs text-slate-600 mt-1">配置不同表单与不同业务人员的对应关系</p>
                </div>
                <button
                  onClick={() => {
                    setEditingMapping(null);
                    setShowAddMappingModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增表单配置
                </button>
              </div>

              <div className="space-y-3">
                {relationMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-slate-900">{mapping.formName}</h5>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            mapping.mappingType === 'submitter'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {mapping.mappingType === 'submitter' ? '关联提交人' : '自定义关系'}
                          </span>
                        </div>
                        {mapping.mappingType === 'submitter' && mapping.relatedForm && (
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">关联表单：</span>
                              <span className="font-medium">{mapping.relatedForm}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">匹配字段：</span>
                              <span className="font-medium">{mapping.matchField || '提交人'}</span>
                            </div>
                          </div>
                        )}
                        {mapping.mappingType === 'custom' && mapping.mappingDataCount !== undefined && (
                          <button
                            onClick={() => {
                              setSelectedMapping(mapping);
                              setShowMappingDetailModal(true);
                            }}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Database className="w-3 h-3" />
                            <span>导入数据{mapping.mappingDataCount}条</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMapping(mapping);
                            setShowAddMappingModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑配置"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除"${mapping.formName}"的关系配置吗？`)) {
                              setRelationMappings(relationMappings.filter(m => m.id !== mapping.id));
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="删除配置"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {relationMappings.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 mb-2">暂无表单关系配置</p>
                    <p className="text-xs text-slate-400">为外部表单配置对应的业务人员关系</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Multi-Account Modal */}
      {showAddAccountModal && (
        <AddMultiAccountModal
          account={editingAccount}
          onClose={() => {
            setShowAddAccountModal(false);
            setEditingAccount(null);
          }}
          onSave={(account) => {
            if (editingAccount) {
              setMultiAccounts(multiAccounts.map(a => a.id === account.id ? account : a));
            } else {
              setMultiAccounts([...multiAccounts, { ...account, id: `acc-${Date.now()}` }]);
            }
            setShowAddAccountModal(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Batch Import Modal */}
      {showBatchImportModal && (
        <BatchImportAccountsModal
          onClose={() => setShowBatchImportModal(false)}
          onSave={(accounts) => {
            setMultiAccounts([...multiAccounts, ...accounts]);
            setShowBatchImportModal(false);
          }}
        />
      )}

      {/* Add Relation Mapping Modal */}
      {showAddMappingModal && (
        <AddRelationMappingModal
          mapping={editingMapping}
          onClose={() => {
            setShowAddMappingModal(false);
            setEditingMapping(null);
          }}
          onSave={(mapping) => {
            if (editingMapping) {
              setRelationMappings(relationMappings.map(m => m.id === mapping.id ? mapping : m));
            } else {
              setRelationMappings([...relationMappings, { ...mapping, id: `rel-${Date.now()}` }]);
            }
            setShowAddMappingModal(false);
            setEditingMapping(null);
          }}
        />
      )}

      {/* Mapping Detail Modal */}
      {showMappingDetailModal && selectedMapping && (
        <MappingDetailModal
          mapping={selectedMapping}
          onClose={() => {
            setShowMappingDetailModal(false);
            setSelectedMapping(null);
          }}
        />
      )}

      {/* Table Mapping Dialog */}
      {showTableMappingDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTableMappingDialog(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">
                添加表单映射
              </h2>
              <button
                onClick={() => setShowTableMappingDialog(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* 表单信息 */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                  表单信息
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      表单名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTableMapping.tableName}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, tableName: e.target.value })}
                      placeholder="例如：供应商入驻申请"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      OA表单编码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTableMapping.oaFormCode}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, oaFormCode: e.target.value })}
                      placeholder="例如：TBL_004"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* OA表单类型 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    OA表单类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="oaFormType"
                        value="process"
                        checked={newTableMapping.oaFormType === 'process'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, oaFormType: 'process', permissionId: '' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">流程表单</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="oaFormType"
                        value="non-process"
                        checked={newTableMapping.oaFormType === 'non-process'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, oaFormType: 'non-process' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">非流程表单</span>
                    </label>
                  </div>
                </div>

                {/* 权限ID - 仅在非流程表单时显示 */}
                {newTableMapping.oaFormType === 'non-process' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      权限ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTableMapping.permissionId || ''}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, permissionId: e.target.value })}
                      placeholder="例如：PERM_001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                )}
              </div>

              {/* 测试表单数据时间段 */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                  测试表单数据时间段
                </h3>

                <p className="text-sm text-slate-600">
                  协同表单配置后发起一条测试数据，并在此配置数据的发起时间
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      开始时间
                    </label>
                    <input
                      type="datetime-local"
                      value={newTableMapping.testDataStartTime}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, testDataStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      结束时间
                    </label>
                    <input
                      type="datetime-local"
                      value={newTableMapping.testDataEndTime}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, testDataEndTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTableMappingDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddTableMapping}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加映射
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Multi-Account Modal Component
function AddMultiAccountModal({
  account,
  onClose,
  onSave,
}: {
  account: MultiAccount | null;
  onClose: () => void;
  onSave: (account: MultiAccount) => void;
}) {
  const [formData, setFormData] = useState<MultiAccount>(
    account || {
      id: '',
      internalUserName: '',
      phone: '',
      oaLoginAccount: '',
      emailAddress: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.internalUserName || !formData.phone || !formData.oaLoginAccount || !formData.emailAddress) {
      alert('请填写所有必填字段');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {account ? '编辑账号' : '新增账号'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              内部人员名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.internalUserName}
              onChange={(e) => setFormData({ ...formData, internalUserName: e.target.value })}
              placeholder="请输入内部人员名称"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              手机号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              协同登录账号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.oaLoginAccount}
              onChange={(e) => setFormData({ ...formData, oaLoginAccount: e.target.value })}
              placeholder="请输入协同登录账号"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              邮箱地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.emailAddress}
              onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              placeholder="请输入邮箱地址"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {account ? '保存' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Relation Mapping Modal Component - 表单关系配置模态框
function AddRelationMappingModal({
  mapping,
  onClose,
  onSave,
}: {
  mapping: AccountRelationMapping | null;
  onClose: () => void;
  onSave: (mapping: AccountRelationMapping) => void;
}) {
  const [mappingType, setMappingType] = useState<'submitter' | 'custom'>(mapping?.mappingType || 'submitter');
  const [selectedForm, setSelectedForm] = useState(mapping?.formName || '');
  const [relatedForm, setRelatedForm] = useState(mapping?.relatedForm || '');
  const [matchField, setMatchField] = useState(mapping?.matchField || '手机号');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<1 | 2>(
    mapping?.mappingType === 'custom' && mapping?.mappingData ? 2 : 1
  ); // 1=上传文件, 2=预览确认
  // 默认模拟数据用于展示效果
  const [successData, setSuccessData] = useState<Array<{
    formField: string;
    fieldValue: string;
    internalUserName: string;
    internalUserPhone: string;
  }>>(
    mapping?.mappingData || [
      { formField: '供应商类型', fieldValue: '一般供应商', internalUserName: '张伟', internalUserPhone: '13800138000' },
      { formField: '供应商类型', fieldValue: '重点供应商', internalUserName: '李雷', internalUserPhone: '13900139000' },
      { formField: '供应商级别', fieldValue: 'A级供应商', internalUserName: '王强', internalUserPhone: '13700137000' },
    ]
  );
  const [failedData, setFailedData] = useState<Array<{
    row: number;
    data: string;
    reason: string;
  }>>([
    { row: 5, data: '供应商地区,华南地区,赵六,', reason: '数据不完整，缺少必填字段' },
    { row: 6, data: '供应商规模,大型供应商,孙七,138001380', reason: '手机号格式不正确' },
  ]);

  // 从表单映射列表获取可用的外部表单
  const availableForms = [
    '供应商入驻表单',
    '供应商报价表单',
    '资产盘点表单',
    '客户信息表单',
    '采购申请表单',
    '合同审批表单'
  ];

  // 可关联的表单（B表 - 包含账号信息的表单）
  const relatedForms = [
    '员工名单表',
    '业务人员表',
    '账号信息表'
  ];

  // 可匹配的字段
  const matchFields = [
    '提交人',
    '姓名',
    '工号',
    '邮箱',
    '手机号'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExt)) {
        alert('请上传Excel或CSV文件');
        return;
      }
      setUploadedFile(file);

      // 解析文件内容进行预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1); // 跳过表头

        const success: typeof successData = [];
        const failed: typeof failedData = [];

        dataLines.forEach((line, index) => {
          const [formField, fieldValue, userName, phone] = line.split(',').map(item => item.trim());

          // 验证数据
          if (!formField || !fieldValue || !userName || !phone) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '数据不完整，缺少必填字段'
            });
          } else if (!/^1[3-9]\d{9}$/.test(phone)) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '手机号格式不正确'
            });
          } else {
            success.push({
              formField,
              fieldValue,
              internalUserName: userName,
              internalUserPhone: phone
            });
          }
        });

        setSuccessData(success);
        setFailedData(failed);
        setUploadStep(2); // 进入预览步骤
      };

      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    // 下载表单关系映射模板 - Excel格式
    const csvContent = '表单字段,字段值,对应内部人员姓名,内部人员手机号\n供应商类型,一般供应商,张伟,13800138000\n供应商类型,重点供应商,李雷,13900139000\n供应商级别,A级供应商,王强,13700137000\n供应商级别,B级供应商,张伟,13800138000\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '表单关系映射模板.xlsx';
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) {
      alert('请选择外部表单');
      return;
    }

    if (mappingType === 'submitter') {
      if (!relatedForm) {
        alert('请选择关联表单');
        return;
      }
      onSave({
        id: mapping?.id || '',
        formName: selectedForm,
        mappingType: 'submitter',
        relatedForm,
        matchField,
      });
    } else {
      if (successData.length === 0) {
        alert('请上传映射配置文件并完成数据预览');
        return;
      }
      onSave({
        id: mapping?.id || '',
        formName: selectedForm,
        mappingType: 'custom',
        mappingFile: uploadedFile || mapping?.mappingFile,
        mappingFileName: uploadedFile?.name || mapping?.mappingFileName || '',
        mappingData: successData,
        mappingDataCount: successData.length,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 固定在顶部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{mapping ? '编辑表单关系配置' : '新增表单关系配置'}</h3>
            <p className="text-xs text-slate-600 mt-1">为指定外部表单配置业务人员对应关系</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form Content - 可滚动区域 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 选择外部表单 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择外部表单 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">请选择要配置的外部表单</option>
              {availableForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              选择表单列表中创建的外部表单
            </p>
          </div>

          {/* 选择映射方式 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              配置方式 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                mappingType === 'submitter' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  checked={mappingType === 'submitter'}
                  onChange={() => setMappingType('submitter')}
                  className="w-4 h-4 text-green-600"
                />
                <div>
                  <div className="font-medium text-slate-900">关联提交人</div>
                  <p className="text-xs text-slate-600 mt-1">通过字段关联，适合关联内部邀约人场景</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                mappingType === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  checked={mappingType === 'custom'}
                  onChange={() => {
                    setMappingType('custom');
                    setUploadStep(2); // 默认显示预览步骤
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="font-medium text-slate-900">自定义关系</div>
                  <p className="text-xs text-slate-600 mt-1">导入自定义映射配置，适合公开采集数据场景</p>
                </div>
              </label>
            </div>
          </div>

          {/* 关联提交人配置 */}
          {mappingType === 'submitter' && (
            <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择关联表单 <span className="text-red-500">*</span>
                </label>
                <select
                  value={relatedForm}
                  onChange={(e) => setRelatedForm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  required
                >
                  <option value="">请选择包含账号信息的表单</option>
                  {relatedForms.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  选择包含账号信息的表单（如报价邀约表、员工信息表等）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  匹配字段
                </label>
                <select
                  value={matchField}
                  onChange={(e) => setMatchField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  {matchFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-white border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-green-800">
                    <p className="font-medium mb-1">关联逻辑说明：</p>
                    <p>系统可提取关联表单内手机号字段作为唯一ID，匹配多账号维护中的信息，以他的身份发起内部流程，相关通知邮件同步抄送其邮箱。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 自定义关系配置 */}
          {mappingType === 'custom' && (
            <div className="space-y-4">
              {/* 步骤指示器 */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 1 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">1. 导入文件</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200"></div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">2. 数据预览</span>
                </div>
                <div className="flex-1 h-0.5 bg-slate-200"></div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 && successData.length > 0 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">3. 确认</span>
                </div>
              </div>

              {/* 步骤1: 上传文件 */}
              {uploadStep === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      上传映射配置文件 <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      下载模版
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="mapping-file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="mapping-file"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-10 h-10 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">点击上传文件</p>
                        <p className="text-xs text-slate-500 mt-1">
                          支持 .xlsx、.xls、.csv 格式
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">配置文件格式说明：</p>
                        <p>文件包含四列：<strong>表单字段</strong>、<strong>字段值</strong>、<strong>对应内部人员姓名</strong>、<strong>内部人员手机号</strong></p>
                        <p className="mt-1">示例：</p>
                        <code className="text-xs bg-white px-1 py-0.5 rounded block mt-1">供应商类型, 一般供应商, 张伟, 13800138000</code>
                        <p className="mt-1">含义：当该表单中"供应商类型"字段的值为"一般供应商"时，使用"13800138000"对应的账号发起流程，邮件通知抄送其邮箱</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤2: 数据预览 */}
              {uploadStep === 2 && (
                <div className="space-y-4">
                  {/* 成功数据预览 */}
                  {successData.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="text-sm font-medium text-slate-900">成功数据预览 ({successData.length} 条)</h4>
                      </div>
                      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">表单字段</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">字段值</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">对应内部人员</th>
                              <th className="px-3 py-2 text-left font-medium text-slate-700">内部人员手机号</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {successData.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-900">{item.formField}</td>
                                <td className="px-3 py-2 text-slate-600">{item.fieldValue}</td>
                                <td className="px-3 py-2 text-slate-600">{item.internalUserName}</td>
                                <td className="px-3 py-2 text-slate-600 font-mono">{item.internalUserPhone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 失败数据及原因 */}
                  {failedData.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h4 className="text-sm font-medium text-slate-900">失败数据 ({failedData.length} 条)</h4>
                      </div>
                      <div className="border border-red-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-red-50">
                        <table className="w-full text-xs">
                          <thead className="bg-red-100 border-b border-red-200 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-red-900">行号</th>
                              <th className="px-3 py-2 text-left font-medium text-red-900">数据</th>
                              <th className="px-3 py-2 text-left font-medium text-red-900">失败原因</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-200">
                            {failedData.map((item, index) => (
                              <tr key={index} className="hover:bg-red-100">
                                <td className="px-3 py-2 text-red-900">{item.row}</td>
                                <td className="px-3 py-2 text-red-700 font-mono text-xs">{item.data}</td>
                                <td className="px-3 py-2 text-red-600">{item.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 重新上传按钮 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setSuccessData([]);
                        setFailedData([]);
                        setUploadStep(1);
                      }}
                      className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      重新上传
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Footer - 固定在底部 */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                mappingType === 'submitter'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              保存配置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Batch Import Accounts Modal Component
function BatchImportAccountsModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (accounts: MultiAccount[]) => void;
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<1 | 2>(1); // 1=上传文件, 2=预览确认
  const [successData, setSuccessData] = useState<MultiAccount[]>([]);
  const [failedData, setFailedData] = useState<Array<{
    row: number;
    data: string;
    reason: string;
  }>>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExt)) {
        alert('请上传Excel或CSV文件');
        return;
      }
      setUploadedFile(file);

      // 解析文件并预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1); // 跳过表头

        const success: MultiAccount[] = [];
        const failed: typeof failedData = [];

        dataLines.forEach((line, index) => {
          const [internalUserName, phone, oaLoginAccount, emailAddress] = line.split(',').map(item => item.trim());

          // 验证数据
          if (!internalUserName || !phone || !oaLoginAccount || !emailAddress) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '数据不完整，缺少必填字段'
            });
          } else if (!/^1[3-9]\d{9}$/.test(phone)) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '手机号格式不正确'
            });
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '邮箱地址格式不正确'
            });
          } else {
            success.push({
              id: `acc-${Date.now()}-${index}`,
              internalUserName,
              phone,
              oaLoginAccount,
              emailAddress,
            });
          }
        });

        setSuccessData(success);
        setFailedData(failed);
        setUploadStep(2); // 进入预览步骤
      };

      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    // 下载批量导入模板
    const csvContent = '内部人员名称,手机号,协同登录账号,邮箱地址\n张伟,13800138000,zhangwei,zhangwei@company.com\n李雷,13900139000,lilei,lilei@company.com\n王强,13700137000,wangqiang,wangqiang@company.com\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '账号批量导入模板.csv';
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (successData.length === 0) {
      alert('没有可导入的有效数据');
      return;
    }

    onSave(successData);
    alert(`成功导入 ${successData.length} 个账号`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 固定在顶部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">批量导入账号</h3>
            <p className="text-xs text-slate-600 mt-1">通过Excel或CSV文件批量导入多个账号</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form Content - 可滚动区域 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 步骤指示器 */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">1. 导入文件</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">2. 数据预览</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 && successData.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">3. 确认</span>
              </div>
            </div>

            {/* 步骤1: 上传文件 */}
            {uploadStep === 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    上传账号文件 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    下载模版
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    id="batch-import-file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="batch-import-file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">点击上传文件</p>
                      <p className="text-xs text-slate-500 mt-1">
                        支持 .xlsx、.xls、.csv 格式
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">模版格式说明：</p>
                      <p>模版包含四列：<strong>内部人员名称</strong>、<strong>手机号</strong>、<strong>协同登录账号</strong>、<strong>邮箱地址</strong></p>
                      <p className="mt-1">示例：</p>
                      <code className="text-xs bg-white px-1 py-0.5 rounded block mt-1">张伟, 13800138000, zhangwei, zhangwei@company.com</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤2: 数据预览 */}
            {uploadStep === 2 && (
              <div className="space-y-4">
                {/* 成功数据预览 */}
                {successData.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-medium text-slate-900">成功数据预览 ({successData.length} 条)</h4>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">内部人员名称</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">手机号</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">协同登录账号</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">邮箱地址</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {successData.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-900">{item.internalUserName}</td>
                              <td className="px-3 py-2 text-slate-600 font-mono">{item.phone}</td>
                              <td className="px-3 py-2 text-slate-600">{item.oaLoginAccount}</td>
                              <td className="px-3 py-2 text-slate-600">{item.emailAddress}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 失败数据及原因 */}
                {failedData.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-medium text-slate-900">失败数据 ({failedData.length} 条)</h4>
                    </div>
                    <div className="border border-red-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-red-50">
                      <table className="w-full text-xs">
                        <thead className="bg-red-100 border-b border-red-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-red-900">行号</th>
                            <th className="px-3 py-2 text-left font-medium text-red-900">数据</th>
                            <th className="px-3 py-2 text-left font-medium text-red-900">失败原因</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          {failedData.map((item, index) => (
                            <tr key={index} className="hover:bg-red-100">
                              <td className="px-3 py-2 text-red-900">{item.row}</td>
                              <td className="px-3 py-2 text-red-700 font-mono text-xs">{item.data}</td>
                              <td className="px-3 py-2 text-red-600">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 重新上传按钮 */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setSuccessData([]);
                      setFailedData([]);
                      setUploadStep(1);
                    }}
                    className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    重新上传
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - 固定在底部 */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={uploadStep === 1 || successData.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认导入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Mapping Detail Modal Component - 显示导入数据明细
function MappingDetailModal({
  mapping,
  onClose,
}: {
  mapping: AccountRelationMapping;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{mapping.formName} - 数据明细</h3>
            <p className="text-xs text-slate-600 mt-1">共 {mapping.mappingDataCount || 0} 条数据</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {mapping.mappingData && mapping.mappingData.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">表单字段</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">字段值</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">对应内部人员</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">内部人员手机号</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mapping.mappingData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{item.formField}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.fieldValue}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.internalUserName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{item.internalUserPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">暂无数据</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { ArrowLeft, Users, Shield, UserCheck, Plus, Edit2, Trash2, Eye, EyeOff, Search, RefreshCw, X, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
  onNavigateToTenant?: () => void;
}

interface Account {
  id: string;
  username: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  createDate: string;
}

interface Role {
  id: string;
  name: string;
  tenants: string[];
  apps: string[];
  permissions: string[];
  description: string;
}

export function AdminPanel({ onBack, onNavigateToTenant }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'roles' | 'authorization'>('accounts');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAuthorization, setShowAuthorization] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingAuth, setEditingAuth] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // Mock data
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      username: 'admin',
      phone: '13800138000',
      role: '超级管理员',
      status: 'active',
      createDate: '2026-01-01',
    },
    {
      id: '2',
      username: 'zhangwei',
      phone: '13900139000',
      role: '应用管理员',
      status: 'active',
      createDate: '2026-02-15',
    },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: '超级管理员',
      tenants: ['all'],
      apps: ['all'],
      permissions: ['app_create', 'app_manage', 'app_view', 'sms_config', 'billing_view', 'billing_recharge'],
      description: '拥有所有租户、所有应用的所有权限',
    },
    {
      id: '2',
      name: '渠道管理员',
      tenants: [],
      apps: [],
      permissions: ['app_create', 'app_manage', 'app_view', 'billing_view'],
      description: '可以新建应用，管理和查看应用，查看账单',
    },
    {
      id: '3',
      name: '企业管理员',
      tenants: [],
      apps: [],
      permissions: ['app_manage', 'app_view', 'submission_data_view'],
      description: '可以管理和查看授权应用，查看提交数据',
    },
  ]);

  const allPermissions = [
    { id: 'app_create', label: '应用新建', desc: '新建应用的权限' },
    { id: 'app_manage', label: '应用管理', desc: '应用下连接-表单-通知-数据四个tab的修改权限' },
    { id: 'app_view', label: '应用查看', desc: '应用下连接-表单-通知-数据四个tab内容只能查看不能修改' },
    { id: 'submission_data_view', label: '提交数据查看', desc: '查看填报的提交数据' },
    { id: 'sms_config', label: '短信配置', desc: '配置和管理短信服务提供商及相关参数' },
    { id: 'billing_view', label: '账单查看', desc: '查看租户下的账单及明细，不能充值' },
    { id: 'billing_recharge', label: '积分充值', desc: '租户下的积分充值权限' },
  ];

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
              <h1 className="text-2xl font-bold text-slate-900">系统管理</h1>
              <p className="text-sm text-slate-600 mt-1">管理账号、角色权限和授权</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === 'accounts'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>账号管理</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">{accounts.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>角色权限</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">{roles.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('authorization')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === 'authorization'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                <span>角色授权</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* Account Management */}
          {activeTab === 'accounts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">账号列表</h3>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增账号
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">用户名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">手机号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">角色</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">创建时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{account.username}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{account.phone}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {account.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            account.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {account.status === 'active' ? '正常' : '停用'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{account.createDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAccount(account);
                                setShowAddAccount(true);
                              }}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {account.username !== 'admin' && (
                              <button
                                onClick={() => setDeleteConfirm({ type: 'account', id: account.id, name: account.username })}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Role Management */}
          {activeTab === 'roles' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">角色列表</h3>
                <button
                  onClick={() => setShowAddRole(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增角色
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{role.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setShowAddRole(true);
                          }}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {role.name !== '超级管理员' && (
                          <button
                            onClick={() => setDeleteConfirm({ type: 'role', id: role.id, name: role.name })}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-slate-600">功能权限：</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.permissions.map((perm) => {
                          const permLabel = allPermissions.find(p => p.id === perm)?.label || perm;
                          return (
                            <span key={perm} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {permLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authorization Management */}
          {activeTab === 'authorization' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">角色授权</h3>
                <button
                  onClick={() => setShowAuthorization(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  授权角色
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">用户名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">授权角色</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">授权租户</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">授权应用</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{account.username}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                            {account.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {account.username === 'admin' ? '全部' : '华强集团、鑫源机械'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {account.username === 'admin' ? '全部' : '供应商管理、资产盘点'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingAuth({ accountId: account.id, accountName: account.username, role: account.role });
                                setShowAuthorization(true);
                              }}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600"
                              title="编辑授权"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {account.username !== 'admin' && (
                              <button
                                onClick={() => setDeleteConfirm({ type: 'authorization', id: account.id, name: account.username })}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="删除授权"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {showAddAccount && (
        <AddAccountModal
          account={editingAccount}
          onClose={() => {
            setShowAddAccount(false);
            setEditingAccount(null);
          }}
          onSave={(data) => {
            console.log(editingAccount ? 'Edit account:' : 'Add account:', data);
            setShowAddAccount(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Add/Edit Role Modal */}
      {showAddRole && (
        <AddRoleModal
          role={editingRole}
          onClose={() => {
            setShowAddRole(false);
            setEditingRole(null);
          }}
          onSave={(data) => {
            console.log(editingRole ? 'Edit role:' : 'Add role:', data);
            setShowAddRole(false);
            setEditingRole(null);
          }}
          allPermissions={allPermissions}
        />
      )}

      {/* Add/Edit Authorization Modal */}
      {showAuthorization && (
        <AuthorizationModal
          authorization={editingAuth}
          onClose={() => {
            setShowAuthorization(false);
            setEditingAuth(null);
          }}
          onSave={(data) => {
            console.log(editingAuth ? 'Edit authorization:' : 'Add authorization:', data);
            setShowAuthorization(false);
            setEditingAuth(null);
          }}
          roles={roles}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">确认删除</h3>
              <button onClick={() => setDeleteConfirm(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-slate-900 font-medium mb-2">
                    确定要删除{deleteConfirm.type === 'account' ? '账号' : deleteConfirm.type === 'role' ? '角色' : '授权'} "{deleteConfirm.name}" 吗？
                  </p>
                  <p className="text-sm text-slate-600">
                    此操作不可恢复，请谨慎操作。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  console.log('Delete:', deleteConfirm);
                  if (deleteConfirm.type === 'account') {
                    setAccounts(accounts.filter(a => a.id !== deleteConfirm.id));
                  } else if (deleteConfirm.type === 'role') {
                    setRoles(roles.filter(r => r.id !== deleteConfirm.id));
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Account Modal Component
function AddAccountModal({
  account,
  onClose,
  onSave
}: {
  account: Account | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [username, setUsername] = useState(account?.username || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(account?.phone || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ username, password, phone });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{account ? '编辑账号' : '新增账号'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Role Modal Component
function AddRoleModal({
  role,
  onClose,
  onSave,
  allPermissions
}: {
  role: Role | null;
  onClose: () => void;
  onSave: (data: any) => void;
  allPermissions: Array<{ id: string; label: string; desc: string }>;
}) {
  const [roleName, setRoleName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      roleName,
      description,
      permissions: selectedPermissions,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{role ? '编辑角色' : '新增角色'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">角色名称</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="请输入角色名称"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">角色描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入角色描述"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">功能权限</label>
            <div className="space-y-3 bg-slate-50 rounded-lg p-4">
              {allPermissions.map((perm) => (
                <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, perm.id]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                      }
                    }}
                    className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{perm.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{perm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Authorization Modal Component
function AuthorizationModal({
  authorization,
  onClose,
  onSave,
  roles
}: {
  authorization: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  roles: Role[];
}) {
  const [selectedRole, setSelectedRole] = useState(authorization?.role || '');
  const [selectedAccount, setSelectedAccount] = useState(authorization?.accountId || '');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const tenants = ['华强集团', '鑫源机械', '宏达化工'];
  const apps = ['供应商管理', '资产盘点', '客户关系管理'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      account: selectedAccount,
      role: selectedRole,
      tenants: selectedTenants,
      apps: selectedApps,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{authorization ? '编辑授权' : '角色授权'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">选择用户</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">请选择用户</option>
              <option value="admin">admin</option>
              <option value="zhangwei">zhangwei</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">授权角色</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">请选择角色</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* 授权租户 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">授权租户</label>
            <div className="space-y-2 bg-slate-50 rounded-lg p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTenants.length === tenants.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTenants(tenants);
                    } else {
                      setSelectedTenants([]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-900">全部租户</span>
              </label>
              <div className="h-px bg-slate-200 my-2"></div>
              {tenants.map((tenant) => (
                <label key={tenant} className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedTenants.includes(tenant)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenants([...selectedTenants, tenant]);
                      } else {
                        setSelectedTenants(selectedTenants.filter(t => t !== tenant));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{tenant}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 授权应用范围 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">授权应用</label>
            <div className="space-y-2 bg-slate-50 rounded-lg p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedApps.length === apps.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApps(apps);
                    } else {
                      setSelectedApps([]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-900">全部应用</span>
              </label>
              <div className="h-px bg-slate-200 my-2"></div>
              {apps.map((app) => (
                <label key={app} className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedApps.includes(app)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApps([...selectedApps, app]);
                      } else {
                        setSelectedApps(selectedApps.filter(a => a !== app));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{app}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              保存授权
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
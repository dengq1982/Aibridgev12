import { useState } from 'react';
import { ArrowLeft, Search, Plus, Edit2, Ban, Building2 } from 'lucide-react';

interface TenantManagementProps {
  onBack: () => void;
}

interface Tenant {
  id: string;
  companyName: string;
  communityId: string;
  contactPerson: string;
  phone: string;
  partner: string;
  createDate: string;
  remark: string;
  status: 'active' | 'closed';
}

export function TenantManagement({ onBack }: TenantManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Mock data
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: '1',
      companyName: '华强集团',
      communityId: 'COMM-001',
      contactPerson: '张伟',
      phone: '13800138000',
      partner: '北京渠道商',
      createDate: '2026-01-15',
      remark: '大型企业客户，年度签约',
      status: 'active',
    },
    {
      id: '2',
      companyName: '鑫源机械',
      communityId: 'COMM-002',
      contactPerson: '李娜',
      phone: '13900139000',
      partner: '上海渠道商',
      createDate: '2026-02-20',
      remark: '中型制造企业',
      status: 'active',
    },
    {
      id: '3',
      companyName: '宏达化工',
      communityId: 'COMM-003',
      contactPerson: '王强',
      phone: '13700137000',
      partner: '广州渠道商',
      createDate: '2026-03-10',
      remark: '化工行业标杆客户',
      status: 'active',
    },
  ]);

  // Filter tenants by search term
  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tenant.companyName.toLowerCase().includes(searchLower) ||
      tenant.phone.includes(searchTerm) ||
      tenant.partner.toLowerCase().includes(searchLower) ||
      tenant.contactPerson.toLowerCase().includes(searchLower)
    );
  });

  const handleAddTenant = (tenant: Omit<Tenant, 'id' | 'createDate' | 'status'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: Date.now().toString(),
      createDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setTenants([...tenants, newTenant]);
    setShowAddTenant(false);
  };

  const handleUpdateTenant = (tenant: Tenant) => {
    setTenants(tenants.map(t => t.id === tenant.id ? tenant : t));
    setEditingTenant(null);
  };

  const handleCloseTenant = (tenantId: string) => {
    if (confirm('确定要关闭该租户吗？关闭后该租户将无法使用系统。')) {
      setTenants(tenants.map(t => t.id === tenantId ? { ...t, status: 'closed' } : t));
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
              <h1 className="text-xl font-bold text-slate-900">租户管理</h1>
              <p className="text-sm text-slate-600 mt-0.5">管理所有租户信息和状态</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Search and Actions */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索租户名称、联系人手机号、签约伙伴..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                onClick={() => setShowAddTenant(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                新建租户
              </button>
            </div>
          </div>

          {/* Tenant Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">企业名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">社区ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">联系人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">手机号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">签约伙伴</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">创建时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">备注</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">{tenant.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tenant.communityId}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{tenant.contactPerson}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tenant.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tenant.partner}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tenant.createDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={tenant.remark}>
                      {tenant.remark}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        tenant.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tenant.status === 'active' ? '正常' : '已关闭'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {tenant.status === 'active' && (
                          <button
                            onClick={() => handleCloseTenant(tenant.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            title="关闭"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchTerm ? '没有找到匹配的租户' : '还没有租户'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {searchTerm ? '尝试调整搜索条件' : '点击"新建租户"开始添加第一个租户'}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          {tenants.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
              <span>共 {tenants.length} 个租户</span>
              <div className="flex items-center gap-4">
                <span>{tenants.filter(t => t.status === 'active').length} 个正常</span>
                <span>•</span>
                <span>{tenants.filter(t => t.status === 'closed').length} 个已关闭</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Tenant Modal */}
      {(showAddTenant || editingTenant) && (
        <TenantModal
          tenant={editingTenant}
          onClose={() => {
            setShowAddTenant(false);
            setEditingTenant(null);
          }}
          onSave={(tenant) => {
            if (editingTenant) {
              handleUpdateTenant(tenant as Tenant);
            } else {
              handleAddTenant(tenant);
            }
          }}
        />
      )}
    </div>
  );
}

// Tenant Modal Component
function TenantModal({
  tenant,
  onClose,
  onSave,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id' | 'createDate' | 'status'> | Tenant) => void;
}) {
  const [formData, setFormData] = useState({
    companyName: tenant?.companyName || '',
    communityId: tenant?.communityId || '',
    contactPerson: tenant?.contactPerson || '',
    phone: tenant?.phone || '',
    partner: tenant?.partner || '',
    remark: tenant?.remark || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.companyName.trim()) newErrors.companyName = '请输入企业名称';
    if (!formData.communityId.trim()) newErrors.communityId = '请输入社区ID';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = '请输入联系人';
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }
    if (!formData.partner.trim()) newErrors.partner = '请输入签约伙伴';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (tenant) {
      onSave({ ...tenant, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {tenant ? '编辑租户' : '新建租户'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 企业名称 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                企业名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => {
                  setFormData({ ...formData, companyName: e.target.value });
                  setErrors({ ...errors, companyName: '' });
                }}
                placeholder="请输入企业名称"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.companyName && (
                <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>
              )}
            </div>

            {/* 社区ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                社区ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.communityId}
                onChange={(e) => {
                  setFormData({ ...formData, communityId: e.target.value });
                  setErrors({ ...errors, communityId: '' });
                }}
                placeholder="请输入社区ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.communityId && (
                <p className="text-xs text-red-500 mt-1">{errors.communityId}</p>
              )}
            </div>

            {/* 联系人 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => {
                  setFormData({ ...formData, contactPerson: e.target.value });
                  setErrors({ ...errors, contactPerson: '' });
                }}
                placeholder="请输入联系人姓名"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.contactPerson && (
                <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>
              )}
            </div>

            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setErrors({ ...errors, phone: '' });
                }}
                placeholder="请输入联系人手机号"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* 签约伙伴 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              签约伙伴 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.partner}
              onChange={(e) => {
                setFormData({ ...formData, partner: e.target.value });
                setErrors({ ...errors, partner: '' });
              }}
              placeholder="请输入签约伙伴"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.partner && (
              <p className="text-xs text-red-500 mt-1">{errors.partner}</p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              备注 <span className="text-slate-400">(选填)</span>
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
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
              {tenant ? '保存修改' : '创建租户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

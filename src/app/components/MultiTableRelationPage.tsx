import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Info } from 'lucide-react';
import { AddTableRelationForm } from './AddTableRelationForm';

interface TableRelation {
  id: string;
  sourceTable: string;
  relatedTable: string;
  relationType: '数据调用规则' | '名单校验规则';
  enabled: boolean;
}

export function MultiTableRelationPage({ onBack }: { onBack: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [relations, setRelations] = useState<TableRelation[]>([
    {
      id: 'rel-1',
      sourceTable: '供应商入驻表',
      relatedTable: '供应商报价表',
      relationType: '数据调用规则',
      enabled: true,
    },
    {
      id: 'rel-2',
      sourceTable: '供应商报价表',
      relatedTable: '供应商名单库',
      relationType: '名单校验规则',
      enabled: true,
    },
    {
      id: 'rel-3',
      sourceTable: '资产盘点表',
      relatedTable: '资产台账表',
      relationType: '数据调用规则',
      enabled: false,
    },
  ]);

  const handleToggleEnabled = (id: string) => {
    setRelations(relations.map(rel =>
      rel.id === id ? { ...rel, enabled: !rel.enabled } : rel
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条关系配置吗？')) {
      setRelations(relations.filter(rel => rel.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    alert('编辑功能开发中...');
  };

  const handleAddRelation = (data: any) => {
    // 处理新增关系的逻辑
    console.log('新增关系:', data);
    setShowAddForm(false);
  };

  if (showAddForm) {
    return (
      <AddTableRelationForm
        onBack={() => setShowAddForm(false)}
        onSubmit={handleAddRelation}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回表单管理
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">多表关系配置</h2>
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                数据推送到协同平台已通过 AI 自动实现，支持在此配置多表之间的数据调用规则与其他校验规则
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增关系
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">本表</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">数据关联表</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">关系类型</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">状态</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {relations.map((relation) => (
              <tr key={relation.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-900">{relation.sourceTable}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{relation.relatedTable}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    relation.relationType === '数据调用规则'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {relation.relationType}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleEnabled(relation.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      relation.enabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        relation.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(relation.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(relation.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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

        {relations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">暂无关系配置</p>
          </div>
        )}
      </div>
    </div>
  );
}

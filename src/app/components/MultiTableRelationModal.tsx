import { useState } from 'react';
import { X, Plus, Edit, Trash2, Info } from 'lucide-react';

interface MultiTableRelationModalProps {
  onClose: () => void;
}

interface TableRelation {
  id: string;
  sourceTable: string;
  relatedTable: string;
  relationType: '数据调用规则' | '名单校验规则';
  enabled: boolean;
}

export function MultiTableRelationModal({ onClose }: MultiTableRelationModalProps) {
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

  const handleAddNew = () => {
    alert('新增关系功能开发中...');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">多表关系配置</h3>
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                数据推送到协同平台已通过 AI 自动实现，支持在此配置多表之间的数据调用规则与其他校验规则
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4">
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增关系
            </button>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

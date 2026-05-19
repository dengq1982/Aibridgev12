import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CreateFormModalProps {
  onClose: () => void;
  onCreate: (data: { relatedForm: string; externalFormName: string }) => void;
}

export function CreateFormModal({ onClose, onCreate }: CreateFormModalProps) {
  const [relatedForm, setRelatedForm] = useState('');
  const [externalFormName, setExternalFormName] = useState('');

  // 模拟表单映射列表
  const formMappingList = [
    { id: 'map-1', name: '供应商入驻表单' },
    { id: 'map-2', name: '供应商报价表单' },
    { id: 'map-3', name: '资产盘点表单' },
    { id: 'map-4', name: '客户信息表单' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!relatedForm) {
      alert('请选择关联推送到内部的表单');
      return;
    }

    if (!externalFormName.trim()) {
      alert('请输入外部表单名称');
      return;
    }

    onCreate({ relatedForm, externalFormName });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">新建表单</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* 提示信息 */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">提示</p>
                <p className="text-sm text-blue-700 mt-1">
                  根据关联的协同表单，自动完成外部表单初始化
                </p>
              </div>
            </div>

            {/* 关联推送到内部的表单 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                关联推送到内部的表单 <span className="text-red-500">*</span>
              </label>
              <select
                value={relatedForm}
                onChange={(e) => setRelatedForm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">请选择表单</option>
                {formMappingList.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                选择表单映射中的表单
              </p>
            </div>

            {/* 外部表单名称 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                外部表单名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={externalFormName}
                onChange={(e) => setExternalFormName(e.target.value)}
                placeholder="请输入外部表单名称"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

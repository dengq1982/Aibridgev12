import { useState } from 'react';
import { Type, Hash, Calendar, CheckSquare, AlignLeft, Mail, Phone, Table, Plus, Trash2, Settings, Eye, Save } from 'lucide-react';

interface Component {
  id: string;
  type: string;
  label: string;
  icon: any;
}

interface Field {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  width?: string;
}

export function FormDesigner({ onSave }: { onSave?: (config: any) => void }) {
  const [formFields, setFormFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState({
    formName: 'formData',
    formTitle: '',
    description: '',
    submitUrl: '',
  });

  const components: Component[] = [
    { id: 'text', type: 'text', label: '单行输入', icon: Type },
    { id: 'textarea', type: 'textarea', label: '多行输入', icon: AlignLeft },
    { id: 'number', type: 'number', label: '数字', icon: Hash },
    { id: 'date', type: 'date', label: '日期', icon: Calendar },
    { id: 'select', type: 'select', label: '下拉选择', icon: CheckSquare },
    { id: 'email', type: 'email', label: '邮箱', icon: Mail },
    { id: 'tel', type: 'tel', label: '电话', icon: Phone },
    { id: 'table', type: 'table', label: '明细表格', icon: Table },
  ];

  const handleAddField = (componentType: string) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      type: componentType,
      label: componentType === 'table' ? '明细表格' : '未命名字段',
      placeholder: '请输入',
      required: false,
    };

    if (componentType === 'table') {
      (newField as any).columns = [
        { id: 'col1', label: '列1', type: 'text' },
        { id: 'col2', label: '列2', type: 'text' },
      ];
    }

    setFormFields([...formFields, newField]);
    setSelectedField(newField.id);
  };

  const handleDeleteField = (fieldId: string) => {
    setFormFields(formFields.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const handleUpdateField = (fieldId: string, updates: Partial<Field>) => {
    setFormFields(formFields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const selectedFieldData = formFields.find(f => f.id === selectedField);

  const handleSave = () => {
    const config = {
      ...formConfig,
      fields: formFields,
    };
    onSave?.(config);
  };

  return (
    <div className="h-[calc(100vh-240px)] flex bg-slate-50">
      {/* Left Panel - Components */}
      <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">组件库</h3>
        </div>

        <div className="p-3">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase">字段</h4>
            <div className="space-y-1">
              {components.filter(c => c.type !== 'table').map((component) => {
                const Icon = component.icon;
                return (
                  <button
                    key={component.id}
                    onClick={() => handleAddField(component.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{component.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase">高级组件</h4>
            <div className="space-y-1">
              {components.filter(c => c.type === 'table').map((component) => {
                const Icon = component.icon;
                return (
                  <button
                    key={component.id}
                    onClick={() => handleAddField(component.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{component.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Panel - Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Form Header */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
            <input
              type="text"
              value={formConfig.formTitle}
              onChange={(e) => setFormConfig({ ...formConfig, formTitle: e.target.value })}
              placeholder="表单标题"
              className="text-2xl font-bold text-slate-900 w-full border-0 border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none px-0 pb-2"
            />
            <input
              type="text"
              value={formConfig.description}
              onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
              placeholder="表单描述（可选）"
              className="text-sm text-slate-600 w-full border-0 mt-2 focus:outline-none px-0"
            />
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4 min-h-[400px]">
            {formFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Table className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm">从左侧拖拽或点击组件添加到表单</p>
              </div>
            ) : (
              formFields.map((field, index) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedField(field.id)}
                  className={`group relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedField === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 text-xs rounded">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1">
                      {field.type === 'table' ? (
                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="border border-slate-300 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50">
                                <tr>
                                  {(field as any).columns?.map((col: any, idx: number) => (
                                    <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-slate-700 border-b border-slate-300">
                                      {col.label}
                                    </th>
                                  ))}
                                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-300 w-16">
                                    操作
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-white">
                                  {(field as any).columns?.map((col: any, idx: number) => (
                                    <td key={idx} className="px-3 py-2 border-b border-slate-200">
                                      <input
                                        type="text"
                                        placeholder="请输入"
                                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                                        readOnly
                                      />
                                    </td>
                                  ))}
                                  <td className="px-3 py-2 border-b border-slate-200 text-center">
                                    <button className="p-1 text-slate-400">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <button className="mt-2 w-full px-3 py-1.5 border border-dashed border-slate-300 text-slate-600 rounded text-xs hover:border-blue-500 hover:text-blue-600">
                            + 添加行
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              readOnly
                            />
                          ) : field.type === 'select' ? (
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" disabled>
                              <option>请选择</option>
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              readOnly
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteField(field.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存表单
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            {selectedFieldData ? '字段设置' : '表单设置'}
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {selectedFieldData ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">字段标签</label>
                <input
                  type="text"
                  value={selectedFieldData.label}
                  onChange={(e) => handleUpdateField(selectedField!, { label: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">字段类型</label>
                <select
                  value={selectedFieldData.type}
                  onChange={(e) => handleUpdateField(selectedField!, { type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {components.map(c => (
                    <option key={c.type} value={c.type}>{c.label}</option>
                  ))}
                </select>
              </div>

              {selectedFieldData.type !== 'table' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">占位提示</label>
                  <input
                    type="text"
                    value={selectedFieldData.placeholder || ''}
                    onChange={(e) => handleUpdateField(selectedField!, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-medium text-slate-700">必填字段</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFieldData.required || false}
                    onChange={(e) => handleUpdateField(selectedField!, { required: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {selectedFieldData.type === 'table' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">表格列配置</label>
                  <div className="space-y-2">
                    {(selectedFieldData as any).columns?.map((col: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) => {
                            const newColumns = [...(selectedFieldData as any).columns];
                            newColumns[idx].label = e.target.value;
                            handleUpdateField(selectedField!, { columns: newColumns } as any);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded mb-1"
                          placeholder="列名"
                        />
                        <select
                          value={col.type}
                          onChange={(e) => {
                            const newColumns = [...(selectedFieldData as any).columns];
                            newColumns[idx].type = e.target.value;
                            handleUpdateField(selectedField!, { columns: newColumns } as any);
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                        >
                          <option value="text">文本</option>
                          <option value="number">数字</option>
                          <option value="date">日期</option>
                          <option value="select">下拉</option>
                        </select>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newColumns = [
                          ...(selectedFieldData as any).columns,
                          { id: `col${(selectedFieldData as any).columns.length + 1}`, label: `列${(selectedFieldData as any).columns.length + 1}`, type: 'text' }
                        ];
                        handleUpdateField(selectedField!, { columns: newColumns } as any);
                      }}
                      className="w-full px-3 py-1.5 border border-dashed border-slate-300 text-slate-600 rounded text-xs hover:border-blue-500 hover:text-blue-600"
                    >
                      + 添加列
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">表单名称</label>
                <input
                  type="text"
                  value={formConfig.formName}
                  onChange={(e) => setFormConfig({ ...formConfig, formName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">提交地址</label>
                <input
                  type="text"
                  value={formConfig.submitUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, submitUrl: e.target.value })}
                  placeholder="/api/form/submit"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { X, Type, CheckSquare, Hash, Calendar, AlignLeft, Link2, Calculator, AlertCircle, ToggleLeft } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[] | Record<string, string[]>;
  cascade?: string;
  validation?: any;
  computed?: boolean;
  formula?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

export function FieldConfigurator({ 
  field, 
  onUpdate, 
  onClose 
}: { 
  field: Field; 
  onUpdate: (updates: Partial<Field>) => void;
  onClose: () => void;
}) {
  const fieldTypes = [
    { value: 'text', label: '单行文本', icon: Type },
    { value: 'textarea', label: '多行文本', icon: AlignLeft },
    { value: 'number', label: '数字', icon: Hash },
    { value: 'date', label: '日期', icon: Calendar },
    { value: 'select', label: '下拉选择', icon: CheckSquare },
    { value: 'tel', label: '电话号码', icon: Type },
    { value: 'email', label: '电子邮箱', icon: Type },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-medium text-slate-900 text-sm">{field.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">ID: {field.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Settings */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">基本设置</h4>
          
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              字段标签
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              字段类型
            </label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Required */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <div>
              <label className="text-xs font-medium text-slate-700">必填字段</label>
              <p className="text-xs text-slate-500">用户必须填写此字段</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Placeholder */}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'tel') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                占位提示
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="请输入..."
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Rows for textarea */}
          {field.type === 'textarea' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                显示行数
              </label>
              <input
                type="number"
                value={field.rows || 3}
                onChange={(e) => onUpdate({ rows: parseInt(e.target.value) })}
                min="2"
                max="20"
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Options for select */}
        {field.type === 'select' && !field.cascade && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              下拉选项
            </h4>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                选项列表（每行一个）
              </label>
              <textarea
                value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                onChange={(e) => {
                  const options = e.target.value.split('\n').filter(o => o.trim());
                  onUpdate({ options });
                }}
                rows={5}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="选项1&#10;选项2&#10;选项3"
              />
            </div>
          </div>
        )}

        {/* Cascade Configuration */}
        {field.cascade && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              级联配置
            </h4>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800">
                此字段依赖于: <span className="font-mono font-semibold">{field.cascade}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                父字段选择后，此字段的选项会动态更新
              </p>
            </div>
          </div>
        )}

        {/* Number Settings */}
        {field.type === 'number' && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Hash className="w-3 h-3" />
              数字设置
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  最小值
                </label>
                <input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) => onUpdate({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  最大值
                </label>
                <input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) => onUpdate({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                步长
              </label>
              <input
                type="number"
                value={field.step ?? ''}
                onChange={(e) => onUpdate({ step: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="1"
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Computed Field */}
        {field.computed && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              自动计算
            </h4>
            <div className="p-2 bg-purple-50 border border-purple-200 rounded">
              <p className="text-xs text-purple-800 font-mono">
                {field.formula}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                根据其他字段自动计算结果
              </p>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            校验规则
          </h4>

          {/* Text Length */}
          {(field.type === 'text' || field.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  最小长度
                </label>
                <input
                  type="number"
                  value={field.validation?.minLength ?? ''}
                  onChange={(e) => onUpdate({ 
                    validation: { 
                      ...field.validation, 
                      minLength: e.target.value ? parseInt(e.target.value) : undefined 
                    } 
                  })}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  最大长度
                </label>
                <input
                  type="number"
                  value={field.validation?.maxLength ?? ''}
                  onChange={(e) => onUpdate({ 
                    validation: { 
                      ...field.validation, 
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                    } 
                  })}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Pattern */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              正则表达式
            </label>
            <input
              type="text"
              value={field.validation?.pattern ?? ''}
              onChange={(e) => onUpdate({ 
                validation: { 
                  ...field.validation, 
                  pattern: e.target.value 
                } 
              })}
              placeholder="例如: ^1[3-9]\d{9}$"
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Error Message */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              错误提示
            </label>
            <input
              type="text"
              value={field.validation?.message ?? ''}
              onChange={(e) => onUpdate({ 
                validation: { 
                  ...field.validation, 
                  message: e.target.value 
                } 
              })}
              placeholder="校验失败时的提示信息"
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Warning */}
          {field.type === 'number' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                警告提示
              </label>
              <input
                type="text"
                value={field.validation?.warning ?? ''}
                onChange={(e) => onUpdate({ 
                  validation: { 
                    ...field.validation, 
                    warning: e.target.value 
                  } 
                })}
                placeholder="达到某个值时的警告信息"
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Field Info */}
        <div className="pt-3 border-t border-slate-200">
          <div className="p-3 bg-slate-50 rounded text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">字段ID:</span>
              <code className="text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                {field.id}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">字段类型:</span>
              <span className="text-slate-900">{field.type}</span>
            </div>
            {field.required && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>必填字段</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          完成配置
        </button>
      </div>
    </div>
  );
}

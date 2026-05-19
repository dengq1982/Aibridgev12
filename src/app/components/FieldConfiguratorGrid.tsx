import { X, Settings, Grid, Minus, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
  columns?: any[];
  minRows?: number;
  maxRows?: number;
  defaultRows?: number;
  // Grid layout properties
  row?: number;
  col?: number;
  rowSpan?: number;
  colSpan?: number;
  // Section
  section?: string;
}

export function FieldConfiguratorGrid({
  field,
  onUpdate,
  onClose,
  gridColumns = 12,
}: {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onClose: () => void;
  gridColumns?: number;
}) {
  const handleColumnUpdate = (columnId: string, updates: any) => {
    if (field.columns) {
      const updatedColumns = field.columns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      );
      onUpdate({ columns: updatedColumns });
    }
  };

  const handleAddColumn = () => {
    if (field.columns) {
      const newColumn = {
        id: `col_${Date.now()}`,
        label: `新列${field.columns.length + 1}`,
        type: 'text',
        width: 150,
      };
      onUpdate({ columns: [...field.columns, newColumn] });
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (field.columns && field.columns.length > 1) {
      onUpdate({ columns: field.columns.filter(col => col.id !== columnId) });
    }
  };

  const handleMoveColumn = (columnId: string, direction: 'up' | 'down') => {
    if (!field.columns) return;
    const index = field.columns.findIndex(col => col.id === columnId);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < field.columns.length - 1)
    ) {
      const newColumns = [...field.columns];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      onUpdate({ columns: newColumns });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" />
          字段配置
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-2">
            <Settings className="w-3 h-3" />
            基础设置
          </h4>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              字段类型
            </label>
            <div className="px-3 py-2 bg-slate-100 text-slate-900 text-sm rounded-lg border border-slate-200">
              {field.type}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              字段标签 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              字段ID
            </label>
            <div className="px-3 py-2 bg-slate-50 text-slate-700 text-sm rounded-lg border border-slate-200 font-mono text-xs">
              {field.id}
            </div>
          </div>

          {!['table'].includes(field.type) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                占位文本
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入..."
              />
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-medium text-slate-700">必填项</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {field.type === 'number' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    最小值
                  </label>
                  <input
                    type="number"
                    value={field.min || ''}
                    onChange={(e) => onUpdate({ min: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    最大值
                  </label>
                  <input
                    type="number"
                    value={field.max || ''}
                    onChange={(e) => onUpdate({ max: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {field.type === 'textarea' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                行数
              </label>
              <input
                type="number"
                min="1"
                value={field.rows || 3}
                onChange={(e) => onUpdate({ rows: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {['select'].includes(field.type) && !field.cascade && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                选项配置 (每行一个)
              </label>
              <textarea
                value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                onChange={(e) =>
                  onUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })
                }
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="选项1&#10;选项2&#10;选项3"
              />
            </div>
          )}

          {['radio', 'checkbox'].includes(field.type) && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                选项配置 (每行一个)
              </label>
              <textarea
                value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                onChange={(e) =>
                  onUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })
                }
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="选项1&#10;选项2&#10;选项3"
              />
            </div>
          )}
        </div>

        {/* Grid Layout Settings */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-2">
            <Grid className="w-3 h-3" />
            网格布局
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                起始行
              </label>
              <input
                type="number"
                min="0"
                value={field.row || 0}
                onChange={(e) => onUpdate({ row: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                起始列
              </label>
              <input
                type="number"
                min="0"
                max={gridColumns - 1}
                value={field.col || 0}
                onChange={(e) => onUpdate({ col: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                跨行数
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate({ rowSpan: Math.max(1, (field.rowSpan || 1) - 1) })}
                  className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Minus className="w-3 h-3 text-slate-600" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={field.rowSpan || 1}
                  onChange={(e) => onUpdate({ rowSpan: parseInt(e.target.value) || 1 })}
                  className="flex-1 px-3 py-2 text-sm text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => onUpdate({ rowSpan: (field.rowSpan || 1) + 1 })}
                  className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                跨列数
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate({ colSpan: Math.max(1, (field.colSpan || 6) - 1) })}
                  className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Minus className="w-3 h-3 text-slate-600" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={gridColumns}
                  value={field.colSpan || 6}
                  onChange={(e) => onUpdate({ colSpan: parseInt(e.target.value) || 6 })}
                  className="flex-1 px-3 py-2 text-sm text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => onUpdate({ colSpan: Math.min(gridColumns, (field.colSpan || 6) + 1) })}
                  className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <Plus className="w-3 h-3 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              网格配置: {gridColumns} 列 × 自动行<br />
              当前位置: 行{field.row || 0} 列{field.col || 0}<br />
              占用空间: {field.rowSpan || 1}行 × {field.colSpan || 6}列
            </p>
          </div>
        </div>

        {/* Table Settings */}
        {field.type === 'table' && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 uppercase">表格配置</h4>
              <button
                onClick={handleAddColumn}
                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                添加列
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                默认行数
              </label>
              <input
                type="number"
                min="1"
                value={field.defaultRows || 3}
                onChange={(e) => onUpdate({ defaultRows: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  最少行数
                </label>
                <input
                  type="number"
                  min="0"
                  value={field.minRows || 1}
                  onChange={(e) => onUpdate({ minRows: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  最多行数
                </label>
                <input
                  type="number"
                  min="1"
                  value={field.maxRows || 50}
                  onChange={(e) => onUpdate({ maxRows: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">列配置</label>
              {field.columns?.map((column, index) => (
                <div key={column.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700">列 {index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveColumn(column.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="上移"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveColumn(column.id, 'down')}
                        disabled={index === (field.columns?.length || 0) - 1}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下移"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        disabled={field.columns && field.columns.length <= 1}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={column.label}
                    onChange={(e) => handleColumnUpdate(column.id, { label: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="列标题"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={column.type}
                      onChange={(e) => handleColumnUpdate(column.id, { type: e.target.value })}
                      className="px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="text">文本</option>
                      <option value="number">数字</option>
                      <option value="select">下拉</option>
                      <option value="date">日期</option>
                    </select>

                    <input
                      type="number"
                      value={column.width || 150}
                      onChange={(e) => handleColumnUpdate(column.id, { width: parseInt(e.target.value) || 150 })}
                      className="px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="宽度(px)"
                    />
                  </div>

                  {column.type === 'select' && (
                    <textarea
                      value={column.options?.join('\n') || ''}
                      onChange={(e) =>
                        handleColumnUpdate(column.id, { 
                          options: e.target.value.split('\n').filter(o => o.trim()) 
                        })
                      }
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="选项(每行一个)"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {(field.computed || field.cascade) && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase">高级设置</h4>

            {field.computed && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  计算公式
                </label>
                <input
                  type="text"
                  value={field.formula || ''}
                  onChange={(e) => onUpdate({ formula: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="quantity * unit_price"
                />
              </div>
            )}

            {field.cascade && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  级联父字段
                </label>
                <div className="px-3 py-2 bg-slate-50 text-slate-700 text-sm rounded-lg border border-slate-200">
                  {field.cascade}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
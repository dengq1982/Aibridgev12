import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

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
}

interface FormConfig {
  name: string;
  description?: string;
  source?: string;
  type?: string;
  fields: Field[];
  actions?: any[];
}

export function FormPreview({ 
  config, 
  onFieldClick, 
  selectedFieldId 
}: { 
  config: FormConfig; 
  onFieldClick?: (fieldId: string) => void;
  selectedFieldId?: string | null;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});

  // Initialize table data
  useEffect(() => {
    const tableFields = config.fields.filter(f => f.type === 'table');
    const initialTableData: Record<string, any[]> = {};
    
    tableFields.forEach(field => {
      if (!tableData[field.id]) {
        const rows = field.defaultRows || 3;
        initialTableData[field.id] = Array(rows).fill(null).map((_, idx) => ({
          _id: `row-${idx}`,
          ...field.columns?.reduce((acc: any, col: any) => {
            acc[col.id] = '';
            return acc;
          }, {})
        }));
      }
    });
    
    if (Object.keys(initialTableData).length > 0) {
      setTableData(prev => ({ ...prev, ...initialTableData }));
    }
  }, [config.fields]);

  // Handle computed fields
  useEffect(() => {
    config.fields.forEach(field => {
      if (field.computed && field.formula) {
        const result = evaluateFormula(field.formula, formData);
        if (result !== null) {
          setFormData(prev => ({ ...prev, [field.id]: result }));
        }
      }
    });
  }, [formData.quantity, formData.unit_price]);

  const evaluateFormula = (formula: string, data: Record<string, any>) => {
    try {
      const vars = formula.match(/[a-z_]+/g) || [];
      const values = vars.map(v => data[v] || 0);
      const func = new Function(...vars, `return ${formula}`);
      return func(...values);
    } catch {
      return null;
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldId]: value };
      
      const field = config.fields.find(f => f.id === fieldId);
      const cascadedField = config.fields.find(f => f.cascade === fieldId);
      if (cascadedField) {
        newData[cascadedField.id] = '';
      }
      
      return newData;
    });

    setErrors(prev => ({ ...prev, [fieldId]: '' }));
    setWarnings(prev => ({ ...prev, [fieldId]: '' }));
  };

  const handleTableChange = (fieldId: string, rowId: string, columnId: string, value: any) => {
    setTableData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].map(row => 
        row._id === rowId ? { ...row, [columnId]: value } : row
      )
    }));
  };

  const addTableRow = (fieldId: string) => {
    const field = config.fields.find(f => f.id === fieldId);
    if (!field || !field.columns) return;
    
    const currentRows = tableData[fieldId] || [];
    if (field.maxRows && currentRows.length >= field.maxRows) return;
    
    const newRow = {
      _id: `row-${Date.now()}`,
      ...field.columns.reduce((acc: any, col: any) => {
        acc[col.id] = '';
        return acc;
      }, {})
    };
    
    setTableData(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), newRow]
    }));
  };

  const deleteTableRow = (fieldId: string, rowId: string) => {
    const field = config.fields.find(f => f.id === fieldId);
    const currentRows = tableData[fieldId] || [];
    if (field?.minRows && currentRows.length <= field.minRows) return;
    
    setTableData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].filter(row => row._id !== rowId)
    }));
  };

  const validate = (field: Field, value: any) => {
    if (field.required && !value) {
      return '此字段为必填项';
    }

    if (field.validation) {
      if (field.validation.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return field.validation.message || '格式不正确';
        }
      }

      if (field.validation.max !== undefined && value > field.validation.max) {
        if (field.validation.warning) {
          setWarnings(prev => ({ ...prev, [field.id]: field.validation.warning }));
        }
      }
    }

    return '';
  };

  const renderField = (field: Field) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];
    const warning = warnings[field.id];
    const isSelected = selectedFieldId === field.id;

    // Table field
    if (field.type === 'table') {
      const rows = tableData[field.id] || [];
      
      return (
        <div className="space-y-2">
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {field.columns?.map((col: any) => (
                    <th 
                      key={col.id} 
                      className="px-3 py-2 text-left text-xs font-medium text-slate-700 border-b border-slate-300"
                      style={{ width: col.width ? `${col.width}px` : 'auto' }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-700 border-b border-slate-300 w-16">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row._id} className="hover:bg-slate-50">
                    {field.columns?.map((col: any) => (
                      <td key={col.id} className="px-3 py-2 border-b border-slate-200">
                        {col.type === 'select' ? (
                          <select
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(field.id, row._id, col.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">请选择</option>
                            {col.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : col.computed ? (
                          <input
                            type={col.type}
                            value={(() => {
                              try {
                                const result = evaluateFormula(col.formula, row);
                                return result !== null ? result : '';
                              } catch {
                                return '';
                              }
                            })()}
                            readOnly
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-slate-50"
                          />
                        ) : (
                          <input
                            type={col.type}
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(field.id, row._id, col.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 border-b border-slate-200 text-center">
                      <button
                        onClick={() => deleteTableRow(field.id, row._id)}
                        disabled={field.minRows && rows.length <= field.minRows}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => addTableRow(field.id)}
            disabled={field.maxRows && rows.length >= field.maxRows}
            className="w-full px-3 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 text-xs flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            添加行 {field.maxRows && `(${rows.length}/${field.maxRows})`}
          </button>
        </div>
      );
    }

    // Regular fields
    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            onBlur={() => {
              const err = validate(field, value);
              if (err) setErrors(prev => ({ ...prev, [field.id]: err }));
            }}
            placeholder={field.placeholder}
            disabled={field.computed}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error
                ? 'border-red-300 focus:ring-red-500'
                : warning
                ? 'border-yellow-300 focus:ring-yellow-500'
                : isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-300 focus:ring-blue-500'
            } ${field.computed ? 'bg-slate-50' : ''}`}
          />
        );

      case 'select':
        let options: string[] = [];
        
        if (field.cascade && field.options) {
          const parentValue = formData[field.cascade];
          if (parentValue && typeof field.options === 'object') {
            options = (field.options as Record<string, string[]>)[parentValue] || [];
          }
        } else if (Array.isArray(field.options)) {
          options = field.options;
        }

        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          >
            <option value="">请选择{field.label}</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            rows={field.rows || 3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="pb-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{config.name}</h3>
        {config.description && (
          <p className="text-sm text-slate-600 mt-1">{config.description}</p>
        )}
        {config.source && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>已对接: {config.source}</span>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {config.fields.map(field => (
          <div 
            key={field.id}
            onClick={() => onFieldClick?.(field.id)}
            className={`cursor-pointer rounded-lg transition-all ${
              selectedFieldId === field.id ? 'bg-blue-50 p-3 -m-3' : ''
            }`}
          >
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.computed && (
                <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">(自动计算)</span>
              )}
              {field.cascade && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">(级联字段)</span>
              )}
              {field.type === 'table' && (
                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">(多维表)</span>
              )}
            </label>
            {renderField(field)}
            
            {errors[field.id] && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>{errors[field.id]}</span>
              </div>
            )}
            
            {warnings[field.id] && (
              <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3" />
                <span>{warnings[field.id]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Actions */}
      {config.actions && config.actions.length > 0 && (
        <div className="pt-4 border-t border-slate-200 flex gap-3">
          {config.actions.map(action => (
            <button
              key={action.id}
              className={`px-6 py-2 rounded-lg font-medium ${
                action.type === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

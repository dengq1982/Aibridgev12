import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, Trash2, Copy, GripVertical, Upload, X, File, Smartphone, Monitor } from 'lucide-react';

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

interface FormConfig {
  name: string;
  description?: string;
  source?: string;
  type?: string;
  fields: Field[];
  actions?: any[];
  gridColumns?: number;
}

export function FormPreviewGrid({ 
  config, 
  onFieldClick, 
  selectedFieldId,
  onFieldUpdate
}: { 
  config: FormConfig; 
  onFieldClick?: (fieldId: string) => void;
  selectedFieldId?: string | null;
  onFieldUpdate?: (fieldId: string, updates: Partial<Field>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const gridColumns = config.gridColumns || 12;

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

  const handleFileUpload = (fieldId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ...fileArray]
    }));
  };

  const removeFile = (fieldId: string, fileIndex: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, idx) => idx !== fileIndex)
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
        <div className="space-y-2 h-full">
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {field.columns?.map((col: any) => (
                    <th 
                      key={col.id} 
                      className="px-3 py-2 text-left font-medium text-slate-700 border-b border-slate-300"
                      style={{ minWidth: col.width || 120 }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-slate-700 border-b border-slate-300 w-20">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50">
                    {field.columns?.map((col: any) => (
                      <td key={col.id} className="px-3 py-2 border-b border-slate-200">
                        {col.type === 'select' ? (
                          <select
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(field.id, row._id, col.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
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
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-slate-100 text-slate-600"
                          />
                        ) : (
                          <input
                            type={col.type}
                            value={row[col.id] || ''}
                            onChange={(e) => handleTableChange(field.id, row._id, col.id, e.target.value)}
                            placeholder="请输入"
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
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
            className="w-full px-3 py-2 border border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 text-sm flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加行
          </button>
        </div>
      );
    }

    // File upload field
    if (field.type === 'file') {
      const files = uploadedFiles[field.id] || [];
      
      return (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-blue-600 hover:text-blue-700">添加文件</span>
              <span className="text-xs text-slate-500 mt-1">大小限制：10M，支持word、excel、pdf</span>
              <input
                type="file"
                multiple
                accept=".doc,.docx,.xls,.xlsx,.pdf"
                onChange={(e) => handleFileUpload(field.id, e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <File className="w-4 h-4 text-blue-600" />
                  <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)}KB</span>
                  <button
                    onClick={() => removeFile(field.id, idx)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Radio field
    if (field.type === 'radio') {
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    // Checkbox field
    if (field.type === 'checkbox') {
      const options = Array.isArray(field.options) ? field.options : [];
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={opt}
                checked={selectedValues.includes(opt)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, opt]
                    : selectedValues.filter(v => v !== opt);
                  handleChange(field.id, newValues);
                }}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
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
            placeholder={field.placeholder || '请输入'}
            disabled={field.computed}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm bg-slate-50 ${
              error
                ? 'border-red-300 focus:ring-red-500'
                : warning
                ? 'border-yellow-300 focus:ring-yellow-500'
                : isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-300 focus:ring-blue-500'
            } ${field.computed ? 'bg-slate-100 text-slate-600' : ''}`}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm bg-slate-50 ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          >
            <option value="">请选择</option>
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
            placeholder={field.placeholder || '请输入'}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm resize-none bg-slate-50 ${
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

  const renderFieldContainer = (field: Field) => {
    const error = errors[field.id];
    const warning = warnings[field.id];
    const isSelected = selectedFieldId === field.id;

    return (
      <div 
        key={field.id}
        onClick={(e) => {
          e.stopPropagation();
          onFieldClick?.(field.id);
        }}
        className={`relative rounded-lg p-3 cursor-pointer transition-all group ${
          isSelected 
            ? 'bg-blue-50 ring-2 ring-blue-400' 
            : 'bg-white hover:bg-slate-50'
        } ${field.type === 'table' ? 'flex flex-col' : ''}`}
        style={{
          gridColumn: viewMode === 'mobile' 
            ? 'span 1' 
            : `span ${Math.min(field.colSpan || 6, gridColumns)}`,
          gridRow: `span ${field.rowSpan || 1}`,
        }}
      >
        {/* Drag Handle */}
        {isSelected && (
          <div className="absolute left-1 top-1 z-10">
            <GripVertical className="w-4 h-4 text-blue-500" />
          </div>
        )}

        {/* Field Actions */}
        {isSelected && (
          <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-slate-200 p-0.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Duplicate logic
              }}
              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
              title="复制"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Delete logic
              }}
              className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
              title="删除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Field Label */}
        <label className={`block text-sm text-slate-700 mb-1.5 ${field.type === 'table' ? 'flex-shrink-0' : ''}`}>
          {field.required && <span className="text-red-500 mr-0.5">*</span>}
          {field.label}
        </label>

        {/* Field Input */}
        <div className={field.type === 'table' ? 'flex-1 flex flex-col' : ''}>
          {renderField(field)}
        </div>
        
        {/* Error/Warning Messages */}
        {error && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
        
        {warning && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    );
  };

  // Group fields by section
  const sections = config.fields.reduce((acc, field) => {
    const section = field.section || 'default';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, Field[]>);

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-slate-900">{config.name}</h3>
          {config.description && (
            <p className="text-xs text-slate-600 mt-0.5">{config.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-2 py-1 rounded-md transition-colors ${
              viewMode === 'desktop'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="桌面端"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2 py-1 rounded-md transition-colors ${
              viewMode === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="移动端"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(sections).map(([sectionName, sectionFields]) => (
          <div key={sectionName} className="mb-6">
            {sectionName !== 'default' && (
              <h4 className="text-sm font-medium text-slate-700 mb-3 pb-2 border-b border-slate-200">
                {sectionName}
              </h4>
            )}
            <div
              className="grid gap-3 auto-rows-min"
              style={{
                gridTemplateColumns: viewMode === 'mobile' 
                  ? '1fr' 
                  : `repeat(${gridColumns}, minmax(0, 1fr))`,
              }}
            >
              {sectionFields
                .sort((a, b) => (a.row || 0) - (b.row || 0) || (a.col || 0) - (b.col || 0))
                .map(renderFieldContainer)}
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      {config.actions && config.actions.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-200 flex gap-3 flex-shrink-0">
          {config.actions.map(action => (
            <button
              key={action.id}
              className={`px-6 py-2 rounded-lg font-medium text-sm ${
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

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface AddTableRelationFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function AddTableRelationForm({ onBack, onSubmit }: AddTableRelationFormProps) {
  const [relationType, setRelationType] = useState<'dataCall' | 'listValidation' | ''>('dataCall');
  const [sourceTable, setSourceTable] = useState('');
  const [relatedTable, setRelatedTable] = useState('');
  const [relationTypeConfirmed, setRelationTypeConfirmed] = useState(false);

  // 表单调用规则字段
  const [relatedTableType, setRelatedTableType] = useState<'noFlow' | 'flowNoDetail' | 'flowWithDetail'>('noFlow');
  const [uniqueFieldCurrent, setUniqueFieldCurrent] = useState('');
  const [uniqueFieldTarget, setUniqueFieldTarget] = useState('');
  const [dataFields, setDataFields] = useState<Array<{ current: string; target: string }>>([{ current: '', target: '' }]);
  const [allowEdit, setAllowEdit] = useState(false);
  const [autoFill, setAutoFill] = useState<'default' | 'auto' | 'manual'>('default');
  const [callTiming, setCallTiming] = useState('flowEnd');

  // 名单校验规则字段
  const [validationType, setValidationType] = useState<'whitelist' | 'blacklist'>('whitelist');

  // 模拟表单列表
  const formList = [
    '供应商入驻表',
    '供应商报价表',
    '资产盘点表',
    '客户信息表',
    '员工名单表',
  ];

  // 模拟字段列表
  const fieldList = [
    '供应商ID',
    '供应商名称',
    '联系人',
    '联系电话',
    '邮箱',
    '地址',
  ];

  const handleAddDataField = () => {
    setDataFields([...dataFields, { current: '', target: '' }]);
  };

  const handleRemoveDataField = (index: number) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const handleDataFieldChange = (index: number, field: 'current' | 'target', value: string) => {
    const newFields = [...dataFields];
    newFields[index][field] = value;
    setDataFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!relationType) {
      alert('请选择关系类型');
      return;
    }

    if (!sourceTable || !relatedTable) {
      alert('请选择本表和数据关联表');
      return;
    }

    const data = {
      relationType,
      sourceTable,
      relatedTable,
      ...(relationType === 'dataCall' && {
        relatedTableType,
        uniqueField: { current: uniqueFieldCurrent, target: uniqueFieldTarget },
        dataFields,
        allowEdit,
        autoFill,
        callTiming,
      }),
      ...(relationType === 'listValidation' && {
        uniqueField: { current: uniqueFieldCurrent, target: uniqueFieldTarget },
        validationType,
      }),
    };

    onSubmit(data);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <h2 className="text-xl font-semibold text-slate-900 mt-4">新增多表关系配置</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 max-w-4xl space-y-6">
        {/* 1. 选择关系类型 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            关系类型 <span className="text-red-500">*</span>
            {relationTypeConfirmed && (
              <span className="ml-2 text-xs text-slate-500">(配置后不可更改)</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
              relationType === 'dataCall' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            } ${relationTypeConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                checked={relationType === 'dataCall'}
                onChange={() => !relationTypeConfirmed && setRelationType('dataCall')}
                disabled={relationTypeConfirmed}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-slate-900">表单调用规则</div>
                <p className="text-xs text-slate-600 mt-1">配置表单间数据调用关系</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
              relationType === 'listValidation' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
            } ${relationTypeConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                checked={relationType === 'listValidation'}
                onChange={() => !relationTypeConfirmed && setRelationType('listValidation')}
                disabled={relationTypeConfirmed}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="font-medium text-slate-900">名单校验规则</div>
                <p className="text-xs text-slate-600 mt-1">配置表单填写权限校验</p>
              </div>
            </label>
          </div>
        </div>

        {relationType && (
          <>
            {/* 2. 基础配置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择本表 <span className="text-red-500">*</span>
                </label>
                <select
                  value={sourceTable}
                  onChange={(e) => {
                    setSourceTable(e.target.value);
                    if (e.target.value && relatedTable) {
                      setRelationTypeConfirmed(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择表单</option>
                  {formList.map((form) => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择数据关联表 <span className="text-red-500">*</span>
                </label>
                <select
                  value={relatedTable}
                  onChange={(e) => {
                    setRelatedTable(e.target.value);
                    if (sourceTable && e.target.value) {
                      setRelationTypeConfirmed(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">请选择表单</option>
                  {formList.map((form) => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 表单调用规则配置 */}
            {relationType === 'dataCall' && (
              <>
                {/* 关联表类型 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    关联表类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={relatedTableType === 'noFlow'}
                        onChange={() => setRelatedTableType('noFlow')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">无流程表单</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={relatedTableType === 'flowNoDetail'}
                        onChange={() => setRelatedTableType('flowNoDetail')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">流程表单不带明细表</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={relatedTableType === 'flowWithDetail'}
                        onChange={() => setRelatedTableType('flowWithDetail')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">流程表单带明细表</span>
                    </label>
                  </div>
                </div>

                {/* 唯一标识字段 - 流程表单不带明细表不需要 */}
                {relatedTableType !== 'flowNoDetail' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      配置两表对应的唯一标识字段 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={uniqueFieldCurrent}
                        onChange={(e) => setUniqueFieldCurrent(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">本表字段</option>
                        {fieldList.map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      <select
                        value={uniqueFieldTarget}
                        onChange={(e) => setUniqueFieldTarget(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">关联表字段</option>
                        {fieldList.map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 配置调用数据字段 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    配置调用数据字段 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {dataFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          value={field.current}
                          onChange={(e) => handleDataFieldChange(index, 'current', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">本表字段</option>
                          {fieldList.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <span className="text-slate-500">→</span>
                        <select
                          value={field.target}
                          onChange={(e) => handleDataFieldChange(index, 'target', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">关联表字段</option>
                          {fieldList.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        {dataFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDataField(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddDataField}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      添加字段映射
                    </button>
                  </div>
                </div>

                {/* 是否允许修改 */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">是否允许修改</div>
                    <p className="text-sm text-slate-600 mt-1">调用的数据是否允许用户修改</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowEdit(!allowEdit)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      allowEdit ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        allowEdit ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 是否自动带出 - 流程表单不带明细表时不显示 */}
                {relatedTableType !== 'flowNoDetail' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      是否自动带出
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={autoFill === 'default'}
                          onChange={() => setAutoFill('default')}
                          className="w-4 h-4 text-blue-600 mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-900">默认自动匹配</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            默认匹配单条数据自动带出，匹配多条数据手动选择
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={autoFill === 'auto'}
                          onChange={() => setAutoFill('auto')}
                          className="w-4 h-4 text-blue-600 mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-900">自动带出数据</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            匹配唯一标识字段后自动带出，匹配失败空，多条数据随机匹配
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={autoFill === 'manual'}
                          onChange={() => setAutoFill('manual')}
                          className="w-4 h-4 text-blue-600 mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-900">手动选择</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            匹配唯一标识字段后手动点击带出数据
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* 调用时机 - 仅流程表单显示 */}
                {(relatedTableType === 'flowNoDetail' || relatedTableType === 'flowWithDetail') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      调用时机（仅适用于流程表单）
                    </label>
                    <select
                      value={callTiming}
                      onChange={(e) => setCallTiming(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      disabled
                    >
                      <option value="flowEnd">数据表单表流程结束</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">默认在流程结束时调用数据</p>
                  </div>
                )}
              </>
            )}

            {/* 名单校验规则配置 */}
            {relationType === 'listValidation' && (
              <>
                {/* 唯一标识字段 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    配置两表对应的唯一标识字段 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={uniqueFieldCurrent}
                      onChange={(e) => setUniqueFieldCurrent(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">本表字段</option>
                      {fieldList.map((field) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                    <select
                      value={uniqueFieldTarget}
                      onChange={(e) => setUniqueFieldTarget(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">关联表字段</option>
                      {fieldList.map((field) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 校验表单类型 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    校验表单类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2">
                      <input
                        type="radio"
                        checked={validationType === 'whitelist'}
                        onChange={() => setValidationType('whitelist')}
                        className="w-4 h-4 text-blue-600 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">白名单</span>
                        <p className="text-xs text-slate-600 mt-0.5">只有名单内用户可填写</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        type="radio"
                        checked={validationType === 'blacklist'}
                        onChange={() => setValidationType('blacklist')}
                        className="w-4 h-4 text-blue-600 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">黑名单</span>
                        <p className="text-xs text-slate-600 mt-0.5">名单内用户不可填写</p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存配置
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

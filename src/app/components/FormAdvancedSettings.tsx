import { useState } from 'react';
import { X, Plus, Trash2, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface TimeLimitGroup {
  id: string;
  type: 'total' | 'daily' | 'weekly' | 'monthly';
  count: number;
}

interface RelationSetting {
  id: string;
  relatedForm: string;
  uniqueField: { current: string; target: string };
  otherFields: Array<{ current: string; target: string }>;
  autoFill: 'default' | 'auto' | 'manual';
  allowEdit: 'yes' | 'no';
  enabled: boolean;
}

interface WhitelistSetting {
  id: string;
  relatedForm: string;
  uniqueField: { current: string; target: string };
  matchType: 'submitter' | 'field';
  matchField?: string;
  listType: 'whitelist' | 'blacklist';
  enabled: boolean;
}

export function FormAdvancedSettings({ onClose, formName }: { onClose: () => void; formName: string }) {
  // 模式设置
  const [multiFormMode, setMultiFormMode] = useState(false); // 是否开启多流程表单限制

  // 时间设置
  const [timeSettingMode, setTimeSettingMode] = useState<'custom' | 'related'>('custom');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [cycleType, setCycleType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [cycleStartTime, setCycleStartTime] = useState('');
  const [cycleEndTime, setCycleEndTime] = useState('');
  const [cycleWeekday, setCycleWeekday] = useState('1');
  const [cycleDay, setCycleDay] = useState('1');
  const [relatedStartField, setRelatedStartField] = useState('');
  const [relatedEndField, setRelatedEndField] = useState('');
  const [outOfRangeMessage, setOutOfRangeMessage] = useState('当前不在表单填写时间范围内');

  // 填写设置
  const [requireLogin, setRequireLogin] = useState(false);
  const [autoFillPrevious, setAutoFillPrevious] = useState(false);
  const [timeLimits, setTimeLimits] = useState<TimeLimitGroup[]>([]);
  const [restrictUsers, setRestrictUsers] = useState(false);
  const [listType, setListType] = useState<'whitelist' | 'blacklist'>('whitelist'); // 白名单或黑名单
  const [whitelistInput, setWhitelistInput] = useState('');
  const [whitelistMessage, setWhitelistMessage] = useState('您没有填写权限');
  const [showWhitelistImport, setShowWhitelistImport] = useState(false);
  const [selectedRelationRules, setSelectedRelationRules] = useState<string[]>([]); // 多表关系中选择的名单校验规则
  const [limitTotal, setLimitTotal] = useState(false);
  const [totalLimit, setTotalLimit] = useState('');

  // 同步时间
  const [syncType, setSyncType] = useState<'immediate' | 'scheduled' | 'afterDeadline'>('immediate');
  const [scheduledSyncTime, setScheduledSyncTime] = useState('');

  // 修改规则（改为多选）
  const [editRules, setEditRules] = useState<string[]>([]);

  const toggleEditRule = (rule: string) => {
    if (editRules.includes(rule)) {
      setEditRules(editRules.filter(r => r !== rule));
    } else {
      setEditRules([...editRules, rule]);
    }
  };

  // 高级设置
  const [relationSettings, setRelationSettings] = useState<RelationSetting[]>([]);
  const [whitelistSettings, setWhitelistSettings] = useState<WhitelistSetting[]>([]);

  const addTimeLimit = () => {
    setTimeLimits([...timeLimits, { id: Date.now().toString(), type: 'total', count: 1 }]);
  };

  const removeTimeLimit = (id: string) => {
    setTimeLimits(timeLimits.filter(item => item.id !== id));
  };

  const updateTimeLimit = (id: string, field: 'type' | 'count', value: any) => {
    setTimeLimits(timeLimits.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addRelationSetting = () => {
    setRelationSettings([...relationSettings, {
      id: Date.now().toString(),
      relatedForm: '',
      uniqueField: { current: '', target: '' },
      otherFields: [],
      autoFill: 'default',
      allowEdit: 'yes',
      enabled: true,
    }]);
  };

  const removeRelationSetting = (id: string) => {
    setRelationSettings(relationSettings.filter(item => item.id !== id));
  };

  const addWhitelistSetting = () => {
    setWhitelistSettings([...whitelistSettings, {
      id: Date.now().toString(),
      relatedForm: '',
      uniqueField: { current: '', target: '' },
      matchType: 'submitter',
      listType: 'whitelist',
      enabled: true,
    }]);
  };

  const removeWhitelistSetting = (id: string) => {
    setWhitelistSettings(whitelistSettings.filter(item => item.id !== id));
  };

  const updateWhitelistSetting = (id: string, field: keyof WhitelistSetting, value: any) => {
    setWhitelistSettings(whitelistSettings.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 固定在顶部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">表单高级配置</h1>
            <p className="text-xs text-slate-600 mt-1">{formName}</p>
            <p className="text-xs text-amber-600 mt-1">当前设置在保存后不会立即生效，表单发布后生效</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content - 可滚动区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
          {/* 模式切换 */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-slate-900">模式切换</h2>
                  <button
                    onClick={() => setMultiFormMode(!multiFormMode)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      multiFormMode ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                        multiFormMode ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${multiFormMode ? 'text-blue-600' : 'text-slate-500'}`}>
                    {multiFormMode ? '已开启' : '已关闭'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium mb-2">开启多流程表单限制</p>
                {multiFormMode ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    适用于在多表关系配置中关联了流程表单，生成多个外部表单批次，则以下配置规则控制到每个表单批次
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    适用于未在多表关系配置中关联流程表单，该表单模版按照统一规则限制
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 1. 时间设置 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">时间设置</h2>

            <div className="space-y-6">
              {/* 关闭多流程表单限制时：只显示自定义固定时间 */}
              {!multiFormMode && (
                <>
                  {/* 开始/结束时间 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        开始时间
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        结束时间
                      </label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 开启多流程表单限制时：只显示关联时间 */}
              {multiFormMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      关联内部系统开始时间字段
                    </label>
                    <select
                      value={relatedStartField}
                      onChange={(e) => setRelatedStartField(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择字段</option>
                      <option value="flow_start_time">流程开始时间</option>
                      <option value="project_start_time">项目开始时间</option>
                      <option value="task_start_time">任务开始时间</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      关联内部系统截止时间字段
                    </label>
                    <select
                      value={relatedEndField}
                      onChange={(e) => setRelatedEndField(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择字段</option>
                      <option value="flow_end_time">流程截止时间</option>
                      <option value="project_end_time">项目截止时间</option>
                      <option value="task_end_time">任务截止时间</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 收集周期 - 仅在关闭多流程表单限制时显示 */}
              {!multiFormMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  收集周期
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={cycleType === 'none'}
                      onChange={() => setCycleType('none')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">不设置周期</span>
                  </label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={cycleType === 'daily'}
                        onChange={() => setCycleType('daily')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">每日</span>
                    </label>
                    {cycleType === 'daily' && (
                      <div className="ml-6 flex items-center gap-2">
                        <input
                          type="time"
                          value={cycleStartTime}
                          onChange={(e) => setCycleStartTime(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">到</span>
                        <input
                          type="time"
                          value={cycleEndTime}
                          onChange={(e) => setCycleEndTime(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={cycleType === 'weekly'}
                        onChange={() => setCycleType('weekly')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">每周</span>
                    </label>
                    {cycleType === 'weekly' && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">开始时间：星期</span>
                          <select
                            value={cycleWeekday}
                            onChange={(e) => setCycleWeekday(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="1">一</option>
                            <option value="2">二</option>
                            <option value="3">三</option>
                            <option value="4">四</option>
                            <option value="5">五</option>
                            <option value="6">六</option>
                            <option value="7">日</option>
                          </select>
                          <input
                            type="time"
                            value={cycleStartTime}
                            onChange={(e) => setCycleStartTime(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">结束时间：星期</span>
                          <select
                            value={cycleWeekday}
                            onChange={(e) => setCycleWeekday(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="1">一</option>
                            <option value="2">二</option>
                            <option value="3">三</option>
                            <option value="4">四</option>
                            <option value="5">五</option>
                            <option value="6">六</option>
                            <option value="7">日</option>
                          </select>
                          <input
                            type="time"
                            value={cycleEndTime}
                            onChange={(e) => setCycleEndTime(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={cycleType === 'monthly'}
                        onChange={() => setCycleType('monthly')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">每月</span>
                    </label>
                    {cycleType === 'monthly' && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">开始时间：</span>
                          <select
                            value={cycleDay}
                            onChange={(e) => setCycleDay(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                          <span className="text-sm text-slate-600">号</span>
                          <input
                            type="time"
                            value={cycleStartTime}
                            onChange={(e) => setCycleStartTime(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">结束时间：</span>
                          <select
                            value={cycleDay}
                            onChange={(e) => setCycleDay(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                          <span className="text-sm text-slate-600">号</span>
                          <input
                            type="time"
                            value={cycleEndTime}
                            onChange={(e) => setCycleEndTime(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* 时间范围外提示语 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  时间范围外提示语
                </label>
                <input
                  type="text"
                  value={outOfRangeMessage}
                  onChange={(e) => setOutOfRangeMessage(e.target.value)}
                  placeholder="请输入用户在时间范围外访问时的提示语"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* 2. 填写设置 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">填写设置</h2>
            
            <div className="space-y-6">
              {/* 填写是否需要登录 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">填写是否需要登录</div>
                  <p className="text-sm text-slate-600 mt-1">开启后用户需要登录才能填写表单</p>
                </div>
                <button
                  onClick={() => setRequireLogin(!requireLogin)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    requireLogin ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      requireLogin ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 是否自动带入上一份填写记录 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">是否自动带入上一份填写记录</div>
                  <p className="text-sm text-slate-600 mt-1">开启后将自动填充用户上次提交的内容</p>
                </div>
                <button
                  onClick={() => setAutoFillPrevious(!autoFillPrevious)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoFillPrevious ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoFillPrevious ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 限制每位用户填写次数 */}
              <div>
                <div className="font-medium text-slate-900 mb-1">限制每位用户填写次数</div>
                <p className="text-sm text-slate-600 mb-3">如果关联了流程表单，则限制到每一个流程表单的提交次数</p>
                <div className="space-y-3">
                  {timeLimits.map((limit) => (
                    <div key={limit.id} className="flex items-center gap-3">
                      <select
                        value={limit.type}
                        onChange={(e) => updateTimeLimit(limit.id, 'type', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="total">总共</option>
                        <option value="daily">每日</option>
                        <option value="weekly">每周</option>
                        <option value="monthly">每月</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={limit.count}
                        onChange={(e) => updateTimeLimit(limit.id, 'count', parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">次</span>
                      <button
                        onClick={() => removeTimeLimit(limit.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTimeLimit}
                    className="w-full px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加限制
                  </button>
                </div>
              </div>

              {/* 限制用户填写 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-slate-900">限制用户填写</div>
                    <p className="text-sm text-slate-600 mt-1">配置只有白名单用户可以填写或者限制黑名单用户不能填写</p>
                  </div>
                  <button
                    onClick={() => setRestrictUsers(!restrictUsers)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      restrictUsers ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        restrictUsers ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {restrictUsers && !multiFormMode && (
                  <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        名单类型
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={listType === 'whitelist'}
                            onChange={() => setListType('whitelist')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-slate-700">白名单</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={listType === 'blacklist'}
                            onChange={() => setListType('blacklist')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-slate-700">黑名单</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        名单输入（手机号，以逗号隔开）
                      </label>
                      <textarea
                        value={whitelistInput}
                        onChange={(e) => setWhitelistInput(e.target.value)}
                        placeholder="例如：13800138000,13900139000"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowWhitelistImport(true)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        导入Excel
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        非名单内用户的填写提示语
                      </label>
                      <input
                        type="text"
                        value={whitelistMessage}
                        onChange={(e) => setWhitelistMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
                {restrictUsers && multiFormMode && (
                  <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        选择多表关系中的名单校验规则（支持多选）
                      </label>
                      <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                        {['供应商报价表-白名单校验', '资产盘点表-黑名单校验', '客户信息表-白名单校验'].map((rule) => (
                          <label key={rule} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRelationRules.includes(rule)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRelationRules([...selectedRelationRules, rule]);
                                } else {
                                  setSelectedRelationRules(selectedRelationRules.filter(r => r !== rule));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700">{rule}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 收集数据上限 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-slate-900">收集数据上限</div>
                    <p className="text-sm text-slate-600 mt-1">达到上限后将不再接受新的提交。如果关联了流程表单，则限制到每一个流程表单的提交次数</p>
                  </div>
                  <button
                    onClick={() => setLimitTotal(!limitTotal)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      limitTotal ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        limitTotal ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {limitTotal && (
                  <div className="pl-4 border-l-2 border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={totalLimit}
                        onChange={(e) => setTotalLimit(e.target.value)}
                        placeholder="请输入数量"
                        className="w-40 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <span className="text-sm text-slate-600">条</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. 同步时间 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">同步时间</h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  checked={syncType === 'immediate'}
                  onChange={() => setSyncType('immediate')}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">立即同步</div>
                  <p className="text-sm text-slate-600 mt-1">表单提交后立即同步到内部系统</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  checked={syncType === 'scheduled'}
                  onChange={() => setSyncType('scheduled')}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">指定时间同步</div>
                  <p className="text-sm text-slate-600 mt-1">在指定的时间点同步到内部系统</p>
                  {syncType === 'scheduled' && (
                    <div className="mt-3">
                      <input
                        type="datetime-local"
                        value={scheduledSyncTime}
                        onChange={(e) => setScheduledSyncTime(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  checked={syncType === 'afterDeadline'}
                  onChange={() => setSyncType('afterDeadline')}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">截止时间后同步</div>
                  <p className="text-sm text-slate-600 mt-1">在表单截止时间后自动同步到内部系统</p>
                </div>
              </label>
            </div>
          </section>

          {/* 4. 修改规则 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">修改规则</h2>

            <div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={editRules.includes('beforeSync')}
                    onChange={() => toggleEditRule('beforeSync')}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">提交后同步前允许修改</div>
                    <p className="text-sm text-slate-600 mt-1">
                      用户提交表单后，在同步到内部系统之前可以修改表单内容，更新已有记录，不会生成多条提交记录
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>
          </div>
        </div>

        {/* Footer - 固定在底部 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>

      {/* 白名单导入模态框 */}
      {showWhitelistImport && (
        <ImportWhitelistModal
          onClose={() => setShowWhitelistImport(false)}
          onSave={(phones) => {
            const currentPhones = whitelistInput ? whitelistInput.split(',').map(p => p.trim()).filter(Boolean) : [];
            const newPhones = [...new Set([...currentPhones, ...phones])];
            setWhitelistInput(newPhones.join(','));
            setShowWhitelistImport(false);
          }}
        />
      )}
    </div>
  );
}

// Import Whitelist Modal Component - 导入白名单模态框
function ImportWhitelistModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (phones: string[]) => void;
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<1 | 2>(1); // 1=上传文件, 2=预览确认
  const [successData, setSuccessData] = useState<string[]>([]);
  const [failedData, setFailedData] = useState<Array<{
    row: number;
    data: string;
    reason: string;
  }>>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExt)) {
        alert('请上传Excel或CSV文件');
        return;
      }
      setUploadedFile(file);

      // 解析文件并预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1); // 跳过表头

        const success: string[] = [];
        const failed: typeof failedData = [];

        dataLines.forEach((line, index) => {
          const phone = line.split(',')[0]?.trim();

          // 验证手机号格式
          if (!phone) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '手机号为空'
            });
          } else if (!/^1[3-9]\d{9}$/.test(phone)) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '手机号格式不正确'
            });
          } else if (success.includes(phone)) {
            failed.push({
              row: index + 2,
              data: line,
              reason: '手机号重复'
            });
          } else {
            success.push(phone);
          }
        });

        setSuccessData(success);
        setFailedData(failed);
        setUploadStep(2); // 进入预览步骤
      };

      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    // 下载白名单导入模板
    const csvContent = '手机号\n13800138000\n13900139000\n13700137000\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '白名单导入模板.csv';
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (successData.length === 0) {
      alert('没有可导入的有效数据');
      return;
    }

    onSave(successData);
    alert(`成功导入 ${successData.length} 个手机号`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 固定在顶部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">导入白名单</h3>
            <p className="text-xs text-slate-600 mt-1">通过Excel或CSV文件批量导入手机号白名单</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form Content - 可滚动区域 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 步骤指示器 */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">1. 导入文件</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">2. 数据预览</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded ${uploadStep >= 2 && successData.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className="text-xs font-medium">3. 确认</span>
              </div>
            </div>

            {/* 步骤1: 上传文件 */}
            {uploadStep === 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    上传白名单文件 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    下载模版
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="whitelist-import-file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="whitelist-import-file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">点击上传文件</p>
                      <p className="text-xs text-slate-500 mt-1">
                        支持 .xlsx、.xls、.csv 格式
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">模版格式说明：</p>
                      <p>模版包含一列：<strong>手机号</strong></p>
                      <p className="mt-1">示例：</p>
                      <code className="text-xs bg-white px-1 py-0.5 rounded block mt-1">13800138000</code>
                      <p className="mt-1">每行一个手机号，系统会自动去重</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤2: 数据预览 */}
            {uploadStep === 2 && (
              <div className="space-y-4">
                {/* 成功数据预览 */}
                {successData.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-medium text-slate-900">成功数据预览 ({successData.length} 条)</h4>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">序号</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">手机号</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {successData.map((phone, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-600">{index + 1}</td>
                              <td className="px-3 py-2 text-slate-900 font-mono">{phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 失败数据及原因 */}
                {failedData.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-medium text-slate-900">失败数据 ({failedData.length} 条)</h4>
                    </div>
                    <div className="border border-red-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-red-50">
                      <table className="w-full text-xs">
                        <thead className="bg-red-100 border-b border-red-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-red-900">行号</th>
                            <th className="px-3 py-2 text-left font-medium text-red-900">数据</th>
                            <th className="px-3 py-2 text-left font-medium text-red-900">失败原因</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          {failedData.map((item, index) => (
                            <tr key={index} className="hover:bg-red-100">
                              <td className="px-3 py-2 text-red-900">{item.row}</td>
                              <td className="px-3 py-2 text-red-700 font-mono text-xs">{item.data}</td>
                              <td className="px-3 py-2 text-red-600">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 重新上传按钮 */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setSuccessData([]);
                      setFailedData([]);
                      setUploadStep(1);
                    }}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    重新上传
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - 固定在底部 */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={uploadStep === 1 || successData.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认导入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
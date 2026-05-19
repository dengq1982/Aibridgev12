import { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';

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
  const [whitelistInput, setWhitelistInput] = useState('');
  const [whitelistMessage, setWhitelistMessage] = useState('您没有填写权限');
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">表单高级配置</h1>
          <p className="text-sm text-slate-600">{formName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* 1. 时间设置 */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">时间设置</h2>

            <div className="space-y-6">
              {/* 时间设置方式选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  时间设置方式
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={timeSettingMode === 'custom'}
                      onChange={() => setTimeSettingMode('custom')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">自定义固定时间</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={timeSettingMode === 'related'}
                      onChange={() => setTimeSettingMode('related')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">关联时间</span>
                  </label>
                </div>
              </div>

              {/* 自定义固定时间 */}
              {timeSettingMode === 'custom' && (
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

              {/* 关联时间 */}
              {timeSettingMode === 'related' && (
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

              {/* 收集周期 */}
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
                    <p className="text-sm text-slate-600 mt-1">开启后只有白名单内的用户可以填写</p>
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
                {restrictUsers && (
                  <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        白名单（手机号，以逗号隔开）
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
                      <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
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
              <label className="block text-sm font-medium text-slate-700 mb-3">
                是否允许修改（可多选）
              </label>
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

                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={editRules.includes('afterSync')}
                    onChange={() => toggleEditRule('afterSync')}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">同步后允许修改</div>
                    <p className="text-sm text-slate-600 mt-1">
                      数据同步到内部系统后，用户仍可以修改表单内容，生成多条提交记录
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* 底部操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
      </div>
    </div>
  );
}
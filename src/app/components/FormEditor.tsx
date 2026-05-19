import { useState } from 'react';
import { Send, Sparkles, Eye, Save, ArrowLeft, Layers, Settings, Rocket, X, Image, Edit3, Calculator, Paperclip, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { FormPreviewGrid } from './FormPreviewGrid';
import { FieldConfiguratorGrid } from './FieldConfiguratorGrid';
import { FormAdvancedSettings } from './FormAdvancedSettings';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  formConfig?: any;
}

export function FormEditor({ 
  initialConfig, 
  onBack, 
  onSave 
}: { 
  initialConfig?: any; 
  onBack: () => void; 
  onSave: (config: any) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFormConfig, setCurrentFormConfig] = useState<any>(initialConfig || generateSupplierQuoteForm());
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [formSettings, setFormSettings] = useState({
    startTime: '',
    endTime: '',
    allowEditMode: '' as '' | 'beforeSync' | 'afterSync',
  });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Scroll handler for quick actions
  const scrollQuickActions = (direction: 'left' | 'right') => {
    const container = document.getElementById('quick-actions-container');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      let response: Message;
      
      if (input.includes('供应商') || input.includes('报价')) {
        const formConfig = generateSupplierQuoteForm();
        response = {
          role: 'assistant',
          content: '已为您生成【供应商报价表单】。我已对接致远OA的供应商管理系统，提取了相关字段和业务规则。您可以预览表单结构，点击字段可配置详细规则。',
          formConfig
        };
        setCurrentFormConfig(formConfig);
      } else if (input.includes('级联') || input.includes('下拉')) {
        response = {
          role: 'assistant',
          content: '已优化表单配置，级联规则已生效。',
        };
      } else if (input.includes('校验') || input.includes('超过')) {
        response = {
          role: 'assistant',
          content: '已添加金额校验规则。',
        };
      } else if (input.includes('添加') && input.includes('字段')) {
        response = {
          role: 'assistant',
          content: '已添加新字段。您可以在右侧配置面板中进行详细设置。',
        };
      } else {
        response = {
          role: 'assistant',
          content: '我可以帮您：\n1. 生成表单字段\n2. 配置字段校验和级联规则\n3. 添加表格和附件字段\n4. 优化表单布局\n\n请具体描述您的需求。'
        };
      }

      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    }, 1500);

    setInput('');
  };

  const handleSaveForm = () => {
    onSave(currentFormConfig);
    setMessages(prev => [...prev, {
      role: 'system',
      content: '✓ 表单已保存。'
    }]);
  };

  const handlePublishForm = () => {
    onSave(currentFormConfig);
    setMessages(prev => [...prev, {
      role: 'system',
      content: '✓ 表单已发布，现在用户可以填写了！'
    }]);
  };

  const handleOpenSettings = () => {
    setShowAdvancedSettings(true);
  };

  const handleFieldUpdate = (fieldId: string, updates: any) => {
    if (!currentFormConfig) return;
    
    setCurrentFormConfig((prev: any) => ({
      ...prev,
      fields: prev.fields.map((field: any) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  // Quick action handlers
  const handleScreenshotUpload = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '请上传表单截图，我将为您解析并生成相应的表单结构。\n\n支持的格式：PNG、JPG、PDF\n建议：清晰的表单截图会有更好的识别效果'
    }]);
  };

  const handleModifyForm = () => {
    if (!currentFormConfig) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '请先生成表单，然后我可以帮您：\n• 删除不需要的字段\n• 调整字段顺序\n• 修改字段属性\n• 调整表单布局'
      }]);
      return;
    }
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '我可以帮您修改表单：\n\n1️⃣ 删除字段：如"删除联系方式字段"\n2️⃣ 调整顺序：如"将供应商名称移到第一个"\n3️⃣ 修改属性：如"将电话字段设为必填"\n4️⃣ 调整布局：如"将两个字段放在同一行"\n\n请告诉我您想做什么修改？'
    }]);
  };

  const handleAddFormula = () => {
    setInput('为表格中的总价列添加数量*单价的计算公式');
  };

  const handleAddAttachment = () => {
    if (!currentFormConfig) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '请先生成表单，然后我可以帮您添加附件上传字段。'
      }]);
      return;
    }
    const fieldNames = currentFormConfig.fields.map((f: any) => f.label).join('、');
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `当前表单字段：${fieldNames}\n\n请告诉我：\n1️⃣ 附件字段的名称（如"营业执照"、"相关资料"）\n2️⃣ 放在哪个字段后面？\n3️⃣ 是否必填？\n4️⃣ 允许上传的文件类型（如PDF、图片、Word等）\n\n例如："在联系方式后面添加营业执照附件字段，必填，只允许PDF和图片"`
    }]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {currentFormConfig?.name || '新建表单'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {currentFormConfig?.description || '使用AI助手快速设计表单'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenSettings}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="高级配置"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleSaveForm}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={handlePublishForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Rocket className="w-4 h-4" />
            发布
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
        {/* Left: Chat Interface */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI 设计助手
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-600">剩余</span>
              <span className="font-semibold text-blue-600">200</span>
              <span className="text-slate-600">积分</span>
              <div className="relative group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                <div className="absolute left-0 top-6 w-56 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-xl">
                  <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-900 rotate-45"></div>
                  积分是用于AI生成表单，如积分不足请联系商务购买
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                <p className="text-sm text-slate-600">开始对话设计表单</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.role === 'system'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="text-xs whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="ml-1">处理中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200">
            {/* Quick Action Bubbles - Horizontal Scrollable */}
            <div className="mb-3 relative group">
              {/* Left Arrow */}
              <button
                onClick={() => scrollQuickActions('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3 h-3 text-slate-600" />
              </button>

              {/* Scrollable Container */}
              <div
                id="quick-actions-container"
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={handleScreenshotUpload}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-all border border-purple-200 whitespace-nowrap flex-shrink-0"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>截图生成表单</span>
                </button>
                
                <button
                  onClick={handleModifyForm}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-150 transition-all border border-blue-200 whitespace-nowrap flex-shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>修改表单</span>
                </button>
                
                <button
                  onClick={handleAddFormula}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-150 transition-all border border-green-200 whitespace-nowrap flex-shrink-0"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>增加公式</span>
                </button>
                
                <button
                  onClick={handleAddAttachment}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-lg hover:from-orange-100 hover:to-orange-150 transition-all border border-orange-200 whitespace-nowrap flex-shrink-0"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>增加附件</span>
                </button>
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollQuickActions('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入需求..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Form Preview */}
        <div className="col-span-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-blue-600" />
              表单预览
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentFormConfig ? (
              <FormPreviewGrid 
                config={currentFormConfig} 
                onFieldClick={(fieldId) => setSelectedField(fieldId)}
                selectedFieldId={selectedField}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">开始对话设计表单</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Field Configurator */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {selectedField && currentFormConfig ? (
              <FieldConfiguratorGrid
                field={currentFormConfig.fields.find((f: any) => f.id === selectedField)}
                onUpdate={(updates) => handleFieldUpdate(selectedField, updates)}
                onClose={() => setSelectedField(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 p-6">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs">点击表单中的字段查看和编辑配置规则</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Dialog */}
      {showConfigDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">表单高级配置</h3>
                <p className="text-sm text-slate-600 mt-1">配置表单收集规则和权限</p>
              </div>
              <button
                onClick={() => setShowConfigDialog(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 开始收集时间 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  开始收集时间
                </label>
                <input
                  type="datetime-local"
                  value={formSettings.startTime}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  在表单列表和详情页面显示此时间，到达时间前用户无法填写表单
                </p>
              </div>

              {/* 结束收集时间 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  结束收集时间
                </label>
                <input
                  type="datetime-local"
                  value={formSettings.endTime}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  在表单列表和详情页面显示此时间，超过时间后用户无法填写表单
                </p>
              </div>

              {/* 是否允许更改 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  是否允许更改
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="allowEditMode"
                      checked={formSettings.allowEditMode === 'beforeSync'}
                      onChange={() => setFormSettings(prev => ({ ...prev, allowEditMode: 'beforeSync' }))}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">提交后同步前允许修改</div>
                      <p className="text-xs text-slate-600 mt-1">
                        用户提交表单后，在同步到内部系统之前可以修改表单内容，更新已有记录，不会生成多条提交记录
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="allowEditMode"
                      checked={formSettings.allowEditMode === 'afterSync'}
                      onChange={() => setFormSettings(prev => ({ ...prev, allowEditMode: 'afterSync' }))}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">同步后允许修改</div>
                      <p className="text-xs text-slate-600 mt-1">
                        数据同步到内部系统后，用户仍可以修改表单内容，生成多条提交记录
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfigDialog(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // Save settings to form config
                  setCurrentFormConfig((prev: any) => ({
                    ...prev,
                    settings: formSettings,
                  }));
                  setShowConfigDialog(false);
                  setMessages(prev => [...prev, {
                    role: 'system',
                    content: '✓ 表单配置已保存。'
                  }]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings Page */}
      {showAdvancedSettings && (
        <FormAdvancedSettings
          formName={currentFormConfig?.name || '未命名表单'}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}
    </div>
  );
}

// Generate supplier quote form configuration
function generateSupplierQuoteForm() {
  return {
    id: 'supplier-quote-' + Date.now(),
    name: '供应商报价表单',
    description: '对接致远OA供应商管理系统',
    source: '致远OA',
    type: 'form',
    gridColumns: 12,
    fields: [
      {
        id: 'quote_date',
        label: '选择日期',
        type: 'date',
        required: false,
        row: 0,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: 'default',
      },
      {
        id: 'supplier_name',
        label: '供应商名称',
        type: 'text',
        required: true,
        placeholder: '请输入',
        row: 1,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: '应商方信息',
      },
      {
        id: 'contact_person',
        label: '联系人',
        type: 'text',
        required: false,
        placeholder: '请输入',
        row: 2,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: '应商方信息',
      },
      {
        id: 'contact_phone',
        label: '联系方式',
        type: 'tel',
        required: false,
        placeholder: '请输入',
        row: 3,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: '应商方信息',
      },
      {
        id: 'detail_table',
        label: '报价明细',
        type: 'table',
        required: false,
        columns: [
          { id: 'item_name', label: '物品名称', type: 'text', width: 200 },
          { id: 'specification', label: '规格', type: 'text', width: 120 },
          { id: 'qty', label: '数量', type: 'number', width: 100 },
          { id: 'unit_price', label: '单价(元)', type: 'number', width: 120 },
          { id: 'total_price', label: '总价', type: 'number', computed: true, formula: 'qty * unit_price', width: 120 },
        ],
        minRows: 1,
        maxRows: 50,
        defaultRows: 3,
        row: 4,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: '报价明细',
      },
      {
        id: 'total_amount',
        label: '总价',
        type: 'text',
        required: false,
        placeholder: '请输入',
        row: 5,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: '报价明细',
      },
      {
        id: 'attachments',
        label: '相关投标资料',
        type: 'file',
        required: false,
        row: 6,
        col: 0,
        rowSpan: 1,
        colSpan: 12,
        section: 'default',
      },
    ],
    actions: [
      { id: 'submit', label: '提交报价', type: 'primary' },
      { id: 'save_draft', label: '保存草稿', type: 'secondary' },
    ],
  };
}
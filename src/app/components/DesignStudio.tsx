import { useState } from 'react';
import { Send, Sparkles, Code, Eye, Save, Layers, Table, CreditCard, Grid3x3, Upload, Edit3, Settings } from 'lucide-react';
import { FormPreviewGrid } from './FormPreviewGrid';
import { FieldConfiguratorGrid } from './FieldConfiguratorGrid';
import { TemplateSelector } from './TemplateSelector';
import { FormAdvancedSettings } from './FormAdvancedSettings';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  formConfig?: any;
}

export function DesignStudio({ onFormGenerated }: { onFormGenerated: (config: any) => void }) {
  const [showTemplates, setShowTemplates] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFormConfig, setCurrentFormConfig] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleTemplateSelect = (template: any) => {
    setShowTemplates(false);
    setCurrentFormConfig(template.config);
    setShowPreview(true);
    setMessages([
      {
        role: 'system',
        content: `已加载模板：${template.name}。您可以直接使用或通过对话进行个性化调整。`
      }
    ]);
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
        setShowPreview(true);
      } else if (input.includes('级联') || input.includes('下拉')) {
        const updatedConfig = updateFormWithCascade();
        response = {
          role: 'assistant',
          content: '已优化表单配置，将"零件类别"和"零件名称"改为级联下拉选择。当选择类别后，零件名称会自动过滤显示对应的选项。',
          formConfig: updatedConfig
        };
        setCurrentFormConfig(updatedConfig);
      } else if (input.includes('校验') || input.includes('超过')) {
        response = {
          role: 'assistant',
          content: '已添加金额校验规则：当报价总额超过5000元时，系统将弹出提示框提醒用户"报价超出限额，需要额外审批"。'
        };
      } else if (input.includes('多维表') || input.includes('表格') || input.includes('明细')) {
        const updatedConfig = addMultiDimensionalTable();
        response = {
          role: 'assistant',
          content: '已添加多维明细表。您可以在表格中录入多行数据，支持动态添加和删除行。',
          formConfig: updatedConfig
        };
        setCurrentFormConfig(updatedConfig);
      } else {
        response = {
          role: 'assistant',
          content: '我可以帮您：\n1. 对接致远OA、ERP等企业系统\n2. 生成符合业务规则的表单和卡片\n3. 配置字段校验和级联规则\n4. 设计多维表格和明细表\n\n请具体描述您的需求。'
        };
      }

      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    }, 1500);

    setInput('');
  };

  const handleSaveForm = () => {
    if (currentFormConfig) {
      onFormGenerated(currentFormConfig);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '✓ 表单已保存到运行态引擎，您可以切换到"运行态"标签查看和测试表单。'
      }]);
    }
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

  if (showTemplates) {
    return <TemplateSelector onSelect={handleTemplateSelect} onSkip={() => setShowTemplates(false)} />;
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-240px)]">
        {/* Left: Chat Interface */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI 设计助手
            </h2>
            
            {/* Quick Actions at Top */}
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setInput('上传表单截图，还原表单样式')}
                className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>上传表单截图</span>
              </button>
              <button
                onClick={() => setInput('调整字段顺序，删除不需要的字段')}
                className="w-full px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>修改表单字段</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

          {/* Input - Smaller */}
          <div className="p-3 border-t border-slate-200">
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
            
            {/* Quick Actions - Smaller */}
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                onClick={() => setInput('添加多维明细表')}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                多维表
              </button>
              <button
                onClick={() => setInput('添加级联规则')}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                级联
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                <Layers className="w-3 h-3 inline mr-1" />
                模板
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Form Preview */}
        <div className="col-span-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-blue-600" />
                表单预览
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {currentFormConfig && (
                <>
                  <button
                    onClick={() => setShowAdvancedSettings(true)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    title="表单高级设置"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={handleSaveForm}
                    className="px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1 text-xs"
                  >
                    <Save className="w-3 h-3" />
                    保存
                  </button>
                  <button
                    onClick={handleSaveForm}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs"
                  >
                    发布
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {showPreview && currentFormConfig ? (
              <FormPreviewGrid 
                config={currentFormConfig} 
                onFieldClick={(fieldId) => setSelectedField(fieldId)}
                selectedFieldId={selectedField}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">选择模板或开始对话设计表单</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Field Configurator */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-purple-600" />
              字段配置
            </h2>
          </div>

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
                  <Grid3x3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs">点击表单中的字段查看和编辑配置规则</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Settings Page */}
      {showAdvancedSettings && (
        <FormAdvancedSettings
          formName={currentFormConfig?.name || '未命名表单'}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}
    </>
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

function updateFormWithCascade() {
  return generateSupplierQuoteForm();
}

function addMultiDimensionalTable() {
  const config = generateSupplierQuoteForm();
  config.fields.push({
    id: 'detail_table',
    label: '报价明细表',
    type: 'table',
    required: false,
    columns: [
      { id: 'item_name', label: '项目名称', type: 'text', width: 200 },
      { id: 'specification', label: '规格型号', type: 'text', width: 150 },
      { id: 'unit', label: '单位', type: 'select', options: ['个', '件', '套', '台', 'kg'], width: 100 },
      { id: 'qty', label: '数量', type: 'number', width: 100 },
      { id: 'price', label: '单价', type: 'number', width: 120 },
      { id: 'amount', label: '金额', type: 'number', computed: true, formula: 'qty * price', width: 120 },
    ],
    minRows: 1,
    maxRows: 50,
    defaultRows: 3,
    row: 4,
    col: 0,
    rowSpan: 1,
    colSpan: 12,
  } as any);
  return config;
}
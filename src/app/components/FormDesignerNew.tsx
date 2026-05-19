import { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Database, X, AlertCircle, CheckCircle, 
  Loader, ChevronRight, Settings, Eye, Save, Undo, Redo, Send,
  GripVertical, Trash2, Edit, Plus, Clock, Link2, Copy, Download,
  ChevronLeft, ChevronDown, FileSpreadsheet, Paperclip, ImagePlus
} from 'lucide-react';
import { FormAdvancedSettings } from './FormAdvancedSettings';

type ParseMethod = 'screenshot' | 'api' | null;
type DesignerStep = 'select-method' | 'uploading' | 'parsing' | 'designer';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file';
  required: boolean;
  oaMapped: boolean;
  oaFieldId?: string;
  options?: string[];
  hidden?: boolean;
}

interface TimeConfig {
  startTime: string;
  endTime: string;
  pushTime?: string;
}

export function FormDesignerNew({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<DesignerStep>('select-method');
  const [parseMethod, setParseMethod] = useState<ParseMethod>(null);
  
  // Screenshot parsing
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // API parsing
  const [oaFormId, setOaFormId] = useState('');
  const [oaForms, setOaForms] = useState([
    { id: 'TBL_001', name: '供应商管理' },
    { id: 'TBL_002', name: '采购流程' },
    { id: 'TBL_003', name: '合同管理' },
  ]);
  
  // Form data
  const [formName, setFormName] = useState('未命名表单');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [timeConfig, setTimeConfig] = useState<TimeConfig>({
    startTime: '',
    endTime: '',
    pushTime: '',
  });
  
  // AI Instructions
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiHistory, setAiHistory] = useState<Array<{ instruction: string; result: string; time: string }>>([]);
  const [undoStack, setUndoStack] = useState<FormField[][]>([]);
  const [redoStack, setRedoStack] = useState<FormField[][]>([]);
  
  // AI file attachments
  const [aiAttachments, setAiAttachments] = useState<Array<{ id: string; name: string; type: string; size: number; preview?: string }>>([]);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  
  // Designer UI
  const [leftPanelWidth, setLeftPanelWidth] = useState(25); // percentage
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Story 4.1: Handle screenshot upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validation: file size ≤10MB
    if (file.size > 10 * 1024 * 1024) {
      setParseError('文件大小超限（最大 10MB），请压缩后重试');
      return;
    }
    
    // Validation: JPG/PNG only
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setParseError('仅支持 JPG/PNG 格式截图');
      return;
    }
    
    setScreenshot(file);
    setParseError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Auto-trigger parsing
    handleStartParsing();
  };

  // Story 4.1: AI Parsing simulation (BR-4.1: ≤30s timeout)
  const handleStartParsing = () => {
    setStep('parsing');
    setParseProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setParseProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate AI parsing (mock response after 3s)
    setTimeout(() => {
      clearInterval(interval);
      setParseProgress(100);
      
      // BR-4.2: Mock parsed fields with confidence
      const mockFields: FormField[] = [
        { id: 'f1', name: 'companyName', label: '供应商名称', type: 'text', required: true, oaMapped: true, oaFieldId: 'OA_F001' },
        { id: 'f2', name: 'contactPerson', label: '联系人', type: 'text', required: true, oaMapped: true, oaFieldId: 'OA_F002' },
        { id: 'f3', name: 'phone', label: '联系电话', type: 'text', required: true, oaMapped: true, oaFieldId: 'OA_F003' },
        { id: 'f4', name: 'email', label: '电子邮箱', type: 'text', required: false, oaMapped: true, oaFieldId: 'OA_F004' },
        { id: 'f5', name: 'quotation', label: '报价金额', type: 'number', required: true, oaMapped: true, oaFieldId: 'OA_F005' },
        { id: 'f6', name: 'notes', label: '备注', type: 'textarea', required: false, oaMapped: false },
      ];
      
      setFields(mockFields);
      setUndoStack([]);
      setRedoStack([]);
      
      setTimeout(() => {
        setStep('designer');
      }, 500);
    }, 3000);
  };

  // Story 4.2: API reading simulation (BR-4.1: ≤10s timeout)
  const handleApiReading = () => {
    if (!oaFormId) {
      setParseError('请选择OA表单');
      return;
    }
    
    setStep('parsing');
    setParseProgress(0);
    setParseError(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setParseProgress(prev => Math.min(prev + 15, 90));
    }, 200);
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setParseProgress(100);
      
      // Mock API response
      const mockFields: FormField[] = [
        { id: 'f1', name: 'supplierCode', label: '供应商编码', type: 'text', required: true, oaMapped: true, oaFieldId: 'OA_F001' },
        { id: 'f2', name: 'supplierName', label: '供应商名称', type: 'text', required: true, oaMapped: true, oaFieldId: 'OA_F002' },
        { id: 'f3', name: 'category', label: '供应商类别', type: 'select', required: true, oaMapped: true, oaFieldId: 'OA_F003', options: ['材料供应商', '服务供应商', '设备供应商'] },
        { id: 'f4', name: 'registeredCapital', label: '注册资本', type: 'number', required: true, oaMapped: true, oaFieldId: 'OA_F004' },
        { id: 'f5', name: 'address', label: '公司地址', type: 'textarea', required: false, oaMapped: true, oaFieldId: 'OA_F005' },
      ];
      
      setFields(mockFields);
      setFormName(oaForms.find(f => f.id === oaFormId)?.name || '未命名表单');
      
      setTimeout(() => {
        setStep('designer');
      }, 500);
    }, 2000);
  };

  // Story 4.4: AI instruction execution (NFR2: ≤3s response)
  const handleSendAiInstruction = () => {
    if (!aiInstruction.trim() && aiAttachments.length === 0) return;
    
    // Save current state to undo stack (BR-4.7: max 10 steps)
    setUndoStack(prev => {
      const newStack = [...prev, fields];
      return newStack.slice(-10); // Keep only last 10
    });
    setRedoStack([]); // Clear redo stack
    
    const instruction = aiInstruction;
    const attachments = aiAttachments;
    setAiInstruction('');
    setAiAttachments([]);
    
    // Simulate AI processing
    setTimeout(() => {
      let newFields = [...fields];
      let resultMessage = '';
      
      // If has attachments (image or excel), parse fields from them
      if (attachments.length > 0) {
        const attachment = attachments[0];
        if (attachment.type.startsWith('image/')) {
          // Simulate image recognition
          resultMessage = `已从图片识别到 3 个字段（公司名称、联系人、联系电话）`;
          const newFieldsFromImage: FormField[] = [
            { id: `f${Date.now()}_1`, name: 'companyName', label: '公司名称', type: 'text', required: true, oaMapped: false },
            { id: `f${Date.now()}_2`, name: 'contact', label: '联系人', type: 'text', required: true, oaMapped: false },
            { id: `f${Date.now()}_3`, name: 'phone', label: '联系电话', type: 'text', required: false, oaMapped: false },
          ];
          newFields = [...newFields, ...newFieldsFromImage];
        } else if (attachment.type.includes('spreadsheet') || attachment.type.includes('excel')) {
          // Simulate excel parsing
          resultMessage = `已从Excel表格识别到 4 个字段（产品名称、规格型号、单价、数量）`;
          const newFieldsFromExcel: FormField[] = [
            { id: `f${Date.now()}_1`, name: 'productName', label: '产品名称', type: 'text', required: true, oaMapped: false },
            { id: `f${Date.now()}_2`, name: 'model', label: '规格型号', type: 'text', required: false, oaMapped: false },
            { id: `f${Date.now()}_3`, name: 'price', label: '单价', type: 'number', required: true, oaMapped: false },
            { id: `f${Date.now()}_4`, name: 'quantity', label: '数量', type: 'number', required: true, oaMapped: false },
          ];
          newFields = [...newFields, ...newFieldsFromExcel];
        }
      } else {
        // Parse text instructions
        if (instruction.includes('删除') && instruction.includes('备注')) {
          newFields = newFields.filter(f => f.label !== '备注');
          resultMessage = '已删除"备注"字段';
        } else if (instruction.includes('必填') && instruction.includes('电话')) {
          newFields = newFields.map(f => 
            f.label.includes('电话') ? { ...f, required: true } : f
          );
          resultMessage = '已将"联系电话"设置为必填';
        } else if (instruction.includes('第一') || instruction.includes('首位')) {
          const targetField = newFields.find(f => f.label.includes('供应商名称'));
          if (targetField) {
            newFields = newFields.filter(f => f.id !== targetField.id);
            newFields.unshift(targetField);
            resultMessage = '已将"供应商名称"移至第一位';
          }
        } else if (instruction.includes('增加') || instruction.includes('添加')) {
          const newField: FormField = {
            id: `f${Date.now()}`,
            name: 'newField',
            label: '新字段',
            type: 'text',
            required: false,
            oaMapped: false, // BR-4.9: 新字段标记为未映射OA
          };
          newFields.push(newField);
          resultMessage = '已添加新字段（未映射OA）';
        } else {
          resultMessage = 'AI未能理解指令，请参考示例重新输入';
        }
      }
      
      setFields(newFields);
      setAiHistory(prev => [{
        instruction: instruction || `上传文件: ${attachments[0]?.name}`,
        result: resultMessage,
        time: new Date().toLocaleTimeString(),
      }, ...prev]);
    }, 1500);
  };

  // Handle AI file attachment upload
  const handleAiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isExcel = file.type.includes('spreadsheet') || 
                      file.type.includes('excel') || 
                      file.name.endsWith('.xlsx') || 
                      file.name.endsWith('.xls') ||
                      file.name.endsWith('.csv');
      
      if (!isImage && !isExcel) {
        alert('仅支持图片（JPG/PNG）或Excel文件（XLSX/XLS/CSV）');
        return;
      }
      
      // Validate file size (≤10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小超限（最大 10MB）');
        return;
      }
      
      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAiAttachments(prev => [...prev, {
            id: `${Date.now()}_${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            preview: e.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        setAiAttachments(prev => [...prev, {
          id: `${Date.now()}_${file.name}`,
          name: file.name,
          type: file.type,
          size: file.size,
        }]);
      }
    });
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAiAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Undo/Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, fields]);
    setFields(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, fields]);
    setFields(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Story 4.6: Publish form with validation (BR-4.3, BR-4.4)
  const handlePublish = () => {
    // BR-4.3: Field validation
    if (fields.length === 0) {
      alert('请至少添加一个表单字段');
      return;
    }
    
    // Check if all fields have names
    const hasEmptyNames = fields.some(f => !f.label.trim());
    if (hasEmptyNames) {
      alert('所有字段必须有展示名称');
      return;
    }
    
    // BR-4.4: Time validation
    if (timeConfig.startTime && timeConfig.endTime) {
      if (new Date(timeConfig.endTime) <= new Date(timeConfig.startTime)) {
        alert('截止时间必须晚于开始时间');
        return;
      }
    }
    
    // BR-4.8: Generate unique form link
    const formId = `form_${Date.now()}`;
    const link = `https://h5.aihub.com/form/${formId}`;
    setPublishedLink(link);
    setIsPublished(true);
    setShowPublishDialog(true);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publishedLink);
      alert('链接已复制到剪贴板！');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = publishedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('链接已复制到剪贴板！');
    }
  };

  // Render different steps
  if (step === 'select-method') {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">新建表单</h2>
          <p className="text-slate-600">选择表单解析方式，快速生成外部表单</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Story 4.1: Screenshot Parsing */}
          <div
            onClick={() => setParseMethod('screenshot')}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              parseMethod === 'screenshot'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">截图解析</h3>
              <p className="text-sm text-slate-600 mb-4">
                上传致远OA表单截图，AI自动识别字段结构
              </p>
              <ul className="text-xs text-slate-500 space-y-1 text-left w-full">
                <li>• 支持JPG/PNG格式</li>
                <li>• 文件大小≤10MB</li>
                <li>• AI解析≤30秒</li>
              </ul>
            </div>
          </div>

          {/* Story 4.2: API Reading */}
          <div
            onClick={() => setParseMethod('api')}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              parseMethod === 'api'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">接口读取</h3>
              <p className="text-sm text-slate-600 mb-4">
                通过OA接口直接读取字段结构，更精确
              </p>
              <ul className="text-xs text-slate-500 space-y-1 text-left w-full">
                <li>• 需要已配置OA集成</li>
                <li>• 自动生成字段映射</li>
                <li>• 接口读取≤10秒</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Screenshot Upload Area */}
        {parseMethod === 'screenshot' && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-medium text-slate-900 mb-4">上传OA表单截图</h3>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            >
              {screenshot ? (
                <div className="space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="text-sm text-slate-900">{screenshot.name}</p>
                  <p className="text-xs text-slate-500">
                    {(screenshot.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-sm text-slate-900">点击上传或拖拽文件到此处</p>
                    <p className="text-xs text-slate-500 mt-1">支持JPG、PNG格式，文件大小≤10MB</p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleScreenshotUpload}
              className="hidden"
            />

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{parseError}</p>
              </div>
            )}
          </div>
        )}

        {/* API Reading Area */}
        {parseMethod === 'api' && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-medium text-slate-900 mb-4">选择OA表单</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  OA表单ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={oaFormId}
                  onChange={(e) => setOaFormId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择...</option>
                  {oaForms.map(form => (
                    <option key={form.id} value={form.id}>
                      {form.name} ({form.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApiReading}
                disabled={!oaFormId}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                读取字段结构
              </button>
            </div>

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{parseError}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (step === 'parsing') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Loader className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-spin" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {parseMethod === 'screenshot' ? 'AI正在解析截图...' : 'OA接口读取中...'}
          </h2>
          <p className="text-slate-600 mb-6">
            {parseMethod === 'screenshot' 
              ? '预计需要30秒，请耐心等待'
              : '预计需要10秒，请耐心等待'
            }
          </p>
          
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${parseProgress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">{parseProgress}%</p>
        </div>
      </div>
    );
  }

  // Story 4.3: Three-panel Designer
  if (step === 'designer') {
    const selectedField = fields.find(f => f.id === selectedFieldId);
    
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-lg font-semibold text-slate-900 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
              
              {isPublished && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  已发布
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title={`撤销 ${undoStack.length}/10`}
              >
                <Undo className="w-4 h-4 text-slate-600" />
              </button>
              
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="重做"
              >
                <Redo className="w-4 h-4 text-slate-600" />
              </button>

              <div className="w-px h-6 bg-slate-300 mx-2" />

              <button
                onClick={() => setShowAdvancedSettings(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="表单高级设置"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </button>

              <button
                onClick={() => setShowTimeSettings(true)}
                className="px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm"
              >
                <Clock className="w-4 h-4" />
                时间设置
              </button>

              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                {isPublished ? '重新发布' : '发布表单'}
              </button>
            </div>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: OA Reference (Story 4.3) */}
          <div 
            className="bg-white border-r border-slate-200 flex flex-col"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 text-sm">OA原始表单对照</h3>
              <p className="text-xs text-slate-500 mt-0.5">只读，仅供参考</p>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {screenshotPreview ? (
                <img src={screenshotPreview} alt="OA Screenshot" className="w-full rounded-lg border border-slate-200" />
              ) : (
                <div className="space-y-2">
                  {fields.filter(f => f.oaMapped).map(field => (
                    <div
                      key={field.id}
                      className={`p-3 border rounded-lg transition-all ${
                        selectedFieldId === field.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-xs text-red-500">必填</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {field.type === 'text' && '文本'}
                        {field.type === 'number' && '数字'}
                        {field.type === 'date' && '日期'}
                        {field.type === 'select' && '下拉选择'}
                        {field.type === 'textarea' && '多行文本'}
                        {field.oaFieldId && ` • ${field.oaFieldId}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel: Form Preview (Story 4.3) */}
          <div className="flex-1 bg-slate-50 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-white">
              <h3 className="font-medium text-slate-900 text-sm">外部表单预览</h3>
              <p className="text-xs text-slate-500 mt-0.5">供应商视角实时预览</p>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">{formName}</h2>
                
                <div className="space-y-5">
                  {fields.filter(f => !f.hidden).map(field => (
                    <div
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`transition-all ${
                        selectedFieldId === field.id
                          ? 'ring-2 ring-blue-500 rounded-lg p-3 -m-3'
                          : 'cursor-pointer hover:bg-slate-50 rounded-lg p-3 -m-3'
                      }`}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        {!field.oaMapped && (
                          <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            未映射OA
                          </span>
                        )}
                      </label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={`请输入${field.label}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}
                      
                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={`请输入${field.label}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={`请输入${field.label}`}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          disabled
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        >
                          <option>请选择...</option>
                          {field.options?.map((opt, idx) => (
                            <option key={idx}>{opt}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium"
                    disabled
                  >
                    提交
                  </button>
                </div>
              </div>
            </div>

            {/* Story 4.4: AI Instruction Area (Bottom Left) */}
            <div className="bg-white border-t border-slate-200 p-4">
              {/* AI File Attachments Preview */}
              {aiAttachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {aiAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {attachment.preview ? (
                        <img src={attachment.preview} alt={attachment.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 truncate">{attachment.name}</p>
                        <p className="text-xs text-slate-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Buttons Row */}
              <div className="mb-3 flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  onChange={handleAiFileUpload}
                  multiple
                  className="hidden"
                />

                <button
                  onClick={() => aiFileInputRef.current?.click()}
                  className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>上传图片</span>
                </button>

                <button
                  onClick={() => aiFileInputRef.current?.click()}
                  className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>上传Excel</span>
                </button>

                <span className="text-xs text-slate-500">支持 JPG/PNG 或 XLSX/XLS/CSV，≤10MB</span>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAiInstruction();
                      }
                    }}
                    placeholder="输入指令..."
                    rows={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                  
                  {/* Instruction hints */}
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>生成表单</span>
                    <span>添加字段</span>
                  </div>
                </div>
                
                <button
                  onClick={handleSendAiInstruction}
                  disabled={!aiInstruction.trim() && aiAttachments.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {aiHistory.length > 0 && (
                <div className="mt-3 max-h-24 overflow-y-auto space-y-1">
                  {aiHistory.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-600">{item.time}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-slate-900">{item.instruction}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-green-600">{item.result}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Field Config (Story 4.3) */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 text-sm">字段配置</h3>
              <p className="text-xs text-slate-500 mt-0.5">{fields.length} 个字段</p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedFieldId === field.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-xs text-red-500">必填</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {field.type === 'text' && '文本'}
                          {field.type === 'number' && '数字'}
                          {field.type === 'date' && '日期'}
                          {field.type === 'select' && '选择'}
                          {field.type === 'textarea' && '多行'}
                        </span>
                        {!field.oaMapped && (
                          <span className="text-amber-600">未映射</span>
                        )}
                      </div>
                    </div>

                    <button className="p-1 hover:bg-slate-100 rounded">
                      <Trash2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200">
              <button className="w-full px-3 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-blue-400 hover:text-blue-600 text-sm">
                + 添加字段
              </button>
            </div>
          </div>
        </div>

        {/* Story 4.5: Time Settings Dialog */}
        {showTimeSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeSettings(false)}>
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">表单时间设置</h2>
                <button
                  onClick={() => setShowTimeSettings(false)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      填写开始时间
                    </label>
                    <input
                      type="datetime-local"
                      value={timeConfig.startTime}
                      onChange={(e) => setTimeConfig({ ...timeConfig, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      填写截止时间
                    </label>
                    <input
                      type="datetime-local"
                      value={timeConfig.endTime}
                      onChange={(e) => setTimeConfig({ ...timeConfig, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    数据推送时间（可选）
                  </label>
                  <input
                    type="datetime-local"
                    value={timeConfig.pushTime || ''}
                    onChange={(e) => setTimeConfig({ ...timeConfig, pushTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    到达此时间前，供应商提交的数据不会发送至OA（适用于竞争性报价场景）
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">时间设置说明</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 填写窗口：在开始和截止时间之间，供应商可填写表单</li>
                        <li>• 数据推送：若设置推送时间，数据在到达该时间前不会传输至OA</li>
                        <li>• 未设置推送时间时，数据将实时推送至OA</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowTimeSettings(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowTimeSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Story 4.6: Publish Success Dialog */}
        {showPublishDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPublishDialog(false)}>
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">表单发布成功！</h2>
                    <p className="text-sm text-slate-600">链接已生成，可直接发送给供应商</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublishDialog(false)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    H5访问链接 (BR-4.8)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publishedLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">发布说明</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 链接地址永久不变，修改表单后重新发布即可生效</li>
                        <li>• 可通过短信、邮件、企业微信等渠道发送给供应商</li>
                        <li>• 填写时间到达后，表单动开放；截止后自动锁定</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowPublishDialog(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings Page */}
        {showAdvancedSettings && (
          <FormAdvancedSettings
            formName={formName}
            onClose={() => setShowAdvancedSettings(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
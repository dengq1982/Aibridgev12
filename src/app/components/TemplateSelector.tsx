import { ArrowLeft, FileText, Sparkles, ShoppingCart, Users, Calendar, FileSpreadsheet } from 'lucide-react';

const templates = [
  {
    id: 'supplier-quote',
    name: '供应商报价表单',
    description: '对接致远OA供应商管理系统，包含报价明细表格和附件上传',
    icon: ShoppingCart,
    color: 'blue',
    config: {
      id: 'template-supplier-quote',
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
    },
  },
  {
    id: 'employee-onboarding',
    name: '员工入职申请',
    description: '新员工入职信息收集，包含个人信息、教育背景、工作经历等',
    icon: Users,
    color: 'green',
    config: {
      id: 'template-employee-onboarding',
      name: '员工入职申请',
      description: '新员工入职信息收集表',
      source: 'HR系统',
      type: 'form',
      gridColumns: 12,
      fields: [
        {
          id: 'employee_name',
          label: '姓名',
          type: 'text',
          required: true,
          placeholder: '请输入',
          row: 0,
          col: 0,
          rowSpan: 1,
          colSpan: 6,
          section: '基本信息',
        },
        {
          id: 'gender',
          label: '性别',
          type: 'radio',
          required: true,
          options: ['男', '女'],
          row: 0,
          col: 6,
          rowSpan: 1,
          colSpan: 6,
          section: '基本信息',
        },
        {
          id: 'phone',
          label: '联系电话',
          type: 'tel',
          required: true,
          placeholder: '请输入',
          row: 1,
          col: 0,
          rowSpan: 1,
          colSpan: 6,
          section: '基本信息',
        },
        {
          id: 'email',
          label: '电子邮箱',
          type: 'email',
          required: true,
          placeholder: '请输入',
          row: 1,
          col: 6,
          rowSpan: 1,
          colSpan: 6,
          section: '基本信息',
        },
        {
          id: 'department',
          label: '入职部门',
          type: 'select',
          required: true,
          options: ['技术部', '产品部', '市场部', '人事部', '财务部'],
          row: 2,
          col: 0,
          rowSpan: 1,
          colSpan: 6,
          section: '职位信息',
        },
        {
          id: 'position',
          label: '职位',
          type: 'text',
          required: true,
          placeholder: '请输入',
          row: 2,
          col: 6,
          rowSpan: 1,
          colSpan: 6,
          section: '职位信息',
        },
        {
          id: 'start_date',
          label: '入职日期',
          type: 'date',
          required: true,
          row: 3,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: '职位信息',
        },
      ],
      actions: [
        { id: 'submit', label: '提交申请', type: 'primary' },
        { id: 'save', label: '保存草稿', type: 'secondary' },
      ],
    },
  },
  {
    id: 'meeting-booking',
    name: '会议室预订',
    description: '会议室预订管理，支持时间段选择和设备需求配置',
    icon: Calendar,
    color: 'purple',
    config: {
      id: 'template-meeting-booking',
      name: '会议室预订',
      description: '会议室预订管理表单',
      source: 'OA系统',
      type: 'form',
      gridColumns: 12,
      fields: [
        {
          id: 'meeting_room',
          label: '会议室',
          type: 'select',
          required: true,
          options: ['301会议室', '302会议室', '401会议室', '大会议室'],
          row: 0,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: 'default',
        },
        {
          id: 'meeting_date',
          label: '会议日期',
          type: 'date',
          required: true,
          row: 1,
          col: 0,
          rowSpan: 1,
          colSpan: 6,
          section: 'default',
        },
        {
          id: 'meeting_time',
          label: '会议时段',
          type: 'select',
          required: true,
          options: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'],
          row: 1,
          col: 6,
          rowSpan: 1,
          colSpan: 6,
          section: 'default',
        },
        {
          id: 'equipment',
          label: '所需设备',
          type: 'checkbox',
          required: false,
          options: ['投影仪', '音响', '白板', '视频会议系统'],
          row: 2,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: 'default',
        },
        {
          id: 'purpose',
          label: '会议主题',
          type: 'textarea',
          required: true,
          placeholder: '请简要描述会议主题',
          rows: 3,
          row: 3,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: 'default',
        },
      ],
      actions: [
        { id: 'submit', label: '提交预订', type: 'primary' },
        { id: 'cancel', label: '取消', type: 'secondary' },
      ],
    },
  },
  {
    id: 'expense-report',
    name: '费用报销单',
    description: '费用报销申请，支持多项费用明细和发票附件上传',
    icon: FileSpreadsheet,
    color: 'orange',
    config: {
      id: 'template-expense-report',
      name: '费用报销单',
      description: '费用报销申请表单',
      source: '财务系统',
      type: 'form',
      gridColumns: 12,
      fields: [
        {
          id: 'applicant',
          label: '申请人',
          type: 'text',
          required: true,
          placeholder: '请输入',
          row: 0,
          col: 0,
          rowSpan: 1,
          colSpan: 6,
          section: '申请信息',
        },
        {
          id: 'department',
          label: '所属部门',
          type: 'select',
          required: true,
          options: ['技术部', '产品部', '市场部', '人事部', '财务部'],
          row: 0,
          col: 6,
          rowSpan: 1,
          colSpan: 6,
          section: '申请信息',
        },
        {
          id: 'expense_table',
          label: '费用明细',
          type: 'table',
          required: true,
          columns: [
            { id: 'expense_type', label: '费用类型', type: 'select', options: ['差旅费', '交通费', '餐饮费', '办公费', '其他'], width: 120 },
            { id: 'expense_date', label: '发生日期', type: 'date', width: 120 },
            { id: 'amount', label: '金额(元)', type: 'number', width: 100 },
            { id: 'remark', label: '备注', type: 'text', width: 200 },
          ],
          minRows: 1,
          maxRows: 20,
          defaultRows: 2,
          row: 1,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: '费用明细',
        },
        {
          id: 'total_amount',
          label: '总计金额',
          type: 'number',
          required: true,
          placeholder: '自动计算',
          row: 2,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: '费用明细',
        },
        {
          id: 'invoices',
          label: '发票附件',
          type: 'file',
          required: true,
          row: 3,
          col: 0,
          rowSpan: 1,
          colSpan: 12,
          section: 'default',
        },
      ],
      actions: [
        { id: 'submit', label: '提交审批', type: 'primary' },
        { id: 'save', label: '保存草稿', type: 'secondary' },
      ],
    },
  },
];

export function TemplateSelector({
  onSelect,
  onSkip,
}: {
  onSelect: (template: any) => void;
  onSkip: () => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          选择模板
        </h2>
        <p className="text-sm text-slate-600 mt-1">从预设模板开始，或创建空白表单</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        {templates.map((template) => {
          const Icon = template.icon;
          const colorMap: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hover: 'hover:border-blue-400' },
            green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', hover: 'hover:border-green-400' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', hover: 'hover:border-purple-400' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', hover: 'hover:border-orange-400' },
          };
          const colors = colorMap[template.color];

          return (
            <div
              key={template.id}
              onClick={() => onSelect(template)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-600">{template.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-white rounded text-xs text-slate-600">
                      {template.config.fields.length} 个字段
                    </span>
                    <span className="px-2 py-1 bg-white rounded text-xs text-slate-600">
                      {template.config.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="px-6 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 mx-auto"
        >
          <FileText className="w-4 h-4" />
          跳过，创建空白表单
        </button>
      </div>
    </div>
  );
}

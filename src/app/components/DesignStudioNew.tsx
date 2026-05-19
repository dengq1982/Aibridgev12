import { useState } from 'react';
import { DesignHome } from './DesignHome';
import { FormEditor } from './FormEditor';
import { RuntimeEngine } from './RuntimeEngine';
import { TemplateSelector } from './TemplateSelector';
import { MultiTableRelationPage } from './MultiTableRelationPage';

type ViewMode = 'home' | 'template' | 'editor' | 'publish' | 'multiTable';

interface FormItem {
  id: string;
  name: string;
  description: string;
  source?: string;
  type: string;
  createTime: string;
  updateTime: string;
  published: boolean;
  fields?: any[];
  config?: any;
}

export function DesignStudioNew() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [forms, setForms] = useState<FormItem[]>([
    {
      id: 'form-1',
      name: '供应商入驻表',
      description: '已对接致远OA',
      source: '致远OA',
      type: 'form',
      createTime: '2024-01-15',
      updateTime: '2024-02-20',
      published: true,
      fields: [],
      config: null,
    },
    {
      id: 'form-2',
      name: '供应商报价表',
      description: '已对接致远OA',
      source: '致远OA',
      type: 'form',
      createTime: '2024-02-01',
      updateTime: '2024-02-18',
      published: true,
      fields: [],
      config: null,
    },
  ]);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  const handleNew = () => {
    setViewMode('template');
  };

  const handleTemplateSelect = (template: any) => {
    setEditingConfig(template.config);
    setCurrentFormId(null);
    setViewMode('editor');
  };

  const handleTemplateSkip = () => {
    setEditingConfig(null);
    setCurrentFormId(null);
    setViewMode('editor');
  };

  const handleEdit = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setCurrentFormId(formId);
      setEditingConfig(form.config);
      setViewMode('editor');
    }
  };

  const handlePublish = (formId: string) => {
    setCurrentFormId(formId);
    setViewMode('publish');
  };

  const handleDuplicate = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      const newForm: FormItem = {
        ...form,
        id: `form-${Date.now()}`,
        name: `${form.name} (副本)`,
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0],
        published: false,
      };
      setForms(prev => [...prev, newForm]);
    }
  };

  const handleDelete = (formId: string) => {
    if (confirm('确定要删除这个表单吗？')) {
      setForms(prev => prev.filter(f => f.id !== formId));
    }
  };

  const handleSaveForm = (config: any) => {
    if (currentFormId) {
      // Update existing form
      setForms(prev => prev.map(f => 
        f.id === currentFormId 
          ? { 
              ...f, 
              config, 
              name: config.name || f.name,
              description: config.description || f.description,
              source: config.source || f.source,
              fields: config.fields || f.fields,
              updateTime: new Date().toISOString().split('T')[0],
            } 
          : f
      ));
    } else {
      // Create new form
      const newForm: FormItem = {
        id: `form-${Date.now()}`,
        name: config.name || '未命名表单',
        description: config.description || '',
        source: config.source,
        type: 'form',
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0],
        published: false,
        fields: config.fields || [],
        config,
      };
      setForms(prev => [...prev, newForm]);
      setCurrentFormId(newForm.id);
    }
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setCurrentFormId(null);
    setEditingConfig(null);
  };

  const handleBackToEditor = () => {
    setViewMode('editor');
  };

  const handleOpenMultiTable = () => {
    setViewMode('multiTable');
  };

  return (
    <>
      {viewMode === 'home' && (
        <DesignHome
          forms={forms}
          onNew={handleNew}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onOpenMultiTable={handleOpenMultiTable}
        />
      )}

      {viewMode === 'template' && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onSkip={handleTemplateSkip}
        />
      )}

      {viewMode === 'editor' && (
        <FormEditor
          initialConfig={editingConfig}
          onBack={handleBackToHome}
          onSave={handleSaveForm}
        />
      )}

      {viewMode === 'publish' && (
        <div>
          <div className="mb-6">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              ← 返回首页
            </button>
          </div>
          <RuntimeEngine
            forms={forms
              .filter(f => f.id === currentFormId)
              .map(f => ({
                id: f.id,
                name: f.name,
                description: f.description,
                source: f.source,
                fields: f.fields || [],
                ...(f.config || {})
              }))
            }
          />
        </div>
      )}

      {viewMode === 'multiTable' && (
        <MultiTableRelationPage
          onBack={handleBackToHome}
        />
      )}
    </>
  );
}
import { useState, useRef } from 'react';
import { Play, Link, Copy, Smartphone, Monitor, QrCode, Download } from 'lucide-react';
import { FormPreview } from './FormPreview';
import QRCode from 'qrcode';

export function RuntimeEngine({ forms }: { forms: any[] }) {
  const [selectedForm, setSelectedForm] = useState<any>(forms.length > 0 ? forms[0] : null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewType, setPreviewType] = useState<'list' | 'detail' | 'myList' | 'myDetail'>('list');
  const [qrCodeUrls, setQrCodeUrls] = useState<{ [key: string]: string }>({});
  const [linkType, setLinkType] = useState<'h5' | 'miniprogram' | 'h5tomp'>('h5');

  if (forms.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center text-slate-400">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">暂无可用表单</h3>
          <p className="text-sm">请先在"设计态"中生成表单，然后在此运行和测试</p>
        </div>
      </div>
    );
  }

  const generateUrl = (type: string, formId?: string, instanceId?: string) => {
    const baseUrl = 'https://ai-bridge.example.com';
    let path = '';

    switch (type) {
      case 'fillList':
        path = `/forms/fill-list`;
        break;
      case 'myList':
        path = '/forms/my-submissions';
        break;
      case 'fillDetail':
        path = `/forms/${instanceId || formId}/fill`;
        break;
      default:
        return baseUrl;
    }

    // 根据链接类型返回不同的URL
    if (linkType === 'miniprogram') {
      return `weixin://miniprogram/ai-bridge${path}`;
    } else if (linkType === 'h5tomp') {
      return `${baseUrl}${path}?target=miniprogram`;
    } else {
      return `${baseUrl}${path}`;
    }
  };

  // 模拟表单实例数据
  const formInstances = [
    { id: 'inst-1', name: '供应商中标通知', user: '蔡青', time: '2026-08-08 10:24' },
    { id: 'inst-2', name: '供应商中标通知', user: '杨宁', time: '2026-08-08 10:24' },
    { id: 'inst-3', name: '供应商中标通知', user: '王强', time: '2026-08-07 15:30' },
  ];

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label}已复制到剪贴板`);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert(`${label}已复制到剪贴板`);
      } catch (e) {
        alert(`复制失败，请手动复制：${text}`);
      }
      document.body.removeChild(textArea);
    }
  };

  const generateQrCode = async (url: string) => {
    // 如果已经生成了二维码，则收起（移除）
    if (qrCodeUrls[url]) {
      setQrCodeUrls((prev) => {
        const newQrCodes = { ...prev };
        delete newQrCodes[url];
        return newQrCodes;
      });
      return;
    }
    
    // 否则生成新的二维码
    try {
      const qrCode = await QRCode.toDataURL(url);
      setQrCodeUrls((prev) => ({ ...prev, [url]: qrCode }));
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Integration Options */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">表单链接</h2>
          <p className="text-sm text-slate-600 mt-1">复制表单链接配置到Portal或者通过邮件等方式发送</p>

          {/* Link Type Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setLinkType('h5')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                linkType === 'h5'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              H5（适用于PC邮件等场景）
            </button>
            <button
              onClick={() => setLinkType('miniprogram')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                linkType === 'miniprogram'
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              小程序（适用于微信体系内发布）
            </button>
            <button
              onClick={() => setLinkType('h5tomp')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                linkType === 'h5tomp'
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              H5跳转小程序（适用于手机端短信/浏览器等场景）
            </button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="p-6 space-y-6">
          {/* 表单填写列表 Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">表单填写列表</h3>
                <p className="text-xs text-blue-700">
                  个人有权限填写的该表单列表(配置协同中流程表单触发外部表单,会产生多条填写实例)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generateUrl('fillList')}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(generateUrl('fillList'), '表单填写列表链接')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={() => generateQrCode(generateUrl('fillList'))}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4" />
                  二维码
                </button>
              </div>

              {qrCodeUrls[generateUrl('fillList')] && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-blue-200 inline-block">
                  <img
                    src={qrCodeUrls[generateUrl('fillList')]}
                    alt="表单填写列表二维码"
                    className="w-40 h-40"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeUrls[generateUrl('fillList')];
                      link.download = 'fill-list-qr-code.png';
                      link.click();
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    下载二维码
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 我填写的列表 Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">我填写的列表</h3>
                <p className="text-xs text-green-700">
                  个人提交的该表单数据列表
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generateUrl('myList')}
                  className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm bg-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(generateUrl('myList'), '我填写的列表链接')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={() => generateQrCode(generateUrl('myList'))}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4" />
                  二维码
                </button>
              </div>

              {qrCodeUrls[generateUrl('myList')] && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-green-200 inline-block">
                  <img
                    src={qrCodeUrls[generateUrl('myList')]}
                    alt="我填写的列表二维码"
                    className="w-40 h-40"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeUrls[generateUrl('myList')];
                      link.download = 'my-list-qr-code.png';
                      link.click();
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    下载二维码
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 表单填写详情 Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">表单填写详情</h3>
                <p className="text-xs text-purple-700">
                  该表单每次生成的表单详情(配置协同流程表单触发外部表单,会产生多条填写实例)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formInstances.map((instance) => {
                const instanceUrl = generateUrl('fillDetail', selectedForm?.id, instance.id);
                return (
                  <div key={instance.id} className="bg-white rounded-lg border border-purple-200 p-4">
                    <h4 className="font-medium text-purple-900 mb-3 text-sm">
                      {instance.name}（{instance.user} {instance.time}）
                    </h4>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={instanceUrl}
                        className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-sm bg-slate-50 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(instanceUrl, `${instance.name}链接`)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Copy className="w-4 h-4" />
                        复制
                      </button>
                      <button
                        onClick={() => generateQrCode(instanceUrl)}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap"
                      >
                        <QrCode className="w-4 h-4" />
                        二维码
                      </button>
                    </div>

                    {qrCodeUrls[instanceUrl] && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-purple-200 inline-block">
                        <img
                          src={qrCodeUrls[instanceUrl]}
                          alt={`${instance.name}二维码`}
                          className="w-40 h-40"
                        />
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrCodeUrls[instanceUrl];
                            link.download = `${instance.name}-${instance.user}-qr-code.png`;
                            link.click();
                          }}
                          className="w-full mt-2 px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200 flex items-center justify-center gap-2"
                        >
                          <Download className="w-3 h-3" />
                          下载二维码
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
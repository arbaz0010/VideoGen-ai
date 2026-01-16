import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard, Button, Input, Badge } from '../../components/UI';
import { 
  Server, DollarSign, Mail, Book, Save, ToggleLeft, ToggleRight, 
  AlertTriangle, CheckCircle2, Edit3, Plus, Tag, Package, Trash2, Shield,
  Image as ImageIcon, Key, Globe, AtSign, Cpu
} from 'lucide-react';
import { PlanType } from '../../types';

type Tab = 'general' | 'pricing' | 'email' | 'kb';

export default function SystemSettings() {
  const { 
    systemConfig, updateSystemConfig, 
    pricingPlans, updatePricingPlan, 
    emailTemplates, updateEmailTemplate,
    kbArticles, addKBArticle,
    creditPacks, updateCreditPack,
    promoCodes, addPromoCode, deletePromoCode
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [successMsg, setSuccessMsg] = useState('');

  // Local state for new entries
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState('');
  
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // --- Handlers ---
  const handleToggleFlag = (key: keyof typeof systemConfig.featureFlags) => {
    updateSystemConfig({
      featureFlags: { ...systemConfig.featureFlags, [key]: !systemConfig.featureFlags[key] }
    });
    showSuccess(`Updated ${String(key)}`);
  };

  const handleCreateArticle = () => {
    if (newArticleTitle && newArticleCategory) {
      addKBArticle({
        title: newArticleTitle,
        category: newArticleCategory,
        status: 'draft',
        content: 'Draft content...'
      });
      setNewArticleTitle('');
      setNewArticleCategory('');
      showSuccess('Article draft created');
    }
  };

  const handleAddPromo = () => {
    if (newPromoCode && newPromoDiscount) {
      addPromoCode({
        code: newPromoCode.toUpperCase(),
        discountType: newPromoType,
        discountValue: Number(newPromoDiscount),
        status: 'active'
      });
      setNewPromoCode('');
      setNewPromoDiscount('');
      showSuccess('Promo code created');
    }
  };

  // --- Render Functions ---

  const renderGeneral = () => (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <Cpu size={20} className="text-purple-500" /> AI Configuration
        </h3>
        <div className="space-y-4">
           <div className="space-y-1">
             <label className="text-sm font-medium text-neutral-300 flex items-center gap-1"><Key size={14} /> Gemini API Key</label>
             <p className="text-xs text-neutral-500 mb-2">Used for Veo video generation and prompt enhancement.</p>
             <div className="flex gap-2">
                <Input 
                   type="password"
                   value={systemConfig.gemini.apiKey}
                   onChange={(e) => updateSystemConfig({ gemini: { ...systemConfig.gemini, apiKey: e.target.value } })}
                   placeholder="sk-..."
                   className="flex-1"
                />
                <Button variant="secondary" onClick={() => showSuccess('API Key Saved')}>Save</Button>
             </div>
           </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" /> Maintenance & Status
        </h3>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
          <div>
            <p className="font-medium">Maintenance Mode</p>
            <p className="text-sm text-neutral-400">Disable platform access for all non-admin users</p>
          </div>
          <button onClick={() => {
            updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode });
            showSuccess(`Maintenance mode ${!systemConfig.maintenanceMode ? 'enabled' : 'disabled'}`);
          }}>
            {systemConfig.maintenanceMode ? <ToggleRight size={32} className="text-amber-500" /> : <ToggleLeft size={32} className="text-neutral-600" />}
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span>Video Generation</span>
            <button onClick={() => handleToggleFlag('videoGeneration')}>
              {systemConfig.featureFlags.videoGeneration ? <ToggleRight size={32} className="text-green-500" /> : <ToggleLeft size={32} className="text-neutral-600" />}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span>New Signups</span>
            <button onClick={() => handleToggleFlag('newSignups')}>
              {systemConfig.featureFlags.newSignups ? <ToggleRight size={32} className="text-green-500" /> : <ToggleLeft size={32} className="text-neutral-600" />}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span>API Access</span>
            <button onClick={() => handleToggleFlag('apiAccess')}>
              {systemConfig.featureFlags.apiAccess ? <ToggleRight size={32} className="text-green-500" /> : <ToggleLeft size={32} className="text-neutral-600" />}
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-500" /> Watermark Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium">Enable Global Watermark</p>
              <p className="text-sm text-neutral-400">If disabled, no watermarks will be applied regardless of plan</p>
            </div>
            <button onClick={() => {
              updateSystemConfig({ watermark: { ...systemConfig.watermark, enabled: !systemConfig.watermark.enabled } });
              showSuccess(`Watermarks ${!systemConfig.watermark.enabled ? 'enabled' : 'disabled'}`);
            }}>
               {systemConfig.watermark.enabled ? <ToggleRight size={32} className="text-green-500" /> : <ToggleLeft size={32} className="text-neutral-600" />}
            </button>
          </div>
          
          {systemConfig.watermark.enabled && (
             <div className="space-y-4 mt-4 border-t border-white/5 pt-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => updateSystemConfig({ watermark: { ...systemConfig.watermark, type: 'text' } })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors ${systemConfig.watermark.type === 'text' ? 'bg-white text-black border-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'}`}
                >
                  <Edit3 size={14} /> Text Watermark
                </button>
                <button 
                  onClick={() => updateSystemConfig({ watermark: { ...systemConfig.watermark, type: 'image' } })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors ${systemConfig.watermark.type === 'image' ? 'bg-white text-black border-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'}`}
                >
                  <ImageIcon size={14} /> Image Logo
                </button>
              </div>

              {(systemConfig.watermark.type || 'text') === 'text' ? (
                <Input 
                  label="Watermark Text" 
                  value={systemConfig.watermark.text}
                  onChange={(e) => updateSystemConfig({ watermark: { ...systemConfig.watermark, text: e.target.value } })}
                  placeholder="Made with VideoGen AI"
                />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400 block">Upload Logo</label>
                  <div className="flex items-start gap-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                    {systemConfig.watermark.imageUrl ? (
                      <div className="relative group">
                        <img src={systemConfig.watermark.imageUrl} alt="Watermark" className="h-16 w-auto object-contain bg-black/50 border border-white/10 rounded p-1" />
                        <button 
                          onClick={() => updateSystemConfig({ watermark: { ...systemConfig.watermark, imageUrl: '' } })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 border border-dashed border-neutral-700 rounded flex items-center justify-center text-neutral-500 text-xs bg-white/5">
                        No Image
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateSystemConfig({ watermark: { ...systemConfig.watermark, imageUrl: reader.result as string } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <p className="text-xs text-neutral-500 mt-2">Recommended: PNG with transparency, max height 50px.</p>
                    </div>
                  </div>
                </div>
              )}
             </div>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Free Plan Max Duration (sec)" 
            type="number"
            value={systemConfig.limits.freeMaxDuration}
            onChange={(e) => updateSystemConfig({ limits: { ...systemConfig.limits, freeMaxDuration: Number(e.target.value) } })}
          />
          <Input 
            label="Pro Plan Max Duration (sec)" 
            type="number"
            value={systemConfig.limits.proMaxDuration}
            onChange={(e) => updateSystemConfig({ limits: { ...systemConfig.limits, proMaxDuration: Number(e.target.value) } })}
          />
        </div>
      </GlassCard>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-8">
      {/* Subscription Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-300">
           <DollarSign size={18} /> Subscription Plans
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {pricingPlans.map((plan) => (
            <GlassCard key={plan.id} className="p-5">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <Badge>{plan.id}</Badge>
                  </div>
                  <Button variant="secondary" className="text-xs h-8" onClick={() => showSuccess(`${plan.name} plan updated`)}>Save</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="Monthly Price ($)" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={plan.price}
                  onChange={(e) => updatePricingPlan(plan.id, { price: Number(e.target.value) })}
                />
                <Input 
                  label="Yearly Price ($)" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={plan.priceYearly}
                  onChange={(e) => updatePricingPlan(plan.id, { priceYearly: Number(e.target.value) })}
                />
                <div className="space-y-1.5 w-full">
                  <label className="text-sm font-medium text-neutral-400 block">Credits / Month</label>
                  <input 
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-white"
                    value={plan.credits}
                    onChange={(e) => updatePricingPlan(plan.id, { credits: e.target.value === 'Unlimited' ? 'Unlimited' : Number(e.target.value) })}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Credit Packs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-300">
           <Package size={18} /> Add-on Credit Packs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPacks.map((pack) => (
            <GlassCard key={pack.id} className="p-5">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold">{pack.name}</h4>
                 <Badge>{pack.id}</Badge>
               </div>
               <div className="space-y-3">
                 <Input 
                   label="Credits Amount"
                   type="number"
                   value={pack.credits}
                   onChange={(e) => updateCreditPack(pack.id, { credits: Number(e.target.value) })}
                 />
                 <Input 
                   label="Price ($)"
                   type="number"
                   step="0.01"
                   value={pack.price}
                   onChange={(e) => updateCreditPack(pack.id, { price: Number(e.target.value) })}
                 />
                 <Button variant="secondary" className="w-full text-xs" onClick={() => showSuccess(`${pack.name} updated`)}>Save Changes</Button>
               </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Promo Codes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-300">
           <Tag size={18} /> Promotional Codes
        </h3>
        
        <GlassCard className="p-4 bg-neutral-900/50 flex flex-col md:flex-row gap-4 items-end">
          <Input 
            label="Promo Code"
            placeholder="e.g. SUMMER25" 
            value={newPromoCode}
            onChange={(e) => setNewPromoCode(e.target.value)}
            className="flex-1"
          />
          <div className="w-full md:w-32">
            <label className="text-sm font-medium text-neutral-400 block mb-1.5">Type</label>
            <select 
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2.5 text-white outline-none"
              value={newPromoType}
              onChange={(e) => setNewPromoType(e.target.value as any)}
            >
              <option value="percent">% Off</option>
              <option value="fixed">$ Off</option>
            </select>
          </div>
          <Input 
            label="Value"
            placeholder="e.g. 25" 
            type="number"
            value={newPromoDiscount}
            onChange={(e) => setNewPromoDiscount(e.target.value)}
            className="w-full md:w-32"
          />
          <Button onClick={handleAddPromo} className="h-[42px] mb-[1px]">Create Code</Button>
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-neutral-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold tracking-wide">{promo.code}</td>
                  <td className="p-4 text-green-400">
                    {promo.discountType === 'percent' ? `${promo.discountValue}%` : `$${promo.discountValue}`} OFF
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      promo.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {promo.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400">{promo.usageCount} times</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deletePromoCode(promo.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-500">No active promotional codes</td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        {/* Mailgun Config */}
        <GlassCard className="p-5 border-l-4 border-l-blue-500">
          <h4 className="font-bold flex items-center gap-2 mb-4">
            <Server size={18} /> Mailgun Config
          </h4>
          <div className="space-y-3">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm">Enable Emails</span>
               <button onClick={() => updateSystemConfig({ mailgun: { ...systemConfig.mailgun, enabled: !systemConfig.mailgun.enabled } })}>
                 {systemConfig.mailgun.enabled ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-neutral-600" />}
               </button>
             </div>
             
             <div className="space-y-1">
               <label className="text-xs text-neutral-500 flex items-center gap-1"><Key size={10} /> API Key</label>
               <input 
                 type="password"
                 className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white"
                 value={systemConfig.mailgun.apiKey}
                 onChange={(e) => updateSystemConfig({ mailgun: { ...systemConfig.mailgun, apiKey: e.target.value } })}
                 placeholder="key-..."
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs text-neutral-500 flex items-center gap-1"><Globe size={10} /> Domain</label>
               <input 
                 type="text"
                 className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white"
                 value={systemConfig.mailgun.domain}
                 onChange={(e) => updateSystemConfig({ mailgun: { ...systemConfig.mailgun, domain: e.target.value } })}
                 placeholder="mg.yourdomain.com"
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs text-neutral-500 flex items-center gap-1"><AtSign size={10} /> From Email</label>
               <input 
                 type="text"
                 className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white"
                 value={systemConfig.mailgun.fromEmail}
                 onChange={(e) => updateSystemConfig({ mailgun: { ...systemConfig.mailgun, fromEmail: e.target.value } })}
                 placeholder="noreply@..."
               />
             </div>
             <Button variant="secondary" className="w-full text-xs mt-2" onClick={() => showSuccess("Mailgun settings saved")}>Save Config</Button>
          </div>
        </GlassCard>

        {/* Templates List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-neutral-400 uppercase tracking-wider">Templates</h4>
          {emailTemplates.map(t => (
            <div key={t.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
              <h4 className="font-medium">{t.name}</h4>
              <p className="text-xs text-neutral-400 mt-1 truncate">{t.subject}</p>
            </div>
          ))}
          <Button variant="ghost" className="w-full border-dashed border border-white/20">
            <Plus size={16} className="mr-2" /> New Template
          </Button>
        </div>
      </div>
      
      {/* Template Editor */}
      <GlassCard className="col-span-2">
        <h3 className="font-semibold mb-4">Welcome Email (Preview)</h3>
        <Input label="Subject Line" value={emailTemplates[0].subject} readOnly className="mb-4" />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-400">Body Content (HTML supported)</label>
          <textarea 
            className="w-full h-64 bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-white/20"
            value={emailTemplates[0].body}
            readOnly
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Save Template</Button>
        </div>
      </GlassCard>
    </div>
  );

  const renderKB = () => (
    <div className="space-y-6">
      <GlassCard className="p-4 bg-neutral-900/50 flex gap-4">
        <Input 
          placeholder="Article Title" 
          value={newArticleTitle}
          onChange={(e) => setNewArticleTitle(e.target.value)}
          className="flex-1"
        />
        <select 
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm outline-none"
          value={newArticleCategory}
          onChange={(e) => setNewArticleCategory(e.target.value)}
        >
          <option value="">Category</option>
          <option value="General">General</option>
          <option value="Support">Support</option>
          <option value="Developers">Developers</option>
        </select>
        <Button onClick={handleCreateArticle}>Create Article</Button>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-neutral-400">
            <tr>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Views</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {kbArticles.map((article) => (
              <tr key={article.id} className="hover:bg-white/5">
                <td className="p-4 font-medium">{article.title}</td>
                <td className="p-4"><Badge>{article.category}</Badge></td>
                <td className="p-4">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${article.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {article.status}
                </td>
                <td className="p-4 text-neutral-400">{article.views}</td>
                <td className="p-4 text-right">
                  <button className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors">
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-neutral-400">Manage platform configuration and resources.</p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg text-sm animate-fade-in">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex gap-6">
        {[
          { id: 'general', label: 'Platform Config', icon: Server },
          { id: 'pricing', label: 'Pricing Plans', icon: DollarSign },
          { id: 'email', label: 'Email Templates', icon: Mail },
          { id: 'kb', label: 'Knowledge Base', icon: Book },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-white text-white' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-4">
        {activeTab === 'general' && renderGeneral()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'email' && renderEmail()}
        {activeTab === 'kb' && renderKB()}
      </div>
    </div>
  );
}
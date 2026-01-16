import React, { useEffect, useState } from 'react';
import { User, PlanType, PricingPlan, CreditPack } from '../types';
import { PLANS } from '../constants';
import { useApp } from '../context/AppContext';
import { Button, GlassCard, Badge } from '../components/UI';
import { Check, CreditCard, Download, Loader2, AlertCircle, HardDrive, Droplet, PlusCircle, CheckCircle2 } from 'lucide-react';

// Extend Window interface for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
}

export default function Billing({ user }: { user: User }) {
  const { updateUser, creditPacks, addLog } = useApp();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);
  
  // Billing Cycle State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (window.Paddle) {
      window.Paddle.Setup({ 
        vendor: 1234567, 
        debug: true 
      });
      window.Paddle.Environment.set('sandbox');
      setPaddleReady(true);
    }
  }, []);

  const handleSwitchPlan = (plan: PricingPlan) => {
    if (plan.price === 0) {
      if (confirm(`Are you sure you want to downgrade to the ${plan.name} plan?`)) {
        updateUser(user.id, { plan: plan.name });
        addLog('Plan Downgrade', 'warning', `Switched to ${plan.name}`);
      }
      return;
    }

    if (!paddleReady) {
      alert("Payment gateway is initializing. Please try again in a moment.");
      return;
    }

    setLoadingPlan(plan.id);
    const finalPrice = billingCycle === 'monthly' ? plan.price : plan.priceYearly;

    window.Paddle.Checkout.open({
      product: 12345, 
      email: user.email,
      title: `Upgrade to ${plan.name}`,
      message: `Get access to ${plan.quality} generation and ${plan.credits} credits/mo. Total: $${finalPrice}`,
      successCallback: (data: any) => {
        console.log("Paddle Checkout Success:", data);
        updateUser(user.id, { plan: plan.name });
        addLog('Plan Upgrade', 'success', `Upgraded to ${plan.name} (${billingCycle})`);
        setLoadingPlan(null);
        alert(`Successfully subscribed to ${plan.name}!`);
      },
      closeCallback: () => {
        setLoadingPlan(null);
      }
    });
  };

  const handleBuyAddon = (pack: CreditPack) => {
     if (!paddleReady) return;
     
     window.Paddle.Checkout.open({
      product: 99999, 
      email: user.email,
      title: `Buy ${pack.name}`,
      message: `Add ${pack.credits} credits to your account for $${pack.price}.`,
      successCallback: (data: any) => {
        updateUser(user.id, { credits: user.credits + pack.credits });
        addLog('Add-on Purchase', 'success', `Bought ${pack.name}`);
        alert(`Successfully purchased ${pack.credits} credits!`);
      }
    });
  };

  const handleStorageUpgrade = () => {
     alert("Storage upgrade to 50GB initiated ($10/mo). Redirecting to secure checkout...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
          <p className="text-neutral-400">Manage your subscription and billing information.</p>
        </div>
        
        {/* Cycle Toggle */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800">
           <button 
             onClick={() => setBillingCycle('monthly')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
           >
             Monthly
           </button>
           <button 
             onClick={() => setBillingCycle('yearly')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
           >
             Yearly
             <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-black text-white' : 'bg-green-500 text-black'}`}>
               -15%
             </span>
           </button>
        </div>
      </div>

      <GlassCard className="border-l-4 border-l-white bg-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">Current Plan: {user.plan}</h3>
              <Badge color="bg-green-600">Active</Badge>
            </div>
            <p className="text-neutral-400 mt-1">
              {user.plan === PlanType.FREE ? 'Free forever' : `Renews on ${new Date(Date.now() + 86400000 * 30).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-right mr-4">
               <p className="text-sm text-neutral-400">Credits Balance</p>
               <p className="text-2xl font-bold">{user.credits}</p>
            </div>
            {user.plan !== PlanType.FREE && <Button variant="ghost" className="border border-white/10">Cancel Subscription</Button>}
          </div>
        </div>
      </GlassCard>

      <div>
        <h3 className="text-xl font-bold mb-6">Available Plans</h3>
        {!paddleReady && (
           <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm flex items-center gap-2">
             <Loader2 size={16} className="animate-spin" /> Initializing secure payment gateway...
           </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
             const isCurrent = user.plan === plan.name;
             const price = billingCycle === 'monthly' ? plan.price : plan.priceYearly;
             const priceDisplay = billingCycle === 'monthly' 
                ? `$${price}`
                : `$${price}`;
             
             return (
              <div key={plan.id} className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 relative ${isCurrent ? 'bg-white/10 border-white shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-600'}`}>
                {plan.name === PlanType.PRO && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">Most Popular</div>}
                
                <div className="mb-4">
                   <h4 className="font-bold text-lg">{plan.name}</h4>
                   <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">{priceDisplay}</span>
                      <span className="text-sm text-neutral-400 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                   </div>
                   <p className="text-xs text-neutral-500 mt-1">
                     {typeof plan.credits === 'number' ? `${plan.credits} credits/mo` : 'Unlimited credits'}
                   </p>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check size={14} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-white' : 'text-neutral-500'}`} /> 
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </div>

                <Button 
                  variant={isCurrent ? 'ghost' : (plan.name === PlanType.PRO ? 'primary' : 'secondary')} 
                  className={`w-full mt-auto ${isCurrent ? 'cursor-default opacity-100 bg-white/10' : ''}`}
                  disabled={isCurrent || (loadingPlan !== null && loadingPlan !== plan.id)}
                  isLoading={loadingPlan === plan.id}
                  onClick={() => !isCurrent && handleSwitchPlan(plan)}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade`}
                </Button>
              </div>
          )})}
        </div>
      </div>

      {/* Add-ons Section */}
      <div>
         <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle size={24} /> Power-Ups & Add-ons</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Credit Packs */}
            {creditPacks.map((pack) => (
              <GlassCard key={pack.id} className="flex flex-col justify-between p-6 hover:bg-white/5 transition-colors">
                 <div>
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-4">
                       <CreditCard size={20} />
                    </div>
                    <h4 className="font-bold text-lg">{pack.name}</h4>
                    <p className="text-sm text-neutral-400 mt-1">Get an extra {pack.credits} credits instantly.</p>
                 </div>
                 <div className="mt-6 flex items-center justify-between">
                    <span className="font-bold text-xl">${pack.price}</span>
                    <Button variant="secondary" className="text-xs" onClick={() => handleBuyAddon(pack)}>Buy Now</Button>
                 </div>
              </GlassCard>
            ))}

            {/* Storage Addon */}
            <GlassCard className="flex flex-col justify-between p-6 hover:bg-white/5 transition-colors">
               <div>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 mb-4">
                     <HardDrive size={20} />
                  </div>
                  <h4 className="font-bold text-lg">50GB Storage</h4>
                  <p className="text-sm text-neutral-400 mt-1">Expand your cloud storage for more videos.</p>
               </div>
               <div className="mt-6 flex items-center justify-between">
                  <span className="font-bold text-xl">$10<span className="text-sm font-normal text-neutral-500">/mo</span></span>
                  <Button variant="secondary" className="text-xs" onClick={handleStorageUpgrade}>Subscribe</Button>
               </div>
            </GlassCard>

            {/* Watermark Removal Info */}
            <GlassCard className="flex flex-col justify-between p-6 bg-neutral-900/30">
               <div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 mb-4">
                     <Droplet size={20} />
                  </div>
                  <h4 className="font-bold text-lg">Remove Watermark</h4>
                  <p className="text-sm text-neutral-400 mt-1">One-time removal for Free tier videos.</p>
               </div>
               <div className="mt-6 flex items-center justify-between">
                  <span className="font-bold text-xl">$3<span className="text-sm font-normal text-neutral-500">/video</span></span>
                  <Badge color="bg-neutral-800">In Library</Badge>
               </div>
            </GlassCard>
         </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Billing History</h3>
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-neutral-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1].map((i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">Oct 20, 2024</td>
                  <td className="p-4">{user.plan} Plan - Monthly</td>
                  <td className="p-4">$XX.XX</td>
                  <td className="p-4"><Badge color="bg-green-500/20 text-green-500 border-green-500/20">Paid</Badge></td>
                  <td className="p-4 text-right">
                    <button className="text-neutral-400 hover:text-white"><Download size={16} /></button>
                  </td>
                </tr>
              ))}
              {user.plan === PlanType.FREE && (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-neutral-500">No billing history available for free plan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
        <div className="mt-4 text-xs text-neutral-500 flex items-center gap-2">
           <AlertCircle size={12} />
           <span>Payments are securely processed by Paddle. We do not store your credit card details.</span>
        </div>
      </div>
    </div>
  );
}
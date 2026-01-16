import React, { useState } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import { Button, Input, GlassCard } from '../components/UI';
import { Shield, Smartphone, Mail, CheckCircle2, Lock, AlertCircle, LogOut } from 'lucide-react';

export default function Settings({ user }: { user: User }) {
  const { updateUser, logout } = useApp();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  
  // 2FA State (Mock)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const handleProfileSave = () => {
    updateUser(user.id, { name, email });
    showSuccess('Profile updated successfully!');
  };

  const handlePasswordUpdate = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      showError('Please fill in all password fields.');
      return;
    }
    if (newPwd !== confirmPwd) {
      showError('New passwords do not match.');
      return;
    }
    if (newPwd.length < 8) {
       showError('Password must be at least 8 characters.');
       return;
    }
    // Mock API call simulation
    showSuccess('Password updated successfully.');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const toggle2FA = () => {
    const newState = !is2FAEnabled;
    setIs2FAEnabled(newState);
    showSuccess(`Two-factor authentication ${newState ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        {(successMsg || errorMsg) && (
            <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-fade-in ${successMsg ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {successMsg ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} 
              {successMsg || errorMsg}
            </div>
        )}
      </div>

      <GlassCard className="space-y-6">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-4">Profile Information</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
             <img src={user.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border border-white/20" />
             <button className="absolute bottom-0 right-0 bg-white text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg hover:bg-neutral-200 transition-colors">Edit</button>
          </div>
          <div>
            <p className="font-medium">Profile Photo</p>
            <p className="text-sm text-neutral-500">Max file size 5MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <Input 
            label="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <Button onClick={handleProfileSave}>Save Profile</Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
         <h3 className="text-lg font-semibold border-b border-white/10 pb-4 flex items-center gap-2">
           <Shield size={18} /> Security
         </h3>
         
         {/* Password Reset Section */}
         <div className="space-y-4">
            <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
              <Lock size={16} /> Change Password
            </h4>
            <div className="p-4 bg-neutral-900/30 rounded-lg border border-neutral-800 space-y-4">
              <Input 
                type="password" 
                label="Current Password" 
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  type="password" 
                  label="New Password" 
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                />
                <Input 
                  type="password" 
                  label="Confirm Password" 
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordUpdate} variant="secondary" className="text-sm">
                  Update Password
                </Button>
              </div>
            </div>
         </div>

         <div className="border-t border-white/10 my-6"></div>

         {/* 2FA Section */}
         <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 transition-colors hover:border-neutral-700">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg transition-colors ${is2FAEnabled ? 'bg-green-500/20 text-green-500' : 'bg-neutral-800 text-neutral-400'}`}>
               <Smartphone size={20} />
             </div>
             <div>
               <p className="font-medium">Two-factor Authentication</p>
               <p className="text-xs text-neutral-500">
                 {is2FAEnabled ? 'Active via Authenticator App' : 'Add an extra layer of security'}
               </p>
             </div>
           </div>
           <Button 
             variant={is2FAEnabled ? 'danger' : 'secondary'} 
             className="text-sm min-w-[100px]"
             onClick={toggle2FA}
           >
             {is2FAEnabled ? 'Disable' : 'Enable'}
           </Button>
         </div>

         <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 transition-colors hover:border-neutral-700">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400"><Mail size={20} /></div>
             <div>
               <p className="font-medium">Email Notifications</p>
               <p className="text-xs text-neutral-500">Manage your alerts and digests</p>
             </div>
           </div>
           <Button variant="secondary" className="text-sm min-w-[100px]">Manage</Button>
         </div>
         
         <div className="pt-4 border-t border-white/10">
            <Button variant="danger" className="w-full justify-center gap-2" onClick={logout}>
              <LogOut size={16} /> Log out of all devices
            </Button>
         </div>
      </GlassCard>
    </div>
  );
}
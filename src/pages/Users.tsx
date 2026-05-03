/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Trash2, Shield, User as UserIcon, 
  ShieldCheck, Search, ChevronRight, X,
  Briefcase, DollarSign, Activity, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { User, UserRole } from '../types';

export default function Users() {
  const { users, updateUser, deleteUser, user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser);
      setEditingUser(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="text-rose-500" size={18} />;
      case 'direktur': return <Briefcase className="text-blue-500" size={18} />;
      case 'keuangan': return <DollarSign className="text-emerald-500" size={18} />;
      default: return <Activity className="text-slate-400" size={18} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'direktur': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'keuangan': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={12} />
            Access Management
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Security Personnel</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage administrative roles and system permissions</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text"
               placeholder="Search personnel..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
             />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((u) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={u.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
                u.role === 'admin' ? "bg-rose-600" : "bg-blue-600"
              )} />
              
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                   "p-4 rounded-2xl border",
                   getRoleColor(u.role)
                )}>
                  {getRoleIcon(u.role)}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setEditingUser(u)}
                    className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Role"
                  >
                    <Mail size={18} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Revoke Access"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{u.name}</h3>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@{u.username}</div>
                </div>
                
                <div className="flex gap-2">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    getRoleColor(u.role)
                  )}>
                    {u.role}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Connection</span>
                </div>
                <div className="text-[8px] font-mono text-slate-300 truncate max-w-[100px]">{u.id}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">Update Permissions</h3>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateRole} className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                     <UserIcon size={24} />
                   </div>
                   <div>
                     <div className="font-black text-slate-800 uppercase tracking-tight">{editingUser.name}</div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingUser.username}</div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Access Tier (Role)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['karyawan', 'keuangan', 'direktur', 'admin'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEditingUser(u => u ? ({ ...u, role }) : null)}
                        className={cn(
                          "px-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-center",
                          editingUser.role === role 
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                            : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mt-4 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  Save Permission Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

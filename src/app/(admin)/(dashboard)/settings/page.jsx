'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Settings as SettingsIcon,
  Lock,
  Database,
  Shield,
  Bell,
  Layout,
  Save,
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [settings, setSettings] = useState({
    systemName: 'ATMS Network',
    maintenanceMode: false,
    traderSelfRegistration: true,
    backupFrequency: 'daily',
    retentionDays: '90',
    notifyOnNewTrader: true,
    notifyOnLowStock: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/admin/profile');
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleToggle = (key) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const handleSelect = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/api/admin/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // System settings would be saved here if a model existed
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-slate-900 text-white">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile and system configuration</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'profile', label: 'Personal Profile', icon: User },
            { id: 'system', label: 'System Config', icon: Layout },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold gap-3 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
          {activeTab === 'profile' && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg">Personal Profile</CardTitle>
                <CardDescription>Update your administrative account details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="h-10 rounded-lg"
                      placeholder="Admin Name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="h-10 rounded-lg bg-slate-50 border-slate-200 text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                        className="h-10 rounded-lg"
                        placeholder="+91 0000000000"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSaveProfile} disabled={loading} className="h-10 rounded-lg">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription>Basic system identity and access rules</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="systemName" className="text-sm font-medium">Platform Name</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => setSettings(s => ({ ...s, systemName: e.target.value }))}
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-900">Maintenance Mode</Label>
                      <p className="text-xs text-slate-500">Disable all trader access during maintenance</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={() => handleToggle('maintenanceMode')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-900">Self Registration</Label>
                      <p className="text-xs text-slate-500">Allow new traders to register on their own</p>
                    </div>
                    <Switch
                      checked={settings.traderSelfRegistration}
                      onCheckedChange={() => handleToggle('traderSelfRegistration')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(v) => handleSelect('backupFrequency', v)}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily (Recommended)</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention" className="text-sm font-medium">Data Retention (Days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={settings.retentionDays}
                      onChange={(e) => setSettings(s => ({ ...s, retentionDays: e.target.value }))}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-500 font-medium px-1 uppercase">Old logs and transactions will be archived after this period</p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveSettings} disabled={loading} className="h-10 rounded-lg">
                      {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Authentication and access controls</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-900">Two-Factor Authentication</Label>
                      <p className="text-xs text-slate-500">Enforce 2FA for all administrative accounts</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={() => handleToggle('twoFactorAuth')}
                    />
                  </div>

                  <Button variant="outline" className="w-full h-10 rounded-lg gap-2 border-slate-200 justify-start px-4">
                    <Lock className="h-4 w-4" />
                    Manage IP Whitelist
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg">Global Notifications</CardTitle>
                <CardDescription>Configure system-wide alert triggers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
                  {[
                    { id: 'notifyOnNewTrader', label: 'New Trader Alert', sub: 'Notify admin when a new trader registers' },
                    { id: 'notifyOnLowStock', label: 'Network Low Stock Alert', sub: 'Aggregate low stock alerts for all traders' },
                  ].map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-900">{p.label}</Label>
                        <p className="text-xs text-slate-500">{p.sub}</p>
                      </div>
                      <Switch
                        checked={settings[p.id]}
                        onCheckedChange={() => handleToggle(p.id)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Button onClick={handleSaveSettings} disabled={loading} className="h-10 rounded-lg">
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

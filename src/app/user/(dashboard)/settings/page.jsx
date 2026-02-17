'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Bell, User, LogOut, Shield, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Profile State
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' });

  // Security State
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  // Preferences State
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get('/api/user/settings')
      ]);
      setProfile(profileRes.data);
      setPreferences(settingsRes.data);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/user/profile', {
        name: profile.name,
        phone: profile.phone
      });
      setProfile(res.data);
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/user/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      alert('Password updated successfully');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrefs = async () => {
    setLoading(true);
    try {
      const res = await axios.put('/api/user/settings', preferences);
      setPreferences(res.data);
      alert('Preferences saved');
    } catch (err) {
      alert('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/user/auth/logout');
      window.location.href = '/user/login';
    } catch (err) {
      window.location.href = '/user/login';
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-slate-900 text-white">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage account security and system preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Navigation Tabs */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'profile', label: 'Identity', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'prefs', label: 'Preferences', icon: Bell },
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
                <CardTitle className="text-lg">Personal Identity</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="h-10 rounded-lg"
                        placeholder="Sayyad Azim"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        className="h-10 rounded-lg bg-slate-50 border-slate-200 text-slate-500"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-10 rounded-lg"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="h-10 rounded-lg">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-500" />
                  Credentials & Security
                </CardTitle>
                <CardDescription>Manage your account password</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Password</Label>
                    <Input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="h-10 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">New Password</Label>
                    <Input
                      type="password"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      className="h-10 rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="h-10 rounded-lg"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="h-10 rounded-lg bg-slate-900 border-none">
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'prefs' && preferences && (
            <Card className="border-slate-200 animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="text-lg">Communication Preferences</CardTitle>
                <CardDescription>Manage how you receive alerts and reports</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: 'email', label: 'Email Notifications', sub: 'Receive weekly market reports' },
                    { id: 'lowStock', label: 'Low Stock Alerts', sub: 'Alert when inventory is critical' },
                    { id: 'newSale', label: 'New Sale Alerts', sub: 'Notify on every outgoing order' },
                    { id: 'newPurchase', label: 'New Purchase Alerts', sub: 'Confirm when stock is received' },
                  ].map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-900">{p.label}</Label>
                        <p className="text-xs text-slate-500">{p.sub}</p>
                      </div>
                      <Switch
                        checked={preferences.notifications[p.id]}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [p.id]: checked
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Button onClick={handleUpdatePrefs} disabled={loading} className="h-10 rounded-lg">
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

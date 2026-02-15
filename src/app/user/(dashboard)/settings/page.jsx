'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoadingSettings(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setLoadingSettings(false));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        alert('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      alert('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSettings(data);
      alert('Settings updated successfully');
    } catch (err) {
      console.error('Settings update error:', err);
      alert('Failed to update settings');
    }
  };

  const toggleNotification = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Account and app preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!loadingSettings && settings && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => toggleNotification('email')}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.lowStock}
                  onChange={() => toggleNotification('lowStock')}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Sale Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify on new sales</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.newSale}
                  onChange={() => toggleNotification('newSale')}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Purchase Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify on new purchases</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.newPurchase}
                  onChange={() => toggleNotification('newPurchase')}
                  className="h-4 w-4"
                />
              </div>
              <Button onClick={handleUpdateSettings}>Save Preferences</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

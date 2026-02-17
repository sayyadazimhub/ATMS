'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Calendar, ShieldCheck, ShieldAlert, Edit2, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    axios
      .get('/api/user/profile')
      .then((res) => {
        setProfile(res.data);
        setFormData({ name: res.data.name, phone: res.data.phone || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put('/api/user/profile', formData);
      setProfile(res.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Profile not found</h2>
          <p className="text-muted-foreground mt-2">There was an issue loading your profile.</p>
          <Button onClick={fetchProfile} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  // Get initials for avatar
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-bold text-white shadow-lg">
                {initials}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  India
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="h-10 rounded-lg"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information Card */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 rounded-lg"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-10 rounded-lg"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="h-10 rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: profile.name, phone: profile.phone || '' });
                    }}
                    disabled={saving}
                    className="h-10 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-900">{profile.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="font-semibold text-slate-900">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="font-semibold text-slate-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Account Role</p>
                  <p className="font-semibold text-slate-900 capitalize">{profile.role || 'User'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Member Since */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Member Since</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${profile.emailVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`p-2 rounded-lg ${profile.emailVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {profile.emailVerified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <p className={`text-xs font-medium ${profile.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Email Status
                </p>
                <p className={`text-lg font-semibold ${profile.emailVerified ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {profile.emailVerified ? 'Verified' : 'Unverified'}
                </p>
                <p className={`text-xs mt-1 ${profile.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {profile.emailVerified ? 'Account is secured' : 'Please verify your email'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

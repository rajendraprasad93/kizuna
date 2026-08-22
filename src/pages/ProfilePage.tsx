import { useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export function ProfilePage() {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile?.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleLabel = profile?.role === 'admin' ? 'Administrator' : profile?.role === 'department' ? 'Department Official' : 'Citizen';
  const roleColor = profile?.role === 'admin' ? 'purple' : profile?.role === 'department' ? 'emerald' : 'blue';

  return (
    <DashboardShell title="Profile" subtitle="Manage your account">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={roleColor as 'blue' | 'emerald' | 'purple'}>{roleLabel}</Badge>
                <span className="text-xs text-slate-400">Member since {new Date(profile?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User className="h-4 w-4" />} />
            <Input label="Email" value={profile?.email || ''} disabled icon={<Mail className="h-4 w-4" />} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" icon={<Phone className="h-4 w-4" />} />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" /> Save Changes</Button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

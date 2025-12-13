import { useState } from 'react';
import { User, FileText } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAdsDashboard } from './UserAdsDashboard';
import { ProfileForm } from '@/components/profile/ProfileForm';

interface AccountTabsProps {
  userId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export function AccountTabs({ userId, supabaseUrl, supabaseKey }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState('announcements');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="announcements" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Moje ogłoszenia
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profil
        </TabsTrigger>
      </TabsList>

      <TabsContent value="announcements" className="mt-6">
        <UserAdsDashboard userId={userId} />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Mój profil</h1>
            <p className="text-sm text-muted-foreground">
              Zarządzaj swoimi danymi kontaktowymi i zdjęciem profilowym.
            </p>
          </header>
          <ProfileForm userId={userId} supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} />
        </div>
      </TabsContent>
    </Tabs>
  );
}





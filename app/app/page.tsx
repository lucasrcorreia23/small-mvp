'use client';

import { Conversation } from '../components/conversation';
import { AuthGuard } from '../components/auth-guard';
import { AppHeader } from '../components/app-header';

function AgentPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <AppHeader />

      <div className="relative z-10 pt-24 min-h-screen flex items-center justify-center px-6">
        <Conversation />
      </div>
    </main>
  );
}

export default function AppPage() {
  return (
    <AuthGuard>
      <AgentPage />
    </AuthGuard>
  );
}

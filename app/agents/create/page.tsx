'use client';

import { Suspense } from 'react';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';
import { WizardContainer } from '@/app/components/agents/create-wizard/wizard-container';

function CreateAgentPageContent() {
  return (
    <main className="min-h-screen relative">
      <AppHeader />

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
        

          <Suspense fallback={null}>
            <WizardContainer />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export default function CreateAgentPage() {
  return (
    <AuthGuard>
      <CreateAgentPageContent />
    </AuthGuard>
  );
}

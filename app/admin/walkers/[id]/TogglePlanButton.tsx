'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TogglePlanButton({
  walkerId,
  currentPlan,
}: {
  walkerId: string;
  currentPlan: string;
}) {
  const router  = useRouter();
  const isPro   = currentPlan === 'pro';
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch('/api/admin/walkers/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walkerId, plan: isPro ? 'free' : 'pro' }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-60 ${
        isPro
          ? 'bg-red-700 text-white hover:bg-red-600'
          : 'bg-emerald-600 text-white hover:bg-emerald-500'
      }`}
    >
      {loading ? '...' : isPro ? 'Remover Pro' : 'Ativar Pro'}
    </button>
  );
}

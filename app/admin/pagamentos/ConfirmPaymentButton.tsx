'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmPaymentButton({ paymentId }: { paymentId: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    await fetch('/api/admin/pagamentos/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={confirm}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 transition disabled:opacity-60"
    >
      {loading ? '...' : 'Confirmar Pix'}
    </button>
  );
}

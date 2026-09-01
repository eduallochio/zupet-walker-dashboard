'use client';

import { useRef, useState, useTransition } from 'react';
import { salvarLead } from '@/app/actions/salvar-lead';

export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await salvarLead(data);
      if (result.success) {
        setState('success');
        formRef.current?.reset();
      } else {
        setErrorMsg(result.error ?? 'Erro inesperado.');
        setState('error');
      }
    });
  }

  if (state === 'success') {
    return (
      <div className="lp-lead-success">
        <span className="lp-lead-success-icon">✓</span>
        <p className="lp-lead-success-title">Obrigado! Você está na lista.</p>
        <p className="lp-lead-success-sub">Avisaremos assim que o Zupet Walker for lançado.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="lp-lead-form">
      <input
        name="name"
        type="text"
        placeholder="Seu nome"
        required
        className="lp-lead-input"
        disabled={pending}
      />
      <input
        name="phone"
        type="tel"
        placeholder="WhatsApp (com DDD)"
        required
        className="lp-lead-input"
        disabled={pending}
      />
      <input
        name="instagram"
        type="text"
        placeholder="Instagram (opcional)"
        className="lp-lead-input"
        disabled={pending}
      />
      {state === 'error' && (
        <p className="lp-lead-error">{errorMsg}</p>
      )}
      <button type="submit" className="lp-lead-btn" disabled={pending}>
        {pending ? 'Enviando…' : 'Quero ser avisado no lançamento'}
      </button>
    </form>
  );
}

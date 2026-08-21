'use client';
import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_WALKER: FaqItem[] = [
  {
    q: 'Preciso pagar para usar o app?',
    a: 'Não. O plano gratuito é permanente e já inclui GPS, relatórios e gestão de até 10 pets. O Pro desbloqueia recursos avançados por R$ 29/mês.',
  },
  {
    q: 'Como os tutores me encontram?',
    a: 'Tutores buscam walkers pelo app Zupet pelo nome ou localização. No plano Pro você aparece em destaque nos resultados.',
  },
  {
    q: 'O app funciona no iPhone e Android?',
    a: 'Sim. O Zupet Walker está disponível gratuitamente na App Store (iOS) e no Google Play (Android).',
  },
  {
    q: 'Como recebo os pagamentos?',
    a: 'O pagamento é combinado diretamente entre você e o tutor — o app não processa cobranças. O Zupet Walker ajuda você a registrar e acompanhar o histórico de recebimentos.',
  },
  {
    q: 'O tutor acompanha o passeio?',
    a: 'O GPS registra distância e rota localmente durante o passeio. Ao finalizar, o tutor recebe uma notificação e pode ver o relatório com distância, duração, fotos e eventos.',
  },
  {
    q: 'Posso definir minha área de atendimento?',
    a: 'Sim. No seu perfil você configura o raio de atendimento em km, os dias e horários disponíveis e o número máximo de pets por passeio.',
  },
];

const FAQ_TUTOR: FaqItem[] = [
  {
    q: 'Como encontro um walker para o meu pet?',
    a: 'Baixe o app Zupet, cadastre seu pet e busque walkers disponíveis na sua região. Você vê o perfil, serviços e avaliações de cada um antes de contratar.',
  },
  {
    q: 'Consigo acompanhar o passeio?',
    a: 'O GPS registra a rota durante o passeio. Ao final você recebe uma notificação e pode ver o relatório completo com distância percorrida, duração, fotos e eventos registrados pelo walker.',
  },
  {
    q: 'Como o pagamento funciona?',
    a: 'O valor é combinado diretamente com o walker. O app não cobra nem intermedia pagamentos — você paga da forma que preferir (Pix, dinheiro, etc.).',
  },
  {
    q: 'Posso cadastrar mais de um pet?',
    a: 'Sim. Você cadastra todos os seus pets no app Zupet com informações como raça, peso, vacinas e observações importantes para o walker.',
  },
  {
    q: 'O walker é verificado?',
    a: 'Todos os walkers passam por um cadastro com dados pessoais e aceitam os termos de uso da plataforma. Avaliações de outros tutores ficam visíveis no perfil.',
  },
  {
    q: 'O app é gratuito para tutores?',
    a: 'Sim. O app Zupet para tutores é totalmente gratuito — baixe, cadastre seu pet e comece a contratar walkers sem nenhum custo.',
  },
];

export function FaqTabs() {
  const [tab, setTab] = useState<'walker' | 'tutor'>('walker');
  const items = tab === 'walker' ? FAQ_WALKER : FAQ_TUTOR;

  return (
    <div className="faq-tabs-wrap">
      <div className="faq-tabs-switcher" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'walker'}
          className={`faq-tab-btn ${tab === 'walker' ? 'active' : ''}`}
          onClick={() => setTab('walker')}
        >
          🐕 Sou walker
        </button>
        <button
          role="tab"
          aria-selected={tab === 'tutor'}
          className={`faq-tab-btn ${tab === 'tutor' ? 'active' : ''}`}
          onClick={() => setTab('tutor')}
        >
          🧑 Sou tutor
        </button>
      </div>

      <div className="lp-faq-grid" role="tabpanel">
        {items.map((item) => (
          <div key={item.q} className="lp-faq-item">
            <p className="lp-faq-q">{item.q}</p>
            <p className="lp-faq-a">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

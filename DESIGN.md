# DESIGN — Zupet Walker (dashboard web)

## Perfil
- Produto: painel web do profissional de pets (walker, banhista, adestrador, cuidador).
- Uso: rápido e recorrente, geralmente para conferir o dia, cobrar e responder tutores.
- Personalidade: profissional, confiável, ágil, com calor de marca pet. Não é: infantil, barulhento.
- Expressividade: nível 2 (polido). Animações curtas e só com propósito.

## Conceito
"Seu dia": o Início é um painel de trabalho (o que fazer agora), não só números.
Momento memorável: resolver pendências (pagamento, agendamento sem registro) com um clique.

## Tokens (fonte: components/walker/dash-ui.tsx → T)
- Fundo #0B1512 · menu #0D2420 · card #11201B · card2 #152822 · borda rgba(134,239,172,.12)
- Texto #EEF6F1 · secundário #A3BCB0 · rótulos #8FAB9E
- Destaque #22C55E (claro #86EFAC) · atenção/a receber #FBBF24 · perigo #FCA5A5
- Fonte Plus Jakarta Sans · raio 16 (cards), 10 (botões), 20 (chips)
- Botões: classes .zw-btn / .zw-btn-primary / .zw-btn-ghost / .zw-btn-s (app/globals.css)

## Regras
- Números em pt-BR via lib/format.ts (brl, km, duracao, dataCurta, hora) no fuso de Brasília.
- Ícones lucide-react, nunca emoji na interface.
- "A receber" é amarelo e neutro; nunca mostrar faturamento zerado como queda em vermelho.
- Passeio sem distância = "Rota não registrada" (avisar, não esconder).
- Ações por extenso ("Marcar como pago", "Cancelar") e confirmação antes de ações destrutivas.
- Estados vazios sempre com explicação e próxima ação.

## Decisões
- 2026-10-08: direção B ("Seu dia") escolhida para o dashboard, a partir do visual atual.
- 2026-10-08: destaque unificado no verde do site (#22C55E), substituindo o #00C6A7 do painel.

## Protótipos
- Canvas "Zupet Walker — Dashboard v1" (Início A/B, Financeiro, Agenda, Relatórios, Serviços).

## Padrões de tela
- Lista + detalhe lado a lado: classe `.zw-split` (vira uma coluna abaixo de 900px). Usada em Pets; Relatórios segue a mesma ideia.
- Ações destrutivas ou de status: confirmação inline ("Sim, recusar" / "Voltar"), nunca confirm()/alert(); erro aparece no próprio card.
- Ícones lucide no lugar de emojis; cores de serviço fixas (passeio verde, banho azul, hospedagem lilás, day care amarelo, adestramento laranja, vet rosa).

## Pendente
- Todas as telas do dashboard estão na direção B (2026-10-08).
- Futuro, se quiser: gravar rota GPS no app (hoje só há distância), alternar visibilidade de serviços (depende da regra do plano grátis).

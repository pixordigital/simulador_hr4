# Simulador de Frete — CLAUDE.md

## Visão Geral do Projeto

App web pra logística em **João Pessoa, PB, Brasil**. Calcula quanto cobrar por entrega — evita **subcobrar** (prejuízo) ou **sobrecobrar** (perde cliente).

**Público**: equipe escritório — dono + 2-5 pessoas, desktop.
**Idioma**: Português (pt-BR) — labels, erros, textos, configs. Sem exceções, sem inglês.
**Tema**: claro/escuro, alternável.
**Layout**: desktop-only. Sem responsividade mobile.

### O negócio

- Opera **só em João Pessoa e Grande JP**.
- Frota própria: **KANGOO** (van leve) e **8-160** (caminhão leve).
- Usa **motoristas freelancers** contratados por job (taxa fixa).
- Escolha entre KANGOO, 8-160 ou freelancer depende de peso e disponibilidade — sem regra fixa. Simulador mostra 3 custos lado a lado, usuário decide.
- Oferece **dedicada** (veículo exclusivo por dia + km) e **agendada** (horário garantido).

> **Nota sobre Concept Cargo**: tabela estudada só pra copiar estrutura de precificação (taxa mínima + faixas de peso). Não tem presença no app.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Persistência**: JSON files only — sem banco, sem auth, sem login. Dados em JSON via API Routes.
- **Estilização**: Tailwind CSS, dark/light mode via `class` strategy
- **Fontes**: Geist Sans (corpo/UI) + Geist Mono (valores numéricos) — via `next/font/google`
- **Sem autenticação**: app abre direto sem login.

---

## Design System e Identidade Visual

### Direção estética — "Precision Freight"

App não deve parecer SaaS genérico. Ferramenta pra empresa de frete séria — seriedade visual de painel industrial, precisão tipográfica de software financeiro.

**Referências visuais** (não layout):
- Densidade informacional de terminais Bloomberg
- Legibilidade de tabelas aduaneiras e CTe
- Confiança cromática de marcas logísticas premium (DHL, Maersk)

**Evitar absolutamente:**
- Cantos arredondados excessivos (parece delivery)
- Gradientes decorativos
- Ícones coloridos em cada menu
- Sombras suaves genéricas
- Tipografia sans-serif leve demais
- Empty states com ilustrações fofas

---

### Paleta de cores — HR Cargo

Paleta das cores da marca (laranja/âmbar + navy escuro). Laranja usado com parcimônia — ferramenta de hierarquia, não decoração.

```css
/* Brand */
--brand-orange:     #F97316;   /* laranja HR Cargo — usado só onde importa */
--brand-orange-dim: #C2590A;   /* laranja queimado — hover, pressed states */
--brand-navy:       #0F1C2E;   /* navy profundo — sidebar, headers, âncora visual */
--brand-navy-mid:   #1A2E45;   /* navy médio — hover na sidebar */

/* Superfícies — Light */
--surface-base:     #F5F5F4;   /* fundo geral — quase branco, levemente quente */
--surface-raised:   #FFFFFF;   /* cards, painéis — branco puro sobre base */
--surface-sunken:   #EBEBEA;   /* inputs, áreas internas de cards */

/* Superfícies — Dark */
--surface-base-dk:  #0A0F1A;   /* fundo geral dark — quase preto com toque azul */
--surface-raised-dk:#111827;   /* cards dark */
--surface-sunken-dk:#1F2937;   /* inputs dark */

/* Bordas */
--border-subtle:    #E0DFDD;   /* light mode — divisores, bordas de card */
--border-strong:    #A8A29E;   /* light mode — bordas de input, separadores */
--border-subtle-dk: #1F2937;   /* dark mode */
--border-strong-dk: #374151;   /* dark mode */

/* Texto */
--text-primary:     #111110;   /* quase preto — títulos, valores */
--text-secondary:   #78716C;   /* cinza médio — labels, metadata */
--text-disabled:    #A8A29E;   /* cinza claro — placeholders */
--text-primary-dk:  #F5F5F4;
--text-secondary-dk:#9CA3AF;

/* Semânticas — discretas, não vibrantes */
--semantic-gain:    #15803D;   /* verde escuro — margem positiva, lucro */
--semantic-loss:    #B91C1C;   /* vermelho escuro — prejuízo, alerta crítico */
--semantic-warn:    #92400E;   /* âmbar escuro — atenção moderada */
--semantic-info:    #1E40AF;   /* azul escuro — informação neutra */
```

> Princípio: laranja `--brand-orange` aparece em max 3 lugares por tela — botão primário, item ativo sidebar, acento de dado importante. Hierarquia construída com peso tipográfico e contraste de superfície, não cor.

---

### Tipografia — dupla com caráter

```
Display / Títulos de página: DM Sans
  - Peso: 700 (Bold) e 500 (Medium)
  - Usado em: título de tela ("Nova Simulação"), nome do cliente no resultado,
    valores de KPI grandes no dashboard
  - Tom: moderno, sólido, sem ser frio

Interface / Corpo: Inter
  - Peso: 400 (Regular) e 500 (Medium) e 600 (SemiBold)
  - Usado em: labels, botões, navegação, texto de suporte
  - Escala: 12px (micro), 13px (label), 14px (corpo), 16px (destaque)

Numérico: JetBrains Mono
  - Peso: 500 (Medium)
  - Usado EXCLUSIVAMENTE para: valores em R$, kg, km, % de margem
  - Por quê JetBrains Mono e não Geist Mono: tabular figures nativas,
    melhor legibilidade em números longos como R$ 38.416,68
  - Não usar para labels, títulos ou qualquer texto não-numérico

Escala tipográfica:
  xs:   11px / Inter 400 — metadata, timestamps
  sm:   13px / Inter 500 — labels de campo, badges
  base: 14px / Inter 400 — corpo, descrições
  md:   16px / Inter 600 — subtítulos de seção
  lg:   20px / DM Sans 700 — títulos de painel
  xl:   28px / DM Sans 700 — título de página
  kpi:  36px / JetBrains Mono 500 — valores grandes no dashboard
```

---

### Espaçamento e geometria — angular, não arredondado

```
Raio de borda:
  - Inputs, badges, tooltips: 4px (quase reto — profissional, não fofo)
  - Cards e painéis: 6px (mínimo — estrutura, não decoração)
  - Botão primário: 6px
  - Modal/overlay: 8px
  - NUNCA usar 12px, 16px ou rounded-full em elementos funcionais

Bordas:
  - Cards: 1px solid --border-subtle (sem sombra — a borda é suficiente)
  - Card selecionado: 2px solid --brand-orange (destaque por espessura, não cor de fundo)
  - Input: 1px solid --border-strong, focus: 2px solid --brand-orange
  - Divisores internos: 1px solid --border-subtle

Sombras — usadas com extrema economia:
  - Dropdowns e modais: 0 8px 24px rgba(0,0,0,0.12) — profundidade real
  - Cards: NENHUMA sombra — borda faz o trabalho
  - Botão primário hover: NENHUMA sombra — mudança de cor é suficiente

Espaçamento interno:
  - Card padrão: padding 20px
  - Seção de formulário: padding 24px
  - Gap entre campos: 16px
  - Gap entre seções: 32px
  - Sidebar item: padding 10px 16px
```

---

### Componentes — especificações visuais detalhadas

**Sidebar (240px, sempre visível)**
- Fundo: `--brand-navy` (#0F1C2E) — imutável em light e dark mode
- Topo: logo HR Cargo branca. Linha divisória 1px navy-mid abaixo.
- Item inativo: texto `#94A3B8` (slate-400), sem ícone colorido, sem fundo. Hover: fundo `--brand-navy-mid`, texto branco.
- Item ativo: barra laranja 3px borda esquerda + texto branco + fundo `--brand-navy-mid`. Sem fundo laranja.
- Rodapé: toggle dark/light (ícone só), separado por linha divisória.
- Sem collapse — sidebar fixa.

**Botão primário**
- Fundo: `--brand-orange` sólido
- Texto: branco, Inter 600, 14px, sentence case
- Hover: `--brand-orange-dim` — transição 120ms
- Padding: 10px 18px, border-radius: 6px
- Sem sombra, sem gradiente, sem ícone obrigatório

**Botão secundário**
- Fundo: transparente
- Borda: 1px solid `--border-strong`
- Texto: `--text-primary`
- Hover: fundo `--surface-sunken`

**Cards de custo (KANGOO / 8-160 / Freelancer)**
- Três colunas largura igual, alinhadas horizontalmente
- Cada card: borda 1px `--border-subtle`, padding 20px, radius 6px
- Header: nome veículo/motorista Inter 600 14px + detalhe técnico 12px cinza
- Valor principal: JetBrains Mono 500 24px, `--text-primary`
- Neutro: sem cor de fundo especial
- "Mais barato": chip "↓ Menor custo" verde escuro, canto superior direito. Borda 2px `--semantic-gain`.
- Selecionado: borda 2px `--brand-orange`. Sem fundo colorido.
- Alerta: borda 2px `--semantic-loss`.
- Hover não selecionado: fundo `--surface-sunken`

**Inputs de formulário**
- Label: Inter 500 13px, `--text-secondary`, margin-bottom 6px
- Input: altura 38px, padding 0 12px, borda 1px `--border-strong`, radius 4px, fundo `--surface-raised`
- Focus: outline none, borda 2px `--brand-orange`
- Placeholder: Inter 400, `--text-disabled`
- Erro: borda `--semantic-loss` + mensagem 12px vermelho
- Unidade (kg, km, R$): texto à direita dentro do input, Inter 400 14px `--text-secondary`

**Tabela de paradas (multi-stop)**
- Usar tabela real com linhas, não cards empilhados
- Header: Inter 500 12px uppercase letter-spacing 0.05em, `--text-secondary`
- Linha: borda inferior 1px `--border-subtle`
- Valor: JetBrains Mono 500, alinhado à direita
- Total: Inter 700, borda superior 2px `--border-strong`

**Alertas financeiros**
- Inline (mais caro): texto `--text-secondary` 13px com seta "↑ R$ X a mais que a opção mais barata" — sem caixa, sem ícone
- Banner crítico (abaixo break-even): faixa largura total, fundo `--semantic-loss` 8% opacidade, borda esquerda 3px `--semantic-loss`, padding 12px 16px. Texto `--semantic-loss` 14px Inter 500. Sem emoji — usar "⚑" ou nenhum.

**KPI cards (dashboard)**
- 4 cards em linha, sem sombra, borda 1px `--border-subtle`
- Label: Inter 400 12px uppercase letter-spacing 0.08em, `--text-secondary`
- Valor: JetBrains Mono 500 32px, `--text-primary`
- Variação: Inter 500 13px, verde/vermelho conforme direção
- Sem ícones decorativos

---

### Elemento de assinatura — régua de peso

Barra horizontal fina (4px altura) abaixo do campo de peso na tela Nova Simulação. Marcações verticais nas transições de faixa (10kg, 20kg, 35kg, 50kg, 70kg, 100kg...). Indicador laranja move conforme usuário digita peso. Ao passar por marcação, faixa ativa muda e R$/kg aparece acima da barra.

Implementar com `<div>` simples + CSS + JS pra posição do indicador. Sem bibliotecas de gráficos.

---

### Modo escuro

- Default: **light mode**
- Toggle: ícone no rodapé sidebar, persiste em localStorage
- Tailwind `dark:` + `class="dark"` no `<html>`
- Sidebar: sempre `--brand-navy`, não muda entre modos
- Dark mode fundo `--surface-base-dk` (#0A0F1A)

---

### Animações — cirúrgicas

```
O que anima:
  - Régua de peso: movimento do indicador linear (sem easing — parece instrumento)
  - Nova parada: linha aparece height 0→auto + opacity 0→1, 200ms ease-out
  - Banner crítico: borda esquerda 3px clip-path altura 0→100% em 300ms
  - Transição tema: 150ms ease em background-color e color apenas. Não animar transforms.
  - Skeleton screens: pulse 1.5s em loading

O que NÃO anima:
  - Hover em botões (só color change)
  - Dropdowns (instantâneo)
  - Navegação entre telas
  - Cards de custo ao selecionar (só borda muda)
```

---

## Estrutura de Navegação e Layout

### Layout geral
- **Sidebar esquerda fixa** sempre visível
- Conteúdo à direita ocupa resto da tela
- Sidebar nunca colapsa (desktop-only)

### Itens da sidebar (cima pra baixo)
1. **Nova Simulação** — item principal, destacado
2. **Histórico** — lista simulações passadas + dashboard rentabilidade
3. **Templates** — simulações salvas como modelo
4. **Motoristas** — cadastro freelancers
5. **Pagamentos** — registro pagamentos freelancers
6. **Configurações** — parâmetros operacionais e tabela de preços
7. *(separador)*
8. **Tema** — toggle dark/light (ícone só, sem label)

> Remover "Sair" ou "Logout" — sem autenticação.

### Tela inicial (home)
- **Primeiro acesso** (tabela vazia, sem freelancers): tela de boas-vindas com checklist de configuração inicial.
- **Acessos subsequentes**: **Nova Simulação** abre automaticamente.

### Hierarquia de frequência
- **Alta**: Nova Simulação, Histórico
- **Média**: Motoristas, Pagamentos, Templates
- **Baixa**: Configurações

---

## Primeiro Acesso — Tela de Boas-vindas

Exibida quando tabela de preços vazia (todos `0` em `taxas-regioes.json`) ou nenhum freelancer cadastrado.

**Layout**: checklist visual com status (pendente/concluído) e botão pra tela correspondente.

**Itens:**
1. ✅/⬜ **Configure o preço do combustível** → Configurações
2. ✅/⬜ **Preencha sua tabela de preços** → Configurações
3. ✅/⬜ **Cadastre seus motoristas freelancers** → Motoristas
4. ✅/⬜ **Defina sua margem padrão** → Configurações
5. ✅/⬜ **Defina o acréscimo de agendamento** → Configurações (opcional)

- Itens concluídos ficam ✅
- Após itens críticos (1-4) concluídos, tela não aparece mais
- Link "Ver novamente" em Configurações

---

## Tela Nova Simulação — Layout

### Proporção das colunas
**58% / 42%** (esquerda/direita). Separadas por borda vertical 1px `--border-subtle` — não por gap ou sombra.

### Coluna esquerda — formulário

```
┌─────────────────────────────────────┐
│  NOVA SIMULAÇÃO          [Limpar]   │
├─────────────────────────────────────┤
│  Cliente                            │
│  [________________________]         │
│                                     │
│  Motorista / Veículo                │
│  [KANGOO ▼] [8-160 ▼] [Freelancer▼]│
│                                     │
│  Entregas do dia  [___8___]         │
├─────────────────────────────────────┤
│  PARADAS                    [+ Add] │
│                                     │
│  Zona      Peso     Valor NF (opt.) │
│  [JP ▼]   [___kg]  [R$ _____]      │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ régua de peso ←————●————→   │   │
│  │     10  20  35  50  70  100  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ─── Paradas adicionadas ──────     │
│  #1  Cabedelo  12kg  —      R$X.XX │
│  #2  JP        3kg   R$500  R$X.XX │
│  [+ Adicionar outra parada]         │
│                                     │
├─────────────────────────────────────┤
│  ○ Entrega Agendada                 │
│    Data [___] Hora [___]  +R$[___]  │
└─────────────────────────────────────┘
```

**Seleção de motorista**: 3 chips selecionáveis em linha, não dropdown.
- Chip: Inter 500 13px, padding 6px 14px, radius 4px, borda 1px
- Inativo: borda `--border-strong`, texto `--text-secondary`
- Ativo: borda 2px `--brand-orange`, texto `--brand-orange`, fundo laranja 5%
- "Freelancer" ativo → expande selector com lista + campo valor editável

### Coluna direita — resultado ao vivo

**Estado vazio** (sem dados):
```
┌──────────────────────────────────┐
│      Preencha os dados da        │
│      entrega para ver a          │
│      cotação em tempo real.      │
│                                  │
│      ─────────────────────       │
│                                  │
│      Custo do motorista,         │
│      frete por faixa e           │
│      margem calculados           │
│      automaticamente.            │
└──────────────────────────────────┘
```
Sem ilustração, sem ícone, sem botão. Só texto.

**Estado ativo**:
```
┌──────────────────────────────────┐
│ KANGOO      8-160    Freelancer  │
│ ┌────────┐ ┌────────┐ ┌────────┐│
│ │↓ Menor │ │        │ │        ││
│ │R$47,20 │ │R$53,80 │ │R$60,00 ││
│ │        │ │        │ │        ││
│ └────────┘ └────────┘ └────────┘│
│                                  │
│ ▼ Ver detalhamento               │
│                                  │
│ ──────────────────────────────   │
│ Margem    [──────●──] 8%         │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ PREÇO SUGERIDO               │ │
│ │ R$ 51,46                     │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Salvar cotação] [Salvar template]│
└──────────────────────────────────┘
```

**Slider margem**: HTML nativo estilizado + input numérico sincronizados bidireccionalmente. Preço sugerido recalcula com debounce 100ms. Track: `--border-strong`, thumb: `--brand-orange` 16px círculo.

**Detalhamento colapsável**:
```
  Parcela do salário      R$ 28,44
  Vale alimentação        R$ 3,36
  Combustível             R$ 8,20
  Manutenção              R$ 0,84
  Seguro                  R$ 2,68
  Depreciação             R$ 0,00
  Frete por faixa         R$ 3,68
  ─────────────────────────────────
  Total custo             R$ 47,20
```
Valores em JetBrains Mono direita. Labels Inter 400 13px. Total: Inter 600, borda superior 1px `--border-strong`.

---

## Tela de Histórico — Layout e Densidade

Densidade visual de planilha profissional, não lista de cards.

### Header
```
┌──────────────────────────────────────────────────────────────┐
│ HISTÓRICO DE COTAÇÕES              [Período ▼] [Filtrar ▼]   │
│                                                               │
│ Jun 2026                                                      │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ │COTAÇÕES  │  │TOTAL     │  │COBRADO   │  │MARGEM    │      │
│ │   47     │  │R$28.420  │  │R$26.100  │  │  18,4%   │      │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└──────────────────────────────────────────────────────────────┘
```
KPI cards sem borda individual. Valores JetBrains Mono, labels Inter 400 12px uppercase.

### Tabela de simulações
```
DATA         CLIENTE          TIPO       PARADAS           VEÍCULO    CUSTO    MARGEM  SUGERIDO  COBRADO
────────────────────────────────────────────────────────────────────────────────────────────────────────
14/06 14:32  Farmácias ABC    Regular    JP 12kg · CB 8kg  KANGOO     R$47,20    8%    R$51,46   R$51,46
14/06 11:15  Distribuidora X  Dedicada   Santa Rita        8-160     R$240,00   10%    R$264,00    —
13/06 16:40  Cliente Y        Agendada   JP 3kg            Freelancer R$60,00    8%    R$64,80   R$70,00
```
- Fonte: Inter 400 13px texto, JetBrains Mono 13px números
- Hover: fundo `--surface-sunken`
- "Cobrado" vazio: "—" em `--text-disabled`. Diferente do sugerido: verde (`--semantic-gain`) se maior, vermelho (`--semantic-loss`) se menor.
- Header: Inter 500 11px uppercase letter-spacing 0.06em, `--text-secondary`. Colunas numéricas alinhadas à direita.
- Sem paginação até 500 linhas — virtualização acima disso.

---

## Tela de Boas-vindas — Visual

Tom editorial, não genérico.

```
┌──────────────────────────────────────────────────────────────┐
│  HR CARGO                                          Jun 2026  │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Configure o simulador                                        │
│  antes de começar.                                            │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ○  Preço do combustível              Configurações →        │
│  ○  Tabela de preços por zona         Configurações →        │
│  ○  Motoristas freelancers            Motoristas →           │
│  ○  Margem padrão                     Configurações →        │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  ○  Acréscimo de agendamento (opcional)  Configurações →    │
│                                                               │
│                          [Começar assim mesmo →]             │
└──────────────────────────────────────────────────────────────┘
```
- Fundo: `--surface-base` normal
- "○" vira "●" laranja quando concluído, texto riscado
- Concluídas: `--text-secondary`. Pendentes: `--text-primary`.
- Link "→": Inter 500 13px `--brand-orange`, sem sublinhado
- 4 tarefas críticas concluídas → botão muda pra "Ir para Nova Simulação →" (laranja)
- Layout centralizado, max-width 640px

---

## Templates e Duplicação

### 1. Salvar como template
Após simulação, salvar como template com nome descritivo. Templates independentes do histórico — só na tela Templates.

### 2. Duplicar simulação
Botão "Duplicar" no histórico abre nova simulação pré-preenchida com parâmetros originais.

### Tela de Templates
Lista com busca por nome, sem paginação forçada. Cada item: nome, tipo entrega, cliente, data criação. Ações: "Usar", "Editar", "Excluir". Armazenado em `data/dynamic/templates.json`.

---

## Imutabilidade do Histórico

**Histórico é imutável** — simulações salvas nunca recalculam com novos preços. `resultado_json` armazena valores finais no momento da criação. `input_json` preservado intacto.

Mudanças em Configurações são prospectivas, nunca retroativas.

---

### 1. Simulação — Single vs. Multi-parada

Cada simulação pode ter **uma ou várias paradas** pro mesmo cliente. Um motorista/veículo selecionado pra **toda simulação** — não por parada.

**Fluxo multi-parada:**
1. Usuário seleciona motorista/veículo (KANGOO, 8-160 ou freelancer) + nº entregas do dia
2. Adiciona primeira parada (zona + peso + valor NF opcional) → custo calculado **imediatamente**
3. Adiciona segunda parada → calculada imediatamente, **total atualizado em tempo real**
4. Repete pra N paradas
5. Resultado final: preço individual por parada + **total geral destacado**

Custo fixo do motorista dividido pelo nº de entregas do dia — alocação igual pra todas paradas.

---

### 2. Motores de Precificação

#### A. Entrega Regular

Precificada por **zona + peso taxável** por parada.

**Peso taxável** = `max(peso real, peso cúbico)` onde `peso cúbico = comprimento(m) × largura(m) × altura(m) × 167`

**Tabela de preços** (`taxas-regioes.json`):
- Zonas definidas pelo usuário (JP + Grande JP)
- Cada zona: taxa mínima + faixas de peso com R$/kg acima do mínimo

**Cobranças sobre valor da NF (entregas próprias):**
- **GRIS**: 0,10% do valor NF, mínimo R$4,00
- **Ad-Valorem**: 0,30% do valor NF
- "Valor NF" é **opcional**. Se informado: GRIS e Ad-Valorem incluídos. Se não: omitidos, resultado exibe aviso.
- Fórmula:
  ```
  gris = max(valorNF × 0.001, 4.00)
  adValorem = valorNF × 0.003
  custoTotal = fretePeso + gris + adValorem
  ```

**Um motorista/veículo por simulação**. Opções:

| Opção      | Base do custo |
|------------|---------------|
| KANGOO     | (salário diário + vale + custos operacionais diários KANGOO) ÷ n entregas dia |
| 8-160      | (salário diário + vale + custos operacionais diários 8-160) ÷ n entregas dia |
| Freelancer | taxa única negociada pro trabalho inteiro |

Freelancer multi-parada: um valor único pro trabalho todo (não multiplicado por parada). Campo taxa freelancer editável na simulação.

Exibir 3 custos totais lado a lado antes de confirmar. Mais barato destacado.

#### B. Entrega Dedicada

Veículo exclusivo, precificado por **dia(s) + km**, sem relação com peso.

```
diária base = (custo fixo diário veículo + salário diário) × (1 + margem)
taxa km extra = (combustível/km + manutenção/km) × (1 + margem)
custo total = diária base × dias + max(0, km estimado − km incluídos) × taxa km extra
```

**Campos obrigatórios:**
- Veículo (KANGOO ou 8-160), nº dias, **km estimado da rota** (informado por simulação)
- Km incluídos na diária (configurado por veículo em Configurações)
- Ajudante opcional: taxa adicional por dia

---

### 3. Entrega Agendada

Camada sobre regular ou dedicada. Cliente acorda horário específico, paga pela garantia.

```
preço sugerido = (custo entrega + acréscimo agendamento) × (1 + margem)
```
- UI: serviço nomeado "Entrega Agendada" — não checkbox
- Campos: data, horário, acréscimo R$ (padrão R$0,00)
- Data/horário salvos no histórico

---

### 4. Saída da Simulação

**Por parada:**
- Zona, peso taxável, custo, opção selecionada
- Detalhamento colapsável: total por parada; expandido mostra:
  - Parcela salário, vale alimentação, combustível, manutenção, seguro, depreciação
  - Taxa faixa peso, GRIS (só se NF informada), Ad-Valorem (só se NF informada)
  - Acréscimo agendamento se aplicável

**Resumo geral:**
- Total custo (soma paradas)
- Margem % — pré-preenchida, **ajustável**, recalcula tempo real
- **Preço sugerido** (destacado, soma paradas × margem)
- **Preço cobrado (opcional)** — editável, salvo pra comparação futura

**Alertas financeiros automáticos:**

1. **Alerta opção mais cara** (discreto — inline):
   - "ℹ️ Existe uma opção R$ X mais barata disponível"

2. **Alerta abaixo break-even** (crítico — banner):
   - Banner proeminente no topo resultado
   - "⚠️ Atenção: o preço sugerido está abaixo do seu custo. Você terá prejuízo de R$ X nesta entrega."
   - Vermelho/laranja, impossível ignorar

Ambos **informativos** — nunca bloqueiam.

---

## Tela de Histórico e Dashboard de Rentabilidade

**Três seções:**

### 1. Dashboard rentabilidade (topo)
Comparação custo operacional real vs. total cobrado no período:

- **Custo fixo do mês** — salário × motoristas + combustível + manutenção + seguro + depreciação + vale
- **Custo freelancers do mês** — soma pagamentos no período
- **Custo total** = fixo + freelancers
- **Total sugerido** — soma preços sugeridos do período
- **Total cobrado** — soma `preco_cobrado` das simulações com registro
- **Margem real estimada** = (total cobrado − custo total) ÷ total cobrado
- **Diferença sugerido vs. cobrado**

### 2. Métricas simulações
Total, valor cotado, margem média, custo médio por entrega.

### 3. Lista simulações
Cada linha: data/hora, cliente, tipo, paradas, veículo, custo total, margem, sugerido, cobrado.

Filtros: nome cliente, tipo entrega, período. Histórico **somente leitura**. Preço cobrado editável inline.

---

## Tela de Configurações

Substitui edição manual de JSON. Escreve via API Route (`/api/configuracoes`). Todas labels em **pt-BR**.

**Erro obrigatório**: se escrita falhar, UI exibe erro — nunca falhar silenciosamente.

**Hierarquia visual:**
- **Alterado mensalmente** → destaque, fácil acesso: combustível, agendamento
- **Alterado raramente** → colapsáveis: salário, vale, dias úteis, manutenção, seguro, depreciação, dedicada, tabela por zona

**Seções:**
- **Geral** — margem padrão (%), nº padrão entregas/dia, acréscimo agendamento (R$)
- **Motoristas Próprios** — salário mensal, dias úteis, vale alimentação
- **KANGOO** — combustível, manutenção, seguro, depreciação, preço litro, consumo km/L
- **8-160** — mesmos campos
- **Dedicada KANGOO** — km incluídos diária, custo fixo, preço litro, consumo, manutenção/km
- **Dedicada 8-160** — mesmos campos

---

## Cadastro Motoristas Freelancers

CRUD: nome, taxa padrão (R$), observações. Na simulação: selecionar do cadastro, taxa ajustável.

**Seed inicial** (abril/2026):
- DANIELLA NOBREGA HENRIQUES GAMA
- MARCIO JOAO DE OLIVEIRA SANTOS
- HAYRON LEITE COUTINHO RAMOS
- DAVID HENRICH MEDEIROS DE SANTANA

> `default_fee` a confirmar.

---

## Acesso ao App

- **Sem autenticação** — abre direto em Nova Simulação
- Qualquer pessoa com URL usa tudo
- Motoristas não acessam (uso interno escritório)

---

## Armazenamento de Dados

### JSON (via `/api/configuracoes`)

```
data/
  rates/
    taxas-regioes.json       # tabela de preços por zona
  config/
    geral.json               # margem padrão, entregas/dia, acréscimo
    motoristas-proprios.json # salário, vale, dias úteis, custos veículo
    dedicada.json            # custos dedicados por veículo
```

**`taxas-regioes.json`:**
```ts
interface FaixaPreco {
  origem: string;
  zona: string;
  taxaMinima: number;
  pesoBase: number;
  faixas: {
    min: number;
    max: number;
    precoPorKg: number;
  }[];
}
```

**Zonas seed:**
```json
[
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "João Pessoa",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Cabedelo",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Conde",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Santa Rita",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Bayeux",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  },
  {
    "origem": "JOAO PESSOA/PB",
    "zona": "Alhandra",
    "taxaMinima": 0,
    "pesoBase": 10,
    "faixas": [
      { "min": 10, "max": 20, "precoPorKg": 0 },
      { "min": 20, "max": 35, "precoPorKg": 0 },
      { "min": 35, "max": 50, "precoPorKg": 0 },
      { "min": 50, "max": 70, "precoPorKg": 0 },
      { "min": 70, "max": 100, "precoPorKg": 0 },
      { "min": 100, "max": 300, "precoPorKg": 0 },
      { "min": 300, "max": 500, "precoPorKg": 0 },
      { "min": 500, "max": 99999.99, "precoPorKg": 0 }
    ]
  }
]
```
> Valores em `0` — preencher via Configurações após construção. Faixas espelham Concept Cargo.

**`motoristas-proprios.json`:**
```ts
interface ConfigMotoristaProprio {
  salarioMensal: number;
  diasUteisporMes: number;
  valeAlimentacao: number;
  veiculos: {
    [nome: string]: {
      combustivelMensal: number;
      manutencaoMensal: number;
      seguroMensal: number;
      depreciacaoMensal: number;
      precoCombustivelLitro: number;
      consumoKmPorLitro: number;
    }
  }
}
// custo diário = (salário + vale + combustível + manutenção + seguro + depreciação) ÷ dias úteis
// custo por entrega = custo diário ÷ nº entregas dia
```

### Persistência dinâmica (JSON via API Routes)

`data/dynamic/`:
- `motoristas-freelancer.json`
- `pagamentos-freelancer.json`
- `simulacoes.json`
- `templates.json`

```ts
// simulacoes.json
interface Simulacao {
  id: string;
  criadoEm: string;
  nomeCliente: string;
  tipoEntrega: 'regular' | 'dedicada';
  agendada: boolean;
  dataHorarioAgendado?: string;
  acrescimoAgendamento?: number;
  margemPct: number;
  valorNF?: number;
  grisIncluido: boolean;
  adValoremIncluido: boolean;
  inputJson: object;
  resultadoJson: object;
  precoCobrado?: number;
  observacoes?: string;
}

// motoristas-freelancer.json
interface MotoristaFreelancer {
  id: string;
  nome: string;
  taxaPadrao: number;
  observacoes?: string;
  criadoEm: string;
}

// pagamentos-freelancer.json
interface PagamentoFreelancer {
  id: string;
  motoristaId: string;
  valor: number;
  dataPagamento: string;
  descricao?: string;
  criadoEm: string;
}

// templates.json
interface Template {
  id: string;
  nome: string;
  descricao?: string;
  inputJson: object;
  criadoEm: string;
  atualizadoEm: string;
}
```

---

## Estrutura Módulo Cálculo

`lib/precificacao/` — funções puras, sem I/O.

```
lib/precificacao/
  tipos.ts
  peso.ts             # peso taxável: max(peso real, peso cúbico × 167)
  regular.ts          # lookup zona + faixas, custos lado a lado
  dedicada.ts         # diária + km extra
  agendada.ts         # acréscimo antes da margem
  simular.ts          # entrada unificada → despacha → agrega → resultado completo
```

---

## Dados Reais de Custo (Abril/2026)

Extraído de `lancamentos_financeiro.xls` — 01/04 a 30/04/2026, todos LIQUIDADO.

### Resumo operacional
| Centro de Custo        | Total abril/2026 |
|------------------------|------------------|
| AGREGADO (freelancers) | R$ 38.416,68     |
| SALÁRIO                | R$ 12.267,14     |
| COMBUSTÍVEL            | R$ 5.252,29      |
| MECÂNICA               | R$ 4.230,37      |
| VALE ALIMENTAÇÃO       | R$ 4.866,60      |
| SEGURO DE VEÍCULO      | R$ 2.356,61      |
| DIÁRIA                 | R$ 1.210,00      |
| **TOTAL OPERACIONAL**  | **R$ 68.599,69** |

### Combustível por veículo
| Veículo | Total mensal  | Abastecimentos | Média/abastecimento |
|---------|---------------|----------------|---------------------|
| KANGOO  | R$ 1.704,78   | 6              | ~R$ 284,00          |
| 8-160   | R$ 3.397,51   | 4              | ~R$ 849,38          |

### Manutenção por veículo
| Veículo           | Total mensal  |
|-------------------|---------------|
| KANGOO            | R$ 184,00     |
| 8-160             | R$ 1.944,37   |
| Sem identificação | R$ 2.102,00   |

### Salários
- Referência: **R$ 1.964,63/mês** (NILSON)
- Vale alimentação: **R$ 738,00–R$ 774,90/mês** por colaborador
- Diária padrão: **R$ 240,00/dia**

### Freelancers ativos
| Nome                              | Total abril | Pagamentos |
|-----------------------------------|-------------|------------|
| HAYRON LEITE COUTINHO RAMOS       | R$ 11.582,00 | 1          |
| MARCIO JOAO DE OLIVEIRA SANTOS    | R$ 6.150,00  | 2          |
| DANIELLA NOBREGA HENRIQUES GAMA   | R$ 2.150,00  | 3          |
| DAVID HENRICH MEDEIROS DE SANTANA | R$ 1.850,00  | 2          |

### Valores iniciais `motoristas-proprios.json`
```json
{
  "salarioMensal": 1964.63,
  "diasUteisPorMes": 22,
  "valeAlimentacao": 738.00,
  "veiculos": {
    "KANGOO": {
      "combustivelMensal": 1704.78,
      "manutencaoMensal": 184.00,
      "seguroMensal": 589.15,
      "depreciacaoMensal": 0,
      "precoCombustivelLitro": 6.20,
      "consumoKmPorLitro": 10.0
    },
    "8-160": {
      "combustivelMensal": 3397.51,
      "manutencaoMensal": 1944.37,
      "seguroMensal": 1767.46,
      "depreciacaoMensal": 0,
      "precoCombustivelLitro": 6.20,
      "consumoKmPorLitro": 7.0
    }
  }
}
```
> Seguro proporcional: R$ 2.356,61 ÷ 2. Depreciação e consumo real a confirmar.

---

## Escopo MVP (ordem)

1. **Layout + navegação** — sidebar fixa 6 itens, lógica primeiro acesso
2. **Boas-vindas (primeiro acesso)** — checklist 5 itens, link p/ tela, some após críticos
3. **Regular parada única** — dois painéis, seleção motorista, lookup zona + peso, GRIS/Ad-Valorem, 3 custos lado a lado, margem ajustável, alertas 2 níveis, detalhamento colapsável
4. **Multi-parada** — N paradas sequenciais, cada calculada imediatamente
5. **Cadastro freelancers** — CRUD com seed
6. **Pagamentos** — log com totais mensais
7. **Agendada** — sobre regular, data/horário, acréscimo
8. **Dedicada** — calculadora por veículo, km por simulação
9. **Dedicada agendada** — combinação
10. **Templates + duplicação** — salvar, duplicar do histórico, busca
11. **Configurações** — combustível/agendamento topo destacado, demais colapsáveis
12. **Histórico + Dashboard** — imutável, preço cobrado editável, dashboard custo fixo + freelancers + sugerido vs cobrado + margem real

---

## Itens em Aberto

**Sem bloqueios.** App pode ser construído integralmente.

Faltam só **preços da tabela de frete** — taxas mínimas e R$/kg por faixa pra 6 zonas (valores `0`). Usuário preenche via Configurações após construção.

Resolvidos:
- ✅ Zonas: **João Pessoa, Cabedelo, Conde, Santa Rita, Bayeux, Alhandra**
- ✅ Margem padrão: **8%**
- ✅ Entregas/dia: **8**
- ✅ Acréscimo agendamento: **R$0,00**
- ✅ GRIS/Ad-Valorem: aplicam-se, valor NF opcional
- ✅ Consumo KANGOO: **10 km/L** | 8-160: **7 km/L**
- ✅ Depreciação: **R$0,00** inicial
- ✅ Taxa freelancers: usuário define no cadastro

---

## Convenções

- Valores em BRL (R$) — números, formatados só na UI
- Peso em kg, distância em km, volume em m³
- Todo preço rastreável até componentes — sem "caixa preta"
- Apenas João Pessoa e Grande JP
- Interface 100% **Português (pt-BR)** — sem exceções
- **Desktop** — sem responsivo
- **Claro/escuro**, alternável
- JSON via API Route — nunca editado manualmente
- **Histórico imutável** — `resultado_json` permanente. Alterações afetam só simulações futuras
- **Estado vazio orientativo** — nunca tela em branco
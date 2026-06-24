# Simulador de Frete — CLAUDE.md

## Visão Geral do Projeto

Aplicação web que ajuda uma empresa de logística/frete sediada em **João Pessoa, PB, Brasil**
a calcular quanto cobrar por entrega — garantindo que nenhuma entrega seja
**subcobrada** (prejuízo) ou **sobrecobrada** (perda de cliente).

**Público**: equipe de escritório — dono + 2 a 5 pessoas, uso em desktop.
**Idioma**: Português (pt-BR) em tudo — labels, erros, textos, configurações.
Sem exceções, nem termos técnicos em inglês.
**Tema visual**: suporte a modo claro e modo escuro, alternável pelo usuário.
**Layout**: otimizado para desktop. Não é necessário responsividade mobile.

### O negócio

- Opera **exclusivamente em João Pessoa e Grande JP**.
- Frota própria: **KANGOO** (van leve) e **8-160** (caminhão leve).
- Usa **motoristas freelancers** contratados por trabalho (taxa fixa por job).
- A escolha entre KANGOO, 8-160 ou freelancer depende de peso e disponibilidade
  — não há regra fixa. O simulador mostra os três custos lado a lado e o usuário
  decide.
- Oferece **entrega dedicada** (veículo exclusivo por dia + km) e **entrega
  agendada** (horário garantido acordado com o cliente).

> **Nota sobre a Concept Cargo**: tabela estudada apenas para copiar a estrutura
> de precificação (taxa mínima + faixas de peso). Não tem presença no app.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Persistência**: JSON files only — sem banco de dados, sem auth, sem login.
  Todos os dados (histórico, motoristas, pagamentos, templates, configurações)
  são armazenados em arquivos JSON no sistema de arquivos via API Routes.
- **Estilização**: Tailwind CSS com suporte a dark/light mode via `class` strategy
- **Fontes**: Geist Sans (corpo e UI) + Geist Mono (valores numéricos, preços)
  — ambas disponíveis nativamente no Next.js via `next/font/google`
- **Sem autenticação**: o app abre diretamente sem login. Qualquer pessoa
  com acesso à URL pode usar o app.

---

## Design System e Identidade Visual

### Direção estética — "Precision Freight"

O app não deve parecer um produto SaaS genérico. Ele deve parecer uma
ferramenta construída especificamente para uma empresa de frete séria —
com a seriedade visual de um painel de controle industrial e a precisão
tipográfica de um software financeiro. Pesado onde precisa ser pesado,
limpo onde precisa ser limpo.

**Referências de tom visual** (não de layout):
- A densidade informacional de terminais Bloomberg
- A legibilidade de tabelas aduaneiras e CTe
- A confiança cromática de marcas de logística premium (DHL, Maersk)

**O que evitar absolutamente:**
- Cantos arredondados excessivos (parece app de delivery, não empresa séria)
- Gradientes decorativos em botões ou cards
- Ícones coloridos em cada item de menu
- Cards com sombras suaves genéricas
- Tipografia sans-serif leve demais (parece landing page de startup)
- Empty states com ilustrações fofas

---

### Paleta de cores — HR Cargo

Paleta construída a partir das cores da marca (laranja/âmbar + navy escuro),
mas aplicada com disciplina editorial — o laranja é usado com parcimônia,
como uma ferramenta de hierarquia, não como decoração.

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

> Princípio: o laranja `--brand-orange` aparece em no máximo 3 lugares por
> tela — botão primário principal, item ativo da sidebar, e um acento de dado
> importante. Em todo o resto, a hierarquia é construída com peso tipográfico
> e contraste de superfície, não com cor.

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
- Topo: logo HR Cargo à esquerda, em branco. Abaixo, linha divisória
  1px em navy-mid. Sem padding excessivo.
- Item de navegação inativo: texto `#94A3B8` (slate-400), sem ícone colorido,
  sem fundo. Hover: fundo `--brand-navy-mid`, texto branco.
- Item ativo: barra vertical laranja de 3px na borda esquerda + texto branco
  + fundo `--brand-navy-mid`. Não usar fundo laranja — muito pesado.
- Rodapé da sidebar: toggle dark/light mode (ícone apenas, sem label),
  separado do menu por linha divisória.
- Sem animação de collapse — sidebar é fixa.

**Botão primário**
- Fundo: `--brand-orange` sólido
- Texto: branco, Inter 600, 14px, letra maiúscula NÃO — sentence case
- Hover: `--brand-orange-dim` — transição 120ms
- Padding: 10px 18px
- Border-radius: 6px
- Sem sombra, sem gradiente, sem ícone obrigatório

**Botão secundário**
- Fundo: transparente
- Borda: 1px solid `--border-strong`
- Texto: `--text-primary`
- Hover: fundo `--surface-sunken`

**Cards de custo (KANGOO / 8-160 / Freelancer)**
- Layout: três colunas de largura igual, alinhadas horizontalmente
- Cada card: borda 1px `--border-subtle`, padding 20px, radius 6px
- Header do card: nome do veículo/motorista em Inter 600 14px + um detalhe
  técnico relevante em 12px cinza (ex: "10 km/L · diesel")
- Valor principal: JetBrains Mono 500 24px, `--text-primary`
- Estado neutro: sem cor de fundo especial
- Estado "mais barato": chip pequeno "↓ Menor custo" em verde escuro
  (`--semantic-gain`), fundo verde-50, no canto superior direito. Borda
  do card: 2px `--semantic-gain`.
- Estado selecionado: borda 2px `--brand-orange`. Sem fundo colorido.
- Estado com alerta: borda 2px `--semantic-loss`.
- Hover em card não selecionado: fundo `--surface-sunken` sutil

**Inputs de formulário**
- Label: Inter 500 13px, `--text-secondary`, margin-bottom 6px
- Input: altura 38px, padding 0 12px, borda 1px `--border-strong`,
  radius 4px, fundo `--surface-raised`
- Focus: outline none, borda 2px `--brand-orange`
- Placeholder: Inter 400, `--text-disabled`
- Input com erro: borda `--semantic-loss` + mensagem 12px vermelho abaixo
- Unidade de medida (kg, km, R$): texto à direita dentro do input,
  Inter 400 14px `--text-secondary` — não como label separado

**Tabela de paradas (multi-stop)**
- Não usar cards empilhados — usar uma tabela real com linhas
- Header da tabela: Inter 500 12px uppercase com letter-spacing 0.05em,
  `--text-secondary` — dá aparência de documento profissional
- Linha de parada: borda inferior 1px `--border-subtle`
- Coluna de valor: JetBrains Mono 500, alinhado à direita
- Linha de total: Inter 700, separada por borda superior 2px `--border-strong`

**Alertas financeiros**
- Inline (opção mais cara): texto `--text-secondary` 13px com seta "↑ R$ X
  a mais que a opção mais barata" — sem caixa, sem ícone, integrado ao card
- Banner crítico (abaixo do break-even): faixa de largura total, fundo
  `--semantic-loss` com opacidade 8%, borda esquerda 3px sólida
  `--semantic-loss`, padding 12px 16px. Texto em `--semantic-loss` 14px
  Inter 500. Sem ícone emoji — usar símbolo tipográfico "⚑" ou nenhum.

**KPI cards (dashboard)**
- Layout: 4 cards em linha
- Sem sombra, borda 1px `--border-subtle`
- Label: Inter 400 12px uppercase letter-spacing 0.08em, `--text-secondary`
- Valor: JetBrains Mono 500 32px, `--text-primary`
- Variação: Inter 500 13px, verde ou vermelho conforme direção
- Sem ícones decorativos — os números falam por si

---

### Elemento de assinatura — a régua de peso

O elemento visual único desta interface é uma **régua de peso horizontal**
que aparece na tela de Nova Simulação, logo abaixo do campo de peso da parada.

É uma barra fina (4px de altura) com marcações verticais nas transições de
faixa (10kg, 20kg, 35kg, 50kg, 70kg, 100kg...), e um indicador laranja que
se move conforme o usuário digita o peso. Ao passar por uma marcação, a faixa
ativa muda e o R$/kg correspondente aparece discretamente acima da barra.

Isso serve: informa visualmente em qual faixa de preço a carga está, e
encoraja o usuário a entender a estrutura de preços. É específico para o
domínio de frete — não existe em nenhum outro tipo de app.

Implementar com um `<div>` simples e posicionamento CSS + JS para o cálculo
da posição do indicador. Sem bibliotecas de gráficos.

---

### Modo escuro

- Default ao abrir: **light mode**
- Toggle: ícone no rodapé da sidebar, persiste em localStorage
- Implementação: Tailwind `dark:` + `class="dark"` no `<html>`
- A sidebar permanece sempre em `--brand-navy` — não muda entre modos
- No dark mode, `--surface-base-dk` (#0A0F1A) como fundo — mais escuro
  que o convencional para dar mais contraste com os cards

---

### Animações — cirúrgicas

```
O que anima e por quê:
  - Régua de peso: movimento do indicador em real-time (sem easing — linear,
    parece instrumento de medição)
  - Nova parada adicionada: a linha aparece com height 0→auto + opacity 0→1,
    200ms ease-out. Dá sensação de construção progressiva da cotação.
  - Banner de alerta crítico: a borda esquerda 3px aparece com um clip-path
    que vai de altura 0 para 100% em 300ms — atenção sem agitação.
  - Transição de tema: 150ms ease em background-color e color apenas.
    Não animar transforms.
  - Skeleton screens: pulse suave 1.5s em áreas de loading (listas, histórico)

O que NÃO anima:
  - Hover em botões (só color change)
  - Abertura de dropdowns (instântaneo)
  - Navegação entre telas (sem page transitions)
  - Cards de custo ao selecionar (só borda muda — sem scale ou bounce)
```

---

## Estrutura de Navegação e Layout

### Layout geral
- **Sidebar esquerda fixa** sempre visível — navegação principal do app
- Área de conteúdo à direita ocupa o restante da tela
- A sidebar nunca colapsa (desktop-only, espaço suficiente)

### Itens da sidebar (ordem de cima para baixo)
1. **Nova Simulação** — item principal, destacado visualmente, primeiro da lista
2. **Histórico** — lista de simulações passadas + dashboard de rentabilidade
3. **Templates** — simulações salvas como modelo para reutilização
4. **Motoristas** — cadastro de freelancers
5. **Pagamentos** — registro de pagamentos a freelancers (totais mensais automáticos)
6. **Configurações** — parâmetros operacionais e tabela de preços
7. *(separador)*
8. **Tema** — toggle dark/light mode (ícone apenas, sem label de texto)

> Remover qualquer item "Sair" ou "Logout" — não há autenticação no app.

### Tela inicial (home)
Depende do estado do app:
- **Primeiro acesso** (tabela de preços vazia, sem freelancers cadastrados):
  exibir **tela de boas-vindas com checklist de configuração inicial** antes
  de qualquer outra coisa — ver seção "Primeiro Acesso" abaixo.
- **Acessos subsequentes**: **Nova Simulação** abre automaticamente —
  o usuário começa a cotar imediatamente sem cliques extras.

### Hierarquia de frequência de uso
Claude Code deve refletir essa hierarquia no design visual:
- **Alta frequência**: Nova Simulação, Histórico
- **Média frequência**: Motoristas, Pagamentos, Templates
- **Baixa frequência**: Configurações

---

## Primeiro Acesso — Tela de Boas-vindas

Exibida automaticamente quando o app detecta que a tabela de preços está
vazia (todos os valores `0` em `taxas-regioes.json`) ou que nenhum
freelancer está cadastrado.

**Layout**: tela de boas-vindas com checklist visual de tarefas de
configuração inicial. Cada item tem um status (pendente/concluído) e
um botão que leva diretamente à tela correspondente.

**Itens do checklist:**
1. ✅/⬜ **Configure o preço do combustível** → Configurações
2. ✅/⬜ **Preencha sua tabela de preços** (taxas por zona e faixa de peso) → Configurações
3. ✅/⬜ **Cadastre seus motoristas freelancers** → Motoristas
4. ✅/⬜ **Defina sua margem padrão** → Configurações
5. ✅/⬜ **Defina o acréscimo de agendamento** → Configurações (opcional)

- Itens concluídos ficam marcados com ✅ e ficam visualmente "completos"
- O usuário pode ignorar a tela e ir direto a qualquer tela via sidebar
- Após todos os itens críticos (1, 2, 3, 4) concluídos, a tela de
  boas-vindas não aparece mais nos acessos seguintes
- Um link "Ver novamente" fica disponível em Configurações caso o usuário
  queira revisitar o checklist

---

## Tela Nova Simulação — Layout

### Proporção das colunas
Divisão **58% / 42%** (coluna esquerda / coluna direita):
- A esquerda é ligeiramente maior porque é onde o usuário trabalha
- A direita é larga o suficiente para três cards de custo legíveis
- As colunas são separadas por uma borda vertical 1px `--border-subtle` —
  não por gap vazio, não por sombra. A linha é o divisor.

### Coluna esquerda — formulário de entrada

```
┌─────────────────────────────────────┐
│  NOVA SIMULAÇÃO          [Limpar]   │  ← título DM Sans 700 20px +
│                                     │    botão "Limpar" secundário
├─────────────────────────────────────┤
│  Cliente                            │  ← label Inter 500 13px
│  [________________________]         │  ← input 38px
│                                     │
│  Motorista / Veículo                │
│  [KANGOO ▼] [8-160 ▼] [Freelancer▼]│  ← 3 chips selecionáveis, não dropdown
│                                     │
│  Entregas do dia  [___8___]         │  ← número de entregas (aloca custo)
├─────────────────────────────────────┤
│  PARADAS                    [+ Add] │  ← eyebrow Inter 500 12px uppercase
│                                     │
│  Zona      Peso     Valor NF (opt.) │  ← mini-header da tabela de paradas
│  [JP ▼]   [___kg]  [R$ _____]      │  ← linha de nova parada
│                                     │
│  ┌──────────────────────────────┐   │
│  │ régua de peso ←————●————→   │   │  ← elemento de assinatura
│  │     10  20  35  50  70  100  │   │    aparece só com peso > 0
│  └──────────────────────────────┘   │
│                                     │
│  ─── Paradas adicionadas ──────     │  ← separador com label
│  #1  Cabedelo  12kg  —      R$X.XX  │
│  #2  JP        3kg   R$500  R$X.XX  │
│  [+ Adicionar outra parada]         │
│                                     │
├─────────────────────────────────────┤
│  ○ Entrega Agendada                 │  ← toggle (radio estilo switch)
│    Data [___] Hora [___]  +R$[___]  │    expande quando ativo
└─────────────────────────────────────┘
```

**Detalhe crítico — seleção de motorista:**
Não usar um dropdown para escolher KANGOO / 8-160 / Freelancer.
Usar três **chips selecionáveis** em linha:
- Chip: Inter 500 13px, padding 6px 14px, radius 4px, borda 1px
- Inativo: borda `--border-strong`, texto `--text-secondary`
- Ativo: borda 2px `--brand-orange`, texto `--brand-orange`, fundo laranja 5%
- Quando "Freelancer" ativo: expande um selector abaixo com lista de freelancers
  cadastrados + campo de valor editável

### Coluna direita — painel de resultado ao vivo

**Estado vazio** (antes de o usuário preencher qualquer campo):
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│      Preencha os dados da        │
│      entrega para ver a          │  ← DM Sans 500 18px, --text-secondary
│      cotação em tempo real.      │
│                                  │
│      ─────────────────────       │
│                                  │
│      Custo do motorista,         │
│      frete por faixa e           │  ← Inter 400 14px --text-disabled
│      margem calculados           │
│      automaticamente.            │
│                                  │
└──────────────────────────────────┘
```
Sem ilustração, sem ícone grande, sem botão. Só texto. A simplicidade é
intencional — o painel direito é uma tela de resultado, não de onboarding.

**Estado ativo** (com dados preenchidos):
```
┌──────────────────────────────────┐
│ KANGOO      8-160    Freelancer  │  ← tabs/cards de opção
│ ┌────────┐ ┌────────┐ ┌────────┐│
│ │↓ Menor │ │        │ │        ││
│ │R$47,20 │ │R$53,80 │ │R$60,00 ││  ← JetBrains Mono 500 24px
│ │        │ │        │ │        ││
│ └────────┘ └────────┘ └────────┘│
│                                  │
│ ▼ Ver detalhamento               │  ← collapsible, Inter 500 13px
│                                  │
│ ──────────────────────────────   │
│ Margem    [──────●──] 8%         │  ← slider + input numérico editável
│                                  │
│ ┌──────────────────────────────┐ │
│ │ PREÇO SUGERIDO               │ │  ← label 12px uppercase
│ │ R$ 51,46                     │ │  ← JetBrains Mono 700 36px laranja
│ └──────────────────────────────┘ │
│                                  │
│ [Salvar cotação] [Salvar template]│
└──────────────────────────────────┘
```

**Detalhe do slider de margem:**
- Um slider HTML nativo estilizado + input numérico à direita que aceita
  digitação direta. Os dois são sincronizados bidireccionalmente.
- O preço sugerido recalcula em tempo real com debounce de 100ms.
- Slider track: `--border-strong`, thumb: `--brand-orange` 16px círculo.

**Detalhamento colapsável:**
Quando expandido, aparece uma mini-tabela entre os cards de custo e o slider:
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
Todos os valores em JetBrains Mono alinhados à direita. Labels Inter 400 13px.
Linha de total: Inter 600, borda superior 1px `--border-strong`.

---

## Tela de Histórico — Layout e Densidade

A tela de histórico deve ter a densidade visual de uma planilha profissional,
não de uma lista de cards. O usuário é alguém que lê dados rapidamente.

### Header da tela
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
KPI cards sem borda individual — agrupados sob o header como uma unidade.
Valores grandes em JetBrains Mono, labels em Inter 400 12px uppercase.

### Tabela de simulações
```
DATA         CLIENTE          TIPO       PARADAS           VEÍCULO    CUSTO    MARGEM  SUGERIDO  COBRADO
────────────────────────────────────────────────────────────────────────────────────────────────────────
14/06 14:32  Farmácias ABC    Regular    JP 12kg · CB 8kg  KANGOO     R$47,20    8%    R$51,46   R$51,46
14/06 11:15  Distribuidora X  Dedicada   Santa Rita        8-160     R$240,00   10%    R$264,00    —
13/06 16:40  Cliente Y        Agendada   JP 3kg            Freelancer R$60,00    8%    R$64,80   R$70,00 ←negociado
```

- Fonte da tabela: Inter 400 13px para texto, JetBrains Mono 13px para números
- Linha hover: fundo `--surface-sunken`
- Coluna "Cobrado": se vazia, mostrar "—" em `--text-disabled`. Se preenchida
  e diferente do sugerido, mostrar em `--semantic-gain` (verde) se maior,
  `--semantic-loss` (vermelho) se menor.
- Coluna "PREÇO SUGERIDO" e "COBRADO": clique abre um inline edit mínimo
  (apenas o campo "Cobrado" é editável — sugerido é imutável)
- Header da tabela: Inter 500 11px uppercase letter-spacing 0.06em,
  `--text-secondary`. Colunas numéricas com header alinhado à direita.
- Sem paginação para até 500 linhas — virtualização se necessário acima disso.

---

## Tela de Boas-vindas — Visual

Não é uma tela genérica de "bem-vindo ao sistema". Tem caráter editorial.

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  HR CARGO                                          Jun 2026  │  ← logo + data
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  Configure o simulador                                        │  ← DM Sans 700 28px
│  antes de começar.                                            │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ○  Preço do combustível              Configurações →        │  ← tarefa
│  ○  Tabela de preços por zona         Configurações →        │
│  ○  Motoristas freelancers            Motoristas →           │
│  ○  Margem padrão                     Configurações →        │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  ○  Acréscimo de agendamento (opcional)  Configurações →    │
│                                                               │
│                          [Começar assim mesmo →]             │  ← botão secundário
└──────────────────────────────────────────────────────────────┘
```

- Fundo: `--surface-base` normal — não uma tela especial com cor diferente
- O "○" vira "●" laranja quando a tarefa está concluída, com linha riscada
  no texto
- Tarefas concluídas ficam em `--text-secondary` (mais fracas)
- Tarefas pendentes em `--text-primary` (fortes)
- O link "→" é Inter 500 13px `--brand-orange`, sem sublinhado
- Quando as 4 tarefas críticas estão concluídas, o botão muda para
  "Ir para Nova Simulação →" (laranja, primário)
- Layout centralizado horizontalmente, max-width 640px

---

## Templates e Duplicação de Simulações

Para clientes recorrentes, o app oferece dois mecanismos:

### 1. Salvar como template
Após concluir qualquer simulação, o usuário pode salvá-la como template
com um nome descritivo (ex: "Cliente X — entrega semanal Cabedelo").
Templates são independentes do histórico — não aparecem na lista de
simulações, apenas na tela de Templates.

### 2. Duplicar simulação
Em qualquer linha do histórico, um botão "Duplicar" abre uma nova simulação
pré-preenchida com todos os parâmetros da simulação original (cliente,
paradas, zonas, pesos, motorista, margem). O usuário ajusta o que mudou.

### Tela de Templates
Design simples e sem restrição de quantidade — lista com busca por nome,
sem paginação forçada. Cada item mostra: nome do template, tipo de entrega,
cliente, data de criação. Ações: "Usar", "Editar", "Excluir".

Templates armazenados em `data/dynamic/templates.json` (ver seção Armazenamento).

---

## Imutabilidade do Histórico

**Histórico é imutável** — simulações salvas nunca recalculam com novos
preços. Se o usuário atualizar a tabela de preços em Configurações, todas
as simulações anteriores no histórico mantêm exatamente os números que
tinham quando foram criadas.

Isso é garantido pela arquitetura: `resultado_json` armazena os valores
calculados finais no momento da criação — o histórico nunca lê da tabela
de preços atual para exibir resultados passados. O `input_json` também
é preservado intacto para referência e duplicação.

Esta regra se aplica a todos os campos: preço do combustível, salário,
tabela de zonas, taxas de frete — qualquer mudança em Configurações é
prospectiva, nunca retroativa.

---

### 1. Simulação — Single vs. Multi-parada

Cada simulação pode conter **uma ou múltiplas paradas** para o mesmo cliente.
Um único motorista/veículo é selecionado para **toda a simulação** — não por
parada individual.

**Fluxo de multi-parada:**
1. Usuário seleciona o motorista/veículo para a simulação inteira (KANGOO,
   8-160 ou freelancer) e informa quantas entregas o motorista fará no dia
2. Usuário adiciona a primeira parada (zona + peso + valor NF opcional) →
   o custo dessa parada é calculado e exibido **imediatamente**
3. Usuário adiciona a segunda parada → calculada imediatamente, **total
   geral atualizado em tempo real**
4. Repete para N paradas — cada uma calculada ao ser adicionada
5. O resultado final exibe: preço individual por parada + **total geral
   destacado** (soma de todas as paradas × margem)

O custo fixo do motorista (salário + veículo) é dividido pelo número de
entregas do dia informado no início — essa alocação se aplica igualmente
a todas as paradas da simulação.

---

### 2. Motores de Precificação

#### A. Entrega Regular

Precificada por **zona + peso taxável** por parada.

**Peso taxável** = `max(peso real, peso cúbico)`
onde `peso cúbico = comprimento(m) × largura(m) × altura(m) × 167`

**Tabela de preços** (arquivo `taxas-regioes.json`):
- Estruturada por zonas definidas pelo usuário (João Pessoa + Grande JP)
- Cada zona tem: taxa mínima (cobre até o peso base, ex: 10kg) + faixas de
  peso com R$/kg acima do mínimo

**Cobranças sobre valor da NF (aplicam-se às entregas próprias):**
- **GRIS**: 0,10% do valor da NF, mínimo R$4,00
- **Ad-Valorem**: 0,30% do valor da NF
- O campo "Valor da NF" é **opcional** na simulação — o usuário nem sempre
  sabe o valor no momento da cotação. Comportamento:
  - Se informado: GRIS e Ad-Valorem são calculados e incluídos no custo
  - Se não informado: GRIS e Ad-Valorem são omitidos do cálculo, e o
    resultado exibe um aviso claro: "GRIS e Ad-Valorem não incluídos —
    informe o valor da NF para cálculo completo"
- Fórmula quando NF informada:
  ```
  gris = max(valorNF × 0.001, 4.00)
  adValorem = valorNF × 0.003
  custoTotal = fretePeso + gris + adValorem
  ```

**Um motorista/veículo por simulação** — selecionado no início e aplicado
a todas as paradas. Opções:

| Opção      | Base do custo |
|------------|---------------|
| KANGOO     | (salário diário + vale + custos operacionais diários KANGOO) ÷ nº entregas do dia |
| 8-160      | (salário diário + vale + custos operacionais diários 8-160) ÷ nº entregas do dia |
| Freelancer | taxa negociada para o trabalho inteiro (um valor único por simulação, independente do nº de paradas) |

Para freelancer em multi-parada: o usuário informa **um único valor negociado
para o trabalho todo** (não multiplicado por parada). O campo de taxa do
freelancer deve ser editável na simulação, independente do valor padrão
salvo no cadastro — pois cada trabalho é negociado individualmente.

Na tela de simulação, exibir os três custos totais lado a lado antes de o
usuário confirmar a escolha — assim ele vê a diferença de custo antes de
decidir. A opção mais barata é destacada visualmente.

#### B. Entrega Dedicada

Veículo exclusivo para um cliente, precificado por **dia(s) + km**, sem
relação com peso ou valor da carga.

Custo derivado dos insumos operacionais por veículo (KANGOO ou 8-160):
```
diária base = (custo fixo diário do veículo + salário diário) × (1 + margem)
taxa km extra = (combustível/km + manutenção/km) × (1 + margem)
custo total = diária base × dias + max(0, km estimado − km incluídos) × taxa km extra
```

**Campos obrigatórios na simulação dedicada:**
- Veículo (KANGOO ou 8-160)
- Número de dias
- **Km estimado da rota** — informado pelo usuário por simulação (estimativa
  da distância total do trabalho). Não há valor padrão pré-configurado.
- Km incluídos na diária — configurado por veículo na tela de Configurações
- Ajudante/auxiliar opcional: taxa adicional por dia (configurável)

---

### 3. Entrega Agendada (serviço de horário garantido)

Camada de serviço aplicável sobre **regular ou dedicada**. O cliente acorda
um horário específico (ex: "10h de segunda-feira") e paga pela garantia.

```
preço sugerido = (custo da entrega + acréscimo de agendamento) × (1 + margem)
```

- Apresentar na UI como serviço nomeado "Entrega Agendada" — não como checkbox
- Campos: data, horário acordado, acréscimo em R$ (padrão R$0,00)
- Data/horário salvos no histórico

---

### 4. Saída da Simulação

**Por parada:**
- Zona, peso taxável, custo calculado, opção selecionada (KANGOO/8-160/freelancer)
- Detalhamento colapsável: mostra total por parada por padrão; ao expandir,
  exibe cada componente separadamente:
  - Parcela do salário (R$)
  - Parcela do vale alimentação (R$)
  - Parcela do combustível (R$)
  - Parcela da manutenção (R$)
  - Parcela do seguro (R$)
  - Parcela da depreciação (R$)
  - Taxa da faixa de peso (R$)
  - GRIS (R$) — exibido apenas se valor da NF foi informado
  - Ad-Valorem (R$) — exibido apenas se valor da NF foi informado
  - Acréscimo de agendamento, se aplicável (R$)

**Resumo geral:**
- Total de custo (soma das paradas)
- Margem % — pré-preenchida com o padrão, **ajustável livremente por simulação**,
  recalcula em tempo real
- **Preço sugerido ao cliente** (destacado, soma das paradas × margem)
- **Preço cobrado (opcional)** — campo editável para registrar o valor real
  negociado com o cliente, caso seja diferente do sugerido. Salvo no histórico
  para comparação futura.

**Alertas financeiros automáticos** — dois níveis de visibilidade:

1. **Alerta de opção mais cara selecionada** (nível discreto — inline):
   - Exibido sutilmente logo abaixo da opção selecionada
   - "ℹ️ Existe uma opção R$ X mais barata disponível"
   - Não interrompe o fluxo, apenas informa

2. **Alerta de preço abaixo do break-even** (nível crítico — banner):
   - Banner proeminente no topo da seção de resultado
   - "⚠️ Atenção: o preço sugerido está abaixo do seu custo. Você terá
     prejuízo de R$ X nesta entrega."
   - Cor vermelha/laranja, impossível de ignorar
   - Recalcula em tempo real conforme o usuário altera a margem

Ambos os alertas são **informativos** — nunca bloqueiam o usuário de prosseguir.

---

## Tela de Histórico e Dashboard de Rentabilidade

A tela de histórico tem **três seções**:

### 1. Dashboard de rentabilidade (topo)
Comparação entre custo operacional real e valor total cobrado no período:

- **Custo operacional fixo do mês** — calculado automaticamente dos configs:
  salário × motoristas + combustível + manutenção + seguro + depreciação +
  vale alimentação (todos os valores de `motoristas-proprios.json`)
- **Custo com freelancers do mês** — soma dos pagamentos registrados em
  `pagamentos_freelancer` no período
- **Custo operacional total** = fixo + freelancers
- **Total sugerido** — soma dos preços sugeridos das simulações do período
- **Total cobrado** — soma dos `preco_cobrado` das simulações onde foi
  registrado (com indicação de quantas simulações têm preço cobrado vs. apenas
  sugerido)
- **Margem real estimada** = (total cobrado − custo operacional total) ÷ total cobrado
- **Diferença sugerido vs. cobrado** — quanto foi perdido ou ganho na negociação

> Este dashboard responde: "meus custos reais estão sendo cobertos? Estou
> ganhando ou perdendo na negociação com clientes?"

### 2. Métricas de simulações
- Total de simulações no período
- Valor total cotado
- Margem média aplicada nas simulações
- Custo médio por entrega simulada

### 3. Lista de simulações
Cada linha exibe diretamente (sem precisar abrir):
- Data e hora
- Nome do cliente
- Tipo de entrega (Regular / Dedicada / Agendada)
- Paradas: zonas e pesos de cada parada
- Motorista/veículo utilizado
- Custo total
- Margem aplicada (%)
- Preço sugerido total
- Preço cobrado (se registrado) — destacado diferente do sugerido se divergir

Filtros: nome do cliente, tipo de entrega, período (data início/fim).
Histórico é **somente leitura** — sem status de aceite/recusa. O preço
cobrado pode ser adicionado/editado diretamente na linha da lista.

---

## Tela de Configurações

A tela de Configurações substitui a edição manual de arquivos JSON.
Ela escreve nos arquivos via API Route (`/api/configuracoes`).
Todas as seções e labels em **Português (pt-BR)**.

**Tratamento de erros obrigatório**: se a escrita no arquivo falhar, a UI
deve exibir mensagem de erro clara — nunca falhar silenciosamente.

**Hierarquia visual das seções** — campos alterados com frequência diferente
devem ter peso visual diferente:

- **Alterado mensalmente** → destaque visual, fácil acesso:
  - Preço do litro de combustível (KANGOO e 8-160)
  - Acréscimo de agendamento

- **Alterado raramente** → seções secundárias, podem ser colapsáveis:
  - Salário, vale alimentação, dias úteis
  - Manutenção, seguro, depreciação
  - Parâmetros de entrega dedicada
  - Tabela de preços por zona

Sugestão de layout: colocar "Combustível" e "Agendamento" no topo da tela
de Configurações, com as demais seções abaixo em accordions colapsados.

### Seções da tela de Configurações:

**Geral**
- Margem padrão (%)
- Número padrão de entregas por dia
- Acréscimo de agendamento (R$)

**Motoristas Próprios**
- Salário mensal bruto (R$)
- Dias úteis por mês
- Vale alimentação por motorista (R$/mês)

**Veículo: KANGOO**
- Combustível mensal (R$)
- Manutenção mensal (R$)
- Seguro mensal (R$)
- Depreciação mensal (R$)
- Preço do litro de combustível (R$)
- Consumo (km por litro)

**Veículo: 8-160**
- Mesmos campos do KANGOO

**Entrega Dedicada — KANGOO**
- Km incluídos na diária
- Custo fixo mensal (R$)
- Preço do litro (R$)
- Consumo (km por litro)
- Manutenção por km (R$)

**Entrega Dedicada — 8-160**
- Mesmos campos

---

## Cadastro de Motoristas Freelancers

CRUD simples: nome, taxa padrão por trabalho (R$), observações.
Na simulação: selecionar do cadastro (taxa pré-preenchida, ajustável por simulação).

**Seed inicial** (extraído dos lançamentos de abril/2026):
- DANIELLA NOBREGA HENRIQUES GAMA
- MARCIO JOAO DE OLIVEIRA SANTOS
- HAYRON LEITE COUTINHO RAMOS
- DAVID HENRICH MEDEIROS DE SANTANA

> `default_fee` de cada um a ser confirmada pelo usuário — os totais mensais
> não revelam o valor por trabalho individual.

---

## Acesso ao App

- **Sem autenticação** — o app abre diretamente na tela de Nova Simulação
- Sem login, sem senha, sem sessão
- Qualquer pessoa com acesso à URL pode usar todas as funcionalidades
- Motoristas não acessam o app (uso interno de escritório apenas)

---

## Armazenamento de Dados

### Arquivos JSON (escritos via `/api/configuracoes`)

```
data/
  rates/
    taxas-regioes.json       # tabela de preços por zona
  config/
    geral.json               # margem padrão: 8%, entregas/dia padrão: 8,
                             # acréscimo agendamento: R$0,00 (a definir pelo usuário)
    motoristas-proprios.json # salário, vale, dias úteis, custos por veículo
    dedicada.json            # insumos de custo dedicado por veículo
```

**`taxas-regioes.json`:**
```ts
interface FaixaPreco {
  origem: string;        // "JOAO PESSOA/PB"
  zona: string;          // nome da zona
  taxaMinima: number;    // R$ — cobre até pesoBase kg
  pesoBase: number;      // kg cobertos pela taxaMinima
  faixas: {
    min: number;         // kg
    max: number;         // kg (99999.99 para última faixa)
    precoPorKg: number;  // R$/kg nesta faixa
  }[];
}
```

**Zonas confirmadas pelo usuário — seed inicial do arquivo:**
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
> Todos os valores em `0` — preencher via tela de Configurações após o app
> ser construído. As faixas de peso espelham a estrutura da Concept Cargo
> (referência de mercado). O usuário pode adicionar ou remover faixas conforme
> sua estratégia de preços.

**`motoristas-proprios.json`:**
```ts
interface ConfigMotoristaProprio {
  salarioMensal: number;
  diasUteisporMes: number;
  valeAlimentacao: number;
  veiculos: {
    [nome: string]: {        // "KANGOO" | "8-160"
      combustivelMensal: number;
      manutencaoMensal: number;
      seguroMensal: number;
      depreciacaoMensal: number;
      precoCombustivelLitro: number;
      consumoKmPorLitro: number;
    }
  }
}
// custo diário por veículo =
//   (salário + vale + combustível + manutenção + seguro + depreciação) ÷ dias úteis
// custo por entrega = custo diário ÷ nº de entregas do dia
```

### Persistência de dados dinâmicos (JSON via API Routes)

Sem banco de dados. Todos os dados são armazenados em arquivos JSON no
servidor, lidos e escritos via API Routes do Next.js.

Arquivos em `data/dynamic/`:
- `motoristas-freelancer.json` — cadastro de motoristas freelancers
- `pagamentos-freelancer.json` — log de pagamentos a freelancers
- `simulacoes.json` — histórico de simulações
- `templates.json` — templates salvos

```ts
// simulacoes.json — array de:
interface Simulacao {
  id: string;                  // uuid gerado no cliente
  criadoEm: string;            // ISO datetime
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
  precoCobrado?: number;       // editável após a simulação
  observacoes?: string;
}

// motoristas-freelancer.json — array de:
interface MotoristaFreelancer {
  id: string;
  nome: string;
  taxaPadrao: number;
  observacoes?: string;
  criadoEm: string;
}

// pagamentos-freelancer.json — array de:
interface PagamentoFreelancer {
  id: string;
  motoristaId: string;
  valor: number;
  dataPagamento: string;   // YYYY-MM-DD
  descricao?: string;
  criadoEm: string;
}

// templates.json — array de:
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

## Estrutura do Módulo de Cálculo

Todo em `lib/precificacao/` — funções puras, sem I/O, testáveis independentemente.

```
lib/precificacao/
  tipos.ts            # FaixaPreco, ConfigMotoristaProprio, EntradaSimulacao,
                      # ResultadoSimulacao, DetalhamentoCusto, OpcaoEntrega, Parada
  peso.ts             # peso taxável: max(peso real, peso cúbico com fator 167)
  regular.ts          # lookup de zona + faixas, custo KANGOO / 8-160 / freelancer
                      # por parada, retorna três opções para exibição lado a lado
  dedicada.ts         # deriva diária + km extra dos insumos, por veículo
  agendada.ts         # aplica acréscimo antes da margem
  simular.ts          # entrada unificada → despacha para motor correto →
                      # agrega paradas → retorna resultado completo com detalhamento
```

---

## Dados Reais de Custo (Abril/2026)

Extraídos do `lancamentos_financeiro.xls` — 01/04 a 30/04/2026, todos LIQUIDADO.

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
- Salário de referência: **R$ 1.964,63/mês** (motorista principal — NILSON)
- Vale alimentação: **R$ 738,00–R$ 774,90/mês** por colaborador
- Diária padrão identificada: **R$ 240,00/dia**

### Motoristas freelancers ativos
| Nome                              | Total abril  | Pagamentos |
|-----------------------------------|--------------|------------|
| HAYRON LEITE COUTINHO RAMOS       | R$ 11.582,00 | 1          |
| MARCIO JOAO DE OLIVEIRA SANTOS    | R$ 6.150,00  | 2          |
| DANIELLA NOBREGA HENRIQUES GAMA   | R$ 2.150,00  | 3          |
| DAVID HENRICH MEDEIROS DE SANTANA | R$ 1.850,00  | 2          |

### Valores iniciais para `motoristas-proprios.json`
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
> Seguro proporcional: R$ 2.356,61 total ÷ 2 veículos.
> Depreciação e consumo real (km/L) a confirmar com o usuário.

---

## Escopo do MVP (construir nesta ordem)

1. **Layout base + navegação** — sidebar fixa com 6 itens (Nova Simulação,
   Histórico, Templates, Motoristas, Pagamentos, Configurações), lógica de
   primeiro acesso vs. acesso subsequente.
2. **Tela de boas-vindas (primeiro acesso)** — checklist de 5 itens de
   configuração inicial, cada um linkando para a tela correspondente,
   status automático pendente/concluído. Desaparece após itens críticos
   concluídos.
3. **Entrega regular (parada única)** — layout dois painéis (esquerda: form,
   direita: resultado ao vivo), seleção de motorista/veículo, lookup de zona
   + faixas de peso, GRIS/Ad-Valorem opcionais, três custos lado a lado,
   margem ajustável em tempo real, alertas em dois níveis (inline discreto
   + banner crítico), detalhamento colapsável por componente.
4. **Multi-parada** — adicionar N paradas sequencialmente, cada uma calculada
   imediatamente, painel direito atualizado em tempo real, freelancer com
   taxa negociada por trabalho inteiro.
5. **Cadastro de motoristas freelancers (Motoristas)** — CRUD com seed dos
   4 motoristas, estado vazio orientativo.
6. **Registro de pagamentos (Pagamentos)** — tela própria na sidebar, log
   individual com totais mensais automáticos.
7. **Entrega agendada** — camada de serviço sobre regular, campo data/horário,
   acréscimo somado antes da margem, serviço nomeado na UI.
8. **Entrega dedicada** — calculadora por veículo, km estimado por simulação,
   multi-dia e km excedentes.
9. **Entrega dedicada agendada** — combinação dos dois serviços.
10. **Templates e duplicação** — salvar como template nomeado, duplicar do
    histórico, tela de Templates com busca por nome, sem paginação forçada.
11. **Tela de Configurações** — combustível e agendamento no topo destacados,
    demais seções colapsáveis, escrita via API Route com erro explícito,
    nunca falhar silenciosamente.
12. **Histórico + Dashboard de Rentabilidade** — persistência em JSON via
    API Route, cada simulação salva com resultado imutável, campo preço
    cobrado opcional editável inline, dashboard com custo fixo + freelancers
    + sugerido vs. cobrado + margem real estimada, lista filtrável.

---

## Itens em Aberto / Confirmar com o Usuário

**Não há mais itens bloqueantes.** O app pode ser construído integralmente.

Os únicos valores que faltam são os **preços da tabela de frete** — taxas
mínimas e R$/kg por faixa de peso para cada uma das 6 zonas. As zonas já
estão definidas no JSON com valores `0`. O usuário preenche os preços reais
via tela de Configurações após o app ser construído.

Todos os outros itens foram resolvidos:
- ✅ Zonas: **João Pessoa, Cabedelo, Conde, Santa Rita, Bayeux, Alhandra**
- ✅ Margem padrão: **8%**
- ✅ Entregas padrão por dia: **8**
- ✅ Acréscimo de agendamento: **R$0,00** (usuário define depois no app)
- ✅ GRIS e Ad-Valorem: **aplicam-se** — campo valor da NF opcional
- ✅ Consumo KANGOO: **10 km/L** | 8-160: **7 km/L**
- ✅ Depreciação: **R$0,00** inicial (usuário insere depois no app)
- ✅ Taxa padrão freelancers: usuário define no cadastro após construção

---

## Convenções

- Todos os valores em BRL (R$) — armazenados como números, formatados só na UI.
- Peso em kg, distância em km, volume em m³.
- Todo preço exibido deve ser rastreável até seus componentes — sem totais
  "caixa preta". Detalhamento sempre disponível via expansão.
- A empresa opera apenas em João Pessoa e Grande JP. Não modelar outras regiões.
- Interface 100% em **Português (pt-BR)** — sem exceções, sem termos técnicos
  em inglês, nem mesmo em labels de configuração.
- App otimizado para **desktop**. Não é necessário layout responsivo.
- Suporte a **modo claro e modo escuro**, alternável pelo usuário.
- Arquivos JSON de configuração escritos via API Route — nunca editados
  manualmente pelo usuário final.
- **Histórico é imutável** — simulações salvas nunca recalculam com novos
  preços. O `resultado_json` gravado no momento da simulação é permanente.
  Alterações na tabela de preços ou nos custos operacionais afetam apenas
  simulações futuras, nunca as passadas.
- **Estado vazio sempre orientativo** — qualquer tela sem dados (sem
  freelancers, sem templates, sem simulações) deve exibir uma mensagem
  clara explicando o que fazer, nunca uma tela em branco.

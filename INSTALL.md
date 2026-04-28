# Instalação — growth-os-skills

## Pré-requisitos

- [Claude Code](https://claude.com/claude-code) instalado e funcionando.
- `git` instalado.
- *(opcional)* Python 3.10+ e `GEMINI_API_KEY` — apenas para o modo `gemini` do `/pitch-deck-builder`.

---

## Instalação em 3 passos

### 1. Clone o repositório

**Opção A — Skills globais (todas as suas sessões):**

```bash
git clone https://github.com/kcleto-ai/growth-os-skills.git ~/.claude/skills/growth-os-skills
```

**Opção B — Skills do projeto (apenas neste projeto):**

```bash
cd <seu-projeto>
git clone https://github.com/kcleto-ai/growth-os-skills.git
```

### 2. Confirme que o Claude Code reconhece

Abra o Claude Code:

```bash
claude
```

Digite `/help` — você deve ver os 8 comandos do pacote (`/a360-framework-lite`, `/nicho-explorer`, `/mapear-nicho-lite`, `/cliente-radar`, `/lp-builder`, `/gtm-architect`, `/playbook-vendas`, `/meeting-prep`, `/pitch-deck-builder`).

Se não aparecer, verifique se o caminho do clone está em `~/.claude/skills/` ou em `<projeto>/.claude/skills/`.

### 3. Primeiro uso

```
> /a360-framework-lite
```

O coordenador vai te perguntar o que você quer fazer e rotear para a(s) skill(s) certa(s).

---

## Atualização

```bash
cd ~/.claude/skills/growth-os-skills
git pull
```

---

## Configuração opcional — modo `gemini` do `pitch-deck-builder`

Se você quer gerar **imagens AI dos slides** (não apenas Reveal.js HTML):

### 1. Pegue uma chave Gemini

https://ai.google.dev/ — crie uma chave API (custo aproximado: US$ 0.20 por slide).

### 2. Configure no shell

```bash
export GEMINI_API_KEY="sua-chave-aqui"
```

(Para tornar permanente, adicione em `~/.zshrc` ou `~/.bashrc`.)

### 3. Instale dependências Python

```bash
cd ~/.claude/skills/growth-os-skills/.claude/skills/pitch-deck-builder
pip install -r requirements.txt
```

### 4. Use o modo

```
> /pitch-deck-builder modo gemini
```

> ⚠️ Aviso: 20 slides ≈ US$ 4.00 por chamada. Para pitch deck "de produção" use o modo `gemini`. Para testes ou primeiro deck, use o default `reveal` (zero custo).

---

## Solução de problemas

**As skills não aparecem com `/help`:**
- Verifique o caminho do clone (`ls ~/.claude/skills/` deve listar `growth-os-skills`).
- Reinicie o Claude Code.

**`WebSearch` / `WebFetch` falham:**
- Verifique sua conexão com internet.
- Algumas das skills (nicho-explorer, mapear-nicho-lite, cliente-radar, lp-builder) precisam de internet — é esperado.

**O modo `gemini` não funciona:**
- Confirme que `GEMINI_API_KEY` está exportada (`echo $GEMINI_API_KEY`).
- Confirme que `pip install -r requirements.txt` rodou sem erro.
- O modo default (`reveal`) **não** depende de Python nem de API keys — sempre funciona.

---

## Dúvidas

- 🌐 https://accelera360.com.br/
- 🚀 Aplique para o programa: https://yayforms.link/4bRG5aE

---

**Powered by Accelera 360 — A Nova Economia**

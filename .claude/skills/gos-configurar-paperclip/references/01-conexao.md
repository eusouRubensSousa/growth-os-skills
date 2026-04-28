# 01 — Detectar e conectar ao target

> Sempre o **primeiro passo** de qualquer sessão. Sem isso, comandos vão para o lugar errado.

## 1.1. Pergunte ao usuário (se ambíguo)

Se o usuário não disse onde está o Paperclip, pergunte com **AskUserQuestion**:

- "VPS remota via SSH" (ex: Hostinger, AWS)
- "Esta máquina (local)"
- "Não sei / quero descobrir"

Se SSH: peça `user@host` e (opcional) `~/.ssh/config` alias.
Se local: prossiga com detecção automática.

## 1.2. Descobrir variante (native vs docker)

Em qualquer um dos lados (local ou remoto), rode os checks na ordem:

```bash
# Em local-* o prefixo é vazio. Em ssh-* o prefixo é: ssh user@host --
PFX=""              # ou: PFX="ssh $PC_HOST --"

# (a) CLI nativo no PATH?
$PFX command -v paperclipai && echo "native_candidate"
# (alternativas: paperclip, npx paperclipai)

# (b) Docker e algum container do Paperclip?
$PFX docker ps --format '{{.Names}}\t{{.Image}}' 2>/dev/null \
  | grep -iE 'paperclip' \
  | head -1
```

Decisão:

| Output | PC_MODE |
|---|---|
| Só `native_candidate`, sem container | `local-native` ou `ssh-native` |
| Container detectado, sem CLI no host | `local-docker` ou `ssh-docker` |
| Ambos (raro) | Pergunte ao user qual usar |
| Nenhum | Paperclip não está instalado — orientar `references/03-onboard-setup.md` |

## 1.3. Resolver paths (depende do modo)

Default data dir do Paperclip: `~/.paperclip/instances/<id>/` (override por `PAPERCLIP_HOME` env var ou `--data-dir` flag).

### Modo `*-native`

```bash
$PFX bash -c '
  HOME_DIR="${PAPERCLIP_HOME:-$HOME/.paperclip}"
  echo "PC_HOME=$HOME_DIR"
  ls -1 "$HOME_DIR/instances" 2>/dev/null | head -3
  echo "PC_OWNER=$(stat -c "%u:%g" "$HOME_DIR" 2>/dev/null || echo 0:0)"
'
```

### Modo `*-docker`

```bash
$PFX bash -c '
  for CTR in $(docker ps --format "{{.Names}}" | grep -i "paperclip"); do
    LBL=$(docker inspect "$CTR" --format "{{ index .Config.Labels \"com.docker.compose.project.working_dir\" }}")
    [ -n "$LBL" ] && echo "PC_CONTAINER=$CTR"
    [ -n "$LBL" ] && echo "PC_COMPOSE_DIR=$LBL"
    # Procurar onde os data files moram
    [ -d "$LBL/data/.paperclip" ] && echo "PC_HOME=$LBL/data/.paperclip"
    [ -d "$LBL/.paperclip" ]      && echo "PC_HOME=$LBL/.paperclip"
    OWNER=$(stat -c "%u:%g" "$LBL/data/.paperclip" 2>/dev/null)
    [ -n "$OWNER" ] && echo "PC_OWNER=$OWNER"
    break
  done
'
```

Há um script pronto: `scripts/pc-target-detect.sh`. Use:
```bash
eval "$(./scripts/pc-target-detect.sh)"                  # local
eval "$(./scripts/pc-target-detect.sh root@host.com)"    # ssh
```

## 1.4. Pedir ao usuário a company alvo

Detecção automática descobre a INSTÂNCIA. Mas uma instância pode ter várias companies. Pergunte:

```
PC_COMPANY_ID=<uuid>             # via dashboard ou `paperclipai company list`
PC_COMPANY_DIR=<caminho local>   # path para o package markdown (pasta com COMPANY.md)
```

`PC_COMPANY_DIR` pode ser:
- Repositório git checkado em qualquer pasta (recomendado).
- `paperclipai company export <id> --out ./tmp` — saída do export.

Se a company NÃO está exportada como markdown ainda (vive só no DB), oriente o user a fazer:
```bash
paperclipai company export <company-id> --out ./company-pkg
git init ./company-pkg && cd ./company-pkg && git add . && git commit -m "initial export"
```

A partir daqui, o ciclo é: editar markdown → `paperclipai company import` → verificar.

## 1.5. Persistir no contexto da skill

Salve as variáveis no estado da sessão. Reapresente ao usuário ANTES de qualquer mudança:

```
🔌 Target detectado:
   Modo:       ssh-docker
   Host:       root@srv991685.hstgr.cloud
   Container:  paperclip-paperclip-1
   Compose:    /docker/paperclip
   Data dir:   /docker/paperclip/data/.paperclip
   Instance:   default
   API base:   http://localhost:3100  (via tunnel)
   Company:    a1b2c3d4 (Accelera 360)
   Pkg dir:    /Users/kcleto/repos/accelera-company
   Owner:      1000:1000
```

E pergunte: **"Confirma este target?"** Se o usuário disser não, refaça a detecção.

## 1.6. Wrapper unificado

A partir daqui, NUNCA chame `paperclipai` diretamente. Use `scripts/pc-wrap.sh`:

```bash
./scripts/pc-wrap.sh "doctor"
./scripts/pc-wrap.sh "env"
./scripts/pc-wrap.sh "agent list --company-id $PC_COMPANY_ID"
./scripts/pc-wrap.sh "dashboard get --company-id $PC_COMPANY_ID --json"
```

Lê `PC_MODE`, `PC_HOST`, `PC_CONTAINER` do ambiente e monta a chamada certa.

## 1.7. SSH: pré-checagens recomendadas

Antes de mudanças num target SSH:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=5 $PC_HOST true && echo "ssh: ok"
ssh $PC_HOST 'sudo -n true 2>/dev/null && echo sudo:nopasswd || echo sudo:askpw'
ssh $PC_HOST 'docker ps >/dev/null 2>&1 && echo docker:ok || echo docker:missing'
```

Se `sudo:askpw`: avise que mudanças em systemd/firewall vão pedir senha — considere rodar manualmente.

## 1.8. API base e túnel

Por padrão Paperclip ouve em `localhost:3100`. Em ssh-*, para chamadas REST diretas (`/api/companies/{id}/costs/summary`), você precisa de túnel SSH:

```bash
# Em outro terminal: túnel local 3100 → remoto 3100
ssh -N -L 3100:localhost:3100 $PC_HOST &
# Agora `curl localhost:3100/api/...` chega no Paperclip remoto
```

Se o user não conseguir túnel, fallback: rodar `curl` via ssh:
```bash
ssh $PC_HOST 'curl -s localhost:3100/api/companies/<id>/costs/summary'
```

## 1.9. Pegadinhas

- **Hostinger HVPS**: o template "One-Click" (se existir para Paperclip) usa Docker Compose; instalações via curso/manual costumam ser native — verifique antes de assumir.
- **`PAPERCLIP_HOME`**: se setado, sobrescreve `~/.paperclip`. Cheque com `paperclipai env`.
- **Múltiplas instâncias**: `~/.paperclip/instances/dev/`, `~/.paperclip/instances/prod/`. Default é `default`. CLI usa `--profile` ou `--instance` para escolher.
- **Docker sem label**: o label `com.docker.compose.project.working_dir` só existe se o container subiu via `docker compose`. Se foi `docker run` direto, peça o caminho ao usuário.
- **Docker sem grupo**: em `ssh-docker`, o usuário SSH precisa de grupo `docker` ou sudo — caso contrário, `docker exec` falha.
- **Embedded Postgres**: Paperclip embute Postgres por padrão. Para produção, usuário pode ter apontado para Postgres externo via env (`DATABASE_URL`). Cheque com `paperclipai env`.

# Ciclo7 — App de Treino (PWA)

App de treino de hipertrofia com ciclo de 7 dias, registro de carga, timer de descanso e acompanhamento de progresso. Funciona offline e é instalável no celular como um app nativo.

## Como publicar no GitHub Pages

1. **Crie um repositório** novo no GitHub (pode ser público ou privado).
2. **Suba todos os arquivos** desta pasta para a raiz do repositório, na branch `main`. Pelo site: *Add file → Upload files*, arraste tudo, e *Commit*. Pelo terminal:
   ```bash
   git init
   git add .
   git commit -m "Ciclo7 PWA"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
3. **Ative o Pages** em *Settings → Pages*. Em **Source**, escolha **GitHub Actions**. O workflow incluído (`.github/workflows/deploy.yml`) publica automaticamente a cada push na `main`.
   - *Alternativa sem Actions:* em **Source** escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. Funciona igual.
4. Aguarde ~1 minuto. A URL será `https://SEU_USUARIO.github.io/SEU_REPO/`.

## Como instalar no celular

- Abra a URL no navegador do celular (**HTTPS é obrigatório** — o Pages já fornece).
- **Android (Chrome):** aparece um banner "Instalar app" ou use o menu ⋮ → *Adicionar à tela inicial / Instalar app*.
- **iPhone (Safari):** botão *Compartilhar* → *Adicionar à Tela de Início*.

Depois de instalado, abre em tela cheia, sem barra de navegador, e funciona offline.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página de entrada; carrega React e o app |
| `app.js` | Código do app (React + JSX, transpilado no navegador) |
| `manifest.webmanifest` | Define nome, ícones e modo standalone (instalação) |
| `sw.js` | Service worker — cache offline e instalabilidade |
| `icons/` | Ícones do app (192, 512, maskable) |
| `.github/workflows/deploy.yml` | Deploy automático no Pages |
| `.nojekyll` | Impede o Pages de processar os arquivos |

## Onde ficam os dados

Tudo é salvo **localmente no seu navegador** (`localStorage`), neste dispositivo. Nada vai pra nuvem. Trocar de celular ou limpar os dados do navegador apaga o histórico. Para uso pessoal numa academia, é o suficiente.

## Como atualizar o treino

Edite `app.js` — os exercícios estão no objeto `SESSIONS` no topo do arquivo, fáceis de localizar. Ao mudar algo, suba a alteração **e** incremente o `CACHE_VERSION` em `sw.js` (ex.: `ciclo7-v1` → `ciclo7-v2`) para que o app instalado pegue a nova versão.

## Nota técnica

Esta versão usa React via CDN e transpila o JSX no navegador com Babel — zero build step, sobe direto no Pages. Para um app de uso pessoal é perfeito. Se um dia quiser otimizar o carregamento, dá para migrar para um build com Vite (gera arquivos já compilados), mas não é necessário para funcionar.

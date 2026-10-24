# Fluxo · Gestão financeira

Estrutura do projeto:

```
index.html              tela principal (layout e estilos)
js/firebase-config.js   configuração do seu projeto Firebase
js/firebase-sync.js     login Google + sincronização com Firestore
js/app.js               lógica do sistema
firestore.rules         regras de segurança do banco
```

## 1. Configurar o Firebase (uma vez)

1. Console Firebase > projeto `financas-ana`.
2. **Authentication > Sign-in method**: ative o provedor **Google**.
3. **Authentication > Settings > Authorized domains**: adicione o domínio do GitHub Pages
   (ex.: `seuusuario.github.io`). `localhost` já vem por padrão.
4. **Firestore Database**: crie o banco (modo produção).
5. **Firestore > Regras**: cole o conteúdo de `firestore.rules` e publique.

## 2. Publicar no GitHub Pages

1. Crie um repositório e envie todos os arquivos desta pasta.
2. Settings > Pages > Source: `Deploy from a branch` > `main` / `/ (root)`.
3. Acesse `https://seuusuario.github.io/nome-do-repo/`.

## 3. Rodar no computador (teste local)

Módulos ES não funcionam abrindo o arquivo direto (duplo clique). Use um servidor local, na pasta do projeto:

```
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Observações

- Os dados ficam em `users/{seu uid}/fluxo/{chave}`, um documento por chave.
- Cada documento aceita até 1 MB. Com muitos lançamentos, a chave `fluxo_demo_v2` pode chegar a esse limite;
  nesse caso avise, que dividimos os dados em documentos menores.
- Os dados de exemplo antigos foram removidos: ao entrar, o navegador passa a usar somente o que está na nuvem.

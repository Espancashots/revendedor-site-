# Satanabe Reseller v0.1 Alpha

Painel único para todos os revendedores. O usuário autenticado é vinculado a um `reseller_id` no Supabase e só consegue acessar os dados da própria loja.

## Publicação
1. Crie o repositório `satanabe-reseller` no GitHub.
2. Envie os arquivos desta pasta para a raiz do repositório.
3. Ative GitHub Pages em **Settings → Pages → Deploy from a branch → main / root**.
4. O endereço esperado é `https://espancashots.github.io/satanabe-reseller/`.

## Supabase Auth — passo necessário
Em **Authentication → URL Configuration**, adicione aos Redirect URLs:

`https://espancashots.github.io/satanabe-reseller/**`

Isso permite que convites e recuperação de senha retornem ao painel.

## O que o revendedor vê
- Overview apenas da própria loja.
- Keys apenas do próprio `reseller_id`.
- Clientes apenas da própria loja.
- Receita apenas das próprias vendas/renovações.
- Criação, renovação, ativação/desativação, reset de aparelhos e limite de dispositivos de suas próprias keys.

O backend valida o `reseller_id` em cada operação; esconder uma aba no navegador não é usado como mecanismo de segurança.


## Convites por e-mail

Para o Supabase enviar convites automaticamente a endereços que não pertencem à equipe do projeto, configure um SMTP próprio em **Authentication → SMTP Settings**.

Sem SMTP próprio, o Satanabe Admin usa um fallback: gera um link seguro de convite/recuperação para o administrador copiar e enviar ao revendedor por WhatsApp.

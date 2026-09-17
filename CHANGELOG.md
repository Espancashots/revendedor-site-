# v0.1.4 Alpha

- Adicionada aba **Valores** no painel Revendedor.
- Preços padrão configuráveis por plano.
- Geração e renovação de keys passam a usar automaticamente os preços definidos pelo revendedor.
- Configuração persistida no Supabase por revendedor.

## v0.1.3 Alpha
- Troca do login por e-mail para login textual + senha.
- Remoção de “Esqueci minha senha”.
- Ajuste para autenticar internamente com a conta Supabase associada ao login.

# Changelog

## v0.1.2 Alpha
- Corrige erro de sintaxe no objeto de planos do `app.js` que impedia todo o JavaScript do painel de executar.
- Corrige o primeiro acesso e a recuperação de senha usando o evento `PASSWORD_RECOVERY` do Supabase Auth.
- Mantém a URL oficial do painel em `https://espancashots.github.io/revendedor-site-/`.
- Após definir a nova senha, o revendedor é enviado normalmente ao próprio painel.

## v0.1.1 Alpha
- Corrige a URL oficial do painel para `https://espancashots.github.io/revendedor-site-/`.
- Fluxos de recuperação/primeiro acesso passam a usar o endereço correto.

## v0.1 Alpha
- Login com Supabase Auth.
- Primeiro acesso/recuperação com definição de senha.
- Overview isolado por revendedor.
- Keys com criação, renovação, reset de aparelhos, limite e ativar/desativar.
- Clientes com cadastro, WhatsApp e exclusão quando não possuem keys.
- Receita própria com vendas e renovações.
- Permissões Overview, Keys, Clientes e Receita respeitadas também no backend.
- Bloqueio de painel quando o administrador desativa o revendedor.
- Layout responsivo para PC e celular.

# Pokédex TCG — Plataforma pública (MVP inicial)

## O que funciona
- Site público com página inicial e cadastro/login por e-mail e senha usando Supabase Auth.
- Cada conta só consulta/altera seus próprios registros graças a políticas RLS no PostgreSQL.
- Catálogo compartilhado de cartas, inicialmente com Machop, Gengar ex e Wailord.
- Adição de cartas ao inventário, quantidade e total de repetidas.
- Layout responsivo inicial.

## O que ainda não está pronto
- O site NÃO foi publicado e não há URL pública real ainda.
- Sua coleção original de 3 cartas NÃO foi migrada para nenhuma conta. É necessário criar a conta e importar seus registros após autenticação.
- Imagens de catálogo: campos preparados, mas URLs ainda vazias até verificar fonte/licença e edição correta.
- Preços provisórios ficam no banco, mas o painel ainda não mostra cotações nem faz atualização automática.
- Filtros avançados, importação de planilha, autenticação Google, perfil público opcional e reconhecimento de cartas por foto são próximos passos.

## Executar
1. Crie um projeto em https://supabase.com e abra SQL Editor; execute `supabase/schema.sql`.
2. Em Authentication > Providers habilite Email e configure confirmação de e-mail e URLs de redirecionamento.
3. Copie `.env.example` para `.env.local` e preencha URL e chave pública (`anon`/publishable) do projeto. **Nunca use service_role no frontend.**
4. Instale Node.js 20+ e rode `npm install` e `npm run dev`.
5. Acesse http://localhost:3000, crie conta e entre.
6. Para publicar, envie a pasta para um repositório privado no GitHub, importe o projeto na Vercel e configure as mesmas variáveis de ambiente na Vercel. Ajuste os URLs permitidos no Supabase Auth para o domínio publicado.
7. Antes de divulgar amplamente: configure proteção anti-abuso/rate limiting, confirmação de e-mail, política de privacidade/LGPD, backups, monitoramento e revisão das políticas RLS.

## Importante
A planilha XLSX anterior não é uma base multiusuário adequada. O PostgreSQL no Supabase é a base definitiva; a planilha vira exportação/backup. A separação de dados é por `user_id`, validada pelo próprio banco, não só por filtro na interface.

## Atualização V2 (24/10/2026)
- Página `/catalogo` pública, com pesquisa por nome, Pokédex, expansão e número.
- Dashboard com pesquisa, totais, cartas em ordem da Pokédex e fichas detalhadas.
- Adição e alteração de quantidade; remoção com confirmação.
- Botão **opcional** para importar as três cartas da coleção inicial à conta correta, após login. Não atribuir essas cartas a outras pessoas.
- Preços de referência exibidos na moeda de origem com marcação de cotação provisória.
- Imagens de catálogo só aparecem quando `catalog_cards.image_url` estiver preenchido com URL verificada da impressão e idioma exatos. Caso contrário, o sistema apresenta placeholder — não reutiliza fotos pessoais nem inventa imagens.
- O SQL do projeto inicial cria políticas RLS para isolamento de usuários. Teste essas políticas em duas contas distintas antes de divulgar o site.

### Publicação
Este ZIP é código-fonte, não um link de site hospedado. Para publicar, será necessário configurar Supabase, instalar dependências e conectar um repositório à Vercel. Não compartilhe chaves secretas ou `service_role` no cliente.

### Limitações atuais
Ainda não há banco Supabase conectado, hospedagem, cadastro por foto, upload de imagens, sincronização com Google Sheets, cotação automática nem importação genérica de XLSX. O catálogo inicial contém apenas três referências e as respectivas imagens ainda precisam ser validadas. Antes de uso público, acrescente termos de uso, política de privacidade, controles contra abuso e confirmação da autorização de uso das imagens.

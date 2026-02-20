# 📋 Sistema de Logs de Acesso - Projeto Núcleo Técnico

## 📌 Descrição
Sistema implementado para registrar e exibir logs de todos os acessos (logins) realizados no projeto Núcleo Técnico.

## ✅ Funcionalidades Implementadas

### 1. **Interface de Visualização**
- ✅ Nova seção na página de configurações abaixo de "Usuários Cadastrados"
- ✅ Botão **"Exibir Logs de Acesso"** para mostrar/ocultar logs
- ✅ Tabela com colunas: Nome, Email, Categoria, Data e Hora
- ✅ Inicialmente oculta (display: none)
- ✅ Exibe últimos 100 acessos
- ✅ Ordenação: mais recente primeiro

### 2. **Registro Automático de Logs**
- ✅ Todo login validado no testador de login gera um registro
- ✅ Armazena: nome_usuario, email, categoria e timestamp
- ✅ Formato de data: DD/MM/AAAA HH:MM:SS (horário de Brasília)

### 3. **Estilização**
- ✅ Cores por categoria:
  - 🟠 Admin: Laranja (#ff9800)
  - 🔵 Técnico: Azul (#2196F3)
  - 🟢 Usuário: Verde (#4CAF50)
- ✅ Linhas alternadas (zebra striping)
- ✅ Design consistente com o resto da página

## 🗄️ Configuração do Banco de Dados

### Passo 1: Criar a Tabela no Supabase
1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Execute o arquivo `create_login_logs_table.sql`
4. Verifique se a tabela foi criada em **Table Editor**

### Passo 2: Verificar Permissões
O script SQL já configura automaticamente:
- ✅ Row Level Security (RLS) habilitado
- ✅ Política para INSERT (qualquer usuário pode inserir)
- ✅ Política para SELECT (qualquer usuário pode ler)

## 🚀 Como Usar

### Para Visualizar os Logs:
1. Acesse a página `configuracoes.html`
2. Role até o final
3. Clique no botão **"📊 Exibir Logs de Acesso"**
4. Os logs serão carregados e exibidos
5. Clique novamente para ocultar

### Para Registrar um Log:
Os logs são registrados automaticamente quando:
1. Um usuário testa o login no formulário "Testador de Login"
2. O email e senha estão corretos
3. O sistema grava automaticamente no banco

## 📊 Estrutura da Tabela `login_logs_nt`

```sql
id                  BIGSERIAL PRIMARY KEY
nome_usuario        VARCHAR(255)
email               VARCHAR(255) NOT NULL
categoria           VARCHAR(50) NOT NULL
login_timestamp     TIMESTAMPTZ NOT NULL
created_at          TIMESTAMPTZ DEFAULT NOW()
```

## 🔍 Consultas Úteis no Supabase

### Ver últimos 10 acessos:
```sql
SELECT nome_usuario, email, categoria, login_timestamp 
FROM login_logs_nt 
ORDER BY login_timestamp DESC 
LIMIT 10;
```

### Contar acessos por usuário:
```sql
SELECT email, COUNT(*) as total_acessos 
FROM login_logs_nt 
GROUP BY email 
ORDER BY total_acessos DESC;
```

### Acessos por categoria:
```sql
SELECT categoria, COUNT(*) as total_acessos 
FROM login_logs_nt 
GROUP BY categoria 
ORDER BY total_acessos DESC;
```

### Acessos nas últimas 24 horas:
```sql
SELECT * FROM login_logs_nt 
WHERE login_timestamp > NOW() - INTERVAL '24 hours' 
ORDER BY login_timestamp DESC;
```

### Limpar logs com mais de 90 dias:
```sql
DELETE FROM login_logs_nt 
WHERE login_timestamp < NOW() - INTERVAL '90 days';
```

## 🎨 Customizações Possíveis

### Alterar número de logs exibidos:
No arquivo `configuracoes.html`, na função `loadLoginLogs()`:
```javascript
.limit(100); // Altere o número aqui
```

### Adicionar filtros por data:
Adicione campos de data no HTML e modifique a query:
```javascript
.gte('login_timestamp', dataInicio)
.lte('login_timestamp', dataFim)
```

## ⚠️ Observações Importantes

1. **Tabela Específica**: Esta implementação usa a tabela `login_logs_nt` (Núcleo Técnico)
2. **Privacidade**: Os logs armazenam informações de acesso
3. **Storage**: Considere implementar limpeza automática de logs antigos
4. **Performance**: Índices já criados para otimizar consultas
5. **Timezone**: Datas convertidas para horário de Brasília (UTC-3)

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"
- Execute o SQL de criação da tabela no Supabase

### Logs não aparecem:
- Verifique console do navegador (F12)
- Confirme que RLS está configurado
- Teste fazer um login válido no testador

### Horários incorretos:
- Verifique a função `formatarData()` no código
- Ajuste o fuso horário se necessário

## 📝 Changelog

**v1.0** (10/02/2026)
- ✅ Implementação inicial
- ✅ Tabela de logs específica
- ✅ Toggle de exibição
- ✅ Registro automático
- ✅ Formatação de datas
- ✅ Colunas: Nome, Email, Categoria, Data/Hora

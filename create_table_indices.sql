-- Script SQL para criar a tabela 'indices' no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS indices (
    id BIGSERIAL PRIMARY KEY,
    nota TEXT,
    area_operacional TEXT,
    cidade TEXT,
    codigo_medidas TEXT,
    descricao TEXT,
    texto_medidas TEXT,
    status_usuario TEXT,
    inicio_planejado TEXT,
    fim_planejado TEXT,
    concluido_por TEXT,
    concluida_em TEXT,
    modificado_por TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_indices_nota ON indices(nota);
CREATE INDEX IF NOT EXISTS idx_indices_cidade ON indices(cidade);
CREATE INDEX IF NOT EXISTS idx_indices_status ON indices(status_usuario);

-- Comentários das colunas
COMMENT ON TABLE indices IS 'Tabela para armazenar índices de gerenciamento de operações';
COMMENT ON COLUMN indices.nota IS 'Número ou código da nota';
COMMENT ON COLUMN indices.area_operacional IS 'Área operacional responsável';
COMMENT ON COLUMN indices.cidade IS 'Cidade relacionada ao índice';
COMMENT ON COLUMN indices.codigo_medidas IS 'Código das medidas aplicadas';
COMMENT ON COLUMN indices.descricao IS 'Descrição detalhada do índice';
COMMENT ON COLUMN indices.texto_medidas IS 'Texto descritivo das medidas';
COMMENT ON COLUMN indices.status_usuario IS 'Status atual do usuário/processo';
COMMENT ON COLUMN indices.inicio_planejado IS 'Data de início planejado';
COMMENT ON COLUMN indices.fim_planejado IS 'Data de fim planejado';
COMMENT ON COLUMN indices.concluido_por IS 'Usuário que concluiu a tarefa';
COMMENT ON COLUMN indices.concluida_em IS 'Data de conclusão';
COMMENT ON COLUMN indices.modificado_por IS 'Último usuário que modificou o registro';

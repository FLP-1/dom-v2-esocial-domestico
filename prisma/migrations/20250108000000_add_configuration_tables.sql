-- ========================================
-- MIGRAÇÃO: TABELAS DE CONFIGURAÇÃO DINÂMICA
-- ========================================
-- Esta migração cria tabelas para armazenar configurações
-- dinâmicas do sistema, eliminando hardcoded

-- Tabela para configurações gerais do sistema
CREATE TABLE IF NOT EXISTS configuracao_sistema (
  id VARCHAR(255) PRIMARY KEY,
  chave VARCHAR(255) UNIQUE NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para configurações específicas por perfil
CREATE TABLE IF NOT EXISTS configuracao_perfil (
  id VARCHAR(255) PRIMARY KEY,
  perfil_id VARCHAR(255) NOT NULL,
  chave VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (perfil_id) REFERENCES perfil(id) ON DELETE CASCADE,
  UNIQUE(perfil_id, chave)
);

-- Tabela para configurações de geolocalização
CREATE TABLE IF NOT EXISTS configuracao_geolocalizacao (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id VARCHAR(255),
  grupo_id VARCHAR(255),
  chave VARCHAR(255) NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE CASCADE
);

-- Tabela para configurações de antifraude
CREATE TABLE IF NOT EXISTS configuracao_antifraude (
  id VARCHAR(255) PRIMARY KEY,
  usuario_id VARCHAR(255),
  grupo_id VARCHAR(255),
  chave VARCHAR(255) NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_configuracao_sistema_categoria ON configuracao_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracao_sistema_ativo ON configuracao_sistema(ativo);
CREATE INDEX IF NOT EXISTS idx_configuracao_perfil_perfil_id ON configuracao_perfil(perfil_id);
CREATE INDEX IF NOT EXISTS idx_configuracao_perfil_ativo ON configuracao_perfil(ativo);
CREATE INDEX IF NOT EXISTS idx_configuracao_geolocalizacao_usuario_id ON configuracao_geolocalizacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_configuracao_geolocalizacao_grupo_id ON configuracao_geolocalizacao(grupo_id);
CREATE INDEX IF NOT EXISTS idx_configuracao_antifraude_usuario_id ON configuracao_antifraude(usuario_id);
CREATE INDEX IF NOT EXISTS idx_configuracao_antifraude_grupo_id ON configuracao_antifraude(grupo_id);

-- Inserir configurações padrão
INSERT INTO configuracao_sistema (id, chave, categoria, valor, descricao, ativo, prioridade) VALUES
('config-colors-primary', 'colors_primary', 'colors', '{"primary": "#29ABE2"}', 'Cor primária do sistema', true, 1),
('config-colors-secondary', 'colors_secondary', 'colors', '{"secondary": "#90EE90"}', 'Cor secundária do sistema', true, 2),
('config-colors-success', 'colors_success', 'colors', '{"success": "#10B981"}', 'Cor de sucesso', true, 3),
('config-colors-warning', 'colors_warning', 'colors', '{"warning": "#F59E0B"}', 'Cor de aviso', true, 4),
('config-colors-error', 'colors_error', 'colors', '{"error": "#EF4444"}', 'Cor de erro', true, 5),
('config-colors-info', 'colors_info', 'colors', '{"info": "#3B82F6"}', 'Cor de informação', true, 6),

('config-geolocation-max-distance', 'geolocation_max_distance', 'geolocation', '{"maxDistance": 200}', 'Distância máxima para validação de geolocalização (metros)', true, 1),
('config-geolocation-accuracy-threshold', 'geolocation_accuracy_threshold', 'geolocation', '{"accuracyThreshold": 100}', 'Limite de precisão para geolocalização (metros)', true, 2),
('config-geolocation-timeout', 'geolocation_timeout', 'geolocation', '{"timeout": 10000}', 'Timeout para geolocalização (milissegundos)', true, 3),

('config-antifraud-max-attempts', 'antifraud_max_attempts', 'antifraud', '{"maxAttempts": 3}', 'Número máximo de tentativas de antifraude', true, 1),
('config-antifraud-lockout-duration', 'antifraud_lockout_duration', 'antifraud', '{"lockoutDuration": 300000}', 'Duração do bloqueio por antifraude (milissegundos)', true, 2),
('config-antifraud-risk-threshold', 'antifraud_risk_threshold', 'antifraud', '{"riskThreshold": 0.7}', 'Limite de risco para antifraude', true, 3),

('config-urls-api', 'urls_api', 'urls', '{"api": "http://localhost:3000/api"}', 'URL base da API', true, 1),
('config-urls-esocial-homologacao', 'urls_esocial_homologacao', 'urls', '{"esocial": {"homologacao": "https://webservices.producaorestrita.esocial.gov.br"}}', 'URL do eSocial homologação', true, 2),
('config-urls-esocial-producao', 'urls_esocial_producao', 'urls', '{"esocial": {"producao": "https://webservices.envio.esocial.gov.br"}}', 'URL do eSocial produção', true, 3);

-- Inserir configurações específicas por perfil
INSERT INTO configuracao_perfil (id, perfil_id, chave, categoria, valor, descricao, ativo, prioridade) VALUES
('profile-empregado-colors', (SELECT id FROM perfil WHERE codigo = 'EMPREGADO'), 'colors', 'colors', '{"primary": "#29ABE2", "secondary": "#90EE90"}', 'Cores do perfil empregado', true, 1),
('profile-empregador-colors', (SELECT id FROM perfil WHERE codigo = 'EMPREGADOR'), 'colors', 'colors', '{"primary": "#E74C3C", "secondary": "#F39C12"}', 'Cores do perfil empregador', true, 1),
('profile-familia-colors', (SELECT id FROM perfil WHERE codigo = 'FAMILIA'), 'colors', 'colors', '{"primary": "#9B59B6", "secondary": "#E91E63"}', 'Cores do perfil família', true, 1),
('profile-admin-colors', (SELECT id FROM perfil WHERE codigo = 'ADMIN'), 'colors', 'colors', '{"primary": "#34495E", "secondary": "#2ECC71"}', 'Cores do perfil admin', true, 1);

-- Comentários das tabelas
COMMENT ON TABLE configuracao_sistema IS 'Configurações gerais do sistema';
COMMENT ON TABLE configuracao_perfil IS 'Configurações específicas por perfil de usuário';
COMMENT ON TABLE configuracao_geolocalizacao IS 'Configurações de geolocalização por usuário/grupo';
COMMENT ON TABLE configuracao_antifraude IS 'Configurações de antifraude por usuário/grupo';

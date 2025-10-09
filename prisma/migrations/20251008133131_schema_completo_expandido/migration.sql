-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "nomeCompleto" VARCHAR(255) NOT NULL,
    "apelido" VARCHAR(100),
    "dataNascimento" DATE NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "telefone" VARCHAR(11) NOT NULL,
    "telefoneVerificado" BOOLEAN NOT NULL DEFAULT false,
    "logradouro" VARCHAR(255),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "uf" VARCHAR(2),
    "cep" VARCHAR(8),
    "senhaHash" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(255) NOT NULL,
    "autenticacao2FA" BOOLEAN NOT NULL DEFAULT false,
    "secret2FA" VARCHAR(255),
    "refreshToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "codigoRecuperacao" VARCHAR(10),
    "codigoExpiraEm" TIMESTAMP(3),
    "biometriaAtiva" BOOLEAN NOT NULL DEFAULT false,
    "biometriaHash" TEXT,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "bloqueadoAte" TIMESTAMP(3),
    "motivoBloqueio" TEXT,
    "tentativasLogin" INTEGER NOT NULL DEFAULT 0,
    "ultimasTentativasLogin" JSONB,
    "ultimoAcesso" TIMESTAMP(3),
    "notificarNovoDispositivo" BOOLEAN NOT NULL DEFAULT true,
    "notificarLoginSuspeito" BOOLEAN NOT NULL DEFAULT true,
    "consentimentoLGPD" BOOLEAN NOT NULL DEFAULT false,
    "dataConsentimento" TIMESTAMP(3),
    "termosAceitos" BOOLEAN NOT NULL DEFAULT false,
    "versaoTermos" VARCHAR(20),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "cor" VARCHAR(7) NOT NULL,
    "icone" VARCHAR(50),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_perfis" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "avatar" VARCHAR(10),
    "apelido" VARCHAR(100),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionalidades" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "icone" VARCHAR(50),
    "rota" VARCHAR(255),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionalidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_funcionalidades" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "funcionalidadeId" TEXT NOT NULL,
    "permissaoLeitura" BOOLEAN NOT NULL DEFAULT true,
    "permissaoEscrita" BOOLEAN NOT NULL DEFAULT false,
    "permissaoExclusao" BOOLEAN NOT NULL DEFAULT false,
    "permissaoAdmin" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_funcionalidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "cor" VARCHAR(7),
    "icone" VARCHAR(50),
    "tipo" VARCHAR(50) NOT NULL,
    "privado" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_grupos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "papel" VARCHAR(50) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dispositivoId" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(255),
    "modelo" VARCHAR(255),
    "versaoSO" VARCHAR(100),
    "tipo" VARCHAR(50) NOT NULL,
    "nomeRedeWiFi" VARCHAR(255),
    "enderecoIP" VARCHAR(45),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "precisao" DOUBLE PRECISION,
    "confiavel" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoUso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dispositivoId" TEXT,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "enderecoIP" VARCHAR(45),
    "userAgent" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_login" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "tentativaNumero" INTEGER NOT NULL DEFAULT 1,
    "dispositivoId" TEXT,
    "enderecoIP" VARCHAR(45) NOT NULL,
    "userAgent" TEXT,
    "navegador" VARCHAR(100),
    "sistemaOperacional" VARCHAR(100),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "cidade" VARCHAR(100),
    "pais" VARCHAR(50),
    "motivoFalha" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validacoes_contato" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "valor" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "validadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validacoes_contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "etapaAtual" INTEGER NOT NULL DEFAULT 1,
    "etapasCompletas" JSONB NOT NULL,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "completoEm" TIMESTAMP(3),
    "preferencias" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convites" (
    "id" TEXT NOT NULL,
    "convidadoPor" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(11),
    "nome" VARCHAR(255),
    "perfilSugerido" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "aceitoEm" TIMESTAMP(3),
    "usuarioCriado" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "termos" (
    "id" TEXT NOT NULL,
    "versao" VARCHAR(20) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "subtitulo" VARCHAR(255),
    "conteudo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataVigencia" DATE NOT NULL,
    "dataExpiracao" DATE,
    "mudancas" JSONB,
    "anexos" JSONB,
    "notificarUsuarios" BOOLEAN NOT NULL DEFAULT false,
    "notificadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "termos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aceites_termos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "termoId" TEXT NOT NULL,
    "versao" VARCHAR(20) NOT NULL,
    "aceitoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enderecoIP" VARCHAR(45) NOT NULL,
    "userAgent" TEXT,
    "assinaturaHash" VARCHAR(255),

    CONSTRAINT "aceites_termos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(255),
    "descricao" TEXT,
    "avatar" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "ultimaMensagemId" TEXT,
    "ultimaMensagemEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas_participantes" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" VARCHAR(50) NOT NULL DEFAULT 'MEMBRO',
    "fixada" BOOLEAN NOT NULL DEFAULT false,
    "silenciada" BOOLEAN NOT NULL DEFAULT false,
    "notificacoes" BOOLEAN NOT NULL DEFAULT true,
    "ultimaLeitura" TIMESTAMP(3),
    "entradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saidaEm" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "apelidoLocal" VARCHAR(100),

    CONSTRAINT "conversas_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "respostaParaId" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "editada" BOOLEAN NOT NULL DEFAULT false,
    "excluida" BOOLEAN NOT NULL DEFAULT false,
    "fixada" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "excluidaEm" TIMESTAMP(3),

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_anexos" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duracao" INTEGER,
    "largura" INTEGER,
    "altura" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_leituras" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "lidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_leituras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_reacoes" (
    "id" TEXT NOT NULL,
    "mensagemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_reacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "urlPublica" TEXT,
    "hash" VARCHAR(255),
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "validadoEm" TIMESTAMP(3),
    "validadoPor" VARCHAR(255),
    "dataVencimento" TIMESTAMP(3),
    "alertaVencimento" BOOLEAN NOT NULL DEFAULT false,
    "permissao" VARCHAR(50) NOT NULL,
    "tags" TEXT[],
    "esocialPronto" BOOLEAN NOT NULL DEFAULT false,
    "backupCriado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_compartilhamento" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" VARCHAR(50) NOT NULL DEFAULT 'LEITURA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_compartilhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "prioridade" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "atribuidoPara" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "tags" TEXT[],
    "corLabel" VARCHAR(7),
    "tempoEstimado" INTEGER,
    "tempoGasto" INTEGER,
    "tarefaPaiId" TEXT,
    "checklist" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_anexos" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPor" TEXT NOT NULL,

    CONSTRAINT "tarefas_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_comentarios" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_dependencias" (
    "id" TEXT NOT NULL,
    "tarefaDependenteId" TEXT NOT NULL,
    "tarefaBloqueadoraId" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'FINISH_TO_START',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefas_dependencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_ponto" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "dataHora" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" VARCHAR(50) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "precisao" DOUBLE PRECISION NOT NULL,
    "dentroGeofence" BOOLEAN NOT NULL DEFAULT false,
    "enderecoIP" VARCHAR(45) NOT NULL,
    "nomeRedeWiFi" VARCHAR(255),
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "aprovadoPor" VARCHAR(255),
    "aprovadoEm" TIMESTAMP(3),
    "observacao" TEXT,
    "hashIntegridade" VARCHAR(255) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_ponto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_esocial" (
    "id" TEXT NOT NULL,
    "tipoEvento" VARCHAR(20) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "dataEnvio" TIMESTAMP(3),
    "dataProcessamento" TIMESTAMP(3),
    "protocolo" VARCHAR(255),
    "versao" VARCHAR(20),
    "xmlEnvio" TEXT,
    "xmlRetorno" TEXT,
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_esocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empregadores" (
    "id" TEXT NOT NULL,
    "cpfCnpj" VARCHAR(14) NOT NULL,
    "tipoInscricao" VARCHAR(4) NOT NULL DEFAULT 'CPF',
    "nome" VARCHAR(255) NOT NULL,
    "razaoSocial" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(11) NOT NULL,
    "logradouro" VARCHAR(255) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "uf" VARCHAR(2) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "ambienteESocial" VARCHAR(20) NOT NULL DEFAULT 'HOMOLOGACAO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empregadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_digitais" (
    "id" TEXT NOT NULL,
    "empregadorId" TEXT,
    "usuarioId" TEXT,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "tipo" VARCHAR(50) NOT NULL,
    "tipoDocumento" VARCHAR(100) NOT NULL,
    "cpfCnpjTitular" VARCHAR(14) NOT NULL,
    "nomeTitular" VARCHAR(255) NOT NULL,
    "numeroSerial" VARCHAR(255) NOT NULL,
    "emissor" VARCHAR(255) NOT NULL,
    "dataEmissao" DATE NOT NULL,
    "dataValidade" DATE NOT NULL,
    "algoritmo" VARCHAR(50) NOT NULL,
    "tamanhoChave" INTEGER NOT NULL,
    "thumbprint" VARCHAR(255) NOT NULL,
    "caminhoArquivo" VARCHAR(500) NOT NULL,
    "nomeArquivoOriginal" VARCHAR(255) NOT NULL,
    "tamanhoArquivo" INTEGER NOT NULL,
    "hashArquivo" VARCHAR(255) NOT NULL,
    "senhaHash" VARCHAR(255) NOT NULL,
    "senhaSalt" VARCHAR(255) NOT NULL,
    "senhaAlgoritmo" VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
    "criptografiaIV" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "dataRevogacao" TIMESTAMP(3),
    "motivoRevogacao" TEXT,
    "alertaVencimento" BOOLEAN NOT NULL DEFAULT true,
    "diasAntesAlerta" INTEGER NOT NULL DEFAULT 30,
    "ultimoUso" TIMESTAMP(3),
    "contagemUso" INTEGER NOT NULL DEFAULT 0,
    "finalidadeUso" TEXT,
    "consentimentoLGPD" BOOLEAN NOT NULL DEFAULT false,
    "dataConsentimentoLGPD" TIMESTAMP(3),
    "ipCadastro" VARCHAR(45),
    "ipUltimaAlteracao" VARCHAR(45),
    "usuarioCadastro" VARCHAR(255),
    "usuarioUltimaAlteracao" VARCHAR(255),
    "observacoes" TEXT,
    "metadata" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificados_digitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_historico" (
    "id" TEXT NOT NULL,
    "certificadoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "enderecoIP" VARCHAR(45) NOT NULL,
    "userAgent" TEXT,
    "localizacao" VARCHAR(255),
    "sucesso" BOOLEAN NOT NULL DEFAULT true,
    "mensagemErro" TEXT,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "motivoAcesso" TEXT,
    "autorizadoPor" VARCHAR(255),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empregadoId" TEXT,
    "tipo" VARCHAR(20),
    "valor" DECIMAL(10,2) NOT NULL,
    "valorParcela" DECIMAL(10,2) NOT NULL,
    "quantidadeParcelas" INTEGER NOT NULL,
    "parcelasPagas" INTEGER NOT NULL DEFAULT 0,
    "taxaJuros" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "dataConcessao" DATE NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAprovacao" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL,
    "observacao" TEXT,
    "justificativa" TEXT,
    "aprovadoPor" VARCHAR(255),
    "motivoRejeicao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "prioridade" VARCHAR(20) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "dataAlerta" TIMESTAMP(3) NOT NULL,
    "dataExpiracao" TIMESTAMP(3),
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "frequencia" VARCHAR(50),
    "textoNotificacao" TEXT,
    "gatilhoContador" INTEGER NOT NULL DEFAULT 0,
    "ultimoGatilho" TIMESTAMP(3),
    "notificarEmail" BOOLEAN NOT NULL DEFAULT false,
    "notificarPush" BOOLEAN NOT NULL DEFAULT false,
    "notificarSMS" BOOLEAN NOT NULL DEFAULT false,
    "horaAlerta" VARCHAR(5),
    "condicoes" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_historico" (
    "id" TEXT NOT NULL,
    "alertaId" TEXT NOT NULL,
    "disparadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinatarios" TEXT[],
    "canal" VARCHAR(50) NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "erro" TEXT,
    "valorGatilho" JSONB,

    CONSTRAINT "alertas_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas_compras" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "totalItens" INTEGER NOT NULL DEFAULT 0,
    "itensComprados" INTEGER NOT NULL DEFAULT 0,
    "valorEstimado" DECIMAL(10,2) NOT NULL,
    "valorFinal" DECIMAL(10,2),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listas_compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_compra" (
    "id" TEXT NOT NULL,
    "listaId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "quantidade" VARCHAR(100) NOT NULL,
    "preco" DECIMAL(10,2),
    "categoria" VARCHAR(100) NOT NULL,
    "comprado" BOOLEAN NOT NULL DEFAULT false,
    "compradoEm" TIMESTAMP(3),
    "compradoPor" VARCHAR(255),
    "observacao" TEXT,
    "marca" VARCHAR(100),
    "local" VARCHAR(255),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas_compras_compartilhamento" (
    "id" TEXT NOT NULL,
    "listaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissao" VARCHAR(50) NOT NULL DEFAULT 'LEITURA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_compras_compartilhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculos_salariais" (
    "id" TEXT NOT NULL,
    "cpfEmpregado" VARCHAR(11) NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "salarioBruto" DECIMAL(10,2) NOT NULL,
    "descontos" JSONB NOT NULL,
    "proventos" JSONB NOT NULL,
    "salarioLiquido" DECIMAL(10,2) NOT NULL,
    "baseINSS" DECIMAL(10,2) NOT NULL,
    "valorINSS" DECIMAL(10,2) NOT NULL,
    "baseIR" DECIMAL(10,2) NOT NULL,
    "valorIR" DECIMAL(10,2) NOT NULL,
    "horasTrabalhadas" INTEGER,
    "horasExtras" INTEGER,
    "valorHoraExtra" DECIMAL(10,2),
    "valeTransporte" DECIMAL(10,2),
    "valeAlimentacao" DECIMAL(10,2),
    "planoSaude" DECIMAL(10,2),
    "diasFalta" INTEGER DEFAULT 0,
    "valorFaltas" DECIMAL(10,2),
    "processado" BOOLEAN NOT NULL DEFAULT false,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculos_salariais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holerites_pagamento" (
    "id" TEXT NOT NULL,
    "calculoId" TEXT NOT NULL,
    "numeroHolerite" VARCHAR(50) NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "enviadoEm" TIMESTAMP(3),
    "visualizado" BOOLEAN NOT NULL DEFAULT false,
    "visualizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holerites_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_assinatura" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tagline" VARCHAR(255) NOT NULL,
    "descricao" TEXT NOT NULL,
    "precoMensal" DECIMAL(10,2) NOT NULL,
    "precoAnual" DECIMAL(10,2) NOT NULL,
    "descontoAnual" VARCHAR(50),
    "recursos" TEXT[],
    "limitesRecursos" JSONB,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "recomendado" BOOLEAN NOT NULL DEFAULT false,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "parceria" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "tipoCobranca" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "inicioEm" TIMESTAMP(3) NOT NULL,
    "fimEm" TIMESTAMP(3),
    "canceladaEm" TIMESTAMP(3),
    "proximaCobrancaEm" TIMESTAMP(3),
    "valorAtual" DECIMAL(10,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" VARCHAR(100) NOT NULL,
    "entidade" VARCHAR(100) NOT NULL,
    "entidadeId" VARCHAR(255),
    "descricao" TEXT NOT NULL,
    "metodo" VARCHAR(20),
    "rota" VARCHAR(255),
    "enderecoIP" VARCHAR(45),
    "userAgent" TEXT,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "sucesso" BOOLEAN NOT NULL DEFAULT true,
    "erro" TEXT,
    "tipoLog" VARCHAR(50) NOT NULL,
    "nivelSeveridade" VARCHAR(20) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "sensivel" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estatisticas_sistema" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(100) NOT NULL,
    "tipoDado" VARCHAR(50) NOT NULL,
    "atualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estatisticas_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membros_familia" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "parentesco" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11),
    "dataNascimento" DATE,
    "telefone" VARCHAR(11),
    "email" VARCHAR(255),
    "endereco" JSONB,
    "contatoEmergencia" BOOLEAN NOT NULL DEFAULT false,
    "responsavelFinanceiro" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" VARCHAR(255),
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "usuarioVinculado" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membros_familia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_paginas" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipoPagina" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "tags" TEXT[],
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "ultimaModificacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoPor" VARCHAR(255),
    "versao" VARCHAR(20) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dados_paginas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "prioridade" VARCHAR(20) NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "enviada" BOOLEAN NOT NULL DEFAULT false,
    "dadosAcao" JSONB,
    "dataEnvio" TIMESTAMP(3),
    "dataLeitura" TIMESTAMP(3),
    "dataExpiracao" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folha_pagamento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empregadoId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "salarioBase" DECIMAL(10,2) NOT NULL,
    "horasTrabalhadas" INTEGER NOT NULL,
    "horasExtras" INTEGER NOT NULL DEFAULT 0,
    "faltas" INTEGER NOT NULL DEFAULT 0,
    "atestados" INTEGER NOT NULL DEFAULT 0,
    "descontos" DECIMAL(10,2) NOT NULL,
    "adicionais" DECIMAL(10,2) NOT NULL,
    "salarioLiquido" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folha_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_impostos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vencimento" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_impostos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metricas_sistema" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" INTEGER NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(100) NOT NULL,
    "dadosExtras" JSONB,
    "atualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metricas_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade_recente" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "usuarioId" TEXT,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividade_recente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_sistema" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "descricao" VARCHAR(255),
    "categoria" VARCHAR(100) NOT NULL,
    "editavel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_teste" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(500),
    "dados" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_comunicacao" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "assunto" VARCHAR(255),
    "conteudo" TEXT NOT NULL,
    "variaveis" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_comunicacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_cpf_idx" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_telefone_idx" ON "usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_codigo_key" ON "perfis"("codigo");

-- CreateIndex
CREATE INDEX "usuarios_perfis_usuarioId_idx" ON "usuarios_perfis"("usuarioId");

-- CreateIndex
CREATE INDEX "usuarios_perfis_perfilId_idx" ON "usuarios_perfis"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_perfis_usuarioId_perfilId_key" ON "usuarios_perfis"("usuarioId", "perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "funcionalidades_codigo_key" ON "funcionalidades"("codigo");

-- CreateIndex
CREATE INDEX "perfis_funcionalidades_perfilId_idx" ON "perfis_funcionalidades"("perfilId");

-- CreateIndex
CREATE INDEX "perfis_funcionalidades_funcionalidadeId_idx" ON "perfis_funcionalidades"("funcionalidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_funcionalidades_perfilId_funcionalidadeId_key" ON "perfis_funcionalidades"("perfilId", "funcionalidadeId");

-- CreateIndex
CREATE INDEX "usuarios_grupos_usuarioId_idx" ON "usuarios_grupos"("usuarioId");

-- CreateIndex
CREATE INDEX "usuarios_grupos_grupoId_idx" ON "usuarios_grupos"("grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_grupos_usuarioId_grupoId_key" ON "usuarios_grupos"("usuarioId", "grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_dispositivoId_key" ON "dispositivos"("dispositivoId");

-- CreateIndex
CREATE INDEX "dispositivos_usuarioId_idx" ON "dispositivos"("usuarioId");

-- CreateIndex
CREATE INDEX "dispositivos_dispositivoId_idx" ON "dispositivos"("dispositivoId");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_key" ON "sessoes"("token");

-- CreateIndex
CREATE INDEX "sessoes_usuarioId_idx" ON "sessoes"("usuarioId");

-- CreateIndex
CREATE INDEX "sessoes_token_idx" ON "sessoes"("token");

-- CreateIndex
CREATE INDEX "historico_login_usuarioId_idx" ON "historico_login"("usuarioId");

-- CreateIndex
CREATE INDEX "historico_login_criadoEm_idx" ON "historico_login"("criadoEm");

-- CreateIndex
CREATE INDEX "historico_login_sucesso_idx" ON "historico_login"("sucesso");

-- CreateIndex
CREATE INDEX "validacoes_contato_usuarioId_idx" ON "validacoes_contato"("usuarioId");

-- CreateIndex
CREATE INDEX "validacoes_contato_codigo_idx" ON "validacoes_contato"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_usuarioId_key" ON "onboarding"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "convites_token_key" ON "convites"("token");

-- CreateIndex
CREATE INDEX "convites_token_idx" ON "convites"("token");

-- CreateIndex
CREATE INDEX "convites_email_idx" ON "convites"("email");

-- CreateIndex
CREATE INDEX "convites_status_idx" ON "convites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "termos_versao_key" ON "termos"("versao");

-- CreateIndex
CREATE INDEX "termos_versao_idx" ON "termos"("versao");

-- CreateIndex
CREATE INDEX "aceites_termos_usuarioId_idx" ON "aceites_termos"("usuarioId");

-- CreateIndex
CREATE INDEX "aceites_termos_termoId_idx" ON "aceites_termos"("termoId");

-- CreateIndex
CREATE UNIQUE INDEX "aceites_termos_usuarioId_termoId_versao_key" ON "aceites_termos"("usuarioId", "termoId", "versao");

-- CreateIndex
CREATE INDEX "conversas_participantes_conversaId_idx" ON "conversas_participantes"("conversaId");

-- CreateIndex
CREATE INDEX "conversas_participantes_usuarioId_idx" ON "conversas_participantes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_participantes_conversaId_usuarioId_key" ON "conversas_participantes"("conversaId", "usuarioId");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_idx" ON "mensagens"("conversaId");

-- CreateIndex
CREATE INDEX "mensagens_remetenteId_idx" ON "mensagens"("remetenteId");

-- CreateIndex
CREATE INDEX "mensagens_criadoEm_idx" ON "mensagens"("criadoEm");

-- CreateIndex
CREATE INDEX "mensagens_anexos_mensagemId_idx" ON "mensagens_anexos"("mensagemId");

-- CreateIndex
CREATE INDEX "mensagens_leituras_mensagemId_idx" ON "mensagens_leituras"("mensagemId");

-- CreateIndex
CREATE INDEX "mensagens_leituras_usuarioId_idx" ON "mensagens_leituras"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_leituras_mensagemId_usuarioId_key" ON "mensagens_leituras"("mensagemId", "usuarioId");

-- CreateIndex
CREATE INDEX "mensagens_reacoes_mensagemId_idx" ON "mensagens_reacoes"("mensagemId");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_reacoes_mensagemId_usuarioId_emoji_key" ON "mensagens_reacoes"("mensagemId", "usuarioId", "emoji");

-- CreateIndex
CREATE INDEX "documentos_usuarioId_idx" ON "documentos"("usuarioId");

-- CreateIndex
CREATE INDEX "documentos_categoria_idx" ON "documentos"("categoria");

-- CreateIndex
CREATE INDEX "documentos_compartilhamento_documentoId_idx" ON "documentos_compartilhamento"("documentoId");

-- CreateIndex
CREATE INDEX "documentos_compartilhamento_usuarioId_idx" ON "documentos_compartilhamento"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_compartilhamento_documentoId_usuarioId_key" ON "documentos_compartilhamento"("documentoId", "usuarioId");

-- CreateIndex
CREATE INDEX "tarefas_atribuidoPara_idx" ON "tarefas"("atribuidoPara");

-- CreateIndex
CREATE INDEX "tarefas_criadoPor_idx" ON "tarefas"("criadoPor");

-- CreateIndex
CREATE INDEX "tarefas_status_idx" ON "tarefas"("status");

-- CreateIndex
CREATE INDEX "tarefas_anexos_tarefaId_idx" ON "tarefas_anexos"("tarefaId");

-- CreateIndex
CREATE INDEX "tarefas_comentarios_tarefaId_idx" ON "tarefas_comentarios"("tarefaId");

-- CreateIndex
CREATE UNIQUE INDEX "tarefas_dependencias_tarefaDependenteId_tarefaBloqueadoraId_key" ON "tarefas_dependencias"("tarefaDependenteId", "tarefaBloqueadoraId");

-- CreateIndex
CREATE INDEX "registros_ponto_usuarioId_idx" ON "registros_ponto"("usuarioId");

-- CreateIndex
CREATE INDEX "registros_ponto_dataHora_idx" ON "registros_ponto"("dataHora");

-- CreateIndex
CREATE INDEX "registros_ponto_tipo_idx" ON "registros_ponto"("tipo");

-- CreateIndex
CREATE INDEX "eventos_esocial_tipoEvento_idx" ON "eventos_esocial"("tipoEvento");

-- CreateIndex
CREATE INDEX "eventos_esocial_status_idx" ON "eventos_esocial"("status");

-- CreateIndex
CREATE UNIQUE INDEX "empregadores_cpfCnpj_key" ON "empregadores"("cpfCnpj");

-- CreateIndex
CREATE INDEX "empregadores_cpfCnpj_idx" ON "empregadores"("cpfCnpj");

-- CreateIndex
CREATE INDEX "empregadores_ativo_idx" ON "empregadores"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_digitais_numeroSerial_key" ON "certificados_digitais"("numeroSerial");

-- CreateIndex
CREATE INDEX "certificados_digitais_empregadorId_idx" ON "certificados_digitais"("empregadorId");

-- CreateIndex
CREATE INDEX "certificados_digitais_usuarioId_idx" ON "certificados_digitais"("usuarioId");

-- CreateIndex
CREATE INDEX "certificados_digitais_tipo_idx" ON "certificados_digitais"("tipo");

-- CreateIndex
CREATE INDEX "certificados_digitais_dataValidade_idx" ON "certificados_digitais"("dataValidade");

-- CreateIndex
CREATE INDEX "certificados_digitais_ativo_idx" ON "certificados_digitais"("ativo");

-- CreateIndex
CREATE INDEX "certificados_digitais_numeroSerial_idx" ON "certificados_digitais"("numeroSerial");

-- CreateIndex
CREATE INDEX "certificados_historico_certificadoId_idx" ON "certificados_historico"("certificadoId");

-- CreateIndex
CREATE INDEX "certificados_historico_usuarioId_idx" ON "certificados_historico"("usuarioId");

-- CreateIndex
CREATE INDEX "certificados_historico_acao_idx" ON "certificados_historico"("acao");

-- CreateIndex
CREATE INDEX "certificados_historico_criadoEm_idx" ON "certificados_historico"("criadoEm");

-- CreateIndex
CREATE INDEX "emprestimos_usuarioId_idx" ON "emprestimos"("usuarioId");

-- CreateIndex
CREATE INDEX "emprestimos_empregadoId_idx" ON "emprestimos"("empregadoId");

-- CreateIndex
CREATE INDEX "emprestimos_status_idx" ON "emprestimos"("status");

-- CreateIndex
CREATE INDEX "emprestimos_tipo_idx" ON "emprestimos"("tipo");

-- CreateIndex
CREATE INDEX "alertas_usuarioId_idx" ON "alertas"("usuarioId");

-- CreateIndex
CREATE INDEX "alertas_tipo_idx" ON "alertas"("tipo");

-- CreateIndex
CREATE INDEX "alertas_status_idx" ON "alertas"("status");

-- CreateIndex
CREATE INDEX "alertas_historico_alertaId_idx" ON "alertas_historico"("alertaId");

-- CreateIndex
CREATE INDEX "alertas_historico_disparadoEm_idx" ON "alertas_historico"("disparadoEm");

-- CreateIndex
CREATE INDEX "listas_compras_usuarioId_idx" ON "listas_compras"("usuarioId");

-- CreateIndex
CREATE INDEX "listas_compras_categoria_idx" ON "listas_compras"("categoria");

-- CreateIndex
CREATE INDEX "itens_compra_listaId_idx" ON "itens_compra"("listaId");

-- CreateIndex
CREATE INDEX "itens_compra_comprado_idx" ON "itens_compra"("comprado");

-- CreateIndex
CREATE INDEX "itens_compra_categoria_idx" ON "itens_compra"("categoria");

-- CreateIndex
CREATE INDEX "listas_compras_compartilhamento_listaId_idx" ON "listas_compras_compartilhamento"("listaId");

-- CreateIndex
CREATE INDEX "listas_compras_compartilhamento_usuarioId_idx" ON "listas_compras_compartilhamento"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "listas_compras_compartilhamento_listaId_usuarioId_key" ON "listas_compras_compartilhamento"("listaId", "usuarioId");

-- CreateIndex
CREATE INDEX "calculos_salariais_cpfEmpregado_idx" ON "calculos_salariais"("cpfEmpregado");

-- CreateIndex
CREATE UNIQUE INDEX "calculos_salariais_cpfEmpregado_mesReferencia_anoReferencia_key" ON "calculos_salariais"("cpfEmpregado", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "holerites_pagamento_numeroHolerite_key" ON "holerites_pagamento"("numeroHolerite");

-- CreateIndex
CREATE INDEX "holerites_pagamento_calculoId_idx" ON "holerites_pagamento"("calculoId");

-- CreateIndex
CREATE UNIQUE INDEX "planos_assinatura_codigo_key" ON "planos_assinatura"("codigo");

-- CreateIndex
CREATE INDEX "assinaturas_usuarioId_idx" ON "assinaturas"("usuarioId");

-- CreateIndex
CREATE INDEX "assinaturas_status_idx" ON "assinaturas"("status");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuarioId_idx" ON "logs_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_auditoria_acao_idx" ON "logs_auditoria"("acao");

-- CreateIndex
CREATE INDEX "logs_auditoria_entidade_idx" ON "logs_auditoria"("entidade");

-- CreateIndex
CREATE INDEX "logs_auditoria_criadoEm_idx" ON "logs_auditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "logs_auditoria_tipoLog_idx" ON "logs_auditoria"("tipoLog");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- CreateIndex
CREATE INDEX "configuracoes_chave_idx" ON "configuracoes"("chave");

-- CreateIndex
CREATE INDEX "configuracoes_categoria_idx" ON "configuracoes"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "estatisticas_sistema_chave_key" ON "estatisticas_sistema"("chave");

-- CreateIndex
CREATE INDEX "estatisticas_sistema_chave_idx" ON "estatisticas_sistema"("chave");

-- CreateIndex
CREATE INDEX "estatisticas_sistema_categoria_idx" ON "estatisticas_sistema"("categoria");

-- CreateIndex
CREATE INDEX "membros_familia_usuarioId_idx" ON "membros_familia"("usuarioId");

-- CreateIndex
CREATE INDEX "membros_familia_parentesco_idx" ON "membros_familia"("parentesco");

-- CreateIndex
CREATE INDEX "membros_familia_usuarioVinculado_idx" ON "membros_familia"("usuarioVinculado");

-- CreateIndex
CREATE UNIQUE INDEX "dados_paginas_slug_key" ON "dados_paginas"("slug");

-- CreateIndex
CREATE INDEX "dados_paginas_slug_idx" ON "dados_paginas"("slug");

-- CreateIndex
CREATE INDEX "dados_paginas_tipoPagina_idx" ON "dados_paginas"("tipoPagina");

-- CreateIndex
CREATE INDEX "dados_paginas_categoria_idx" ON "dados_paginas"("categoria");

-- CreateIndex
CREATE INDEX "notificacoes_usuarioId_idx" ON "notificacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "notificacoes_tipo_idx" ON "notificacoes"("tipo");

-- CreateIndex
CREATE INDEX "notificacoes_categoria_idx" ON "notificacoes"("categoria");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "notificacoes_dataEnvio_idx" ON "notificacoes"("dataEnvio");

-- CreateIndex
CREATE INDEX "folha_pagamento_usuarioId_idx" ON "folha_pagamento"("usuarioId");

-- CreateIndex
CREATE INDEX "folha_pagamento_empregadoId_idx" ON "folha_pagamento"("empregadoId");

-- CreateIndex
CREATE INDEX "folha_pagamento_mes_ano_idx" ON "folha_pagamento"("mes", "ano");

-- CreateIndex
CREATE INDEX "folha_pagamento_status_idx" ON "folha_pagamento"("status");

-- CreateIndex
CREATE INDEX "guias_impostos_usuarioId_idx" ON "guias_impostos"("usuarioId");

-- CreateIndex
CREATE INDEX "guias_impostos_tipo_idx" ON "guias_impostos"("tipo");

-- CreateIndex
CREATE INDEX "guias_impostos_mes_ano_idx" ON "guias_impostos"("mes", "ano");

-- CreateIndex
CREATE INDEX "guias_impostos_status_idx" ON "guias_impostos"("status");

-- CreateIndex
CREATE UNIQUE INDEX "metricas_sistema_chave_key" ON "metricas_sistema"("chave");

-- CreateIndex
CREATE INDEX "metricas_sistema_chave_idx" ON "metricas_sistema"("chave");

-- CreateIndex
CREATE INDEX "metricas_sistema_categoria_idx" ON "metricas_sistema"("categoria");

-- CreateIndex
CREATE INDEX "atividade_recente_usuarioId_idx" ON "atividade_recente"("usuarioId");

-- CreateIndex
CREATE INDEX "atividade_recente_tipo_idx" ON "atividade_recente"("tipo");

-- CreateIndex
CREATE INDEX "atividade_recente_criadoEm_idx" ON "atividade_recente"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_sistema_chave_key" ON "configuracao_sistema"("chave");

-- CreateIndex
CREATE INDEX "configuracao_sistema_categoria_idx" ON "configuracao_sistema"("categoria");

-- CreateIndex
CREATE INDEX "configuracao_sistema_chave_idx" ON "configuracao_sistema"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_teste_nome_key" ON "configuracao_teste"("nome");

-- CreateIndex
CREATE INDEX "configuracao_teste_ativo_idx" ON "configuracao_teste"("ativo");

-- CreateIndex
CREATE INDEX "template_comunicacao_nome_idx" ON "template_comunicacao"("nome");

-- CreateIndex
CREATE INDEX "template_comunicacao_tipo_idx" ON "template_comunicacao"("tipo");

-- CreateIndex
CREATE INDEX "template_comunicacao_ativo_idx" ON "template_comunicacao"("ativo");

-- AddForeignKey
ALTER TABLE "usuarios_perfis" ADD CONSTRAINT "usuarios_perfis_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_perfis" ADD CONSTRAINT "usuarios_perfis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_funcionalidades" ADD CONSTRAINT "perfis_funcionalidades_funcionalidadeId_fkey" FOREIGN KEY ("funcionalidadeId") REFERENCES "funcionalidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_funcionalidades" ADD CONSTRAINT "perfis_funcionalidades_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_grupos" ADD CONSTRAINT "usuarios_grupos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_grupos" ADD CONSTRAINT "usuarios_grupos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_login" ADD CONSTRAINT "historico_login_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validacoes_contato" ADD CONSTRAINT "validacoes_contato_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_convidadoPor_fkey" FOREIGN KEY ("convidadoPor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aceites_termos" ADD CONSTRAINT "aceites_termos_termoId_fkey" FOREIGN KEY ("termoId") REFERENCES "termos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aceites_termos" ADD CONSTRAINT "aceites_termos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_participantes" ADD CONSTRAINT "conversas_participantes_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_participantes" ADD CONSTRAINT "conversas_participantes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_respostaParaId_fkey" FOREIGN KEY ("respostaParaId") REFERENCES "mensagens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_anexos" ADD CONSTRAINT "mensagens_anexos_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "mensagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_leituras" ADD CONSTRAINT "mensagens_leituras_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "mensagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_leituras" ADD CONSTRAINT "mensagens_leituras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_reacoes" ADD CONSTRAINT "mensagens_reacoes_mensagemId_fkey" FOREIGN KEY ("mensagemId") REFERENCES "mensagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_reacoes" ADD CONSTRAINT "mensagens_reacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_compartilhamento" ADD CONSTRAINT "documentos_compartilhamento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_compartilhamento" ADD CONSTRAINT "documentos_compartilhamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_atribuidoPara_fkey" FOREIGN KEY ("atribuidoPara") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_tarefaPaiId_fkey" FOREIGN KEY ("tarefaPaiId") REFERENCES "tarefas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_anexos" ADD CONSTRAINT "tarefas_anexos_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_comentarios" ADD CONSTRAINT "tarefas_comentarios_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_comentarios" ADD CONSTRAINT "tarefas_comentarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_dependencias" ADD CONSTRAINT "tarefas_dependencias_tarefaBloqueadoraId_fkey" FOREIGN KEY ("tarefaBloqueadoraId") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_dependencias" ADD CONSTRAINT "tarefas_dependencias_tarefaDependenteId_fkey" FOREIGN KEY ("tarefaDependenteId") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "dispositivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_digitais" ADD CONSTRAINT "certificados_digitais_empregadorId_fkey" FOREIGN KEY ("empregadorId") REFERENCES "empregadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_historico" ADD CONSTRAINT "certificados_historico_certificadoId_fkey" FOREIGN KEY ("certificadoId") REFERENCES "certificados_digitais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_empregadoId_fkey" FOREIGN KEY ("empregadoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_historico" ADD CONSTRAINT "alertas_historico_alertaId_fkey" FOREIGN KEY ("alertaId") REFERENCES "alertas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_compras" ADD CONSTRAINT "listas_compras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_compra" ADD CONSTRAINT "itens_compra_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "listas_compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_compras_compartilhamento" ADD CONSTRAINT "listas_compras_compartilhamento_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "listas_compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_compras_compartilhamento" ADD CONSTRAINT "listas_compras_compartilhamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holerites_pagamento" ADD CONSTRAINT "holerites_pagamento_calculoId_fkey" FOREIGN KEY ("calculoId") REFERENCES "calculos_salariais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos_assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_familia" ADD CONSTRAINT "membros_familia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_familia" ADD CONSTRAINT "membros_familia_usuarioVinculado_fkey" FOREIGN KEY ("usuarioVinculado") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folha_pagamento" ADD CONSTRAINT "folha_pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_impostos" ADD CONSTRAINT "guias_impostos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_recente" ADD CONSTRAINT "atividade_recente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

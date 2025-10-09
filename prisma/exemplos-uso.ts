/**
 * 📚 Exemplos de Uso - Prisma ORM
 * Sistema DOM v2.2.1
 * 
 * Este arquivo contém exemplos práticos de uso do Prisma
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==========================================
// 1️⃣ CRIAÇÃO DE USUÁRIO COMPLETO
// ==========================================

async function criarUsuarioCompleto() {
  try {
    // Dados sem máscara
    const cpfLimpo = '12345678901' // Já sem máscara
    const telefoneLimpo = '11999999999' // Já sem máscara
    const cepLimpo = '01234567' // Já sem máscara

    const usuario = await prisma.usuario.create({
      data: {
        // Dados obrigatórios
        cpf: cpfLimpo,
        nomeCompleto: 'João da Silva',
        apelido: 'João',
        dataNascimento: new Date('1990-01-15'),
        email: 'joao@email.com',
        telefone: telefoneLimpo,
        
        // Endereço
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: cepLimpo,
        
        // Autenticação
        senhaHash: 'hash_da_senha_aqui',
        salt: 'salt_aqui',
        
        // LGPD
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.1.0',
        
        // Relações - Criar perfil junto
        perfis: {
          create: {
            perfilId: 'id-do-perfil-empregado',
            avatar: 'JS',
            apelido: 'João',
            principal: true,
          }
        }
      },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        }
      }
    })

    console.log('✅ Usuário criado:', usuario)
    return usuario

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    throw error
  }
}

// ==========================================
// 2️⃣ ADICIONAR PERFIL A USUÁRIO EXISTENTE
// ==========================================

async function adicionarPerfil(usuarioId: string, perfilId: string) {
  try {
    // Verifica se o usuário já tem esse perfil
    const perfilExistente = await prisma.usuarioPerfil.findUnique({
      where: {
        usuarioId_perfilId: {
          usuarioId,
          perfilId,
        }
      }
    })

    if (perfilExistente) {
      throw new Error('Usuário já possui este perfil')
    }

    // Cria novo perfil para o usuário
    const novoPerfil = await prisma.usuarioPerfil.create({
      data: {
        usuarioId,
        perfilId,
        avatar: 'XX',
        ativo: true,
        principal: false,
      },
      include: {
        perfil: true,
        usuario: {
          select: {
            cpf: true,
            nomeCompleto: true,
          }
        }
      }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'CREATE',
        entidade: 'UsuarioPerfil',
        entidadeId: novoPerfil.id,
        descricao: `Novo perfil ${novoPerfil.perfil.nome} adicionado ao usuário`,
        tipoLog: 'DATA_MODIFICATION',
        nivelSeveridade: 'INFO',
        sucesso: true,
      }
    })

    console.log('✅ Perfil adicionado:', novoPerfil)
    return novoPerfil

  } catch (error) {
    console.error('❌ Erro ao adicionar perfil:', error)
    throw error
  }
}

// ==========================================
// 3️⃣ ADICIONAR USUÁRIO A GRUPO (SEM DUPLICIDADE)
// ==========================================

async function adicionarUsuarioAoGrupo(usuarioId: string, grupoId: string) {
  try {
    // Verifica duplicidade
    const jaNoGrupo = await prisma.usuarioGrupo.findUnique({
      where: {
        usuarioId_grupoId: {
          usuarioId,
          grupoId,
        }
      }
    })

    if (jaNoGrupo) {
      throw new Error('Usuário já está neste grupo')
    }

    // Adiciona ao grupo
    const membroGrupo = await prisma.usuarioGrupo.create({
      data: {
        usuarioId,
        grupoId,
        papel: 'MEMBRO',
        ativo: true,
      },
      include: {
        usuario: {
          select: {
            cpf: true,
            nomeCompleto: true,
          }
        },
        grupo: true,
      }
    })

    console.log('✅ Usuário adicionado ao grupo:', membroGrupo)
    return membroGrupo

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário ao grupo:', error)
    throw error
  }
}

// ==========================================
// 4️⃣ REGISTRO DE PONTO COM ANTI-FRAUDE
// ==========================================

async function registrarPonto(
  usuarioId: string,
  dispositivoId: string,
  tipo: 'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM',
  geolocalizacao: { latitude: number, longitude: number, precisao: number },
  dadosDispositivo: { ip: string, nomeRedeWiFi?: string }
) {
  try {
    // 1. Verificar se dispositivo é confiável
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id: dispositivoId }
    })

    if (!dispositivo || !dispositivo.confiavel) {
      throw new Error('Dispositivo não confiável')
    }

    // 2. Verificar geofence (exemplo simplificado)
    const dentroGeofence = verificarGeofence(
      geolocalizacao.latitude,
      geolocalizacao.longitude
    )

    // 3. Criar hash de integridade
    const hashIntegridade = criarHashIntegridade({
      usuarioId,
      dataHora: new Date(),
      tipo,
      ...geolocalizacao,
      ...dadosDispositivo,
    })

    // 4. Registrar ponto (SEMPRE com hora do servidor)
    const registroPonto = await prisma.registroPonto.create({
      data: {
        usuarioId,
        dispositivoId,
        dataHora: new Date(), // ⚠️ SEMPRE DO SERVIDOR
        tipo,
        latitude: geolocalizacao.latitude,
        longitude: geolocalizacao.longitude,
        precisao: geolocalizacao.precisao,
        dentroGeofence,
        enderecoIP: dadosDispositivo.ip,
        nomeRedeWiFi: dadosDispositivo.nomeRedeWiFi,
        hashIntegridade,
        aprovado: false, // Precisa aprovação
      },
      include: {
        usuario: {
          select: {
            cpf: true,
            nomeCompleto: true,
          }
        }
      }
    })

    // 5. Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'CREATE',
        entidade: 'RegistroPonto',
        entidadeId: registroPonto.id,
        descricao: `Registro de ponto: ${tipo}`,
        enderecoIP: dadosDispositivo.ip,
        tipoLog: 'DATA_MODIFICATION',
        nivelSeveridade: 'INFO',
        sucesso: true,
        dadosNovos: {
          tipo,
          dataHora: registroPonto.dataHora,
          dentroGeofence,
        }
      }
    })

    console.log('✅ Ponto registrado:', registroPonto)
    return registroPonto

  } catch (error) {
    console.error('❌ Erro ao registrar ponto:', error)
    throw error
  }
}

// Funções auxiliares
function verificarGeofence(lat: number, lng: number): boolean {
  // Implementar lógica de geofence
  // Exemplo: verificar se está dentro de um raio de X metros
  return true
}

function criarHashIntegridade(dados: any): string {
  // Implementar criação de hash com crypto
  // Exemplo: SHA-256 dos dados
  return 'hash_exemplo'
}

// ==========================================
// 5️⃣ BUSCAR USUÁRIO COM TODOS OS DADOS
// ==========================================

async function buscarUsuarioCompleto(cpf: string) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: {
        perfis: {
          include: {
            perfil: {
              include: {
                permissoes: {
                  include: {
                    funcionalidade: true
                  }
                }
              }
            }
          }
        },
        gruposUsuario: {
          include: {
            grupo: true
          }
        },
        dispositivos: true,
        documentos: {
          where: {
            validado: true
          }
        },
        tarefas: {
          where: {
            status: 'PENDING'
          }
        },
      }
    })

    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Log de acesso (LGPD)
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: 'READ',
        entidade: 'Usuario',
        entidadeId: usuario.id,
        descricao: 'Acesso aos dados completos do usuário',
        tipoLog: 'LGPD',
        nivelSeveridade: 'INFO',
        sucesso: true,
      }
    })

    return usuario

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error)
    throw error
  }
}

// ==========================================
// 6️⃣ VERIFICAR PERMISSÕES DO USUÁRIO
// ==========================================

async function verificarPermissao(
  usuarioId: string,
  funcionalidadeCodigo: string,
  tipoPermissao: 'leitura' | 'escrita' | 'exclusao' | 'admin'
) {
  try {
    // Buscar perfis do usuário
    const usuarioPerfis = await prisma.usuarioPerfil.findMany({
      where: {
        usuarioId,
        ativo: true,
      },
      include: {
        perfil: {
          include: {
            permissoes: {
              include: {
                funcionalidade: true
              }
            }
          }
        }
      }
    })

    // Verificar se algum perfil tem a permissão
    for (const up of usuarioPerfis) {
      const permissao = up.perfil.permissoes.find(
        p => p.funcionalidade.codigo === funcionalidadeCodigo
      )

      if (permissao) {
        switch (tipoPermissao) {
          case 'leitura':
            if (permissao.permissaoLeitura) return true
            break
          case 'escrita':
            if (permissao.permissaoEscrita) return true
            break
          case 'exclusao':
            if (permissao.permissaoExclusao) return true
            break
          case 'admin':
            if (permissao.permissaoAdmin) return true
            break
        }
      }
    }

    return false

  } catch (error) {
    console.error('❌ Erro ao verificar permissão:', error)
    return false
  }
}

// ==========================================
// 7️⃣ CRIAR DOCUMENTO COM VALIDAÇÃO
// ==========================================

async function criarDocumento(
  usuarioId: string,
  dados: {
    nome: string
    descricao?: string
    categoria: string
    tipo: string
    tamanho: number
    caminhoArquivo: string
    dataVencimento?: Date
    tags?: string[]
  }
) {
  try {
    // Criar hash do arquivo
    const hashArquivo = 'hash_do_arquivo' // Implementar com crypto

    const documento = await prisma.documento.create({
      data: {
        usuarioId,
        nome: dados.nome,
        descricao: dados.descricao,
        categoria: dados.categoria,
        tipo: dados.tipo,
        tamanho: dados.tamanho,
        caminhoArquivo: dados.caminhoArquivo,
        hash: hashArquivo,
        dataVencimento: dados.dataVencimento,
        tags: dados.tags || [],
        permissao: 'PRIVATE',
        validado: false,
        esocialPronto: false,
        backupCriado: false,
      },
      include: {
        usuario: {
          select: {
            cpf: true,
            nomeCompleto: true,
          }
        }
      }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'CREATE',
        entidade: 'Documento',
        entidadeId: documento.id,
        descricao: `Documento criado: ${dados.nome}`,
        tipoLog: 'DATA_MODIFICATION',
        nivelSeveridade: 'INFO',
        sucesso: true,
      }
    })

    console.log('✅ Documento criado:', documento)
    return documento

  } catch (error) {
    console.error('❌ Erro ao criar documento:', error)
    throw error
  }
}

// ==========================================
// 8️⃣ CÁLCULO SALARIAL
// ==========================================

async function calcularSalario(
  cpfEmpregado: string,
  mesReferencia: number,
  anoReferencia: number,
  dados: {
    salarioBruto: number
    descontos: any[]
    proventos: any[]
  }
) {
  try {
    // Verificar se já existe cálculo
    const calculoExistente = await prisma.calculoSalarial.findUnique({
      where: {
        cpfEmpregado_mesReferencia_anoReferencia: {
          cpfEmpregado,
          mesReferencia,
          anoReferencia,
        }
      }
    })

    if (calculoExistente) {
      throw new Error('Cálculo já existe para este período')
    }

    // Calcular INSS (exemplo simplificado)
    const baseINSS = dados.salarioBruto
    const valorINSS = baseINSS * 0.11 // 11% exemplo

    // Calcular IR (exemplo simplificado)
    const baseIR = dados.salarioBruto - valorINSS
    const valorIR = baseIR > 1903.98 ? (baseIR - 1903.98) * 0.075 : 0

    // Calcular salário líquido
    const totalDescontos = dados.descontos.reduce((acc, d) => acc + d.valor, 0)
    const totalProventos = dados.proventos.reduce((acc, p) => acc + p.valor, 0)
    const salarioLiquido = dados.salarioBruto + totalProventos - totalDescontos - valorINSS - valorIR

    const calculo = await prisma.calculoSalarial.create({
      data: {
        cpfEmpregado,
        mesReferencia,
        anoReferencia,
        salarioBruto: dados.salarioBruto,
        descontos: dados.descontos,
        proventos: dados.proventos,
        baseINSS,
        valorINSS,
        baseIR,
        valorIR,
        salarioLiquido,
        processado: true,
        pago: false,
      }
    })

    console.log('✅ Cálculo salarial criado:', calculo)
    return calculo

  } catch (error) {
    console.error('❌ Erro ao calcular salário:', error)
    throw error
  }
}

// ==========================================
// 9️⃣ EXPORTAR DADOS DO USUÁRIO (LGPD)
// ==========================================

async function exportarDadosUsuario(usuarioId: string) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        },
        gruposUsuario: {
          include: {
            grupo: true
          }
        },
        dispositivos: true,
        sessoes: true,
        documentos: true,
        tarefas: true,
        mensagens: true,
        pontosRegistrados: true,
        emprestimosAprovados: true,
        emprestimosSolicitados: true,
        alertas: true,
      }
    })

    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Log de exportação (LGPD)
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'EXPORT',
        entidade: 'Usuario',
        entidadeId: usuarioId,
        descricao: 'Exportação de dados do usuário (LGPD)',
        tipoLog: 'LGPD',
        nivelSeveridade: 'INFO',
        sucesso: true,
      }
    })

    // Retornar dados em formato JSON
    return {
      exportacao: {
        data: new Date().toISOString(),
        versao: '2.2.1',
        usuario,
      }
    }

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error)
    throw error
  }
}

// ==========================================
// 🔟 EXCLUIR DADOS DO USUÁRIO (LGPD)
// ==========================================

async function excluirDadosUsuario(usuarioId: string, manterLogs: boolean = true) {
  try {
    // Log antes da exclusão (LGPD)
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'DELETE',
        entidade: 'Usuario',
        entidadeId: usuarioId,
        descricao: 'Solicitação de exclusão de dados (LGPD)',
        tipoLog: 'LGPD',
        nivelSeveridade: 'WARNING',
        sucesso: true,
      }
    })

    // Excluir usuário (cascade irá excluir relacionamentos)
    await prisma.usuario.delete({
      where: { id: usuarioId }
    })

    console.log('✅ Dados do usuário excluídos')
    
    return { sucesso: true, mensagem: 'Dados excluídos com sucesso' }

  } catch (error) {
    console.error('❌ Erro ao excluir dados:', error)
    throw error
  }
}

// ==========================================
// EXPORTAR FUNÇÕES
// ==========================================

export {
  criarUsuarioCompleto,
  adicionarPerfil,
  adicionarUsuarioAoGrupo,
  registrarPonto,
  buscarUsuarioCompleto,
  verificarPermissao,
  criarDocumento,
  calcularSalario,
  exportarDadosUsuario,
  excluirDadosUsuario,
}


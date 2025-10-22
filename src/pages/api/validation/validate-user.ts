/**
 * API para validação de usuários
 * Endpoint: POST /api/validation/validate-user
 */

import { NextApiRequest, NextApiResponse } from 'next';
import ValidationService from '../../../services/validationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de validação e dados são obrigatórios'
      });
    }

    let validationResult;

    switch (type) {
      case 'user-creation':
        validationResult = await ValidationService.validateUserCreation(
          data.cpf,
          data.email
        );
        break;

      case 'user-update':
        validationResult = await ValidationService.validateUserUpdate(
          data.usuarioId,
          data.cpf,
          data.email
        );
        break;

      case 'user-group-assignment':
        validationResult = await ValidationService.validateUserGroupAssignment(data);
        break;

      case 'user-group-removal':
        validationResult = await ValidationService.validateUserGroupRemoval(
          data.usuarioId,
          data.grupoId
        );
        break;

      case 'unique-cpf':
        validationResult = await ValidationService.validateUniqueCPF(
          data.cpf,
          data.excludeUserId
        );
        break;

      case 'single-employer-per-group':
        validationResult = await ValidationService.validateSingleEmployerPerGroup(
          data.grupoId,
          data.usuarioId
        );
        break;

      case 'unique-cpf-in-group':
        validationResult = await ValidationService.validateUniqueCPFInGroup(
          data.cpf,
          data.grupoId,
          data.usuarioId
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de validação não reconhecido'
        });
    }

    return res.status(200).json({
      success: true,
      data: validationResult
    });

  } catch (error: any) {
    console.error('Erro na validação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

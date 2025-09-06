import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { ActionButton } from './ActionButton';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from './Modal';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const TermsModal = styled(Modal)`
  z-index: 9999;
`;

const TermsContent = styled(ModalContent)`
  max-width: 900px;
  max-height: 90vh;
  animation: ${fadeIn} 0.3s ease-out;
`;

const TermsHeader = styled(ModalHeader)`
  background: linear-gradient(135deg, #29abe2 0%, #1e88e5 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 2rem;
  text-align: center;
`;

const TermsTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const TermsSubtitle = styled.p`
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
`;

const TermsBody = styled(ModalBody)`
  padding: 0;
  max-height: 60vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TermsTabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
`;

const TabButton = styled.button<{ $active?: boolean; $theme: any }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => (props.$active ? 'white' : 'transparent')};
  color: ${props =>
    props.$active ? props.$theme?.colors?.primary || '#29ABE2' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.primary || '#29ABE2'
        : 'transparent'};

  &:hover {
    background: ${props => (props.$active ? 'white' : '#f0f0f0')};
    color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }
`;

const DocumentViewer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: white;
`;

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
`;

const DocumentTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0;
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const VersionBadge = styled.span<{ $theme: any }>`
  background: ${props => props.$theme?.colors?.success || '#90EE90'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const EffectiveDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const DocumentContent = styled.div`
  line-height: 1.6;
  font-size: 0.95rem;
  color: #333;

  h3 {
    color: ${props => props.theme?.colors?.primary || '#29ABE2'};
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.2rem;
  }

  h4 {
    color: #333;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin-bottom: 1rem;
    text-align: justify;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  }
`;

const AcceptanceSection = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-top: 2px solid #e0e0e0;
`;

const AcceptanceTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme?.colors?.primary || '#29ABE2'};
    background: ${props => props.theme?.colors?.primary || '#29ABE2'}05;
  }
`;

const Checkbox = styled.input<{ $theme: any }>`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};

  &:checked + label {
    color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    font-weight: 600;
  }
`;

const CheckboxLabel = styled.label`
  flex: 1;
  cursor: pointer;
  line-height: 1.4;
  color: #333;
  transition: all 0.3s ease;
`;

const RequiredText = styled.p`
  text-align: center;
  color: #e74c3c;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
`;

const TermsFooter = styled(ModalFooter)`
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const AcceptButton = styled(ActionButton)<{ $accepted?: boolean; $theme: any }>`
  background: ${props =>
    props.$accepted
      ? props.$theme?.colors?.success || '#90EE90'
      : props.$theme?.colors?.primary || '#29ABE2'};
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  animation: ${props => (props.$accepted ? pulse : 'none')} 2s infinite;
  transition: all 0.3s ease;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    animation: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const DeclineButton = styled(ActionButton)`
  background: #e74c3c;
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

// Interfaces
interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  theme: any;
}

// Dados dos documentos
const termsContent = `
  <h3>1. Aceitação dos Termos</h3>
  <p>Estes Termos de Uso ("Termos") regem o uso do Sistema DOM ("Sistema", "Serviço") operado por nossa empresa ("nós", "nosso", "empresa").</p>

  <h3>2. Descrição do Serviço</h3>
  <p>O Sistema DOM é uma plataforma de gestão doméstica que oferece funcionalidades para:</p>
  <ul>
    <li>Gestão de tarefas e atividades</li>
    <li>Controle de documentos</li>
    <li>Gestão financeira e salarial</li>
    <li>Comunicação interna</li>
    <li>Controle de acesso e segurança</li>
  </ul>

  <h3>3. Conta de Usuário</h3>
  <p>Ao criar uma conta, você concorda em:</p>
  <ul>
    <li>Fornecer informações precisas e atualizadas</li>
    <li>Manter a segurança de sua senha</li>
    <li>Ser responsável por todas as atividades em sua conta</li>
    <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
  </ul>

  <h3>4. Uso Aceitável</h3>
  <p>Você concorda em não usar o Sistema para:</p>
  <ul>
    <li>Atividades ilegais ou não autorizadas</li>
    <li>Interferir com o funcionamento do Sistema</li>
    <li>Tentar acessar contas de outros usuários</li>
    <li>Distribuir malware ou código malicioso</li>
  </ul>

  <h3>5. Propriedade Intelectual</h3>
  <p>O Sistema e seu conteúdo são protegidos por direitos autorais e outras leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir nosso conteúdo sem autorização.</p>

  <h3>6. Limitação de Responsabilidade</h3>
  <p>O Sistema é fornecido "como está". Não garantimos que será ininterrupto ou livre de erros. Nossa responsabilidade é limitada ao máximo permitido por lei.</p>

  <h3>7. Modificações dos Termos</h3>
  <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Mudanças significativas serão comunicadas com 30 dias de antecedência.</p>

  <h3>8. Rescisão</h3>
  <p>Podemos suspender ou encerrar sua conta se você violar estes Termos. Você pode encerrar sua conta a qualquer momento.</p>

  <h3>9. Lei Aplicável</h3>
  <p>Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>

  <h3>10. Contato</h3>
  <p>Para questões sobre estes Termos, entre em contato conosco através dos canais oficiais do Sistema DOM.</p>
`;

const privacyContent = `
  <h3>1. Informações que Coletamos</h3>
  <p>Coletamos informações que você nos fornece diretamente, como:</p>
  <ul>
    <li>Nome, email e informações de contato</li>
    <li>Dados de perfil e preferências</li>
    <li>Conteúdo que você cria ou compartilha</li>
    <li>Informações de pagamento (quando aplicável)</li>
  </ul>

  <h3>2. Como Usamos suas Informações</h3>
  <p>Utilizamos suas informações para:</p>
  <ul>
    <li>Fornecer e melhorar nossos serviços</li>
    <li>Processar transações e pagamentos</li>
    <li>Comunicar-nos com você</li>
    <li>Garantir a segurança da plataforma</li>
    <li>Cumprir obrigações legais</li>
  </ul>

  <h3>3. Compartilhamento de Informações</h3>
  <p>Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:</p>
  <ul>
    <li>Com seu consentimento explícito</li>
    <li>Para cumprir obrigações legais</li>
    <li>Com prestadores de serviços confiáveis</li>
    <li>Em caso de fusão ou aquisição</li>
  </ul>

  <h3>4. Segurança dos Dados</h3>
  <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.</p>

  <h3>5. Seus Direitos (LGPD)</h3>
  <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
  <ul>
    <li>Confirmar a existência de tratamento de dados</li>
    <li>Acessar seus dados pessoais</li>
    <li>Corrigir dados incompletos ou inexatos</li>
    <li>Solicitar anonimização ou eliminação</li>
    <li>Portabilidade dos dados</li>
    <li>Revogar o consentimento</li>
  </ul>

  <h3>6. Cookies e Tecnologias Similares</h3>
  <p>Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar conteúdo.</p>

  <h3>7. Retenção de Dados</h3>
  <p>Mantemos suas informações pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido por lei.</p>

  <h3>8. Transferência Internacional</h3>
  <p>Seus dados podem ser transferidos e processados em países diferentes do seu. Garantimos proteções adequadas conforme a legislação aplicável.</p>

  <h3>9. Menores de Idade</h3>
  <p>Não coletamos intencionalmente informações de menores de 18 anos sem o consentimento dos pais ou responsáveis.</p>

  <h3>10. Alterações nesta Política</h3>
  <p>Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas através do Sistema ou por email.</p>

  <h3>11. Contato</h3>
  <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta Política, entre em contato conosco através dos canais oficiais do Sistema DOM.</p>
`;

const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const currentContent = activeTab === 'terms' ? termsContent : privacyContent;
  const currentAccepted =
    activeTab === 'terms' ? termsAccepted : privacyAccepted;

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setTermsAccepted(false);
      setPrivacyAccepted(false);
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      // Salvar aceite no localStorage
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptanceDate', new Date().toISOString());
      localStorage.setItem('termsVersion', 'v2.1.0');
      localStorage.setItem('privacyVersion', 'v1.8.0');

      toast.success('Termos e Políticas aceitos com sucesso!');
      onAccept();
    } else {
      toast.error('Você deve aceitar ambos os documentos para continuar.');
    }
  };

  const handleDecline = () => {
    toast.info('Você precisa aceitar os termos para usar o sistema.');
    onDecline();
  };

  const canAccept = termsAccepted && privacyAccepted && hasScrolledToBottom;

  return (
    <TermsModal isOpen={isOpen} onClose={() => {}}>
      <TermsContent>
        <TermsHeader>
          <TermsTitle>
            <AccessibleEmoji emoji='📋' label='Checklist' /> Termos de Uso e
            Políticas de Privacidade
          </TermsTitle>
          <TermsSubtitle>
            Leia atentamente os documentos abaixo antes de aceitar
          </TermsSubtitle>
        </TermsHeader>

        <TermsBody>
          <TermsTabs>
            <TabButton
              $active={activeTab === 'terms'}
              $theme={theme}
              onClick={() => setActiveTab('terms')}
            >
              <AccessibleEmoji emoji='📋' label='Checklist' /> Termos de Uso
            </TabButton>
            <TabButton
              $active={activeTab === 'privacy'}
              $theme={theme}
              onClick={() => setActiveTab('privacy')}
            >
              <AccessibleEmoji emoji='🔒' label='Privado' /> Políticas de
              Privacidade
            </TabButton>
          </TermsTabs>

          <DocumentViewer onScroll={handleScroll}>
            <DocumentHeader>
              <div>
                <DocumentTitle>
                  {activeTab === 'terms'
                    ? 'Termos de Uso'
                    : 'Políticas de Privacidade'}
                </DocumentTitle>
                <VersionInfo>
                  <VersionBadge $theme={theme}>
                    {activeTab === 'terms' ? 'v2.1.0' : 'v1.8.0'} - Atual
                  </VersionBadge>
                  <EffectiveDate>
                    Vigente desde:{' '}
                    {new Date('2024-01-15').toLocaleDateString('pt-BR')}
                  </EffectiveDate>
                </VersionInfo>
              </div>
            </DocumentHeader>

            <DocumentContent
              dangerouslySetInnerHTML={{ __html: currentContent }}
            />
          </DocumentViewer>

          <AcceptanceSection>
            <AcceptanceTitle>Confirmação de Leitura e Aceite</AcceptanceTitle>

            <CheckboxContainer>
              <Checkbox
                type='checkbox'
                id='terms-checkbox'
                $theme={theme}
                checked={currentAccepted}
                onChange={e => {
                  if (activeTab === 'terms') {
                    setTermsAccepted(e.target.checked);
                  } else {
                    setPrivacyAccepted(e.target.checked);
                  }
                }}
              />
              <CheckboxLabel htmlFor='terms-checkbox'>
                Eu li atentamente e aceito os{' '}
                <strong>
                  {activeTab === 'terms'
                    ? 'Termos de Uso'
                    : 'Políticas de Privacidade'}
                </strong>{' '}
                do Sistema DOM, incluindo todas as condições e obrigações
                descritas no documento.
              </CheckboxLabel>
            </CheckboxContainer>

            {!hasScrolledToBottom && (
              <RequiredText>
                <AccessibleEmoji emoji='⚠' label='Aviso' /> Você deve rolar até
                o final do documento para aceitar
              </RequiredText>
            )}
          </AcceptanceSection>
        </TermsBody>

        <TermsFooter>
          <DeclineButton variant='danger' theme={theme} onClick={handleDecline}>
            <AccessibleEmoji emoji='❌' label='Erro' /> Recusar
          </DeclineButton>
          <AcceptButton
            variant='success'
            $theme={theme}
            $accepted={canAccept}
            onClick={handleAccept}
            disabled={!canAccept}
          >
            {canAccept ? (
              <>
                <AccessibleEmoji emoji='✅' label='Sucesso' /> Aceitar e
                Continuar
              </>
            ) : (
              '⏳ Aguardando...'
            )}
          </AcceptButton>
        </TermsFooter>
      </TermsContent>
    </TermsModal>
  );
};

export default TermsAcceptanceModal;

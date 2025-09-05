// src/pages/login.tsx
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { validateCpf } from '../utils/cpfValidator';

// Carrega o MotivationCarousel **só no cliente**, pega o default export
const MotivationCarousel = dynamic(
  () => import('../components/MotivationCarousel'),
  { ssr: false }
);

// Styled Components...
const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${p => p.theme.colors.primary}33,
    ${p => p.theme.colors.accent}33
  );
`;

const FormCard = styled.div`
  background: #fff;
  border-radius: ${p => p.theme.borderRadius};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const CarouselContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const FloatingLabel = styled.label`
  position: absolute;
  top: -0.6rem;
  left: 0.75rem;
  background: #fff;
  padding: 0 0.3rem;
  font-size: 0.75rem;
  color: ${p => p.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${p => p.theme.colors.greyLight};
  border-radius: ${p => p.theme.borderRadius};
  font-size: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: ${p => p.theme.colors.text};
  input {
    margin-right: 0.5rem;
  }
`;

const LinksRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StyledLink = styled.a`
  color: ${p => p.theme.colors.primary};
  font-size: 0.9rem;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const AuthIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  font-size: 1.75rem;
  color: ${p => p.theme.colors.text};
  cursor: pointer;
`;

const ProfileOption = styled.button<{ bg: string }>`
  background: ${p => p.bg};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.borderRadius};
  padding: 0.75rem;
  margin: 0.5rem 0;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const LogoImg = styled.img`
  margin-bottom: 1rem;
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

export default function Login() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Perfis simulados (vêm da API em produção)
  const userProfiles = [
    { id: '1', role: 'Empregador', group: 'Casa', color: '#29ABE2' },
    { id: '2', role: 'Familiar', group: 'Família dos Pais', color: '#90EE90' },
    { id: '3', role: 'Empregado', group: 'Jardineiro', color: '#FFDA63' },
  ];

  function validatePassword(p: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!validateCpf(cpf)) {
      toast.error('CPF inválido');
      return;
    }
    if (!validatePassword(password)) {
      toast.error(
        'Senha deve ter 8+ chars, maiúscula, minúscula, número e especial'
      );
      return;
    }
    if (!accepted) {
      toast.error('Você deve aceitar os Termos e Políticas');
      return;
    }

    toast.success('Autenticado!');
    if (userProfiles.length > 1) {
      setTimeout(() => setShowProfileModal(true), 500);
    } else {
      const firstProfile = userProfiles[0];
      if (firstProfile) {
        router.push(`/dashboard?profileId=${firstProfile.id}`);
      }
    }
  }

  const motivationalPhrases = [
    'Organize sua casa, inspire seus dias!',
    'Transforme sua rotina, simplifique sua vida!',
    'Bem-estar em cada detalhe do seu lar.',
  ];

  return (
    <PageWrapper>
      <FormCard>
        <LogoImg src='/logo.png' alt='Logo DOM' width={120} />

        <CarouselContainer>
          <MotivationCarousel phrases={motivationalPhrases} />
        </CarouselContainer>

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <FloatingLabel htmlFor='cpf'>CPF</FloatingLabel>
            <Input
              id='cpf'
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder='000.000.000-00'
            />
          </InputWrapper>

          <InputWrapper>
            <FloatingLabel htmlFor='senha'>Senha</FloatingLabel>
            <Input
              id='senha'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </InputWrapper>

          <CheckboxLabel>
            <input
              type='checkbox'
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            Lembrar de mim
          </CheckboxLabel>

          <LinksRow>
            <StyledLink href='/forgot-password'>Esqueci minha senha</StyledLink>
            <StyledLink href='/register'>Sou novo aqui</StyledLink>
          </LinksRow>

          <CheckboxLabel>
            <input
              type='checkbox'
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
            />
            Li e aceito os <StyledLink href='/terms'>Termos de Uso</StyledLink>{' '}
            e <StyledLink href='/privacy'>Políticas de Privacidade</StyledLink>
          </CheckboxLabel>

          <FullWidthButton type='submit'>Entrar</FullWidthButton>
        </form>

        <AuthIcons>
          <span className='material-symbols-outlined'>face</span>
          <span className='material-symbols-outlined'>fingerprint</span>
        </AuthIcons>

        <ToastContainer position='bottom-center' />

        {showProfileModal && (
          <Modal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          >
            <h3>Selecione o perfil</h3>
            <p>Você possui múltiplos perfis. Qual grupo deseja acessar?</p>
            {userProfiles.map(profile => (
              <ProfileOption
                key={profile.id}
                bg={profile.color}
                onClick={() => {
                  setShowProfileModal(false);
                  router.push(`/dashboard?profileId=${profile.id}`);
                }}
              >
                {profile.role} – {profile.group}
              </ProfileOption>
            ))}
          </Modal>
        )}
      </FormCard>
    </PageWrapper>
  );
}

import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/login-compact.tsx
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import { validateCpf } from '../utils/cpfValidator';

// Carrega o MotivationCarousel dinamicamente
const MotivationCarousel = dynamic(
  () => import('../components/MotivationCarousel'),
  { ssr: false }
);

// Animações
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 100%;
  max-width: 350px;
  position: relative;
  animation: ${slideIn} 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const Logo = styled.img`
  width: 50px;
  height: 50px;
  margin: 0 auto 0.5rem;
  display: block;
  border-radius: 8px;
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  background: linear-gradient(135deg, #29abe2, #90ee90);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CarouselWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(41, 171, 226, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(41, 171, 226, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const FloatingLabel = styled.label<{ $focused: boolean; $hasValue: boolean }>`
  position: absolute;
  left: 0.75rem;
  top: ${props => (props.$focused || props.$hasValue ? '-0.4rem' : '0.75rem')};
  background: ${props =>
    props.$focused || props.$hasValue ? '#fff' : 'transparent'};
  padding: ${props => (props.$focused || props.$hasValue ? '0 0.25rem' : '0')};
  font-size: ${props =>
    props.$focused || props.$hasValue ? '0.7rem' : '0.9rem'};
  color: ${props => (props.$focused ? '#29abe2' : '#7f8c8d')};
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 1;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid
    ${props => (props.$hasError ? '#e74c3c' : 'rgba(41, 171, 226, 0.2)')};
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Roboto', sans-serif;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: #29abe2;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(41, 171, 226, 0.1);
  }

  &::placeholder {
    color: transparent;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: #29abe2;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #29abe2;
  cursor: pointer;
  margin-top: 0.1rem;
`;

const CheckboxLabel = styled.label`
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem;
  color: #5a6c7d;
  cursor: pointer;
  user-select: none;
  line-height: 1.3;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #29abe2, #90ee90);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0.5rem 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(41, 171, 226, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Link = styled.a`
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem;
  color: #29abe2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #90ee90;
  }
`;

const BiometricSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(41, 171, 226, 0.1);
  text-align: center;
`;

const BiometricTitle = styled.h3`
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
`;

const BiometricOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const BiometricButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: 1px solid rgba(41, 171, 226, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;

  &:hover {
    border-color: #29abe2;
    background: rgba(41, 171, 226, 0.05);
  }

  .icon {
    font-size: 1.2rem;
    color: #29abe2;
  }

  .label {
    font-family: 'Roboto', sans-serif;
    font-size: 0.7rem;
    color: #5a6c7d;
    font-weight: 500;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.7rem;
  margin-top: 0.25rem;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '⚠️';
    font-size: 0.6rem;
  }
`;

export default function LoginCompact() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    cpf?: string;
    password?: string;
    terms?: string;
  }>({});

  const motivationalPhrases = [
    'Organize sua casa, inspire seus dias!',
    'Simplifique sua rotina doméstica',
    'Bem-estar em cada detalhe do seu lar',
  ];

  const validateForm = () => {
    const newErrors: { cpf?: string; password?: string; terms?: string } = {};

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCpf(cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!acceptedTerms) {
      newErrors.terms =
        'Você deve aceitar os Termos de Uso e Políticas de Privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simula uma requisição de login
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    }, 1000);
  };

  const handleBiometricLogin = (type: 'face' | 'fingerprint') => {
    toast.info(
      `Login com ${type === 'face' ? 'reconhecimento facial' : 'impressão digital'} em desenvolvimento`
    );
  };

  return (
    <PageContainer>
      <LoginCard>
        <Header>
          <Logo src='/logo.png' alt='Logo DOM' />
          <Title>DOM</Title>
        </Header>

        <CarouselWrapper>
          <MotivationCarousel phrases={motivationalPhrases} />
        </CarouselWrapper>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <FloatingLabel
              htmlFor='cpf'
              $focused={focusedField === 'cpf'}
              $hasValue={!!cpf}
            >
              CPF
            </FloatingLabel>
            <Input
              id='cpf'
              type='text'
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              onFocus={() => setFocusedField('cpf')}
              onBlur={() => setFocusedField(null)}
              placeholder='000.000.000-00'
              $hasError={!!errors.cpf}
            />
            {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <FloatingLabel
              htmlFor='password'
              $focused={focusedField === 'password'}
              $hasValue={!!password}
            >
              Senha
            </FloatingLabel>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder='••••••••'
              $hasError={!!errors.password}
            />
            <PasswordToggle
              type='button'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AccessibleEmoji emoji='👁' label='Mostrar' />
              ) : (
                <AccessibleEmoji emoji='👁' label='Ocultar' />
              )}
            </PasswordToggle>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <CheckboxContainer>
            <Checkbox
              id='remember'
              type='checkbox'
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <CheckboxLabel htmlFor='remember'>Lembrar de mim</CheckboxLabel>
          </CheckboxContainer>

          <CheckboxContainer>
            <Checkbox
              id='terms'
              type='checkbox'
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
            />
            <CheckboxLabel htmlFor='terms'>
              Li e aceito os <Link href='/terms'>Termos de Uso</Link> e as{' '}
              <Link href='/privacy'>Políticas de Privacidade</Link>
            </CheckboxLabel>
          </CheckboxContainer>
          {errors.terms && <ErrorMessage>{errors.terms}</ErrorMessage>}

          <LoginButton type='submit' disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </LoginButton>

          <LinksContainer>
            <Link href='/forgot-password'>Esqueci minha senha</Link>
            <Link href='/register'>Cadastre-se</Link>
          </LinksContainer>
        </Form>

        <BiometricSection>
          <BiometricTitle>Ou entre com</BiometricTitle>
          <BiometricOptions>
            <BiometricButton onClick={() => handleBiometricLogin('face')}>
              <span className='icon'>
                <AccessibleEmoji emoji='👤' label='Perfil' />
              </span>
              <span className='label'>Face ID</span>
            </BiometricButton>
            <BiometricButton
              onClick={() => handleBiometricLogin('fingerprint')}
            >
              <span className='icon'>
                <AccessibleEmoji emoji='👆' label='Dedo' />
              </span>
              <span className='label'>Digital</span>
            </BiometricButton>
          </BiometricOptions>
        </BiometricSection>
      </LoginCard>

      <ToastContainer
        position='top-center'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </PageContainer>
  );
}

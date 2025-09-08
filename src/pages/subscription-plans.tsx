import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/subscription-plans.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useTheme } from '../hooks/useTheme';

// Interfaces
interface Plan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  isFree?: boolean;
  isPartnership?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'success';
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

// Styled Components para substituir estilos inline
const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

const PriceText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
`;

const PriceUnit = styled.span`
  font-size: 1rem;
  color: #7f8c8d;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

// Styled Components

const PlansSection = styled.section`
  margin-bottom: 4rem;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const PlanCard = styled.div<{
  $theme: any;
  $isPopular?: boolean | undefined;
  $isRecommended?: boolean | undefined;
}>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
  border: 2px solid
    ${props => {
      if (props.$isPopular) return '#90EE90';
      if (props.$isRecommended) return props.$theme.colors.primary;
      return 'transparent';
    }};
  position: relative;
  transition: all 0.3s ease;
  transform: ${props => (props.$isPopular ? 'scale(1.05)' : 'scale(1)')};

  &:hover {
    transform: ${props => (props.$isPopular ? 'scale(1.08)' : 'scale(1.02)')};
    box-shadow: 0 12px 40px ${props => props.$theme.colors.shadow};
  }
`;

const PopularBadge = styled.div<{ $theme: any }>`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #90ee90, #32cd32);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(144, 238, 144, 0.3);
  z-index: 10;
`;

const RecommendedBadge = styled.div<{ $theme: any }>`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    ${props => props.$theme.colors.primary},
    ${props => props.$theme.colors.primaryHover}
  );
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px ${props => props.$theme.colors.primary}30;
  z-index: 10;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const PlanTagline = styled.p`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  font-style: italic;
  line-height: 1.4;
`;

const PlanDescription = styled.p`
  font-size: 0.85rem;
  color: #5a6c7d;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const PriceSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MonthlyPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 0.5rem;
`;

const AnnualPrice = styled.div`
  font-size: 1.1rem;
  color: #27ae60;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const AnnualDiscount = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  font-style: italic;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
`;

const FeatureIcon = styled.span`
  color: #27ae60;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const PlanButton = styled.div`
  width: 100%;
`;

const ComparisonSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const ComparisonTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const ComparisonTable = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
`;

const TableHeaderCell = styled.div`
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  font-size: 0.9rem;

  &:last-child {
    border-right: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 1rem;
  text-align: center;
  border-right: 1px solid #e0e0e0;
  font-size: 0.9rem;
  color: #2c3e50;

  &:first-child {
    text-align: left;
    font-weight: 500;
  }

  &:last-child {
    border-right: none;
  }
`;

const CheckIcon = styled.span`
  color: #27ae60;
  font-size: 1.2rem;
  font-weight: bold;
`;

const XIcon = styled.span`
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
`;

const FAQSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const FAQTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const FAQItem = styled.div<{ $theme: any }>`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${props => props.$theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

const FAQQuestion = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
`;

const FAQAnswer = styled.p`
  font-size: 0.9rem;
  color: #5a6c7d;
  margin: 0;
  line-height: 1.5;
`;

const TestimonialsSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const TestimonialsTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TestimonialCard = styled.div<{ $theme: any }>`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${props => props.$theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

const TestimonialText = styled.p`
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
`;

const AuthorRole = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Rating = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => (props.$filled ? '#f39c12' : '#ddd')};
  font-size: 1rem;
`;

const GuaranteeSection = styled.section<{ $theme: any }>`
  background: linear-gradient(
    135deg,
    ${props => props.$theme.colors.primary}10,
    ${props => props.$theme.colors.primary}05
  );
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 2px solid ${props => props.$theme.colors.primary}20;
`;

const GuaranteeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const GuaranteeText = styled.p`
  font-size: 1rem;
  color: #5a6c7d;
  margin: 0;
  line-height: 1.5;
`;

const ContactSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const ContactTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const ContactText = styled.p`
  font-size: 1rem;
  color: #5a6c7d;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

export default function SubscriptionPlans() {
  const router = useRouter();
  const { theme, updateTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Mock data
  const userProfiles = [
    {
      id: '1',
      name: 'João Silva',
      role: 'Empregador',
      avatar: 'JS',
      color: '#29ABE2',
    },
    {
      id: '2',
      name: 'Maria Santos',
      role: 'Familiar',
      avatar: 'MS',
      color: '#90EE90',
    },
  ];

  const [selectedProfile, setSelectedProfile] = useState(userProfiles[0]);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Plano Free',
      tagline: 'Deguste o DOM sem compromisso',
      description:
        '15 dias gratuitos para experimentar a gestão que organiza até seus sonhos mais bagunçados!',
      monthlyPrice: 0,
      annualPrice: 0,
      annualDiscount: 'N/A',
      features: [
        'Dashboard básico',
        'Registro de ponto limitado',
        'Upload de documentos (até 50MB)',
        'Suporte via comunidade',
        'Acesso às funcionalidades básicas',
      ],
      isFree: true,
      buttonText: 'Experimente Grátis',
      buttonVariant: 'success',
    },
    {
      id: 'lar-doce-lar',
      name: 'Lar Doce Lar',
      tagline: 'Cansado de ser o CEO da sua casa?',
      description:
        'Com este plano, você terceiriza a bagunça e foca no que realmente importa: maratonar séries!',
      monthlyPrice: 29.9,
      annualPrice: 299,
      annualDiscount: '2 meses grátis',
      features: [
        'Dashboard personalizado',
        'Gestão de tarefas colaborativa',
        'Registro de ponto inteligente',
        'Gestão de documentos (até 100MB)',
        'Suporte prioritário',
        'Relatórios básicos',
      ],
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'super-domestica',
      name: 'Super Doméstica',
      tagline: 'Transforme sua casa em um paraíso da organização!',
      description: 'Com este plano, até Marie Kondo sentiria inveja.',
      monthlyPrice: 49.9,
      annualPrice: 499,
      annualDiscount: '2 meses grátis',
      features: [
        'Tudo do Lar Doce Lar',
        'Gestão financeira simplificada',
        'Comunicação unificada (chat e videochamadas)',
        'Assistente virtual (comandos de voz)',
        'Gestão de compras',
        'Alertas personalizados',
        'Integração com calendários',
      ],
      isRecommended: true,
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'ultra-pro',
      name: 'Ultra Pro',
      tagline: 'O plano que vai te dar superpoderes domésticos!',
      description: 'Organize, planeje e execute com a eficiência de um ninja.',
      monthlyPrice: 79.9,
      annualPrice: 799,
      annualDiscount: '2 meses grátis',
      features: [
        'Tudo do Super Doméstica',
        'Integração com wearables',
        'Relatórios personalizados',
        'Gamificação (sistema de recompensas)',
        'Gestão de planos de assinatura',
        'Integração com eSocial Doméstico',
        'Gestão de empréstimos e adiantamentos',
        'API personalizada',
      ],
      isPopular: true,
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'parceria-master',
      name: 'Parceria Master',
      tagline: 'Seja nosso parceiro e conquiste o mundo!',
      description: 'Juntos, somos imbatíveis!',
      monthlyPrice: 0,
      annualPrice: 0,
      annualDiscount: 'Fale conosco',
      features: [
        'Customização da interface (white label)',
        'Acesso a dados estratégicos do mercado',
        'Suporte técnico especializado',
        'Participação em eventos exclusivos',
        'Gestão de múltiplos núcleos',
        'Integração com sistemas corporativos',
        'Consultoria personalizada',
      ],
      isPartnership: true,
      buttonText: 'Falar com Vendas',
      buttonVariant: 'secondary',
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer:
        'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. Seu acesso permanecerá ativo até o final do período pago.',
    },
    {
      id: '2',
      question: 'Há desconto para pagamento anual?',
      answer:
        'Sim! Oferecemos 2 meses grátis quando você paga anualmente, o que representa uma economia significativa comparado ao pagamento mensal.',
    },
    {
      id: '3',
      question: 'Posso mudar de plano a qualquer momento?',
      answer:
        'Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferença será calculada proporcionalmente.',
    },
    {
      id: '4',
      question: 'O que acontece com meus dados se eu cancelar?',
      answer:
        'Seus dados ficam seguros por 30 dias após o cancelamento. Você pode reativar sua conta nesse período sem perder informações.',
    },
    {
      id: '5',
      question: 'Há suporte técnico disponível?',
      answer:
        'Sim! Oferecemos suporte via chat, e-mail e telefone, com tempos de resposta diferenciados conforme o plano escolhido.',
    },
    {
      id: '6',
      question: 'Posso testar antes de assinar?',
      answer:
        'Claro! Oferecemos 15 dias grátis para você experimentar todas as funcionalidades do plano escolhido.',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Ana Costa',
      role: 'Empregadora',
      text: 'O DOM revolucionou a gestão da minha casa! Agora consigo organizar tudo de forma muito mais eficiente.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Carlos Mendes',
      role: 'Administrador',
      text: 'A interface é intuitiva e as funcionalidades são exatamente o que precisávamos para nosso negócio.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Mariana Silva',
      role: 'Familiar',
      text: 'Finalmente encontrei uma solução que realmente funciona para organizar a vida doméstica da família.',
      rating: 5,
    },
  ];

  const handleProfileChange = (profileId: string) => {
    const profile = userProfiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      updateTheme(profile.role.toLowerCase());
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      toast.success(
        `Redirecionando para pagamento do plano ${selectedPlan.name}...`
      );
      // Aqui seria implementada a integração com o sistema de pagamento
      setModalOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Grátis';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
        userProfiles={userProfiles}
        selectedProfile={selectedProfile}
        onProfileChange={handleProfileChange}
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar={selectedProfile?.avatar || 'U'}
          userName={selectedProfile?.name || 'Usuário'}
          userRole={selectedProfile?.role || 'Usuário'}
          notificationCount={0}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Planos de Assinatura'
        subtitle='Escolha o plano ideal para transformar sua gestão doméstica'
      />

        {/* Seção de Planos */}
        <PlansSection>
          <PlansGrid>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                $theme={theme}
                $isPopular={plan.isPopular}
                $isRecommended={plan.isRecommended}
              >
                {plan.isPopular && (
                  <PopularBadge $theme={theme}>
                    <AccessibleEmoji emoji='🔥' label='Emoji' /> MAIS POPULAR
                  </PopularBadge>
                )}
                {plan.isRecommended && (
                  <RecommendedBadge $theme={theme}>
                    <AccessibleEmoji emoji='⭐' label='Recomendado' />{' '}
                    RECOMENDADO
                  </RecommendedBadge>
                )}

                <PlanHeader>
                  <PlanName>{plan.name}</PlanName>
                  <PlanTagline>{plan.tagline}</PlanTagline>
                  <PlanDescription>{plan.description}</PlanDescription>
                </PlanHeader>

                <PriceSection>
                  <MonthlyPrice>{formatPrice(plan.monthlyPrice)}</MonthlyPrice>
                  {plan.monthlyPrice > 0 && (
                    <>
                      <AnnualPrice>
                        {formatPrice(plan.annualPrice)}/ano
                      </AnnualPrice>
                      <AnnualDiscount>({plan.annualDiscount})</AnnualDiscount>
                    </>
                  )}
                </PriceSection>

                <FeaturesList>
                  {plan.features.map((feature, index) => (
                    <FeatureItem key={index}>
                      <FeatureIcon>
                        <AccessibleEmoji emoji='✓' label='Emoji' />
                      </FeatureIcon>
                      <span>{feature}</span>
                    </FeatureItem>
                  ))}
                </FeaturesList>

                <PlanButton>
                  <ActionButton
                    variant={plan.buttonVariant}
                    theme={theme}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.buttonText}
                  </ActionButton>
                </PlanButton>
              </PlanCard>
            ))}
          </PlansGrid>
        </PlansSection>

        {/* Tabela Comparativa */}
        <ComparisonSection $theme={theme}>
          <ComparisonTitle>Comparativo de Recursos</ComparisonTitle>
          <ComparisonTable>
            <TableHeader>
              <TableHeaderCell>Recursos</TableHeaderCell>
              <TableHeaderCell>Free</TableHeaderCell>
              <TableHeaderCell>Lar Doce Lar</TableHeaderCell>
              <TableHeaderCell>Super Doméstica</TableHeaderCell>
              <TableHeaderCell>Ultra Pro</TableHeaderCell>
              <TableHeaderCell>Parceria Master</TableHeaderCell>
            </TableHeader>
            <TableRow>
              <TableCell>Dashboard Básico</TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dashboard Personalizado</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gestão de Tarefas</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gestão Financeira</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Comunicação Unificada</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Assistente Virtual</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Integração com Wearables</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gamificação</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>White Label</TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <XIcon>
                  <AccessibleEmoji emoji='✗' label='Emoji' />
                </XIcon>
              </TableCell>
              <TableCell>
                <CheckIcon>
                  <AccessibleEmoji emoji='✓' label='Emoji' />
                </CheckIcon>
              </TableCell>
            </TableRow>
          </ComparisonTable>
        </ComparisonSection>

        {/* FAQ */}
        <FAQSection $theme={theme}>
          <FAQTitle>Perguntas Frequentes</FAQTitle>
          <FAQGrid>
            {faqs.map(faq => (
              <FAQItem key={faq.id} $theme={theme}>
                <FAQQuestion>{faq.question}</FAQQuestion>
                <FAQAnswer>{faq.answer}</FAQAnswer>
              </FAQItem>
            ))}
          </FAQGrid>
        </FAQSection>

        {/* Depoimentos */}
        <TestimonialsSection $theme={theme}>
          <TestimonialsTitle>O que nossos clientes dizem</TestimonialsTitle>
          <TestimonialsGrid>
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} $theme={theme}>
                <TestimonialText>
                  &ldquo;{testimonial.text}&rdquo;
                </TestimonialText>
                <TestimonialAuthor>
                  <AuthorInfo>
                    <AuthorName>{testimonial.name}</AuthorName>
                    <AuthorRole>{testimonial.role}</AuthorRole>
                  </AuthorInfo>
                  <Rating>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} $filled={i < testimonial.rating}>
                        <AccessibleEmoji emoji='★' label='Emoji' />
                      </Star>
                    ))}
                  </Rating>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </TestimonialsSection>

        {/* Garantia */}
        <GuaranteeSection $theme={theme}>
          <GuaranteeTitle>
            <AccessibleEmoji emoji='🛡' label='Emoji' />️ Garantia de Satisfação
          </GuaranteeTitle>
          <GuaranteeText>
            Oferecemos 30 dias de garantia total. Se não ficar satisfeito,
            devolvemos seu dinheiro sem perguntas.
          </GuaranteeText>
        </GuaranteeSection>

        {/* Contato */}
        <ContactSection $theme={theme}>
          <ContactTitle>Precisa de ajuda para escolher?</ContactTitle>
          <ContactText>
            Nossa equipe está pronta para ajudar você a encontrar o plano ideal
            para suas necessidades.
          </ContactText>
          <ActionButton variant='secondary' theme={theme}>
            <AccessibleEmoji emoji='📞' label='Contato' /> Falar com
            Especialista
          </ActionButton>
        </ContactSection>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPlan(null);
        }}
        title={
          selectedPlan
            ? `Confirmar Assinatura - ${selectedPlan.name}`
            : 'Confirmar Assinatura'
        }
      >
        {selectedPlan && (
          <div>
            <ModalSection>
              <h3 className='section-title'>{selectedPlan.name}</h3>
              <p className='section-title'>{selectedPlan.description}</p>
              <PriceText>
                {formatPrice(selectedPlan.monthlyPrice)}
                {selectedPlan.monthlyPrice > 0 && <PriceUnit>/mês</PriceUnit>}
              </PriceText>
            </ModalSection>

            <ModalSection>
              <h4 className='section-title'>Recursos inclusos:</h4>
              <FeaturesList>
                {selectedPlan.features.map((feature, index) => (
                  <FeatureItem key={index}>{feature}</FeatureItem>
                ))}
              </FeaturesList>
            </ModalSection>

            <FlexRow>
              <FlexColumn>
                <ActionButton
                  variant='primary'
                  theme={theme}
                  onClick={handleSubscribe}
                >
                  {selectedPlan.buttonText}
                </ActionButton>
              </FlexColumn>
              <FlexColumn>
                <ActionButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedPlan(null);
                  }}
                >
                  Cancelar
                </ActionButton>
              </FlexColumn>
            </FlexRow>
          </div>
        )}
      </Modal>

      <ToastContainer
        position='top-center'
        autoClose={3000}
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

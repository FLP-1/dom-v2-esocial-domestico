// src/pages/communication.tsx
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import ActionButton from '../components/ActionButton';
import { FormGroup, Input, Label } from '../components/FormComponents';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useTheme } from '../hooks/useTheme';

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'audio' | 'image' | 'file';
  isRead: boolean;
  isOwn: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  isPinned: boolean;
  isMuted: boolean;
  participants: string[];
  onlineStatus: 'online' | 'offline' | 'away';
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  onlineStatus: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => (props.$sidebarCollapsed ? '100px' : '280px')};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
`;

const ChatLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: white;
  border-radius: 16px 0 0 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ConversationsSidebar = styled.div<{ $theme: any }>`
  width: 350px;
  background: #f8f9fa;
  border-right: 1px solid ${props => props.$theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div<{ $theme: any }>`
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid ${props => props.$theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.button<{ $theme: any }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$theme.colors.primary}20;
  color: ${props => props.$theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primary}30;
    transform: scale(1.1);
  }
`;

const SearchContainer = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.input<{ $theme: any }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 0.9rem;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme.colors.primary};
    background: white;
  }

  &::placeholder {
    color: #7f8c8d;
  }
`;

const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const ConversationItem = styled.div<{ $active: boolean; $theme: any }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props =>
    props.$active ? `${props.$theme.colors.primary}10` : 'transparent'};
  border-left: ${props =>
    props.$active
      ? `3px solid ${props.$theme.colors.primary}`
      : '3px solid transparent'};

  &:hover {
    background: ${props => props.$theme.colors.primary}05;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-right: 1rem;
`;

const Avatar = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const OnlineIndicator = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  background: ${props => {
    switch (props.$status) {
      case 'online':
        return '#2ecc71';
      case 'away':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  }};
`;

const ConversationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.p`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const UnreadBadge = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ChatHeader = styled.div<{ $theme: any }>`
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid ${props => props.$theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatHeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div<{ $isOwn: boolean; $theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.$isOwn ? 'flex-end' : 'flex-start')};
  animation: ${fadeIn} 0.3s ease-out;
`;

const MessageContent = styled.div<{ $isOwn: boolean; $theme: any }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background: ${props =>
    props.$isOwn ? props.$theme.colors.primary : 'white'};
  color: ${props => (props.$isOwn ? 'white' : '#2c3e50')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
`;

const MessageText = styled.p`
  margin: 0;
  line-height: 1.4;
`;

const MessageTime = styled.span<{ $isOwn: boolean }>`
  font-size: 0.7rem;
  color: ${props => (props.$isOwn ? 'rgba(255, 255, 255, 0.7)' : '#95a5a6')};
  margin-top: 0.25rem;
  align-self: ${props => (props.$isOwn ? 'flex-end' : 'flex-start')};
`;

const MessageInput = styled.div<{ $theme: any }>`
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid ${props => props.$theme.colors.border};
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #29abe2;
    background: white;
  }
`;

const MessageTextarea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 100px;
  min-height: 20px;
  font-family: inherit;

  &::placeholder {
    color: #7f8c8d;
  }
`;

const SendButton = styled.button<{ $theme: any; $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props =>
    props.$disabled ? '#e0e0e0' : props.$theme.colors.primary};
  color: ${props => (props.$disabled ? '#9e9e9e' : 'white')};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${props => props.$theme.colors.primary}40;
  }
`;

const AttachmentButton = styled.button<{ $theme: any }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primary}20;
    color: ${props => props.$theme.colors.primary};
  }
`;

const EmojiButton = styled.button<{ $theme: any }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primary}20;
    color: ${props => props.$theme.colors.primary};
  }
`;

const GroupModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContactsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem;
`;

const ContactItem = styled.div<{ $selected: boolean; $theme: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props =>
    props.$selected ? `${props.$theme.colors.primary}20` : 'transparent'};

  &:hover {
    background: ${props => props.$theme.colors.primary}10;
  }
`;

const ContactAvatar = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const ContactRole = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #29abe2;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
  text-align: center;
  padding: 2rem;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const EmptyStateDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export default function Communication() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const userProfiles = [
    {
      id: '1',
      name: 'João Silva',
      nickname: 'João',
      role: 'Empregador',
      group: 'Família Silva',
      avatar: 'JS',
      color: '#29ABE2',
    },
    {
      id: '2',
      name: 'Maria Santos',
      nickname: 'Maria',
      role: 'Empregada',
      group: 'Família Silva',
      avatar: 'MS',
      color: '#90EE90',
    },
  ];

  const [selectedProfile, setSelectedProfile] = useState(userProfiles[0]);
  const { theme, updateTheme } = useTheme(selectedProfile?.role.toLowerCase());

  const contacts: Contact[] = [
    {
      id: '2',
      name: 'Maria Santos',
      avatar: 'MS',
      role: 'Empregada',
      onlineStatus: 'online',
    },
    {
      id: '3',
      name: 'Ana Silva',
      avatar: 'AS',
      role: 'Familiar',
      onlineStatus: 'away',
      lastSeen: 'há 5 minutos',
    },
    {
      id: '4',
      name: 'Carlos Silva',
      avatar: 'CS',
      role: 'Familiar',
      onlineStatus: 'offline',
      lastSeen: 'há 2 horas',
    },
    {
      id: '5',
      name: 'Pedro Costa',
      avatar: 'PC',
      role: 'Parceiro',
      onlineStatus: 'online',
    },
  ];

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Maria Santos',
      avatar: 'MS',
      lastMessage: 'Obrigada pela informação! Vou organizar isso hoje.',
      lastMessageTime: '10:30',
      unreadCount: 2,
      isGroup: false,
      isPinned: true,
      isMuted: false,
      participants: ['1', '2'],
      onlineStatus: 'online',
    },
    {
      id: '2',
      name: 'Família Silva',
      avatar: '👨‍👩‍👧‍👦',
      lastMessage: 'Ana: Lembrem-se da reunião de amanhã às 14h',
      lastMessageTime: '09:45',
      unreadCount: 0,
      isGroup: true,
      isPinned: true,
      isMuted: false,
      participants: ['1', '2', '3', '4'],
      onlineStatus: 'online',
    },
    {
      id: '3',
      name: 'Carlos Silva',
      avatar: 'CS',
      lastMessage: 'Tudo certo, pai!',
      lastMessageTime: 'Ontem',
      unreadCount: 0,
      isGroup: false,
      isPinned: false,
      isMuted: false,
      participants: ['1', '4'],
      onlineStatus: 'offline',
    },
    {
      id: '4',
      name: 'Pedro Costa - Manutenção',
      avatar: 'PC',
      lastMessage: 'O orçamento ficou em R$ 350,00',
      lastMessageTime: 'Ontem',
      unreadCount: 1,
      isGroup: false,
      isPinned: false,
      isMuted: false,
      participants: ['1', '5'],
      onlineStatus: 'online',
    },
  ]);

  const [messages, setMessages] = useState<{
    [conversationId: string]: Message[];
  }>({
    '1': [
      {
        id: '1',
        senderId: '1',
        senderName: 'João Silva',
        senderAvatar: 'JS',
        content: 'Bom dia, Maria! Como está o andamento das tarefas de hoje?',
        timestamp: '10:15',
        type: 'text',
        isRead: true,
        isOwn: true,
      },
      {
        id: '2',
        senderId: '2',
        senderName: 'Maria Santos',
        senderAvatar: 'MS',
        content:
          'Bom dia! Está tudo indo bem. Já organizei a sala e agora vou para a cozinha.',
        timestamp: '10:18',
        type: 'text',
        isRead: true,
        isOwn: false,
      },
      {
        id: '3',
        senderId: '1',
        senderName: 'João Silva',
        senderAvatar: 'JS',
        content:
          'Perfeito! Lembre-se de verificar se há algum documento para organizar também.',
        timestamp: '10:25',
        type: 'text',
        isRead: true,
        isOwn: true,
      },
      {
        id: '4',
        senderId: '2',
        senderName: 'Maria Santos',
        senderAvatar: 'MS',
        content: 'Obrigada pela informação! Vou organizar isso hoje.',
        timestamp: '10:30',
        type: 'text',
        isRead: false,
        isOwn: false,
      },
    ],
    '2': [
      {
        id: '1',
        senderId: '3',
        senderName: 'Ana Silva',
        senderAvatar: 'AS',
        content: 'Lembrem-se da reunião de amanhã às 14h',
        timestamp: '09:45',
        type: 'text',
        isRead: true,
        isOwn: false,
      },
    ],
  });

  const handleProfileChange = (profileId: string) => {
    const profile = userProfiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      updateTheme(profile.role.toLowerCase());
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !selectedProfile) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: selectedProfile.id,
      senderName: selectedProfile.name,
      senderAvatar: selectedProfile.avatar,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'text',
      isRead: false,
      isOwn: true,
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), message],
    }));

    setNewMessage('');
    toast.success('Mensagem enviada!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedContacts.length < 2 || !selectedProfile) {
      toast.error('Nome do grupo e pelo menos 2 membros são obrigatórios!');
      return;
    }

    const newGroup: Conversation = {
      id: Date.now().toString(),
      name: groupName,
      avatar: '👥',
      lastMessage: 'Grupo criado',
      lastMessageTime: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      unreadCount: 0,
      isGroup: true,
      isPinned: false,
      isMuted: false,
      participants: [selectedProfile.id, ...selectedContacts],
      onlineStatus: 'online',
    };

    setConversations(prev => [newGroup, ...prev]);
    setGroupName('');
    setSelectedContacts([]);
    setShowGroupModal(false);
    toast.success('Grupo criado com sucesso!');
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];

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
          notificationCount={
            conversations.filter(c => c.unreadCount > 0).length
          }
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Comunicação Unificada'
        subtitle='Mantenha-se conectado com sua equipe através de mensagens instantâneas'
      />

      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <ChatLayout>
          <ConversationsSidebar $theme={theme}>
            <SidebarHeader $theme={theme}>
              <HeaderTitle>Conversas</HeaderTitle>
              <HeaderActions>
                <ActionIcon
                  $theme={theme}
                  onClick={() => setShowGroupModal(true)}
                >
                  👥
                </ActionIcon>
                <ActionIcon $theme={theme}>⚙️</ActionIcon>
              </HeaderActions>
            </SidebarHeader>

            <SearchContainer>
              <SearchInput
                $theme={theme}
                type='text'
                placeholder='Pesquisar conversas...'
              />
            </SearchContainer>

            <ConversationsList>
              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  $active={selectedConversation === conversation.id}
                  $theme={theme}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <AvatarContainer>
                    <Avatar
                      $color={conversation.isGroup ? '#9B59B6' : '#29ABE2'}
                    >
                      {conversation.avatar}
                    </Avatar>
                    {!conversation.isGroup && (
                      <OnlineIndicator $status={conversation.onlineStatus} />
                    )}
                  </AvatarContainer>

                  <ConversationContent>
                    <ConversationName>
                      {conversation.isPinned && '📌 '}
                      {conversation.name}
                      {conversation.isMuted && ' 🔇'}
                    </ConversationName>
                    <LastMessage>{conversation.lastMessage}</LastMessage>
                  </ConversationContent>

                  <ConversationMeta>
                    <MessageTime $isOwn={false}>
                      {conversation.lastMessageTime}
                    </MessageTime>
                    {conversation.unreadCount > 0 && (
                      <UnreadBadge $theme={theme}>
                        {conversation.unreadCount}
                      </UnreadBadge>
                    )}
                  </ConversationMeta>
                </ConversationItem>
              ))}
            </ConversationsList>
          </ConversationsSidebar>

          <ChatArea>
            {selectedConv ? (
              <>
                <ChatHeader $theme={theme}>
                  <ChatHeaderInfo>
                    <AvatarContainer>
                      <Avatar
                        $color={selectedConv.isGroup ? '#9B59B6' : '#29ABE2'}
                      >
                        {selectedConv.avatar}
                      </Avatar>
                      {!selectedConv.isGroup && (
                        <OnlineIndicator $status={selectedConv.onlineStatus} />
                      )}
                    </AvatarContainer>
                    <div>
                      <h3 style={{ margin: 0, color: '#2c3e50' }}>
                        {selectedConv.name}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: '#7f8c8d',
                        }}
                      >
                        {selectedConv.isGroup
                          ? `${selectedConv.participants.length} membros`
                          : selectedConv.onlineStatus === 'online'
                            ? 'Online'
                            : 'Offline'}
                      </p>
                    </div>
                  </ChatHeaderInfo>

                  <ChatHeaderActions>
                    <ActionIcon $theme={theme}>📞</ActionIcon>
                    <ActionIcon $theme={theme}>📹</ActionIcon>
                    <ActionIcon $theme={theme}>🔍</ActionIcon>
                    <ActionIcon $theme={theme}>⋯</ActionIcon>
                  </ChatHeaderActions>
                </ChatHeader>

                <ChatMessages>
                  {currentMessages.map(message => (
                    <MessageBubble
                      key={message.id}
                      $isOwn={message.isOwn}
                      $theme={theme}
                    >
                      <MessageContent $isOwn={message.isOwn} $theme={theme}>
                        <MessageText>{message.content}</MessageText>
                      </MessageContent>
                      <MessageTime $isOwn={message.isOwn}>
                        {message.timestamp}
                      </MessageTime>
                    </MessageBubble>
                  ))}
                  <div ref={messagesEndRef} />
                </ChatMessages>

                <MessageInput $theme={theme}>
                  <AttachmentButton $theme={theme}>📎</AttachmentButton>

                  <InputContainer>
                    <MessageTextarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Digite sua mensagem...'
                      rows={1}
                    />
                    <EmojiButton $theme={theme}>😊</EmojiButton>
                  </InputContainer>

                  <SendButton
                    $theme={theme}
                    $disabled={!newMessage.trim()}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    ➤
                  </SendButton>
                </MessageInput>
              </>
            ) : (
              <EmptyState>
                <EmptyStateIcon>💬</EmptyStateIcon>
                <EmptyStateTitle>Selecione uma conversa</EmptyStateTitle>
                <EmptyStateDescription>
                  Escolha uma conversa da lista ao lado para começar a conversar
                </EmptyStateDescription>
              </EmptyState>
            )}
          </ChatArea>
        </ChatLayout>
      </MainContent>

      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title='Criar Novo Grupo'
        buttonContainer={
          <ActionButton
            variant='secondary'
            onClick={() => setShowGroupModal(false)}
            theme={theme}
          >
            Cancelar
          </ActionButton>
        }
      >
        <GroupModalContent>
          <FormGroup>
            <Label>Nome do Grupo</Label>
            <Input
              $theme={theme}
              type='text'
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder='Digite o nome do grupo...'
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Selecionar Membros ({selectedContacts.length} selecionados)
            </Label>
            <ContactsList>
              {contacts.map(contact => (
                <ContactItem
                  key={contact.id}
                  $selected={selectedContacts.includes(contact.id)}
                  $theme={theme}
                  onClick={() => handleContactToggle(contact.id)}
                >
                  <ContactAvatar
                    $color={
                      contact.onlineStatus === 'online' ? '#2ecc71' : '#95a5a6'
                    }
                  >
                    {contact.avatar}
                  </ContactAvatar>
                  <ContactInfo>
                    <ContactName>{contact.name}</ContactName>
                    <ContactRole>{contact.role}</ContactRole>
                  </ContactInfo>
                  <Checkbox
                    type='checkbox'
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleContactToggle(contact.id)}
                  />
                </ContactItem>
              ))}
            </ContactsList>
          </FormGroup>

          <ActionButton
            variant='primary'
            onClick={handleCreateGroup}
            theme={theme}
            disabled={!groupName.trim() || selectedContacts.length < 2}
          >
            Criar Grupo
          </ActionButton>
        </GroupModalContent>
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

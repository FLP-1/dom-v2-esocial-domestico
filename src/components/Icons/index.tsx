// src/components/Icons/index.tsx
import AccessibleEmoji from '../AccessibleEmoji';

// Sistema centralizado de ícones reutilizáveis
export const Icons = {
  // Navegação
  home: <AccessibleEmoji emoji='🏠' label='Home' />,
  menu: <AccessibleEmoji emoji='☰' label='Menu' />,
  close: <AccessibleEmoji emoji='✕' label='Fechar' />,
  back: <AccessibleEmoji emoji='←' label='Voltar' />,

  // Ações
  check: <AccessibleEmoji emoji='✓' label='Check' />,
  x: <AccessibleEmoji emoji='✗' label='X' />,
  plus: <AccessibleEmoji emoji='➕' label='Adicionar' />,
  edit: <AccessibleEmoji emoji='✏' label='Editar' />,
  delete: <AccessibleEmoji emoji='🗑' label='Excluir' />,
  save: <AccessibleEmoji emoji='💾' label='Salvar' />,
  refresh: <AccessibleEmoji emoji='🔄' label='Atualizar' />,

  // Tempo e Relógio
  clock: <AccessibleEmoji emoji='⏰' label='Relógio' />,
  time: <AccessibleEmoji emoji='🕒' label='Tempo' />,

  // Documentos
  document: <AccessibleEmoji emoji='📄' label='Documento' />,
  folder: <AccessibleEmoji emoji='📁' label='Pasta' />,
  print: <AccessibleEmoji emoji='🖨' label='Imprimir' />,
  download: <AccessibleEmoji emoji='⬇' label='Download' />,

  // Comunicação
  message: <AccessibleEmoji emoji='💬' label='Mensagem' />,
  phone: <AccessibleEmoji emoji='📞' label='Telefone' />,
  video: <AccessibleEmoji emoji='📹' label='Vídeo' />,
  search: <AccessibleEmoji emoji='🔍' label='Pesquisar' />,
  attachment: <AccessibleEmoji emoji='📎' label='Anexo' />,
  smile: <AccessibleEmoji emoji='😊' label='Sorriso' />,
  send: <AccessibleEmoji emoji='➤' label='Enviar' />,

  // Usuários e Perfis
  user: <AccessibleEmoji emoji='👤' label='Usuário' />,
  profile: <AccessibleEmoji emoji='👤' label='Perfil' />,
  team: <AccessibleEmoji emoji='👥' label='Equipe' />,
  family: <AccessibleEmoji emoji='👨‍👩‍👧‍👦' label='Família' />,

  // Finanças
  money: <AccessibleEmoji emoji='💰' label='Dinheiro' />,
  payment: <AccessibleEmoji emoji='💵' label='Pagamento' />,
  bank: <AccessibleEmoji emoji='🏦' label='Banco' />,
  calculator: <AccessibleEmoji emoji='🧮' label='Calculadora' />,

  // Status e Alertas
  success: <AccessibleEmoji emoji='✅' label='Sucesso' />,
  warning: <AccessibleEmoji emoji='⚠' label='Aviso' />,
  error: <AccessibleEmoji emoji='❌' label='Erro' />,
  alert: <AccessibleEmoji emoji='⚠️' label='Alerta' />,
  notification: <AccessibleEmoji emoji='🔔' label='Notificação' />,
  pin: <AccessibleEmoji emoji='📌' label='Marcador' />,
  mute: <AccessibleEmoji emoji='🔇' label='Silenciado' />,

  // Status de Sistema
  online: <AccessibleEmoji emoji='🟢' label='Online' />,
  offline: <AccessibleEmoji emoji='🔴' label='Offline' />,
  pending: <AccessibleEmoji emoji='🟡' label='Pendente' />,
  neutral: <AccessibleEmoji emoji='⚪' label='Neutro' />,

  // Tarefas e Listas
  task: <AccessibleEmoji emoji='📋' label='Tarefa' />,
  checklist: <AccessibleEmoji emoji='📋' label='Checklist' />,
  shopping: <AccessibleEmoji emoji='🛍' label='Compras' />,

  // Segurança
  lock: <AccessibleEmoji emoji='🔒' label='Bloqueado' />,
  shield: <AccessibleEmoji emoji='🛡' label='Escudo' />,
  key: <AccessibleEmoji emoji='🔑' label='Chave' />,
  fingerprint: <AccessibleEmoji emoji='👆' label='Impressão Digital' />,

  // Governo e Integração
  government: <AccessibleEmoji emoji='🏛' label='Governo' />,
  building: <AccessibleEmoji emoji='🏢' label='Edifício' />,

  // Dashboard e Relatórios
  dashboard: <AccessibleEmoji emoji='📊' label='Dashboard' />,
  chart: <AccessibleEmoji emoji='📈' label='Gráfico' />,
  analytics: <AccessibleEmoji emoji='📊' label='Analytics' />,

  // Planos e Assinaturas
  diamond: <AccessibleEmoji emoji='💎' label='Diamante' />,
  star: <AccessibleEmoji emoji='⭐' label='Estrela' />,
  fire: <AccessibleEmoji emoji='🔥' label='Fogo' />,

  // Configurações
  settings: <AccessibleEmoji emoji='⚙' label='Configurações' />,
  gear: <AccessibleEmoji emoji='⚙️' label='Engrenagem' />,

  // Educação
  tutorial: <AccessibleEmoji emoji='🎓' label='Tutorial' />,
  graduation: <AccessibleEmoji emoji='🎓' label='Graduação' />,

  // Diversos
  rocket: <AccessibleEmoji emoji='🚀' label='Foguete' />,
  celebration: <AccessibleEmoji emoji='🎉' label='Celebração' />,
  loading: <AccessibleEmoji emoji='⏳' label='Carregando' />,
  eye: <AccessibleEmoji emoji='👁' label='Olho' />,
  eyeHide: <AccessibleEmoji emoji='👁' label='Ocultar' />,
  eyeShow: <AccessibleEmoji emoji='👁' label='Mostrar' />,
} as const;

// Tipos para TypeScript
export type IconName = keyof typeof Icons;

// Hook para usar ícones
export const useIcon = (name: IconName) => {
  return Icons[name];
};

// Componente para renderizar ícones
export const Icon: React.FC<{ name: IconName }> = ({ name }) => {
  return Icons[name];
};

export default Icons;

// Unified Components - Single source of truth for common UI elements
export { UnifiedButton } from '../UnifiedButton';
export { UnifiedCard } from '../UnifiedCard';
export {
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  UnifiedModal,
} from '../UnifiedModal';

// ✅ Centralized Reusable Components
export { default as ActionIcon } from '../ActionIcon';
export { default as NotificationBadge } from '../NotificationBadge';
export { default as PendingActionIcon } from '../PendingActionIcon';

// Shared styles and utilities
export * from '../shared/styles';

// Re-export common types
export type { UnifiedButtonProps } from '../UnifiedButton';
export type { UnifiedCardProps } from '../UnifiedCard';
export type { UnifiedModalProps } from '../UnifiedModal';

// Design System - Components Index
// Exporta todos os componentes padronizados

export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Modal, ModalBody, ModalFooter } from './Modal';

// Re-exportar tipos para facilitar uso
export type { default as ButtonProps } from './Button';
export type { default as CardProps } from './Card';
export type { default as InputProps } from './Input';

// Componentes compostos que podem ser criados
export * from './Button';
export * from './Card';
export * from './Input';
export * from './Modal';

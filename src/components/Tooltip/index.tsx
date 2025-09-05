// src/components/Tooltip/index.tsx
import { TippyProps } from '@tippyjs/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export function Tooltip(props: TippyProps) {
  return <Tippy {...props} />;
}

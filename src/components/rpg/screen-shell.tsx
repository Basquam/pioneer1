import { type ReactNode } from 'react';

import { QuestoryScreen } from '@/components/ui/questory-screen';

type ScreenShellProps = {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
};

export function ScreenShell({ children, edges = ['top'], padded = true }: ScreenShellProps) {
  return (
    <QuestoryScreen edges={edges} padded={padded}>
      {children}
    </QuestoryScreen>
  );
}

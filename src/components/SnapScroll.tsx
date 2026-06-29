import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function SnapScroll({ children }: Props) {
  return <>{children}</>;
}

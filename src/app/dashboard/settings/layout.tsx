import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '系统设置 - SSRBangumi',
  description: '配置和管理你的 SSRBangumi 系统设置',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import React, { Children } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';

export default function DashboardRootLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
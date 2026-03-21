"use client"; // Required if using Framer Motion inside these components

import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
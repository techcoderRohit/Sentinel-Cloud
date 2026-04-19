"use client";
import ControlBoard from '@/components/Dashboard/ControlBoard';
import React from 'react';
import { useParams } from 'next/navigation';

export default function SingleBoardPage() {
  const params = useParams();
  return <ControlBoard boardId={params.id} />;
}

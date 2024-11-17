import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { InventoryPageSkeleton } from './skeletons/LoadingSkeletons';

export const PrivateRoute: React.FC = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <InventoryPageSkeleton />;
  }

  return signed ? <Outlet /> : <Navigate to="/login" replace />;
};
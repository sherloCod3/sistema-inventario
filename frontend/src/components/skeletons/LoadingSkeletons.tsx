import React from 'react';
import { Card } from '../common/Card';

// Componente base do Skeleton
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Todos os componentes com export nomeado
export const StatusCardsSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    {[...Array(4)].map((_, index) => (
        <Card key={index} className="space-y-3">
        <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16" />
        </Card>
    ))}
    </div>
);

export const InventoryFiltersSkeleton: React.FC = () => (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="col-span-2">
    <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    </div>
);

export const InventoryTableSkeleton: React.FC = () => (
    <Card>
    <div className="flex justify-between items-center mb-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-10 w-24" />
    </div>

    <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
    <tr>
    {[...Array(7)].map((_, i) => (
        <th key={i} className="px-6 py-3">
        <Skeleton className="h-4 w-24" />
        </th>
    ))}
    </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
    {[...Array(5)].map((_, rowIndex) => (
        <tr key={rowIndex}>
        {[...Array(7)].map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
            <Skeleton className="h-4 w-full" />
            </td>
        ))}
        </tr>
    ))}
    </tbody>
    </table>
    </div>

    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
    <Skeleton className="h-4 w-48" />
    <div className="flex gap-2">
    {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-10" />
    ))}
    </div>
    </div>
    </Card>
);

export const InventoryPageSkeleton: React.FC = () => (
    <div className="min-h-screen bg-gray-100">
    <header className="bg-white shadow mb-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex justify-between items-center">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-10 w-32" />
    </div>
    </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="space-y-6">
    <InventoryFiltersSkeleton />
    <StatusCardsSkeleton />
    <InventoryTableSkeleton />
    </div>
    </main>
    </div>
);

import React from 'react';
import { Card } from '../common/Card';

// Componente de fallback para carregamento
export const InventoryTableSkeleton: React.FC = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(7)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export const StatusCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </Card>
      ))}
    </div>
  );
};

export const InventoryPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <StatusCardsSkeleton />
      <InventoryTableSkeleton />
    </div>
  );
};

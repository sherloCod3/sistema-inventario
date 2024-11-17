import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { MonitorSmartphone, Building2, History, AlertCircle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

export const StatusCards: React.FC = () => {
    const { items = [] } = useInventory();

    const stats = useMemo(() => {
        const sectors = new Set(items.map(item => item.sector)).size;
        const inMaintenance = items.filter(item => item.status === 'Em Manutenção').length;
        const poorCondition = items.filter(item => item.condition === 'Ruim').length;

        return {
            totalItems: items.length,
            sectors,
            inMaintenance,
            incidents: poorCondition
        };
    }, [items]);

    const cards = [
        {
            title: 'Total de Equipamentos',
            value: stats.totalItems,
            icon: MonitorSmartphone
        },
        {
            title: 'Setores',
            value: stats.sectors,
            icon: Building2
        },
        {
            title: 'Em Manutenção',
            value: stats.inMaintenance,
            icon: History
        },
        {
            title: 'Incidentes Abertos',
            value: stats.incidents,
            icon: AlertCircle
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <Card key={card.title}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{card.title}</span>
                        <card.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-2xl font-bold">{card.value}</div>
                </Card>
            ))}
        </div>
    );
};
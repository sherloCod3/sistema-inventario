import { InventoryItem } from '../types/inventory';

type ExportFormat = 'csv' | 'xlsx';

interface MenuItem {
    label: string;
    action: () => Promise<void>;
}

export class ExportService {
    private static readonly HEADERS = {
        patrimonyId: 'Nº Patrimônio',
        type: 'Tipo',
        sector: 'Setor',
        brand: 'Marca',
        modelName: 'Modelo',
        status: 'Status',
        condition: 'Condição'
    };

    static getExportMenuItem(format: ExportFormat, items: InventoryItem[]): MenuItem {
        return {
            label: `Exportar ${format.toUpperCase()}`,
            action: async () => {
                switch (format) {
                    case 'csv':
                        await this.exportToCSV(items);
                        break;
                    case 'xlsx':
                        throw new Error('Exportação para XLSX ainda não implementada');
                    default:
                        throw new Error(`Formato de exportação '${format}' não suportado`);
                }
            }
        };
    }

    private static formatDate(date: Date, format: string = 'yyyy-MM-dd'): string {
        const pad = (num: number) => String(num).padStart(2, '0');
        return format
            .replace('yyyy', String(date.getFullYear()))
            .replace('MM', pad(date.getMonth() + 1))
            .replace('dd', pad(date.getDate()));
    }

    private static formatFilename(baseName: string, format: 'csv' | 'xlsx'): string {
        const timestamp = this.formatDate(new Date());
        return `${baseName}_${timestamp}.${format}`;
    }

    private static convertToCSV(items: InventoryItem[], includeHeaders: boolean = true): string {
        const headers = Object.values(this.HEADERS);
        const rows = items.map(item => [
            item.patrimonyId,
            item.type,
            item.sector,
            item.brand,
            item.modelName, // Atualizado de model para modelName
            item.status,
            item.condition
        ]);

        const csvContent = rows.map(row => row.join(',')).join('\n');
        return includeHeaders ? `${headers.join(',')}\n${csvContent}` : csvContent;
    }

    static async exportToCSV(items: InventoryItem[], options: { filename?: string, includeHeaders?: boolean } = {}): Promise<void> {
        const {
            filename = 'inventario',
            includeHeaders = true
        } = options;

        try {
            const csvContent = this.convertToCSV(items, includeHeaders);
            const blob = new Blob(['\ufeff' + csvContent], {
                type: 'text/csv;charset=utf-8;'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.formatFilename(filename, 'csv');

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            throw new Error('Não foi possível exportar os dados para CSV');
        }
    }
}
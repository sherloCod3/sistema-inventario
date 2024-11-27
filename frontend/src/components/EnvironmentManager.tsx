import React from 'react';
import { Select } from './common/Select';

interface Environment {
    id: string;
    name: string;
}

interface EnvironmentManagerProps {
    environments: Environment[];
    selectedEnvironment: Environment;
    onEnvironmentChange: (env: Environment) => void;
    className?: string;
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
    environments,
    selectedEnvironment,
    onEnvironmentChange,
    className = ''
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value;
        const selectedEnv = environments.find(env => env.id === selectedId);
        if (selectedEnv) {
            onEnvironmentChange(selectedEnv);
        }
    };

    return (
        <div className={`Environment-manager ${className}`}>
            <Select
                id="Environment-select"
                value={selectedEnvironment.id}
                onChange={handleChange}
                className="environment-select"
                aria-label="Selecione o ambiente"
            >
                {environments.map(env => (
                    <option key={env.id} value={env.id}>
                        {env.name}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default EnvironmentManager;
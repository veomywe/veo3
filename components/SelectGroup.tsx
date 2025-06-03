
import React from 'react';
import { SelectOption } from '../types';

interface SelectGroupProps {
  label: string;
  id: string;
  name: string; // Added name prop
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
}

const SelectGroup: React.FC<SelectGroupProps> = ({ label, id, name, value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-blue-200 mb-1">{label}</label>
      <select
        id={id}
        name={name} // Changed from name={id} to name={name} (or added if missing)
        value={value}
        onChange={onChange}
        className="w-full bg-blue-900/30 border border-blue-400/50 rounded-lg p-3 text-blue-50 focus:ring-2 focus:ring-sky-400 focus:outline-none transition-shadow shadow-sm focus:shadow-md appearance-none bg-no-repeat bg-right pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237dd3fc' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}

      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-blue-800 text-blue-50">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectGroup;

import React from 'react';

interface InputGroupProps {
  label: string;
  id: string;
  name: string; // Added name prop
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, id, name, value, onChange, placeholder, type = 'text', rows = 3 }) => {
  const commonClasses = "w-full bg-blue-900/30 border border-blue-400/50 rounded-lg p-3 text-blue-50 placeholder-blue-300/70 focus:ring-2 focus:ring-sky-400 focus:outline-none transition-shadow shadow-sm focus:shadow-md";
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-blue-200 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name} // Changed from name={id} to name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={commonClasses}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name} // Changed from name={id} to name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default InputGroup;
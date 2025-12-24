
import React from 'react';
import { Field, Option } from '../types';

interface StepRendererProps {
  field: Field;
  value: any;
  onChange: (val: any) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({ field, value, onChange }) => {
  const handleMultiChoice = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(optionValue)) {
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  switch (field.type) {
    case 'singleChoice':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600 mb-4">{field.label}</label>
          <div className="grid grid-cols-1 gap-2">
            {field.options?.map((option: Option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                  value === option.value
                    ? 'border-sage-800 bg-sage-50 text-sage-800 ring-1 ring-sage-800'
                    : 'border-gray-200 hover:border-sage-200 hover:bg-white text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'multiChoice':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600 mb-4">{field.label}</label>
          <div className="grid grid-cols-1 gap-2">
            {field.options?.map((option: Option) => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiChoice(option.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-sage-800 bg-sage-50 text-sage-800 ring-1 ring-sage-800'
                      : 'border-gray-200 hover:border-sage-200 hover:bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="w-5 h-5 text-sage-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );

    case 'text':
    case 'email':
    case 'phone':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">{field.label}</label>
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-800/20 focus:border-sage-800 transition-all bg-white/50"
            placeholder={`Escribe aquí...`}
          />
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-sage-800 focus:ring-sage-800"
          />
          <label className="text-sm text-gray-600 cursor-pointer">{field.label}</label>
        </div>
      );

    default:
      return null;
  }
};


export type FieldType = 'singleChoice' | 'multiChoice' | 'text' | 'email' | 'phone' | 'checkbox';

export interface Option {
  value: string;
  label: string;
}

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: Option[];
}

export interface StepUI {
  showBack: boolean;
  showNext: boolean;
  ctaLabel: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  fields: Field[];
  ui: StepUI;
}

export interface Questionnaire {
  id: string;
  title: string;
  subtitle: string;
  steps: Step[];
}

export interface QuizResults {
  [key: string]: string | string[] | boolean;
}

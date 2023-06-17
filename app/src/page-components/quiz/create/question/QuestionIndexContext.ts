import { createContext, useContext } from 'react';

export const QuestionIndexContext = createContext<number | null>(null);
export function useQuestionIndex() {
  return useContext(QuestionIndexContext);
}

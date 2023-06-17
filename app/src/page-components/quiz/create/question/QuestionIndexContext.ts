import { createContext, useContext } from 'react';

export const QuestionIndexContext = createContext(-1);
export function useQuestionIndex() {
  return useContext(QuestionIndexContext);
}

import { createContext, useContext } from 'react';

export const AnswerIndexContext = createContext<number | null>(null);
export function useAnswerIndex() {
  return useContext(AnswerIndexContext);
}

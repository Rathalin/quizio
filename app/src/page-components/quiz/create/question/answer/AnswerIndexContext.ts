import { createContext, useContext } from 'react';

export const AnswerIndexContext = createContext(-1);
export function useAnswerIndex() {
  return useContext(AnswerIndexContext);
}

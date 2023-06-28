import { QuizEntity } from '@/graphql/generated/graphql';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
} from 'react';

export const sortOptions = ['createdAt', 'playCount'] as const;
export type SortOption = (typeof sortOptions)[number];
export const sortModes = ['asc', 'desc'] as const;
export type SortMode = (typeof sortModes)[number];
export type Sort = {
  option: SortOption;
  mode: SortMode;
};

export const defaultSort: Sort = {
  option: 'createdAt',
  mode: 'desc',
};

type SortContextType = {
  sort: Sort;
  setSort: Dispatch<SetStateAction<Sort>>;
};

const SortContext = createContext<SortContextType>({
  sort: defaultSort,
  setSort: () => {},
});

export function SortContextProvider({
  sort,
  setSort,
  children,
}: PropsWithChildren<SortContextType>) {
  return (
    <SortContext.Provider value={{ sort, setSort }}>
      {children}
    </SortContext.Provider>
  );
}

export function useSort() {
  const { sort, setSort } = useContext(SortContext);

  const toggleSortMode = useCallback(() => {
    if (sort.mode === 'asc') {
      setSort((prevSort) => ({ ...prevSort, mode: 'desc' }));
    } else {
      setSort((prevSort) => ({ ...prevSort, mode: 'asc' }));
    }
  }, [setSort, sort.mode]);

  const setSortOption = useCallback(
    (option: SortOption) => {
      setSort((prevSort) => ({ ...prevSort, option }));
    },
    [setSort]
  );

  const setSortMode = useCallback(
    (mode: SortMode) => {
      setSort((prevSort) => ({ ...prevSort, mode }));
    },
    [setSort]
  );

  return {
    sort,
    sortMode: sort.mode,
    sortOption: sort.option,
    setSort,
    setSortOption,
    setSortMode,
    toggleSortMode,
  };
}

export function sortQuiz(quizzes: QuizEntity[], sort: Sort) {
  switch (sort.option) {
    case 'createdAt':
      return [...quizzes].sort(
        sort.mode === 'asc' ? sortByCreatedAtAsc : sortByCreatedAtDesc
      );
    default:
      return quizzes;
  }
}

function sortByCreatedAtAsc(q1: QuizEntity, q2: QuizEntity) {
  return (
    Date.parse(q1.attributes?.createdAt) - Date.parse(q2.attributes?.createdAt)
  );
}

function sortByCreatedAtDesc(q1: QuizEntity, q2: QuizEntity) {
  return (
    Date.parse(q2.attributes?.createdAt) - Date.parse(q1.attributes?.createdAt)
  );
}

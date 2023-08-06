import { QuizFiltersInput } from '@/graphql/generated/graphql';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
} from 'react';

export const filterOptions = ['my-quizzes'] as const;
export type FilterOption = (typeof filterOptions)[number];

type FilterContextType = {
  filters: FilterOption[];
  setFilters: Dispatch<SetStateAction<FilterOption[]>>;
};

const FilterContext = createContext<FilterContextType>({
  filters: [],
  setFilters: () => [],
});

export function FilterProvider({
  filters,
  setFilters,
  children,
}: PropsWithChildren<FilterContextType>) {
  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const { filters, setFilters } = useContext(FilterContext);

  const hasFilter = useCallback(
    (filter: FilterOption) => filters.includes(filter),
    [filters]
  );

  const addFilter = useCallback(
    (filter: FilterOption) => {
      setFilters((prevFilters) => [...prevFilters, filter]);
    },
    [setFilters]
  );

  const removeFilter = useCallback(
    (filter: FilterOption) => {
      setFilters((prevFilters) => prevFilters.filter((f) => f !== filter));
    },
    [setFilters]
  );

  const toggleFilter = useCallback(
    (filter: FilterOption) => {
      if (filters.includes(filter)) {
        removeFilter(filter);
      } else {
        addFilter(filter);
      }
    },
    [addFilter, filters, removeFilter]
  );

  return {
    filters,
    setFilters,
    hasFilter,
    addFilter,
    toggleFilter,
    removeFilter,
  };
}

export function useComposeFilters(
  filters: FilterOption[],
  staticFilters?: QuizFiltersInput,
  username?: string
) {
  return useCallback(() => {
    const graphqlFilters: QuizFiltersInput = { ...staticFilters };
    if (username != null && filters.includes('my-quizzes')) {
      graphqlFilters.owner = { username: { eqi: username } };
    }
    return graphqlFilters;
  }, [filters, staticFilters, username]);
}

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
  filters: Set<FilterOption>;
  setFilters: Dispatch<SetStateAction<Set<FilterOption>>>;
};

const FilterContext = createContext<FilterContextType>({
  filters: new Set(),
  setFilters: () => new Set(),
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
    (key: FilterOption) => {
      return filters.has(key);
    },

    [filters]
  );

  const addFilter = useCallback(
    (key: FilterOption) => {
      setFilters((prev) => new Set(prev).add(key));
    },
    [setFilters]
  );

  const toggleFilter = useCallback(
    (key: FilterOption) => {
      setFilters((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    },
    [setFilters]
  );

  const removeFilter = useCallback(
    (key: FilterOption) => {
      setFilters((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    },
    [setFilters]
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

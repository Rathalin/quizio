import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

export const filterOptions = ['none', 'myQuizzes'] as const;
export type FilterOption = (typeof filterOptions)[number];

type FilterContextType = {
  filter: FilterOption;
  setFilter: Dispatch<SetStateAction<FilterOption>>;
};

const FilterContext = createContext<FilterContextType>({
  filter: 'none',
  setFilter: () => 'none',
});

export function FilterProvider({
  filter,
  setFilter,
  children,
}: PropsWithChildren<FilterContextType>) {
  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const { filter, setFilter } = useContext(FilterContext);

  return {
    filter,
    setFilter,
  };
}

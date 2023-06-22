import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

type SearchContextType = {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
};

const SearchContext = createContext<SearchContextType>({
  searchText: '',
  setSearchText: () => {},
});

export function SearchContextProvider({
  searchText,
  setSearchText,
  children,
}: PropsWithChildren<SearchContextType>) {
  return (
    <SearchContext.Provider value={{ searchText, setSearchText }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}

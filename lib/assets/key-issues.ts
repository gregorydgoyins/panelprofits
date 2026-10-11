/**
 * Landmark books that always anchor the assets rail (original-era printings).
 * A key whose book is not in rail_books with a usable price is simply absent — nothing is invented.
 */
export interface KeyIssue { series: string; issue: string; year: number }

export const KEY_ISSUES: KeyIssue[] = [
  { series: "Action Comics", issue: "1", year: 1938 },
  { series: "Action Comics", issue: "252", year: 1959 },
  { series: "Detective Comics", issue: "27", year: 1939 },
  { series: "Detective Comics", issue: "38", year: 1940 },
  { series: "Detective Comics", issue: "400", year: 1970 },
  { series: "Batman", issue: "1", year: 1940 },
  { series: "Batman", issue: "181", year: 1966 },
  { series: "Batman", issue: "404", year: 1987 },
  { series: "Batman", issue: "423", year: 1988 },
  { series: "Superman", issue: "1", year: 1939 },
  { series: "Showcase", issue: "4", year: 1956 },
  { series: "Showcase", issue: "22", year: 1959 },
  { series: "Amazing Fantasy", issue: "15", year: 1962 },
  { series: "Amazing Spider-Man", issue: "1", year: 1963 },
  { series: "Amazing Spider-Man", issue: "129", year: 1974 },
  { series: "Amazing Spider-Man", issue: "252", year: 1984 },
  { series: "Amazing Spider-Man", issue: "300", year: 1988 },
  { series: "Amazing Spider-Man", issue: "361", year: 1992 },
  { series: "Incredible Hulk", issue: "1", year: 1962 },
  { series: "Incredible Hulk", issue: "181", year: 1974 },
  { series: "X-Men", issue: "1", year: 1963 },
  { series: "X-Men", issue: "94", year: 1975 },
  { series: "Giant-Size X-Men", issue: "1", year: 1975 },
  { series: "New Mutants", issue: "98", year: 1991 },
  { series: "Fantastic Four", issue: "1", year: 1961 },
  { series: "Fantastic Four", issue: "48", year: 1966 },
  { series: "Tales of Suspense", issue: "39", year: 1963 },
  { series: "Journey into Mystery", issue: "83", year: 1962 },
  { series: "Iron Man", issue: "1", year: 1968 },
  { series: "Daredevil", issue: "1", year: 1964 },
  { series: "Teenage Mutant Ninja Turtles", issue: "1", year: 1984 },
  { series: "Spawn", issue: "1", year: 1992 },
  { series: "Wolverine", issue: "1", year: 1988 },
];

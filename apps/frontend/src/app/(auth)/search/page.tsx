/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useState } from "react";
import formStyles from "@/styles/Form.module.scss";
import resultsStyles from "@/styles/Results.module.scss";
import SearchSettings from "@/components/SearchSettings";
import LoadSearch from "@/components/LoadSearch";
import React from "react";
import { FiFilter } from "react-icons/fi";

interface Article {
  _id: string;
  title: string;
  authors: string[];
  source: string;
  publication_year: number;
  doi: string;
  abstract: string;
  claim?: string;
  linked_discussion?: string;
  isModerated: boolean;
  isRejected: boolean;
  createdAt: string;
}

const SearchArticles = () => {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [pubYearStart, setPubYearStart] = useState<number | "">("");
  const [pubYearEnd, setPubYearEnd] = useState<number | "">("");
  const [doi, setDoi] = useState("");
  const [practice, setPractice] = useState("");
  const [searchClaim, setSearchClaim] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const [claimFilter, setClaimFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [showClaimFilter, setShowClaimFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "title" as keyof Article,
    direction: "ascending" as "ascending" | "descending",
  });

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (
      !title.trim() &&
      authors.length === 0 &&
      pubYearStart === "" &&
      pubYearEnd === "" &&
      !doi.trim()
    ) {
      newErrors.title = "Please enter at least one search field";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildQueryString = () => {
    const queryParams: string[] = [];
    queryParams.push(`isModerated=true`);
    queryParams.push(`isRejected=false`);

    if (title) queryParams.push(`title=${encodeURIComponent(title)}`);
    if (authors.length > 0) {
      authors.forEach((author) =>
        queryParams.push(`authors[]=${encodeURIComponent(author)}`)
      );
    }
    if (pubYearStart !== "")
      queryParams.push(
        `publication_year_start=${encodeURIComponent(pubYearStart)}`
      );
    if (pubYearEnd !== "")
      queryParams.push(
        `publication_year_end=${encodeURIComponent(pubYearEnd)}`
      );
    if (doi) queryParams.push(`doi=${encodeURIComponent(doi)}`);
    if (practice) queryParams.push(`practice=${encodeURIComponent(practice)}`);
    if (searchClaim)
      queryParams.push(`claim=${encodeURIComponent(searchClaim)}`);

    return queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  };

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
      const queryString = buildQueryString();
      const url = `${base}/api/articles${queryString}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`);
      }

      const data: Article[] = await response.json();
      const approvedOnly = data.filter(
        (a) => a.isModerated === true && a.isRejected === false
      );

      setResults(approvedOnly);
      setLoading(false);
    } catch (error) {
      alert(error);
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const addAuthor = () => {
    setAuthors(authors.concat([""]));
  };
  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };
  const changeAuthor = (index: number, value: string) => {
    setAuthors(authors.map((oldVal, i) => (i === index ? value : oldVal)));
  };

  const sortResults = (key: keyof Article) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";

    const sortedResults = [...results].sort(
      //custom sort function to allow reversing direction if ascending or descending
      (a, b) => {
        const aVal = a[key] as any;
        const bVal = b[key] as any;
        if (aVal < bVal) return direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return direction === "ascending" ? 1 : -1;
        return 0;
      }
    );

    setResults(sortedResults);
    setSortConfig({ key, direction });
  };

  const columnKeys: (keyof Article)[] = [
    "title",
    "authors",
    "claim",
    "doi",
    "publication_year",
    "abstract",
  ];

  const getInitialVisibility = () => {
    if (typeof window === "undefined")
      return Object.fromEntries(columnKeys.map((k) => [k, true]));
    const stored = localStorage.getItem("searchColumnVisibility");
    if (stored) return JSON.parse(stored);
    const defaultVisibility = Object.fromEntries(
      columnKeys.map((k) => [k, true])
    );
    localStorage.setItem(
      "searchColumnVisibility",
      JSON.stringify(defaultVisibility)
    );
    return defaultVisibility;
  };

  const [visibleColumns, setVisibleColumns] =
    useState<Record<string, boolean>>(getInitialVisibility);

  React.useEffect(() => {
    const updateFromStorage = () => {
      const stored = localStorage.getItem("searchColumnVisibility");
      if (stored) {
        const parsed = JSON.parse(stored);
        setVisibleColumns((prev) =>
          JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
        );
      }
    };

    const interval = setInterval(updateFromStorage, 250);
    window.addEventListener("storage", updateFromStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  const applyFilters = (items: Article[]) => {
    return items
      .filter((r) => (claimFilter ? r.claim === claimFilter : true))
      .filter((r) => {
        if (yearFilter) return r.publication_year === yearFilter;
        if (pubYearStart !== "" && pubYearEnd !== "")
          return (
            r.publication_year >= pubYearStart &&
            r.publication_year <= pubYearEnd
          );
        if (pubYearStart !== "") return r.publication_year >= pubYearStart;
        if (pubYearEnd !== "") return r.publication_year <= pubYearEnd;
        return true;
      });
  };

  const saveSearch = () => {
    const name = prompt("Enter a name for this search:");
    if (!name) return;

    const searchState = {
      title,
      authors,
      pubYearStart,
      pubYearEnd,
      doi,
    };

    const existing = localStorage.getItem("saved_searches");
    const saved_searches = existing ? JSON.parse(existing) : {};

    saved_searches[name] = searchState;
    localStorage.setItem("saved_searches", JSON.stringify(saved_searches));
    alert("Search saved!");
  };

  const loadSearch = (searchState: {
    title: string;
    authors: string[];
    pubYearStart: number | "";
    pubYearEnd: number | "";
    doi: string;
  }) => {
    setTitle(searchState.title);
    setAuthors(searchState.authors);
    setPubYearStart(searchState.pubYearStart);
    setPubYearEnd(searchState.pubYearEnd);
    setDoi(searchState.doi);
  };

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formWrapper}>
        <div className={formStyles.searchHeader}>
          <h1 style={{ fontSize: "2rem" }}>Search Articles</h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button onClick={saveSearch} className={formStyles.buttonItem}>
              save search
            </button>
            <LoadSearch callback={loadSearch} />
            <SearchSettings />
          </div>
        </div>
        <form className={formStyles.form} onSubmit={submitSearch}>
          <label htmlFor="title">Title:</label>
          <input
            className={formStyles.formItem}
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Authors:</label>
          {authors.map((author, index) => (
            <div key={index} className={formStyles.arrayItem}>
              <input
                type="text"
                value={author}
                onChange={(e) => changeAuthor(index, e.target.value)}
                className={formStyles.formItem}
              />
              <button
                onClick={() => removeAuthor(index)}
                className={formStyles.buttonItem}
                type="button"
              >
                -
              </button>
            </div>
          ))}
          <button
            onClick={addAuthor}
            className={formStyles.buttonItem}
            style={{ marginLeft: "auto" }}
            type="button"
          >
            +
          </button>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label htmlFor="pubYearStart" style={{ margin: 0 }}>
              Publication Year Start:
            </label>
            <input
              className={formStyles.formItem}
              type="number"
              id="pubYearStart"
              value={pubYearStart}
              onChange={(e) =>
                setPubYearStart(
                  e.target.value === "" ? "" : parseInt(e.target.value)
                )
              }
              style={{ flex: "1 1 0" }}
            />

            <label htmlFor="pubYearEnd" style={{ margin: 0 }}>
              Publication Year End:
            </label>
            <input
              className={formStyles.formItem}
              type="number"
              id="pubYearEnd"
              value={pubYearEnd}
              onChange={(e) =>
                setPubYearEnd(
                  e.target.value === "" ? "" : parseInt(e.target.value)
                )
              }
              style={{ flex: "1 1 0" }}
            />
          </div>

          <label htmlFor="doi">DOI:</label>
          <input
            className={formStyles.formItem}
            type="text"
            id="doi"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
          />

          <label htmlFor="practice">Practice:</label>
          <input
            className={formStyles.formItem}
            type="text"
            id="practice"
            value={practice}
            onChange={(e) => setPractice(e.target.value)}
          />
          <label htmlFor="searchClaim">Claim:</label>
          <input
            className={formStyles.formItem}
            type="text"
            id="searchClaim"
            value={searchClaim}
            onChange={(e) => setSearchClaim(e.target.value)}
          />

          {errors.title && <p className={formStyles.error}>{errors.title}</p>}

          <button
            className={formStyles.buttonItem}
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {!loading && hasSearched && results.length === 0 && (
          <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
            No results found. Try adjusting your search criteria.
          </p>
        )}

        {results.length > 0 && (
          <div>
            <h2 className={resultsStyles.resultsHeader}>Search Results</h2>
            <table className={resultsStyles.resultsTable}>
              <thead>
                <tr>
                  {visibleColumns.title && (
                    <th onClick={() => sortResults("title")}>
                      Title{" "}
                      {sortConfig.key === "title"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                  {visibleColumns.authors && (
                    <th onClick={() => sortResults("authors")}>
                      Authors{" "}
                      {sortConfig.key === "authors"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                  {visibleColumns.claim && (
                    <th>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <div
                          onClick={() => sortResults("claim")}
                          style={{ cursor: "pointer" }}
                        >
                          Claims{" "}
                          {sortConfig.key === "claim"
                            ? sortConfig.direction === "ascending"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                        <button
                          onClick={() => setShowClaimFilter(!showClaimFilter)}
                          type="button"
                          aria-label="Toggle claim filter"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <FiFilter size={16} />
                        </button>
                      </div>
                      {showClaimFilter && (
                        <div className={resultsStyles.filterDropdown}>
                          <button onClick={() => setClaimFilter(null)}>
                            All
                          </button>
                          {[...new Set(results.map((r) => r.claim))].map(
                            (claim) => (
                              <button
                                key={claim}
                                onClick={() => {
                                  setClaimFilter(claim ?? null);
                                  setShowClaimFilter(false);
                                }}
                              >
                                {claim}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </th>
                  )}
                  {visibleColumns.doi && (
                    <th onClick={() => sortResults("doi")}>
                      DOI{" "}
                      {sortConfig.key === "doi"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                  {visibleColumns.publication_year && (
                    <th>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <div
                          onClick={() => sortResults("publication_year")}
                          style={{ cursor: "pointer" }}
                        >
                          Publication Year{" "}
                          {sortConfig.key === "publication_year"
                            ? sortConfig.direction === "ascending"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                        <button
                          onClick={() => setShowYearFilter(!showYearFilter)}
                          type="button"
                          aria-label="Toggle year filter"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <FiFilter size={16} />
                        </button>
                      </div>
                      {showYearFilter && (
                        <div className={resultsStyles.filterDropdown}>
                          <button onClick={() => setYearFilter(null)}>
                            All
                          </button>
                          {[...new Set(results.map((r) => r.publication_year))]
                            .sort((a, b) => a - b)
                            .map((year) => (
                              <button
                                key={year}
                                onClick={() => {
                                  setYearFilter(year);
                                  setShowYearFilter(false);
                                }}
                              >
                                {year}
                              </button>
                            ))}
                        </div>
                      )}
                    </th>
                  )}
                  {visibleColumns.abstract && (
                    <th onClick={() => sortResults("abstract")}>
                      Abstract {}
                      {sortConfig.key === "abstract"
                        ? sortConfig.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {applyFilters(results).map((result) => (
                  <tr key={result._id}>
                    {visibleColumns.title && <td>{result.title}</td>}
                    {visibleColumns.authors && (
                      <td>{result.authors.join(", ")}</td>
                    )}
                    {visibleColumns.claim && <td>{result.claim}</td>}
                    {visibleColumns.doi && <td>{result.doi}</td>}
                    {visibleColumns.publication_year && (
                      <td>{result.publication_year}</td>
                    )}
                    {visibleColumns.abstract && <td>{result.abstract}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchArticles;

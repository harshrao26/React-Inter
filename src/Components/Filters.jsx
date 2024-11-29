import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Filters = ({ categories, onChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    cashbackEnabled: false,
    isPromoted: false,
    isSharable: false,
    status: "",
    alphabet: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Sync filters with URL query params on mount and when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    // Update filter state based on the URL query parameters
    setFilters({
      search: queryParams.get("name_like") || "",
      category: queryParams.get("cats") || "",
      cashbackEnabled: queryParams.get("cashback_enabled") === "1",
      isPromoted: queryParams.get("is_promoted") === "1",
      isSharable: queryParams.get("is_sharable") === "1",
      status: queryParams.get("status") || "",
      alphabet: queryParams.get("alphabet") || "",
      sortBy: queryParams.get("_sort") || "name",
      sortOrder: queryParams.get("_order") || "asc",
    });

    // Trigger the parent callback to re-fetch data (if necessary)
    onChange(filters);
  }, [location.search, onChange]); // Re-run whenever the URL changes

  // Function to update the URL query string for the selected filter
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    // Start with the current URL query parameters
    const searchParams = new URLSearchParams(location.search);

    // Conditionally add or remove filters based on the value
    if (key === "cashbackEnabled") {
      if (value) {
        searchParams.set("cashback_enabled", "1");
      } else {
        searchParams.delete("cashback_enabled");
      }
    } else if (key === "search" && value) {
      searchParams.set("name_like", value);
    } else if (key === "search" && !value) {
      searchParams.delete("name_like");
    } else if (key === "category" && value) {
      searchParams.set("cats", value);
    } else if (key === "category" && !value) {
      searchParams.delete("cats");
    } else if (key === "status" && value) {
      searchParams.set("status", value);
    } else if (key === "status" && !value) {
      searchParams.delete("status");
    } else if (key === "alphabet" && value) {
      searchParams.set("alphabet", value);
    } else if (key === "alphabet" && !value) {
      searchParams.delete("alphabet");
    } else if (key === "sortBy" && value) {
      searchParams.set("_sort", value);
    } else if (key === "sortBy" && !value) {
      searchParams.delete("_sort");
    } else if (key === "sortOrder" && value) {
      searchParams.set("_order", value);
    } else if (key === "sortOrder" && !value) {
      searchParams.delete("_order");
    } else if (key === "isPromoted" && value) {
      searchParams.set("is_promoted", "1");
    } else if (key === "isPromoted" && !value) {
      searchParams.delete("is_promoted");
    } else if (key === "isSharable" && value) {
      searchParams.set("is_sharable", "1");
    } else if (key === "isSharable" && !value) {
      searchParams.delete("is_sharable");
    }

    // Update the URL with the modified query parameters
    navigate({
      pathname: "/stores", // Ensure this is the base URL for stores
      search: searchParams.toString(), // Pass only the modified query parameters
    });

    // Trigger the parent callback to update the state (if necessary)
    onChange(updatedFilters);
  };

  const handleSearchChange = (e) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, search: e.target.value };
      return updatedFilters;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const searchTerm = filters.search.trim();
      if (searchTerm !== "") {
        handleFilterChange("search", searchTerm);
      } else {
        // If the search term is empty, remove the search query from the URL
        handleFilterChange("search", "");
      }
    }
  };

  const handleClearSearch = () => {
    setFilters((prevFilters) => {
      const clearedFilters = { ...prevFilters, search: "" };
      onChange(clearedFilters); // Trigger parent callback to fetch data
      return clearedFilters;
    });
    navigate("/"); // Redirect to base route
  };

  return (
    <div className="filters-container space-y-4 p-4">
      <div className="flex">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border p-2 rounded-md w-1/3"
        >
          <option value="">All Status</option>
          <option value="publish">Published</option>
          <option value="draft">Draft</option>
          <option value="trash">Trash</option>
        </select>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress} // Listen for "Enter" key press
            className="border p-2 rounded-md w-full"
          />
          <button
            onClick={handleClearSearch}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
          >
            &times;
          </button>
        </div>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          className="border p-2 rounded-md w-1/3"
        >
          <option value="name">Alphabetical</option>
          <option value="clicks">Popularity</option>
          <option value="featured">Featured</option>
          <option value="cashback">Cashback</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1">
        {/* Alphabetical Filter */}
        {!filters.search &&
          [...Array(26)].map((_, i) => {
            const letter = String.fromCharCode(65 + i); // Generate A-Z (Uppercase for display)
            const lowerCaseLetter = letter.toLowerCase(); // Convert to lowercase for the query param

            return (
              <button
                key={lowerCaseLetter}
                onClick={() => handleFilterChange("alphabet", lowerCaseLetter)}
                className={`py-2 px-3 rounded-md border ${
                  filters.alphabet === lowerCaseLetter
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-400 hover:text-white focus:outline-none`}
              >
                {letter} {/* Display in uppercase */}
              </button>
            );
          })}
      </div>

      <div className="flex gap-10">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.cashbackEnabled}
            onChange={(e) =>
              handleFilterChange("cashbackEnabled", e.target.checked)
            }
            className="h-5 w-5"
          />
          <span>Cashback Enabled</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.isPromoted}
            onChange={(e) => handleFilterChange("isPromoted", e.target.checked)}
            className="h-5 w-5"
          />
          <span>Promoted Stores</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.isSharable}
            onChange={(e) => handleFilterChange("isSharable", e.target.checked)}
            className="h-5 w-5"
          />
          <span>Sharable Stores</span>
        </label>
      </div>
    </div>
  );
};

export default Filters;

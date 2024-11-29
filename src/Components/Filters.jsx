import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Filters = ({ categories, onChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultFilters = {
    status: "",
    search: "",
    sortBy: "name",
    alphabet: "",
    cashbackEnabled: false,
    isPromoted: false,
    isSharable: false,
  };

  const [filters, setFilters] = useState(defaultFilters);

  // Parse query parameters and set initial filter values
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {
      status: params.get("status") || "",
      search: params.get("name_like") || "",
      sortBy: params.get("_sort") || "name",
      alphabet: params.get("alphabet") || "",
      cashbackEnabled: params.get("cashback_enabled") === "1",
      isPromoted: params.get("is_promoted") === "1",
      isSharable: params.get("is_sharable") === "1",
    };
    setFilters(newFilters);
  }, [location.search]);

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.search) params.set("name_like", newFilters.search);
    if (newFilters.sortBy) params.set("_sort", newFilters.sortBy);
    if (newFilters.alphabet) {
      // Modify alphabet to name_like=^a for example
      params.set("name_like", `^${newFilters.alphabet}`);
    }
    if (newFilters.cashbackEnabled) params.set("cashback_enabled", "1");
    if (newFilters.isPromoted) params.set("is_promoted", "1");
    if (newFilters.isSharable) params.set("is_sharable", "1");

    navigate(`/stores?${params.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
    onChange(updatedFilters);
  };

  const handleSearchChange = (e) => {
    handleFilterChange("search", e.target.value);
  };

  const handleClearSearch = () => {
    handleFilterChange("search", "");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      updateURL(filters);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters(defaultFilters);
    navigate("/stores"); // Reset URL to `/stores`
    onChange(defaultFilters); // Inform parent of the change
  };

  // Fetch stores when filters change
  useEffect(() => {
    const fetchStores = async () => {
      const params = new URLSearchParams(location.search);
      try {
        const response = await axios.get(
          `http://localhost:3001/stores?${params.toString()}`
        );
        if (onChange) onChange(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [location.search, onChange]);

  return (
    <div className="filters-container space-y-4 p-4">
      {/* Status Filter */}
      <div className="flex space-x-4">
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

        {/* Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="border p-2 rounded-md w-full"
          />
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
            >
              &times;
            </button>
          )}
        </div>

        {/* Sort By */}
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

      {/* Alphabet Filter */}
      <div className="flex flex-wrap gap-1">
        {[...Array(26)].map((_, i) => {
          const letter = String.fromCharCode(65 + i);
          const lowerCaseLetter = letter.toLowerCase();
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
              {letter}
            </button>
          );
        })}
      </div>

      {/* Checkbox Filters */}
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
        <button
          onClick={handleClearAll}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;


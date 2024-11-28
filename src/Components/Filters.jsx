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
  }, [location.search]);

  // Function to update the URL query string for the selected filter
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    // Start the base URL
    let searchParams = new URLSearchParams();

    // Conditionally add filters to the searchParams
    if (key === "cashbackEnabled" && value) {
      searchParams.set("cashback_enabled", "1");
    } else if (key === "isPromoted" && value) {
      searchParams.set("is_promoted", "1");
    } else if (key === "isSharable" && value) {
      searchParams.set("is_sharable", "1");
    } else if (key === "search" && value) {
      searchParams.set("name_like", value);
    } else if (key === "category" && value) {
      searchParams.set("cats", value);
    } else if (key === "status" && value) {
      searchParams.set("status", value);
    } else if (key === "alphabet" && value) {
      searchParams.set("name_like", value);
    } else if (key === "sortBy" && value) {
      searchParams.set("_sort", value);
    } else if (key === "sortOrder" && value) {
      searchParams.set("_order", value);
    }

    // Update the URL with only the selected filter
    navigate({
      pathname: "/stores", // Ensure this is the base URL for stores
      search: searchParams.toString(), // Pass only the modified query parameters
    });

    // Pass the updated filters back to the parent if needed
    onChange(updatedFilters);
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

        <input
          type="text"
          placeholder="Search by name"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="border p-2 rounded-md w-full"
        />

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

        {(filters.sortBy === "featured" ||
          filters.sortBy === "clicks" ||
          filters.sortBy === "cashback") && (
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="border p-2 rounded-md w-full"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        )}
      </div>

      <div className="">
        {/* Alphabetical buttons */}
        <div className="flex flex-wrap gap-1">
          {[
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
          ].map((letter) => (
            <button
              key={letter}
              onClick={() => handleFilterChange("alphabet", letter)}
              className={`py-2 px-3 rounded-md border ${
                filters.alphabet === letter
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              } hover:bg-blue-400 hover:text-white focus:outline-none`}
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
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
          <span>Shareable Stores</span>
        </label>
      </div>
    </div>
  );
};

export default Filters;

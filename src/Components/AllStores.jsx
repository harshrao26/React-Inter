import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSpinner, FaBookmark, FaRegBookmark } from "react-icons/fa"; // Correct icons here
import { useLocation } from "react-router-dom"; // To access query parameters from the URL

const AllStores = () => {
  const [stores, setStores] = useState([]); // Stores list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Track the current page for pagination
  const [hasMore, setHasMore] = useState(true); // Check if more stores are available to load
  const [bookmarkedStores, setBookmarkedStores] = useState([]); // For storing bookmarked stores
  const observerRef = useRef(null); // For Intersection Observer

  const API_BASE_URL = "http://localhost:3001";

  // To watch changes in URL
  const location = useLocation();

  // Fetch the list of bookmarked stores from localStorage
  const getBookmarkedStores = () => {
    const storedBookmarks =
      JSON.parse(localStorage.getItem("bookmarkedStores")) || [];
    setBookmarkedStores(storedBookmarks);
  };

  // Bookmark a store
  const handleBookmark = (store) => {
    const updatedBookmarks = [...bookmarkedStores, store];
    setBookmarkedStores(updatedBookmarks);
    localStorage.setItem("bookmarkedStores", JSON.stringify(updatedBookmarks));
  };

  // Remove bookmark for a store
  const handleRemoveBookmark = (storeId) => {
    const updatedBookmarks = bookmarkedStores.filter(
      (store) => store.id !== storeId
    );
    setBookmarkedStores(updatedBookmarks);
    localStorage.setItem("bookmarkedStores", JSON.stringify(updatedBookmarks));
  };

  // Fetch stores from the API based on URL query params
  const fetchStores = async () => {
    if (loading || !hasMore) return; // Prevent duplicate requests or if no more data

    setLoading(true);
    try {
      // Extract query params from URL (e.g., ?name_like=s)
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("_page", page); // Add pagination to the query params
      queryParams.set("_limit", 20); // Limit to 20 items per page

      // Fetch stores based on query parameters
      const response = await axios.get(
        `${API_BASE_URL}/stores?${queryParams.toString()}`
      );

      // If response is empty, there are no more stores to load
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        // Append the newly fetched stores to the list
        setStores((prevStores) => [...prevStores, ...response.data]);

        // If the number of stores returned is less than the limit, there are no more stores
        setHasMore(response.data.length === 20);
      }
    } catch (err) {
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  // Infinite Scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1); // Move to next page
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current); // Start observing the scroll target
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current); // Cleanup observer
    };
  }, [hasMore, loading]);

  // Fetch stores when `page` changes or when the query parameters change in the URL
useEffect(() => {
  // Reset page and other states when URL changes
  setPage(1);
  setStores([]); // Clear the previous stores immediately
  setHasMore(true); // Reset the "hasMore" flag for fresh pagination
  setError(null); // Clear any previous errors
}, [location.search]);

  // Fetch stores when the `page` changes
  useEffect(() => {
    if (page === 1 || hasMore) {
      fetchStores(); // Initial fetch when page is 1 or URL changes
    }
  }, [page]);

  // Fetch the bookmarked stores on initial load
  useEffect(() => {
    getBookmarkedStores();
  }, []);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-4 text-xl text-blue-500">Loading stores...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="stores-list ">
      <h2 className="text-xl font-bold mb-4">Stores</h2>
      <ul className="flex flex-wrap gap-4 ">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex flex-col items-center relative h-48 w-80 justify-center border-[1px] border-zinc-100 rounded-xl shadow p-6 "
          >
            <img
              src={store.logo || "https://via.placeholder.com/50"}
              alt={store.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col gap-2 ">
              <h3 className="font-medium w-full text-center">{store.name}</h3>
              <p className="text-sm text-gray-500 w-full text-center">
                Upto ₹{store.cashback_amount || "No description available"}{" "}
                Cashback 
              </p>
              <h1 className="flex  w-full items-center justify-center ">
                <a href={store.homepage} target="_blank">
                  <p className="text-sm text-white rounded-2xl bg-blue-700 py-2 px-4 flex items-center justify-center ">
                    Shop Now
                  </p>
                </a>
              </h1>
            </div>
            <button
              onClick={() =>
                bookmarkedStores.some((item) => item.id === store.id)
                  ? handleRemoveBookmark(store.id)
                  : handleBookmark(store)
              }
              className="text-blue-500 hover:text-blue-700 absolute right-4 top-2"
            >
              {bookmarkedStores.some((item) => item.id === store.id) ? (
                <FaBookmark />
              ) : (
                <FaRegBookmark />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Loader */}
      {loading && page > 1 && (
        <div className="flex justify-center items-center py-4">
          <FaSpinner className="animate-spin text-2xl text-blue-500" />
          <span className="ml-2 text-blue-500">Loading more stores...</span>
        </div>
      )}

      {/* Intersection Observer Target */}
      <div ref={observerRef} style={{ height: "1px" }}></div>
    </div>
  );
};

export default AllStores;

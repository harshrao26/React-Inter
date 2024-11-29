import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSpinner, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const AllStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedStores, setBookmarkedStores] = useState([]);
  const observerRef = useRef(null);

  const API_BASE_URL = "http://localhost:3001";

  const location = useLocation(); // Watch URL changes

  // Fetch bookmarked stores from localStorage
  const getBookmarkedStores = () => {
    const storedBookmarks =
      JSON.parse(localStorage.getItem("bookmarkedStores")) || [];
    setBookmarkedStores(storedBookmarks);
  };

  // Bookmark or remove a bookmark
  const handleBookmark = (store) => {
    const updatedBookmarks = [...bookmarkedStores, store];
    setBookmarkedStores(updatedBookmarks);
    localStorage.setItem("bookmarkedStores", JSON.stringify(updatedBookmarks));
  };

  const handleRemoveBookmark = (storeId) => {
    const updatedBookmarks = bookmarkedStores.filter(
      (store) => store.id !== storeId
    );
    setBookmarkedStores(updatedBookmarks);
    localStorage.setItem("bookmarkedStores", JSON.stringify(updatedBookmarks));
  };

  // Fetch stores from API
  const fetchStores = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("_page", page);
      queryParams.set("_limit", 20);

      const response = await axios.get(
        `${API_BASE_URL}/stores?${queryParams.toString()}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setStores((prevStores) => [...prevStores, ...response.data]);
        setHasMore(response.data.length === 20);
      }
    } catch (err) {
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  };

  // Infinite Scroll setup with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, loading]);

  // Reset and re-fetch data on URL change
  useEffect(() => {
    setStores([]); // Clear previous data
    setPage(1); // Reset page number
    setHasMore(true); // Reset pagination flag
    setError(null); // Clear errors
  }, [location.search]);

  // Fetch data when `page` changes
  useEffect(() => {
    fetchStores();
  }, [page]);

  // Fetch bookmarked stores on initial load
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
    <div className="stores-list">
      <h2 className="text-xl font-bold mb-4">Stores</h2>
      <ul className="flex flex-wrap gap-4">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex flex-col items-center relative h-48 w-80 justify-center border-[1px] border-zinc-100 rounded-xl shadow p-6"
          >
            <img
              src={store.logo || "https://via.placeholder.com/50"}
              alt={store.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col gap-2">
              <h3 className="font-medium w-full text-center">{store.name}</h3>
              <p className="text-sm text-gray-500 w-full text-center">
                Upto ₹{store.cashback_amount || "No description available"}{" "}
                Cashback
              </p>
              <h1 className="flex w-full items-center justify-center">
                <a href={store.homepage} target="_blank" rel="noreferrer">
                  <p className="text-sm text-white rounded-2xl bg-blue-700 py-2 px-4 flex items-center justify-center">
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

      {loading && page > 1 && (
        <div className="flex justify-center items-center py-4">
          <FaSpinner className="animate-spin text-2xl text-blue-500" />
          <span className="ml-2 text-blue-500">Loading more stores...</span>
        </div>
      )}

      <div ref={observerRef} style={{ height: "1px" }}></div>
    </div>
  );
};

export default AllStores;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa"; // Importing spinner icon

const AllStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // To track if there are more stores to load
  const loaderRef = useRef(null); // To detect when the user reaches the bottom

  // Fetch stores function
  const fetchStores = async () => {
    if (loading) return; // Prevent multiple requests if already loading

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/stores?_page=${page}&_limit=20`
      );
      setStores((prevStores) => [...prevStores, ...response.data]); // Append new stores to the list

      // If fewer than 20 stores are returned, no more stores to load
      if (response.data.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching stores.");
    } finally {
      setLoading(false);
    }
  };

  // Scroll listener to detect when user reaches the bottom
  const handleScroll = () => {
    if (loaderRef.current) {
      const bottom = loaderRef.current.getBoundingClientRect().bottom;
      if (bottom <= window.innerHeight && hasMore && !loading) {
        // User has reached the bottom of the page
        setPage((prevPage) => prevPage + 1); // Increment the page number to fetch the next set of stores
      }
    }
  };

  useEffect(() => {
    // Fetch stores when page changes
    fetchStores();
  }, [page]);

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

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
      <ul className="space-y-4">
        {stores.map((store) => (
          <li
            key={store.id}
            className="flex items-center p-4 border rounded hover:shadow"
          >
            <img
              src={store.icon || "https://via.placeholder.com/50"}
              alt={store.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="font-medium">{store.name}</h3>
              <p className="text-sm text-gray-500">
                {store.description || "No description available"}
              </p>
              <p className="text-sm text-gray-400">
                Visits: {store.visits || 0}
              </p>
            </div>
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

      {/* Empty loader ref div */}
      <div ref={loaderRef} />
    </div>
  );
};

export default AllStores;

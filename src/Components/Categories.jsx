import React, { useState, useEffect } from "react";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch categories from the API using Axios
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/categories");
        setCategories(response.data); // Axios automatically parses JSON
      } catch (err) {
        setError(err.message || "An error occurred while fetching categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading categories...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="categories-list">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <ul className="space-y-4">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center p-4 border rounded hover:shadow"
          >
            <img
              src={category.icon}
              alt={category.name}
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-500">
                {category.store_count} stores • {category.visits} visits
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;

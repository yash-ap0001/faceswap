import React, { useState, useEffect } from 'react';

const UniversalPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Render a simple category card
  const renderCategoryCard = (category) => {
    return (
      <div className="col-md-4 mb-4" key={category.id}>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{category.name}</h5>
            <p className="card-text">{category.description}</p>
            <ul className="list-group list-group-flush">
              {category.subcategories && category.subcategories.map((subcategory) => (
                <li className="list-group-item" key={subcategory.id}>
                  <strong>{subcategory.name}</strong>: {subcategory.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container-fluid p-3">
      <h2 className="mb-4">Universal Categories</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading categories...</p>
        </div>
      ) : (
        <div className="row">
          {categories.map(category => renderCategoryCard(category))}
        </div>
      )}
    </div>
  );
};

export default UniversalPage;
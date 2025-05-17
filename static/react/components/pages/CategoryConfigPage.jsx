import React, { useEffect, useState, useRef } from 'react';
import { AddCategory, AddSubcategory, AddItem } from '../CategoryAdders';

const PURPLE_GRADIENT = 'linear-gradient(135deg, #2b1744 0%, #472a75 100%)';
const PURPLE_LIGHT = '#472a75';

function IconButton({ icon, onClick, title = '', className = '', style = {} }) {
  let btnStyle = {
    width: 32,
    height: 32,
    background: PURPLE_GRADIENT,
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    boxShadow: '0 1px 4px rgba(43,23,68,0.10)',
    fontSize: '1.15em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };
  return (
    <button
      className={`icon-btn d-inline-flex align-items-center justify-content-center ${className}`}
      onClick={onClick}
      title={title}
      style={btnStyle}
      tabIndex={0}
      type="button"
    >
      <i className={icon}></i>
    </button>
  );
}

function EditableLabel({ value, onSave, onDelete, plusIcon, plusAction }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return editing ? (
    <span>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        className="theme-input"
        style={{ width: 120, borderRadius: 8, border: `1.5px solid ${PURPLE_LIGHT}`, background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
      />
      <IconButton icon="fa-solid fa-check" onClick={() => { onSave(val); setEditing(false); }} title="Save" className="ms-1" />
      <IconButton icon="fa-solid fa-times" onClick={() => setEditing(false)} title="Cancel" className="ms-1" />
    </span>
  ) : (
    <span className="editable-label d-inline-flex align-items-center">
      <span style={{ fontWeight: 500, fontSize: '0.98em' }}>{value}</span>
      {plusIcon && (
        <IconButton icon={plusIcon} onClick={plusAction} title="Add" className="ms-1" />
      )}
      <span className="action-icons ms-1">
        <IconButton icon="fa-solid fa-edit" onClick={() => setEditing(true)} title="Edit" className="me-1" />
        <IconButton icon="fa-solid fa-trash" onClick={onDelete} title="Delete" />
      </span>
    </span>
  );
}

const CategoryConfigPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  // Refs for adders
  const addCategoryRef = useRef();
  const addSubRefs = useRef({}); // {catId: ref}
  const addItemRefs = useRef({}); // {catId_subId: ref}

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success && data.categories) setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Edit and delete handlers using backend
  const handleEditCategory = async (catId, name) => {
    await fetch(`/api/categories/${catId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    fetchCategories();
  };
  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Delete this category and all its subcategories/items?')) {
      await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      fetchCategories();
    }
  };
  const handleEditSub = async (catId, subId, name) => {
    await fetch(`/api/categories/${catId}/subcategories/${subId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    fetchCategories();
  };
  const handleDeleteSub = async (catId, subId) => {
    if (window.confirm('Delete this subcategory and all its items?')) {
      await fetch(`/api/categories/${catId}/subcategories/${subId}`, { method: 'DELETE' });
      fetchCategories();
    }
  };
  const handleEditItem = async (catId, subId, itemId, name) => {
    await fetch(`/api/categories/${catId}/subcategories/${subId}/items/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    fetchCategories();
  };
  const handleDeleteItem = async (catId, subId, itemId) => {
    if (window.confirm('Delete this item?')) {
      await fetch(`/api/categories/${catId}/subcategories/${subId}/items/${itemId}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  // Expand/collapse logic
  const toggleExpand = (type, id) => {
    setExpanded(prev => ({ ...prev, [`${type}-${id}`]: !prev[`${type}-${id}`] }));
  };

  // Helper to get or create refs for subcategory/item adders
  const getSubRef = (catId) => {
    if (!addSubRefs.current[catId]) addSubRefs.current[catId] = React.createRef();
    return addSubRefs.current[catId];
  };
  const getItemRef = (catId, subId) => {
    const key = `${catId}_${subId}`;
    if (!addItemRefs.current[key]) addItemRefs.current[key] = React.createRef();
    return addItemRefs.current[key];
  };

  return (
    <div style={{ marginTop: '64px', position: 'relative' }}>
      <div className="app-container" style={{ minHeight: '87vh', background: '#000' }}>
        <div className="main-container">
          <div className="content-container">
            <div className="card bg-dark text-light shadow-sm border-0 p-2 mt-4 mb-4">
              <div className="card-body p-4">
                <h4 className="mb-3 text-center" style={{ fontWeight: 700, letterSpacing: '0.01em' }}>Category Configuration</h4>
                <div className="d-flex flex-wrap align-items-center mb-2">
                  <IconButton icon="fa-solid fa-plus" onClick={() => addCategoryRef.current && addCategoryRef.current.open()} title="Add Category" style={{ marginRight: 8 }} />
                  <AddCategory ref={addCategoryRef} onAdded={fetchCategories} iconOnly />
                  {loading && <span className="ms-3 spinner-border spinner-border-sm text-light"></span>}
                </div>
                <div className="table-responsive">
                  <table className="table table-dark table-sm align-middle mb-0" style={{ fontSize: '0.98em' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '32%' }}>Category</th>
                        <th style={{ width: '32%' }}>Subcategory</th>
                        <th style={{ width: '32%' }}>Item</th>
                        <th style={{ width: '4%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <React.Fragment key={cat.id}>
                          <tr className="category-row">
                            <td>
                              <span style={{ cursor: 'pointer' }} onClick={() => toggleExpand('cat', cat.id)}>
                                <i className={`fas fa-chevron-${expanded[`cat-${cat.id}`] ? 'down' : 'right'} me-1`} style={{ fontSize: '0.9em' }}></i>
                                <EditableLabel
                                  value={cat.name}
                                  onSave={name => handleEditCategory(cat.id, name)}
                                  onDelete={() => handleDeleteCategory(cat.id)}
                                  plusIcon="fa-solid fa-plus"
                                  plusAction={() => getSubRef(cat.id).current && getSubRef(cat.id).current.open()}
                                />
                                <AddSubcategory ref={getSubRef(cat.id)} catId={cat.id} onAdded={fetchCategories} iconOnly />
                              </span>
                            </td>
                            <td colSpan={2}></td>
                            <td></td>
                          </tr>
                          {expanded[`cat-${cat.id}`] && cat.subcategories.map(sub => (
                            <React.Fragment key={sub.id}>
                              <tr className="subcategory-row">
                                <td></td>
                                <td>
                                  <span style={{ cursor: 'pointer' }} onClick={() => toggleExpand('sub', sub.id)}>
                                    <i className={`fas fa-chevron-${expanded[`sub-${sub.id}`] ? 'down' : 'right'} me-1`} style={{ fontSize: '0.9em' }}></i>
                                    <EditableLabel
                                      value={sub.name}
                                      onSave={name => handleEditSub(cat.id, sub.id, name)}
                                      onDelete={() => handleDeleteSub(cat.id, sub.id)}
                                      plusIcon="fa-solid fa-plus"
                                      plusAction={() => getItemRef(cat.id, sub.id).current && getItemRef(cat.id, sub.id).current.open()}
                                    />
                                    <AddItem ref={getItemRef(cat.id, sub.id)} catId={cat.id} subId={sub.id} onAdded={fetchCategories} iconOnly />
                                  </span>
                                </td>
                                <td></td>
                                <td></td>
                              </tr>
                              {expanded[`sub-${sub.id}`] && sub.items.map(item => (
                                <tr className="item-row" key={item.id}>
                                  <td></td>
                                  <td></td>
                                  <td>
                                    <EditableLabel
                                      value={item.name}
                                      onSave={name => handleEditItem(cat.id, sub.id, item.id, name)}
                                      onDelete={() => handleDeleteItem(cat.id, sub.id, item.id)}
                                    />
                                  </td>
                                  <td></td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <style>{`
              .editable-label .action-icons { opacity: 0; transition: opacity 0.2s; }
              .editable-label:hover .action-icons { opacity: 1; }
              .category-row, .subcategory-row, .item-row { border-bottom: 1px solid #232323; }
              .category-row td, .subcategory-row td, .item-row td { padding-top: 0.35rem; padding-bottom: 0.35rem; }
              .icon-btn { transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
              .icon-btn:focus, .icon-btn:hover { filter: brightness(1.15); box-shadow: 0 2px 8px rgba(43,23,68,0.18); }
              .AddCategory, .AddSubcategory, .AddItem { display: none !important; }
              .app-container { font-family: 'Inter', sans-serif; background-color: #000; min-height: 87vh; display: flex; flex-direction: column; color: #fff; }
              .main-container { display: flex; flex: 1; padding: 1.5rem; }
              .content-container { flex: 1; display: flex; flex-direction: column; max-width: 1600px; margin: 0 auto; width: 100%; }
              .theme-input {
                background: #18122B;
                color: #fff;
                border: 1.5px solid #472a75;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 1em;
                outline: none;
                box-shadow: 0 1px 6px rgba(74, 46, 140, 0.10);
                transition: border-color 0.2s, box-shadow 0.2s;
              }
              .theme-input:focus {
                border-color: #a259ff;
                box-shadow: 0 0 0 2px #a259ff44, 0 2px 12px #472a7533;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryConfigPage; 
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const PURPLE_GRADIENT = 'linear-gradient(135deg, #2b1744 0%, #472a75 100%)';

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

// Add Category
export const AddCategory = forwardRef(function AddCategory({ onAdded, iconOnly }, ref) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  useImperativeHandle(ref, () => ({ open: () => setShow(true) }));
  const handleAdd = async () => {
    if (!name.trim()) return setErr('Name required');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      onAdded();
      setShow(false); setName(''); setErr('');
    } else setErr(data.message || 'Error');
  };
  if (iconOnly) {
    return show ? (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New category"
          className="theme-input"
          style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
        />
        <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
        <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
        {err && <span style={{ color: 'red' }}>{err}</span>}
      </div>
    ) : null;
  }
  return show ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="New category"
        className="theme-input"
        style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
      />
      <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
      <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
      {err && <span style={{ color: 'red' }}>{err}</span>}
    </div>
  ) : (
    <button onClick={() => setShow(true)}>+ Add Category</button>
  );
});

// Add Subcategory
export const AddSubcategory = forwardRef(function AddSubcategory({ catId, onAdded, iconOnly }, ref) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  useImperativeHandle(ref, () => ({ open: () => setShow(true) }));
  const handleAdd = async () => {
    if (!name.trim()) return setErr('Name required');
    const res = await fetch(`/api/categories/${catId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      onAdded();
      setShow(false); setName(''); setErr('');
    } else setErr(data.message || 'Error');
  };
  if (iconOnly) {
    return show ? (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New subcategory"
          className="theme-input"
          style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
        />
        <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
        <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
        {err && <span style={{ color: 'red' }}>{err}</span>}
      </div>
    ) : null;
  }
  return show ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="New subcategory"
        className="theme-input"
        style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
      />
      <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
      <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
      {err && <span style={{ color: 'red' }}>{err}</span>}
    </div>
  ) : (
    <button onClick={() => setShow(true)}>+ Add Subcategory</button>
  );
});

// Add Item
export const AddItem = forwardRef(function AddItem({ catId, subId, onAdded, iconOnly }, ref) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  useImperativeHandle(ref, () => ({ open: () => setShow(true) }));
  const handleAdd = async () => {
    if (!name.trim()) return setErr('Name required');
    const res = await fetch(`/api/categories/${catId}/subcategories/${subId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      onAdded();
      setShow(false); setName(''); setErr('');
    } else setErr(data.message || 'Error');
  };
  if (iconOnly) {
    return show ? (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New item"
          className="theme-input"
          style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
        />
        <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
        <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
        {err && <span style={{ color: 'red' }}>{err}</span>}
      </div>
    ) : null;
  }
  return show ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="New item"
        className="theme-input"
        style={{ width: 180, borderRadius: 8, border: '1.5px solid #472a75', background: '#18122B', color: '#fff', padding: '6px 12px', fontSize: '1em', outline: 'none', boxShadow: '0 1px 6px rgba(74, 46, 140, 0.10)' }}
      />
      <IconButton icon="fa-solid fa-check" onClick={handleAdd} title="Add" />
      <IconButton icon="fa-solid fa-times" onClick={() => setShow(false)} title="Cancel" />
      {err && <span style={{ color: 'red' }}>{err}</span>}
    </div>
  ) : (
    <button onClick={() => setShow(true)}>+ Add Item</button>
  );
});

<style>{`
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
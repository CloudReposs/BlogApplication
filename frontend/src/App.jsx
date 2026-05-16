import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/posts`;

// ── Create Modal ─────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create post.');
      } else {
        onCreate(await res.json());
        onClose();
      }
    } catch {
      setError('Failed to create post. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>New Post</h2>
            <p className="modal-sub">Share your thoughts with the world</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">+</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="create-title">Title</label>
            <input
              id="create-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a compelling title..."
              autoFocus
            />
          </div>
          <div className="field-group">
            <label htmlFor="create-content">Content</label>
            <textarea
              id="create-content"
              rows="8"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────
function EditModal({ post, onClose, onSave }) {
  const [title, setTitle]     = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to update post.');
      } else {
        onSave(await res.json());
      }
    } catch {
      setError('Failed to update post. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Post</h2>
            <p className="modal-sub">Make changes to your post</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">+</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="field-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              autoFocus
            />
          </div>
          <div className="field-group">
            <label>Content</label>
            <textarea
              rows="8"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── View Modal ──────────────────────────────────────────────
function ViewModal({ post, onClose, onEdit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-view" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="view-title">{post.title}</h2>
            <p className="modal-sub">
              {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">+</button>
        </div>
        <div className="view-content">{post.content}</div>
        <div className="view-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => { onClose(); onEdit(post); }}>Edit Post</button>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────
function PostCard({ post, onDelete, onEdit, onView }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const excerpt = post.content.length > 140 ? post.content.slice(0, 140) + '…' : post.content;

  return (
    <article className="post-card">
      <div className="post-card-body" onClick={() => onView(post)} style={{ cursor: 'pointer' }}>
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{excerpt}</p>
        <span className="read-more">Read more</span>
      </div>
      <div className="post-card-footer">
        <time className="post-date">
          {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        <div className="post-actions">
          {confirmDelete ? (
            <>
              <button className="btn-danger-solid" onClick={() => onDelete(post._id)}>Confirm</button>
              <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => onEdit(post)}>Edit</button>
              <button className="btn-danger-ghost" onClick={() => setConfirmDelete(true)}>Delete</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Main App ─────────────────────────────────────────────────
function App() {
  const [posts, setPosts]           = useState([]);
  const [error, setError]           = useState('');
  const [fetching, setFetching]     = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setFetching(true);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      setPosts(data);
    } catch {
      setError('Failed to load posts. Is the backend running?');
    } finally {
      setFetching(false);
    }
  };

  const handleCreate  = (newPost) => setPosts((prev) => [newPost, ...prev]);

  const handleDelete  = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError('Failed to delete post.');
    }
  };

  const handleSaveEdit = (updated) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setEditingPost(null);
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="brand-mark">B</div>
            <span className="brand-name">BlogSpace</span>
          </div>
          <button className="btn-create" onClick={() => setShowCreate(true)}>+ New Post</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="page-hero">
        <div className="hero-inner">
          <h1>All Posts <span className="post-count-badge">{posts.length}</span></h1>
          <p className="hero-sub">A collection of stories, ideas and reflections</p>
        </div>
      </div>

      {/* Main */}
      <main className="container">
        {error && <p className="global-error">{error}</p>}

        {fetching ? (
          <div className="posts-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3>No posts yet</h3>
            <p>Get started by writing your first post.</p>
            <button className="btn-create" onClick={() => setShowCreate(true)}>Create your first post</button>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onEdit={setEditingPost}
                onView={setViewingPost}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="brand-name">BlogSpace</span>
          <span className="footer-copy">&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>

      {/* Modals */}
      {showCreate  && <CreateModal onClose={() => setShowCreate(false)}  onCreate={handleCreate} />}
      {viewingPost && <ViewModal   post={viewingPost} onClose={() => setViewingPost(null)} onEdit={(p) => { setViewingPost(null); setEditingPost(p); }} />}
      {editingPost && <EditModal   post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSaveEdit} />}
    </div>
  );
}

export default App;

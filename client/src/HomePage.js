import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import { UserContext } from './UserContext';
import './HomePage.css';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

const HomePage = () => {
  const { userInfo } = useContext(UserContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedBlogsToDelete, setSelectedBlogsToDelete] = useState([]);
  const [newBlog, setNewBlog] = useState({
    name: '',
    description: '',
    imageUrl: null,
    blogUrl: ''
  });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentBlogs();
  }, []);

  const fetchRecentBlogs = async () => {
    try {
      const response = await fetch('http://localhost:4000/blogs/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setNewBlog({ ...newBlog, imageUrl: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setError('');

    if (!userInfo || !userInfo.id) {
      setError('Please log in to create a blog');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newBlog.name);
      formData.append('description', newBlog.description);
      formData.append('blogUrl', newBlog.blogUrl);
      formData.append('userId', userInfo.id);

      if (newBlog.imageUrl) {
        formData.append('image', newBlog.imageUrl);
      } else {
        setError('Please select an image');
        return;
      }

      const url = editingBlogId 
        ? `http://localhost:4000/blogs/${editingBlogId}`
        : 'http://localhost:4000/blogs/create';

      const method = editingBlogId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        fetchRecentBlogs();
        setNewBlog({ name: '', description: '', imageUrl: null, blogUrl: '' });
        setPreviewImage(null);
        setEditingBlogId(null);
        setIsEditMode(false);
        alert(editingBlogId ? 'Blog updated successfully!' : 'Blog created successfully!');
      } else {
        setError(data.message || 'Error creating/updating blog');
      }
    } catch (error) {
      console.error('Error creating/updating blog:', error);
      setError('Error creating/updating blog. Please try again.');
    }
  };

  const handleBlogClick = (url) => {
    if (!isDeleteMode) {
      window.open(url, '_blank');
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setIsDeleteMode(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteMode(!isDeleteMode);
    setIsEditMode(false);
    setSelectedBlogsToDelete([]);
  };

  const handleBlogSelect = (blogId) => {
    if (isEditMode) {
      const blogToEdit = recentBlogs.find(blog => blog._id === blogId);
      if (blogToEdit) {
        setNewBlog({
          name: blogToEdit.name,
          description: blogToEdit.description,
          blogUrl: blogToEdit.blogUrl,
          imageUrl: null
        });
        setEditingBlogId(blogId);
        setShowCreateModal(true);
        setIsEditMode(false);
      }
    } else if (isDeleteMode) {
      setSelectedBlogsToDelete(prev => {
        if (prev.includes(blogId)) {
          return prev.filter(id => id !== blogId);
        } else {
          return [...prev, blogId];
        }
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBlogsToDelete.length === 0) {
      alert('Please select blogs to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete the selected blogs?')) {
      try {
        const response = await fetch('http://localhost:4000/blogs/delete-multiple', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blogIds: selectedBlogsToDelete })
        });

        if (response.ok) {
          fetchRecentBlogs();
          setSelectedBlogsToDelete([]);
          setIsDeleteMode(false);
          alert('Selected blogs deleted successfully!');
        } else {
          alert('Error deleting blogs');
        }
      } catch (error) {
        console.error('Error deleting blogs:', error);
        alert('Error deleting blogs');
      }
    }
  };

  const filteredBlogs = activeTab === 'my' && userInfo
    ? recentBlogs.filter(blog => blog.userId === userInfo.id)
    : recentBlogs;

  return (
    <div className="home-container">
      <Header />
      <div className="home-page">
        <div className="main-content">
          <div className="welcome-section">
            <h1>Welcome to BlogShare</h1>
            <p>Share your thoughts, ideas, and stories with the world</p>
            <button className="create-blog-btn" onClick={() => {
              setShowCreateModal(true);
              setEditingBlogId(null);
              setNewBlog({ name: '', description: '', imageUrl: null, blogUrl: '' });
              setPreviewImage(null);
            }}>
              <FaPlus /> Create New Blog
            </button>
            <div className="blog-actions-container">
              <button 
                className={`edit-blogs-btn ${isEditMode ? 'active' : ''}`} 
                onClick={handleEditClick}
              >
                <FaEdit /> Edit Blog
              </button>
              <button 
                className={`delete-blogs-btn ${isDeleteMode ? 'active' : ''}`} 
                onClick={handleDeleteClick}
              >
                <FaTrash /> Delete Blogs
              </button>
              {isDeleteMode && selectedBlogsToDelete.length > 0 && (
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeleteSelected}
                >
                  <FaCheck /> Confirm Delete ({selectedBlogsToDelete.length})
                </button>
              )}
            </div>
          </div>

          {showCreateModal && (
            <div className="modal-overlay">
              <div className="create-blog-modal">
                <button className="close-modal" onClick={() => {
                  setShowCreateModal(false);
                  setEditingBlogId(null);
                }}>
                  <FaTimes />
                </button>
                <h2>{editingBlogId ? 'Edit Blog' : 'Create New Blog'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleCreateBlog}>
                  <div className="form-group">
                    <label>Blog Name:</label>
                    <input
                      type="text"
                      value={newBlog.name}
                      onChange={(e) => setNewBlog({ ...newBlog, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={newBlog.description}
                      onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Blog URL:</label>
                    <input
                      type="url"
                      value={newBlog.blogUrl}
                      onChange={(e) => setNewBlog({ ...newBlog, blogUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Image:</label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    {previewImage && (
                      <img src={previewImage} alt="Preview" className="image-preview" />
                    )}
                  </div>
                  <button type="submit" className="submit-btn">
                    {editingBlogId ? 'Update Blog' : 'Create Blog'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <section className="recent-blogs">
            <h2 className="section-title">Blogs</h2>
            <div className="section-tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Blogs
              </button>
              {userInfo && (
                <button
                  className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  My Blogs
                </button>
              )}
            </div>
            <div className="blogs-grid">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className={`blog-card ${(isEditMode || isDeleteMode) ? 'selectable' : ''} ${
                    selectedBlogsToDelete.includes(blog._id) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    if (isEditMode || isDeleteMode) {
                      handleBlogSelect(blog._id);
                    } else {
                      handleBlogClick(blog.blogUrl);
                    }
                  }}
                >
                  <div className="blog-image">
                    <img src={blog.imageUrl} alt={blog.name} />
                  </div>
                  <div className="blog-info">
                    <h3>{blog.name}</h3>
                    <p>{blog.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
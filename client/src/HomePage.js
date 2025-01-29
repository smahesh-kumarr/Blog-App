import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import { UserContext } from './UserContext';
import './HomePage.css';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

const HomePage = () => {
  const { userInfo } = useContext(UserContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
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
    fetchAllBlogs();
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.email) {
      fetchUserBlogs();
    } else {
      setMyBlogs([]);
    }
  }, [userInfo]);

  const fetchAllBlogs = async () => {
    try {
      const response = await fetch('http://localhost:4000/blogs/recent');
      if (response.ok) {
        const data = await response.json();
        setAllBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching all blogs:', error);
    }
  };

  const fetchUserBlogs = async () => {
    if (!userInfo?.email) return;
    try {
      const response = await fetch(`http://localhost:4000/blogs/user/${encodeURIComponent(userInfo.email)}`);
      if (response.ok) {
        const data = await response.json();
        setMyBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setError('');

    if (!userInfo || !userInfo.email) {
      setError('Please log in to create a blog');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newBlog.name);
      formData.append('description', newBlog.description);
      formData.append('blogUrl', newBlog.blogUrl);
      formData.append('userEmail', userInfo.email);

      if (newBlog.imageUrl) {
        formData.append('image', newBlog.imageUrl);
      } else {
        setError('Please select an image');
        return;
      }

      const response = await fetch('http://localhost:4000/blogs/create', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewBlog({ name: '', description: '', imageUrl: null, blogUrl: '' });
        setPreviewImage(null);
        await Promise.all([fetchAllBlogs(), fetchUserBlogs()]);
        setActiveTab('my');
        alert('Blog created successfully!');
      } else {
        setError(data.message || 'Error creating blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      setError('Error creating blog. Please try again.');
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    setError('');

    if (!userInfo || !userInfo.email) {
      setError('Please log in to update the blog');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newBlog.name);
      formData.append('description', newBlog.description);
      formData.append('blogUrl', newBlog.blogUrl);
      formData.append('userEmail', userInfo.email);

      if (newBlog.imageUrl instanceof File) {
        formData.append('image', newBlog.imageUrl);
      }

      const response = await fetch(`http://localhost:4000/blogs/${editingBlogId}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewBlog({ name: '', description: '', imageUrl: null, blogUrl: '' });
        setEditingBlogId(null);
        setPreviewImage(null);
        setIsEditMode(false);
        await Promise.all([fetchAllBlogs(), fetchUserBlogs()]);
        alert('Blog updated successfully!');
      } else {
        setError(data.message || 'Error updating blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      setError('Error updating blog. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!userInfo || !userInfo.email) {
      alert('Please log in to delete blogs');
      return;
    }

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
          body: JSON.stringify({ 
            blogIds: selectedBlogsToDelete,
            userEmail: userInfo.email 
          })
        });

        if (response.ok) {
          await Promise.all([fetchAllBlogs(), fetchUserBlogs()]);
          setSelectedBlogsToDelete([]);
          setIsDeleteMode(false);
          alert('Selected blogs deleted successfully!');
        } else {
          const data = await response.json();
          alert(data.message || 'Error deleting blogs');
        }
      } catch (error) {
        console.error('Error deleting blogs:', error);
        alert('Error deleting blogs');
      }
    }
  };

  const handleBlogClick = (url, e) => {
    e.stopPropagation();
    if (!isDeleteMode && !isEditMode) {
      window.open(url, '_blank');
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setIsDeleteMode(false);
    setSelectedBlogsToDelete([]);
  };

  const handleDeleteClick = () => {
    setIsDeleteMode(!isDeleteMode);
    setIsEditMode(false);
    setSelectedBlogsToDelete([]);
  };

  const handleBlogSelect = (blogId) => {
    if (isEditMode) {
      const blogToEdit = myBlogs.find(blog => blog._id === blogId);
      if (blogToEdit && blogToEdit.userEmail === userInfo?.email) {
        setNewBlog({
          name: blogToEdit.name,
          description: blogToEdit.description,
          blogUrl: blogToEdit.blogUrl,
          imageUrl: null
        });
        setEditingBlogId(blogId);
        setShowCreateModal(true);
        setIsEditMode(false);
      } else {
        alert('You can only edit your own blogs!');
      }
    } else if (isDeleteMode) {
      const blogToDelete = myBlogs.find(blog => blog._id === blogId);
      if (blogToDelete && blogToDelete.userEmail === userInfo?.email) {
        setSelectedBlogsToDelete(prev => {
          if (prev.includes(blogId)) {
            return prev.filter(id => id !== blogId);
          } else {
            return [...prev, blogId];
          }
        });
      } else {
        alert('You can only delete your own blogs!');
      }
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

  const isUserBlog = (blog) => userInfo && blog.userEmail === userInfo.email;

  const displayedBlogs = activeTab === 'my' ? myBlogs : allBlogs;

  return (
    <div className="home-container">
      <Header />
      <div className="home-page">
        <div className="main-content">
          <div className="welcome-section">
            <h1>Welcome to BlogShare</h1>
            <p>Share your thoughts, ideas, and stories with the world</p>
            <button className="create-blog-btn" onClick={() => {
              if (!userInfo) {
                alert('Please log in to create a blog');
                return;
              }
              setShowCreateModal(true);
              setEditingBlogId(null);
              setNewBlog({ name: '', description: '', imageUrl: null, blogUrl: '' });
              setPreviewImage(null);
            }}>
              <FaPlus /> Create New Blog
            </button>
            {activeTab === 'my' && userInfo && (
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
            )}
          </div>

          {showCreateModal && (
            <div className="modal-overlay">
              <div className="create-blog-modal">
                <button className="close-modal" onClick={() => {
                  setShowCreateModal(false);
                  setEditingBlogId(null);
                  setPreviewImage(null);
                }}>
                  <FaTimes />
                </button>
                <h2>{editingBlogId ? 'Edit Blog' : 'Create New Blog'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={editingBlogId ? handleUpdateBlog : handleCreateBlog}>
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
                      required={!editingBlogId}
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
                onClick={() => {
                  setActiveTab('all');
                  setIsEditMode(false);
                  setIsDeleteMode(false);
                  setSelectedBlogsToDelete([]);
                }}
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
              {displayedBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className={`blog-card ${
                    (isEditMode || isDeleteMode) && activeTab === 'my' && isUserBlog(blog) ? 'selectable' : ''
                  } ${
                    selectedBlogsToDelete.includes(blog._id) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    if ((isEditMode || isDeleteMode) && activeTab === 'my' && isUserBlog(blog)) {
                      handleBlogSelect(blog._id);
                    }
                  }}
                >
                  <div className="blog-image">
                    <img src={blog.imageUrl} alt={blog.name} />
                  </div>
                  <div className="blog-info">
                    <h3>{blog.name}</h3>
                    <p>{blog.description}</p>
                    <button 
                      className="view-blog-btn"
                      onClick={(e) => handleBlogClick(blog.blogUrl, e)}
                    >
                      View Blog
                    </button>
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
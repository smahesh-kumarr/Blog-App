import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import { FaCamera, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import Header from './Header';
import './Profile.css';

const Profile = () => {
  const { userInfo } = useContext(UserContext);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    interests: [],
    profileImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userInfo?.email) {
      fetchProfile();
    }
  }, [userInfo]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:4000/profile/${userInfo.email}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setPreviewImage(data.profileImage);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error loading profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfile({ ...profile, profileImage: file });
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestChange = (e) => {
    const interests = e.target.value.split(',').map(item => item.trim());
    setProfile({ ...profile, interests });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('email', profile.email);
      formData.append('interests', JSON.stringify(profile.interests));
      
      if (profile.profileImage instanceof File) {
        formData.append('profileImage', profile.profileImage);
      }

      const response = await fetch('http://localhost:4000/profile/update', {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
        setProfile(prev => ({
          ...prev,
          profileImage: data.profileImage,
          interests: data.interests
        }));
        alert('Profile updated successfully!');
      } else {
        setError(data.message || 'Error updating profile');
        if (data.details) {
          console.error('Update error details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile. Please try again.');
    }
  };

  if (!userInfo) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing ? (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Interests
            </button>
          ) : null}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-card">
          <div className="profile-image-section">
            <div className="profile-image-container">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  {profile.username ? profile.username[0].toUpperCase() : 'U'}
                </div>
              )}
              <label className="image-upload-label">
                <FaCamera />
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="profile-details">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled={true}
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={true}
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={profile.phone}
                  disabled={true}
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Interested Topics (comma-separated):</label>
                <input
                  type="text"
                  value={profile.interests.join(', ')}
                  onChange={handleInterestChange}
                  disabled={!isEditing}
                  placeholder="e.g., Technology, Travel, Food"
                />
              </div>

              {isEditing && (
                <div className="button-group">
                  <button type="submit" className="save-button">
                    <FaSave /> Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="interests-section">
          <h2>My Interests</h2>
          <div className="interests-tags">
            {profile.interests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

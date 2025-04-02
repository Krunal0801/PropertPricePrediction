import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './PropertyContactForm.css';

const PropertyContactForm = ({ property }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me.',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();
  
  // Pre-fill form with user data if authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone
      }));
    }
  }, [isAuthenticated, user]);
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number should be 10 digits starting with 6-9';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      try {
        // In a real app, you would send this data to your backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSubmitted(true);
        showToast('Your inquiry has been sent successfully!', 'success');
      } catch (error) {
        showToast('Failed to send inquiry. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="property-contact-form">
      <div className="contact-form-header">
        <h3>Interested in this property?</h3>
        <p>Fill out the form below to get in touch with the agent.</p>
      </div>
      
      {isSubmitted ? (
        <div className="form-success">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h4>Thank you for your inquiry!</h4>
          <p>
            Our agent will contact you shortly about "{property.propHeading}" 
            in {property.location?.localityName}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Your name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="Your phone number"
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`form-control ${errors.message ? 'is-invalid' : ''}`}
              placeholder="Your message"
              rows="4"
            ></textarea>
            {errors.message && <div className="error-message">{errors.message}</div>}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary contact-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PropertyContactForm;
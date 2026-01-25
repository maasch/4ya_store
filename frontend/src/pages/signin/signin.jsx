import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Footer from '../../components/footer/footer.jsx';
import Header from '../../components/header/header.jsx';
import './signin.css';
export default ({ cart }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const signinlink = useRef(null)
  useEffect(() => {
    if (signinlink !== null) {
      signinlink.current.scrollIntoView({ behavior: 'smooth' })
    }
    document.title = `${isSignUp ? 'Create Account' : 'Sign In'} - 4YA Store`
  }, [isSignUp])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Create account
        await axios.post('/api/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        // After successful signup, switch to sign in mode
        setIsSignUp(false);
        setFormData({
          name: '',
          email: formData.email, // Keep email filled
          password: '',
          confirmPassword: '',
        });
      } else {
        // Sign in
        await axios.post('/api/login', {
          email: formData.email,
          password: formData.password,
        });
        // Redirect to home page after successful login
        navigate('/');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({
          submit: isSignUp
            ? 'Failed to create account. Please try again.'
            : 'Invalid email or password. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      name: '',
      email: formData.email, // Keep email when switching
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <>
      <Header cart={cart} />
      <div ref={signinlink} className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <Link to="/" className="signin-logo">
              <span className="signin-logo-text">4YA Store</span>
            </Link>
            <h1 className="signin-title">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="signin-subtitle">
              {isSignUp
                ? 'Create your account to start shopping'
                : 'Welcome back! Sign in to your account'}
            </p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="error-message error-submit">{errors.submit}</div>
            )}

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''
                    }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span>Keep me signed in</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="signin-submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? 'Please wait...'
                : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>

          <div className="signin-divider">
            <span>or</span>
          </div>

          <div className="signin-toggle">
            <p className="toggle-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

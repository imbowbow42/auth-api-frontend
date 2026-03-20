import './style.css';

// Global variables for sharing between DOM logic and Google callback
let currentMode = 'login';
let errorMsgElement;
let successMsgElement;

document.addEventListener('DOMContentLoaded', () => {
  // --- Auth Redirect: if already logged in, go to home ---
  if (localStorage.getItem('accessToken')) {
    window.location.href = '/home.html';
    return;
  }

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
    updateIcons(savedTheme);
  } else if (prefersDark) {
    htmlEl.setAttribute('data-theme', 'dark');
    updateIcons('dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
    updateIcons('light');
  }

  function updateIcons(theme) {
    if (theme === 'dark') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
  });

  // --- Form Elements ---
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const usernameInput = document.getElementById('username');
  const usernameGroup = document.getElementById('username-group');
  const submitBtn = document.getElementById('submit-button');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  
  errorMsgElement = document.getElementById('error-message');
  successMsgElement = document.getElementById('success-message');

  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const toggleText = document.getElementById('toggle-text');
  const toggleFormModeBtn = document.getElementById('toggle-form-mode');

  toggleText.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'toggle-form-mode') {
      e.preventDefault();
      errorMsgElement.classList.add('hidden');
      successMsgElement.classList.add('hidden');

      if (currentMode === 'login') {
        currentMode = 'register';
        usernameGroup.classList.remove('hidden');
        usernameInput.required = true;
        formTitle.textContent = 'Create an account';
        formSubtitle.textContent = 'Sign up for a new account';
        btnText.textContent = 'Sign Up';
        toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-form-mode" class="link">Sign in</a>`;
      } else {
        currentMode = 'login';
        usernameGroup.classList.add('hidden');
        usernameInput.required = false;
        usernameInput.value = '';
        formTitle.textContent = 'Welcome back';
        formSubtitle.textContent = 'Sign in to your account';
        btnText.textContent = 'Continue';
        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-form-mode" class="link">Sign up</a>`;
      }
    }
  });

  // --- Form Submission Logic ---
  const API_BASE_URL = 'http://localhost:3000/auth';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset UI state
    errorMsgElement.classList.add('hidden');
    document.getElementById('error-text').textContent = '';
    successMsgElement.classList.add('hidden');
    document.getElementById('success-text').textContent = '';
    
    // Show loader
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    const API_URL = currentMode === 'login' ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
    const requestBody = {
      email: emailInput.value,
      password: passwordInput.value
    };

    if (currentMode === 'register') {
      requestBody.username = usernameInput.value;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${currentMode === 'login' ? 'Login' : 'Registration'} failed.`);
      }

      // Success — save token and redirect
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      window.location.href = '/home.html';
      
    } catch (error) {
      document.getElementById('error-text').textContent = error.message;
      errorMsgElement.classList.remove('hidden');
    } finally {
      // Revert button state
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  });
});

// --- Google SSO Callback ---
// Exposed globally so the Google '<script>' can invoke it via 'data-callback'
window.handleGoogleLogin = async (response) => {
  const { credential } = response;
  
  if (errorMsgElement) errorMsgElement.classList.add('hidden');
  if (successMsgElement) successMsgElement.classList.add('hidden');

  try {
    const res = await fetch('http://localhost:3000/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: credential
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Google Login failed.');
    }

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    window.location.href = '/home.html';

  } catch (error) {
    if (errorMsgElement) {
      document.getElementById('error-text').textContent = error.message;
      errorMsgElement.classList.remove('hidden');
    }
  }
};

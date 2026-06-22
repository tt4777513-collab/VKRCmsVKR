// Main JavaScript file for CMS Pro Landing Page

// ========== VALIDATION FUNCTIONS ==========
function validateAuthFields(email, password) {
  // Check email length
  if (email.length < 10) {
    return 'Email должен содержать минимум 10 символов';
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Пожалуйста, введите корректный email адрес';
  }

  // Check password length
  if (password.length < 10) {
    return 'Пароль должен содержать минимум 10 символов';
  }

  return null; // No errors
}

// ========== ACCOUNT DATABASE FUNCTIONS ==========
// Initialize accounts database if it doesn't exist
function initAccountsDatabase() {
  if (!localStorage.getItem('cmsPro_accounts')) {
    // Create demo account for testing
    const demoAccounts = [
      {
        id: 1,
        email: 'demo@example.com',
        password: 'DemoPassword123', // In production, this should be hashed
        name: 'Demo User',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('cmsPro_accounts', JSON.stringify(demoAccounts));
  }
}

// Get all accounts from database
function getAllAccounts() {
  try {
    const accounts = localStorage.getItem('cmsPro_accounts');
    return accounts ? JSON.parse(accounts) : [];
  } catch (error) {
    console.error('Error reading accounts:', error);
    return [];
  }
}

// Save account to database
function saveAccount(email, password, name) {
  try {
    const accounts = getAllAccounts();
    
    // Check if account already exists
    if (accounts.some(acc => acc.email === email)) {
      return { success: false, message: 'Email уже зарегистрирован' };
    }

    // Create new account
    const newAccount = {
      id: Math.max(...accounts.map(acc => acc.id), 0) + 1,
      email: email,
      password: password, // In production, this should be hashed
      name: name,
      createdAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    localStorage.setItem('cmsPro_accounts', JSON.stringify(accounts));
    
    return { success: true, message: 'Аккаунт создан успешно' };
  } catch (error) {
    console.error('Error saving account:', error);
    return { success: false, message: 'Ошибка при сохранении аккаунта' };
  }
}

// Check if account exists and password is correct
function checkAccount(email, password) {
  try {
    const accounts = getAllAccounts();
    const account = accounts.find(acc => acc.email === email);

    if (!account) {
      return { success: false, message: 'Неправильный логин или пароль' };
    }

    if (account.password !== password) {
      return { success: false, message: 'Неправильный логин или пароль' };
    }

    return { success: true, message: 'Вход успешен', account: account };
  } catch (error) {
    console.error('Error checking account:', error);
    return { success: false, message: 'Ошибка при проверке учетных данных' };
  }
}

// ========== THEME TOGGLE FUNCTIONALITY ==========
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  // Get saved theme from localStorage or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  html.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
  
  // Add click event to theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Update theme
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    themeToggle.title = theme === 'dark' ? 'Переключиться на светлую тему' : 'Переключиться на тёмную тему';
  }
}

// ========== AUTH MODAL FUNCTIONALITY ==========
function initAuthModal() {
  const authModal = document.getElementById('authModal');
  const orderBtn = document.querySelector('.order-btn');
  const modalClose = document.querySelector('.auth-modal-close');
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Open modal when "Start for free" button is clicked
  if (orderBtn) {
    orderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  }

  // Open modal when hero/CTA buttons are clicked (without a specific plan)
  document.querySelectorAll('.hero-buttons .btn-primary, .cta .btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  });

  // Open modal when a pricing plan button is clicked — pass along plan name and price
  document.querySelectorAll('.pricing-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.pricing-card');
      const planName = card ? card.querySelector('h3').textContent.trim() : '';
      const priceEl = card ? card.querySelector('.price') : null;
      const priceText = priceEl ? priceEl.textContent.replace(/\s+/g, ' ').trim() : '';
      openAuthModal({ name: planName, price: priceText });
    });
  });

  // Close modal when close button is clicked
  if (modalClose) {
    modalClose.addEventListener('click', closeAuthModal);
  }

  // Close modal when clicking outside
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeAuthModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeAuthModal();
    }
  });

  // Tab switching functionality
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchAuthTab(tabName);
    });
  });

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      
      // Validation
      const validationError = validateAuthFields(email, password);
      if (validationError) {
        alert(validationError);
        return;
      }
      
      // Check if account exists and password is correct
      const checkResult = checkAccount(email, password);
      if (!checkResult.success) {
        alert(checkResult.message);
        return;
      }

      console.log('Login successful:', { email, rememberMe });
      
      // Store user session in localStorage with account info
      localStorage.setItem('userSession', JSON.stringify({
        id: checkResult.account.id,
        email: checkResult.account.email,
        name: checkResult.account.name,
        loginTime: new Date().toISOString(),
        rememberMe: rememberMe
      }));
      
      const selectedPlan = authModal.dataset.selectedPlan;
      if (selectedPlan) {
        alert(`Добро пожаловать, ${checkResult.account.name}! План "${selectedPlan}" подключён к вашему аккаунту.`);
      } else {
        alert(`Добро пожаловать, ${checkResult.account.name}!`);
      }
      
      // Close modal and redirect to admin panel
      closeAuthModal();
      loginForm.reset();
      
      // Redirect to admin panel after a short delay
      setTimeout(() => {
        window.location.href = 'admin/index.html';
      }, 1000);
    });
  }

  // Handle register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerPasswordConfirm').value;

      // Validation
      const validationError = validateAuthFields(email, password);
      if (validationError) {
        alert(validationError);
        return;
      }

      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }

      // Save account to database
      const saveResult = saveAccount(email, password, name);
      if (!saveResult.success) {
        alert(saveResult.message);
        return;
      }

      console.log('Registration successful:', { name, email });
      
      // Store user session in localStorage
      localStorage.setItem('userSession', JSON.stringify({
        email: email,
        name: name,
        registrationTime: new Date().toISOString()
      }));
      
      const selectedPlan = authModal.dataset.selectedPlan;
      if (selectedPlan) {
        alert(`Добро пожаловать, ${name}! Ваш аккаунт создан, и план "${selectedPlan}" подключён.`);
      } else {
        alert(`Добро пожаловать, ${name}! Ваш аккаунт создан.`);
      }
      
      // Close modal and redirect to admin panel
      closeAuthModal();
      registerForm.reset();
      
      // Redirect to admin panel after a short delay
      setTimeout(() => {
        window.location.href = 'admin/index.html';
      }, 1000);
    });
  }

  // Switch tab between login and register links
  document.querySelectorAll('.switch-tab').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchAuthTab(tabName);
    });
  });
}

function openAuthModal(planInfo) {
  const authModal = document.getElementById('authModal');
  const planInfoBlock = document.getElementById('selectedPlanInfo');
  const planNameEl = document.getElementById('selectedPlanName');

  if (planInfo && planInfo.name) {
    if (planNameEl) {
      planNameEl.textContent = `${planInfo.name}${planInfo.price ? ' — ' + planInfo.price : ''}`;
    }
    if (planInfoBlock) {
      planInfoBlock.style.display = 'flex';
      authModal.dataset.selectedPlan = planInfo.name;
    }
  } else {
    if (planInfoBlock) {
      planInfoBlock.style.display = 'none';
    }
    delete authModal.dataset.selectedPlan;
  }

  authModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  const planInfoBlock = document.getElementById('selectedPlanInfo');
  authModal.classList.remove('active');
  document.body.style.overflow = 'auto'; // Re-enable scrolling
  if (planInfoBlock) {
    planInfoBlock.style.display = 'none';
  }
  delete authModal.dataset.selectedPlan;
}

function switchAuthTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.auth-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Deactivate all tab buttons
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Activate corresponding tab button
  document.querySelector(`.auth-tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

// ========== SMOOTH SCROLLING ==========
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // Don't intercept modal-related links
    if (href === '#' || this.classList.contains('switch-tab')) {
      return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========== HOVER ANIMATIONS ==========
// Add hover animations to feature cards
document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s ease';
  });
});

// ========== BUTTON RIPPLE EFFECT ==========
// Add click handlers to buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Don't add ripple to form submit buttons
    if (this.type === 'submit' && this.closest('.auth-form')) {
      return;
    }
    
    // Add ripple effect
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  // Initialize accounts database
  initAccountsDatabase();
  
  // Initialize theme toggle
  initThemeToggle();
  
  // Initialize auth modal
  initAuthModal();
  
  console.log('CMS Pro Landing Page loaded successfully!');
  console.log('=== CMS Pro Authentication System ===');
  console.log('Demo Account:');
  console.log('  Email: demo@example.com');
  console.log('  Password: DemoPassword123');
  console.log('');
  console.log('All Accounts:', getAllAccounts());
  console.log('To manage accounts, use:');
  console.log('  getAllAccounts() - view all accounts');
  console.log('  saveAccount(email, password, name) - create new account');
  console.log('  checkAccount(email, password) - check if login is valid');

  // Add ripple animation to stylesheet if not exists
  if (!document.querySelector('style[data-ripple]')) {
    const style = document.createElement('style');
    style.setAttribute('data-ripple', 'true');
    style.textContent = `
      @keyframes ripple {
        to {
          width: 100px;
          height: 100px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Observe elements for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInUp 0.6s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .pricing-card').forEach(el => {
    observer.observe(el);
  });
});

// Add slideInUp animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);


// Admin Panel JavaScript

// ========== RECENT ACTIVITY FEED ==========
// Иконки для разных типов событий
const ACTIVITY_ICONS = {
  page: 'fa-file-plus',
  media: 'fa-image',
  user: 'fa-user-plus',
  delete: 'fa-trash',
  backup: 'fa-database',
  settings: 'fa-cog',
  restore: 'fa-undo'
};

// Добавляет новую запись в начало списка "Недавняя активность"
function logActivity(type, title, description) {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;

  const iconClass = ACTIVITY_ICONS[type] || 'fa-bell';

  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <div class="activity-icon">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="activity-content">
      <p class="activity-title">${title}</p>
      <p class="activity-description">${description}</p>
      <span class="activity-time">только что</span>
    </div>
  `;

  activityList.prepend(item);

  // Ограничиваем список 10 последними записями, чтобы он не разрастался бесконечно
  const items = activityList.querySelectorAll('.activity-item');
  if (items.length > 10) {
    items[items.length - 1].remove();
  }

  // То же событие приходит и в выпадающий список уведомлений (колокольчик)
  if (typeof pushNotification === 'function') {
    pushNotification(iconClass, title, description);
  }
}

// ========== AUTHENTICATION CHECK ==========
// Check if user is logged in when admin panel loads
function checkUserAuthentication() {
  const userSession = localStorage.getItem('userSession');
  
  // If no session, redirect to login page
  if (!userSession) {
    alert('Пожалуйста, войдите в систему для доступа к администраторской панели');
    window.location.href = '../index.html';
  }
  
  // Parse session data
  try {
    const session = JSON.parse(userSession);
    // Update user name in header if it exists
    const userName = session.name || session.email;
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
      userNameElement.textContent = userName;
    }
    
    // Store session info for later use
    window.currentUserSession = session;
    console.log('User logged in:', userName);
  } catch (error) {
    console.error('Error parsing user session:', error);
  }
}

// Check authentication on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkUserAuthentication);
} else {
  checkUserAuthentication();
}

// ========== ACCOUNT DATABASE FUNCTIONS ==========
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

// Get account by email
function getAccountByEmail(email) {
  const accounts = getAllAccounts();
  return accounts.find(acc => acc.email === email);
}

// Update account fields by email, returns the updated account or null
function updateAccount(currentEmail, updates) {
  const accounts = getAllAccounts();
  const index = accounts.findIndex(acc => acc.email === currentEmail);
  if (index === -1) return null;

  accounts[index] = { ...accounts[index], ...updates };
  localStorage.setItem('cmsPro_accounts', JSON.stringify(accounts));
  return accounts[index];
}

// ========== THEME TOGGLE FUNCTIONALITY ==========
function initThemeToggleAdmin() {
  const themeToggle = document.getElementById('themeToggleAdmin');
  const html = document.documentElement;
  
  // Get saved theme from localStorage or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  html.setAttribute('data-theme', savedTheme);
  updateThemeToggleIconAdmin(savedTheme);
  
  // Add click event to theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleThemeAdmin);
  }
}

function toggleThemeAdmin() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Update theme
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  updateThemeToggleIconAdmin(newTheme);
}

function updateThemeToggleIconAdmin(theme) {
  const themeToggle = document.getElementById('themeToggleAdmin');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    themeToggle.title = theme === 'dark' ? 'Переключиться на светлую тему' : 'Переключиться на тёмную тему';
  }
}

// Module Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });
    
    // Add active class to clicked item
    this.classList.add('active');
    
    // Get module name
    const moduleName = this.getAttribute('data-module');
    const moduleId = `module-${moduleName}`;
    
    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
      module.classList.remove('active');
    });
    
    // Show selected module
    const selectedModule = document.getElementById(moduleId);
    if (selectedModule) {
      selectedModule.classList.add('active');
      
      // Update page title
      const titles = {
        'dashboard': 'Главная панель управления',
        'pages': 'Управление страницами',
        'content': 'Редактор контента',
        'media': 'Библиотека медиа',
        'users': 'Управление пользователями',
        'settings': 'Настройки системы',
        'backup': 'Управление резервными копиями',
        'profile': 'Профиль'
      };
      
      document.getElementById('pageTitle').textContent = titles[moduleName] || 'CMS Pro';
    }
    
    // Close sidebar on mobile
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  });
});

// Initialize theme toggle on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize media storage
  initMediaStorage();
  
  initThemeToggleAdmin();
  initLogout();
  
  // Log user session info
  if (window.currentUserSession) {
    console.log('=== User Session ===');
    console.log('Name:', window.currentUserSession.name);
    console.log('Email:', window.currentUserSession.email);
    console.log('Login Time:', window.currentUserSession.loginTime);
    console.log('');
    
    // Show account details
    const account = getAccountByEmail(window.currentUserSession.email);
    if (account) {
      console.log('=== Account Details ===');
      console.log('Account ID:', account.id);
      console.log('Email:', account.email);
      console.log('Name:', account.name);
      console.log('Created:', account.createdAt);
    }
  }
});

// Logout Functionality
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Confirm logout
      if (confirm('Вы уверены, что хотите выйти?')) {
        // Clear session from localStorage
        localStorage.removeItem('userSession');
        
        // Redirect to homepage
        window.location.href = '../index.html';
      }
    });
  }
}

// Menu Toggle for Mobile
const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
  });
}

// Закрытие мобильного меню по клику на затемнённый фон
const sidebarOverlay = document.getElementById('sidebarOverlay');
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', function() {
    document.querySelector('.sidebar').classList.remove('active');
  });
}

// New Page Button
const newPageBtn = document.getElementById('newPageBtn');
if (newPageBtn) {
  newPageBtn.addEventListener('click', function() {
    const modal = document.getElementById('newPageModal');
    if (modal) {
      modal.classList.add('active');
    }
  });
}

// New User Button
const newUserBtn = document.getElementById('newUserBtn');
if (newUserBtn) {
  newUserBtn.addEventListener('click', function() {
    const modal = document.getElementById('newUserModal');
    if (modal) {
      modal.classList.add('active');
    }
  });
}

// Modal Close Buttons (на каждой модалке свой крестик)
document.querySelectorAll('.modal-close').forEach(closeBtn => {
  closeBtn.addEventListener('click', function() {
    this.closest('.modal').classList.remove('active');
  });
});

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Modal buttons
document.querySelectorAll('.modal-footer .btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.classList.contains('btn-secondary')) {
      this.closest('.modal').classList.remove('active');
    } else if (this.classList.contains('btn-primary')) {
      const modal = this.closest('.modal');

      if (modal && modal.id === 'newPageModal') {
        const titleInput = document.getElementById('newPageTitleInput');
        const title = titleInput && titleInput.value.trim() ? titleInput.value.trim() : 'Новая страница';
        const pagesTableBody = document.getElementById('pagesTableBody');

        if (pagesTableBody) {
          const emptyRow = document.getElementById('pagesEmptyRow');
          if (emptyRow) emptyRow.remove();

          const today = new Date();
          const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

          const newRow = document.createElement('tr');
          newRow.innerHTML = `
            <td><strong>${title}</strong></td>
            <td><span class="badge badge-warning">Черновик</span></td>
            <td>Admin</td>
            <td>${dateStr}</td>
            <td>
              <button class="btn-icon" title="Редактировать"><i class="fas fa-edit"></i></button>
              <button class="btn-icon" title="Просмотр"><i class="fas fa-eye"></i></button>
              <button class="btn-icon btn-danger" title="Удалить"><i class="fas fa-trash"></i></button>
            </td>
          `;
          pagesTableBody.prepend(newRow);

          // Навешиваем обработчики на новые кнопки (т.к. forEach выше отработал до их создания)
          newRow.querySelectorAll('.btn-icon').forEach(actionBtn => {
            actionBtn.addEventListener('click', function(e) {
              e.preventDefault();
              const icon = this.querySelector('i');
              if (icon.classList.contains('fa-trash')) {
                if (confirm('Вы уверены, что хотите удалить?')) {
                  const row = this.closest('tr');
                  row.style.transition = 'opacity 0.25s ease';
                  row.style.opacity = '0';
                  setTimeout(() => {
                    row.remove();
                    const pagesTableBodyNow = document.getElementById('pagesTableBody');
                    if (pagesTableBodyNow && !pagesTableBodyNow.children.length) {
                      pagesTableBodyNow.innerHTML = '<tr id="pagesEmptyRow"><td colspan="5" class="table-empty">Страниц пока нет. Нажмите «Новая страница», чтобы создать первую.</td></tr>';
                    } else if (typeof applyPagesFilters === 'function') {
                      applyPagesFilters();
                    }
                  }, 250);
                }
              } else if (icon.classList.contains('fa-edit')) {
                const editContentLink = document.querySelector('.nav-item[data-module="content"]');
                if (editContentLink) editContentLink.click();
              } else if (icon.classList.contains('fa-eye')) {
                alert(`Предпросмотр страницы "${title}" (содержимое пока не задано)`);
              }
            });
          });
        }

        if (typeof applyPagesFilters === 'function') applyPagesFilters();

        if (titleInput) titleInput.value = '';
        logActivity('page', 'Новая страница создана', `Страница "${title}" успешно создана`);
        alert(`Страница "${title}" создана!`);
      } else if (modal && modal.id === 'newUserModal') {
        const nameInput = document.getElementById('newUserNameInput');
        const emailInput = document.getElementById('newUserEmailInput');
        const roleSelect = document.getElementById('newUserRoleSelect');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const role = roleSelect ? roleSelect.value : 'Подписчик';

        if (!name) {
          alert('Введите имя пользователя');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          alert('Пожалуйста, введите корректный email адрес');
          return;
        }

        const usersTableBody = document.getElementById('usersTableBody');
        if (usersTableBody) {
          const emptyRow = document.getElementById('usersEmptyRow');
          if (emptyRow) emptyRow.remove();

          const roleBadgeClass = {
            'Администратор': 'badge-info',
            'Редактор': 'badge-primary',
            'Автор': 'badge-warning',
            'Подписчик': 'badge-secondary'
          }[role] || 'badge-secondary';

          const today = new Date();
          const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

          // Сохраняем в localStorage
          const accounts = getAllAccounts();
          const newAccountId = Date.now();
          accounts.push({ id: newAccountId, name, email, role, status: 'active', createdAt: today.getTime(), dateStr });
          localStorage.setItem('cmsPro_accounts', JSON.stringify(accounts));

          const newRow = document.createElement('tr');
          newRow.dataset.accountId = newAccountId;
          newRow.innerHTML = `
            <td><strong>${name}</strong></td>
            <td>${email}</td>
            <td><span class="badge ${roleBadgeClass}">${role}</span></td>
            <td><span class="badge badge-success">Активен</span></td>
            <td>${dateStr}</td>
            <td>
              <button class="btn-icon" title="Редактировать"><i class="fas fa-edit"></i></button>
              <button class="btn-icon btn-danger" title="Удалить"><i class="fas fa-trash"></i></button>
            </td>
          `;
          usersTableBody.prepend(newRow);

          // Навешиваем обработчик удаления на новую строку
          newRow.querySelector('.btn-danger').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите удалить?')) {
              // Удаляем из localStorage
              const accId = parseInt(newRow.dataset.accountId);
              const accs = getAllAccounts().filter(a => a.id !== accId);
              localStorage.setItem('cmsPro_accounts', JSON.stringify(accs));

              newRow.style.transition = 'opacity 0.25s ease';
              newRow.style.opacity = '0';
              setTimeout(() => {
                newRow.remove();
                const usersTableBodyNow = document.getElementById('usersTableBody');
                if (usersTableBodyNow && !usersTableBodyNow.querySelector('tr:not(#usersEmptyRow):not(#usersNoResultsRow)')) {
                  usersTableBodyNow.innerHTML = '<tr id="usersEmptyRow"><td colspan="6" class="table-empty">Пользователей пока нет. Нажмите «Новый пользователь», чтобы добавить первого.</td></tr>';
                } else if (typeof applyUsersFilters === 'function') {
                  applyUsersFilters();
                }
              }, 250);
            }
          });
        }

        if (typeof applyUsersFilters === 'function') applyUsersFilters();

        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        logActivity('user', 'Новый пользователь', `Добавлен пользователь "${name}"`);
        alert(`Пользователь "${name}" добавлен!`);
      } else {
        alert('Действие выполнено!');
      }

      if (modal) modal.classList.remove('active');
    }
  });
});

// Action buttons in tables and media cards (edit, view, delete, download, restore)
document.querySelectorAll('.btn-icon, .btn-small').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const icon = this.querySelector('i');

    if (icon.classList.contains('fa-edit')) {
      // Переключаем на модуль "Содержание", чтобы реально открыть редактор
      const editContentLink = document.querySelector('.nav-item[data-module="content"]');
      if (editContentLink) {
        editContentLink.click();
      }
    } else if (icon.classList.contains('fa-eye')) {
      const row = this.closest('tr');
      const titleCell = row ? row.querySelector('td strong') : null;
      const title = titleCell ? titleCell.textContent : 'страница';
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head><meta charset="UTF-8"><title>Предпросмотр: ${title}</title>
        <style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #1a2847; }</style>
        </head>
        <body><h1>${title}</h1><p>(Содержимое страницы пока не задано)</p></body>
        </html>
      `);
      previewWindow.document.close();
    } else if (icon.classList.contains('fa-trash')) {
      if (confirm('Вы уверены, что хотите удалить?')) {
        // Реально удаляем строку таблицы или карточку медиа из DOM
        const row = this.closest('tr');
        const mediaItem = this.closest('.media-item');
        const target = row || mediaItem;

        const nameEl = target ? target.querySelector('td strong, .media-name') : null;
        const name = nameEl ? nameEl.textContent : 'элемент';
        logActivity('delete', 'Элемент удалён', `"${name}" удалён из системы`);

        if (target) {
          const parentList = target.closest('#pagesTableBody, #mediaGrid, #usersTableBody');
          target.style.transition = 'opacity 0.25s ease';
          target.style.opacity = '0';
          setTimeout(() => {
            target.remove();
            if (parentList && !parentList.children.length) {
              if (parentList.id === 'pagesTableBody') {
                parentList.innerHTML = '<tr id="pagesEmptyRow"><td colspan="5" class="table-empty">Страниц пока нет. Нажмите «Новая страница», чтобы создать первую.</td></tr>';
              } else if (parentList.id === 'mediaGrid') {
                parentList.innerHTML = '<div class="media-empty" id="mediaEmptyState">Файлов пока нет. Нажмите «Загрузить файлы», чтобы добавить первый.</div>';
              } else if (parentList.id === 'usersTableBody') {
                parentList.innerHTML = '<tr id="usersEmptyRow"><td colspan="6" class="table-empty">Пользователей пока нет. Нажмите «Новый пользователь», чтобы добавить первого.</td></tr>';
              }
            } else if (parentList && parentList.id === 'pagesTableBody' && typeof applyPagesFilters === 'function') {
              applyPagesFilters();
            } else if (parentList && parentList.id === 'usersTableBody' && typeof applyUsersFilters === 'function') {
              applyUsersFilters();
            }
          }, 250);
        }
      }
    } else if (icon.classList.contains('fa-download')) {
      const row = this.closest('tr');
      const nameCell = row ? row.querySelector('td strong') : null;
      const fileName = nameCell ? nameCell.textContent : 'файл';
      alert(`Скачивание "${fileName}" начато (демо-режим, реального файла нет)`);
    } else if (icon.classList.contains('fa-undo')) {
      if (confirm('Вы уверены, что хотите восстановить данные из этой копии?')) {
        const row = this.closest('tr');
        const statusBadge = row ? row.querySelector('.badge') : null;
        const nameEl = row ? row.querySelector('td strong') : null;
        const name = nameEl ? nameEl.textContent : 'резервная копия';
        if (statusBadge) {
          statusBadge.textContent = 'Восстановлено';
          statusBadge.className = 'badge badge-info';
        }
        logActivity('restore', 'Данные восстановлены', `Восстановление из "${name}" завершено`);
        alert('Данные успешно восстановлены из резервной копии!');
      }
    }
  });
});

// ========== MEDIA UPLOAD FUNCTIONALITY ==========
// Supported media types
const SUPPORTED_MEDIA_TYPES = {
  images: ['image/jpeg', 'image/png'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
};

// Get all supported MIME types
const ALL_SUPPORTED_TYPES = [...SUPPORTED_MEDIA_TYPES.images, ...SUPPORTED_MEDIA_TYPES.videos];

// Initialize media storage if it doesn't exist
function initMediaStorage() {
  if (!localStorage.getItem('mediaFiles')) {
    localStorage.setItem('mediaFiles', JSON.stringify([]));
  }
}

// Get all media files from storage
function getAllMediaFiles() {
  try {
    const files = localStorage.getItem('mediaFiles');
    return files ? JSON.parse(files) : [];
  } catch (error) {
    console.error('Error reading media files:', error);
    return [];
  }
}

// Save media file to storage
function saveMediaFile(file, preview) {
  try {
    const mediaFiles = getAllMediaFiles();
    const newFile = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      preview: preview,
      uploadDate: new Date().toISOString(),
      isImage: file.type.startsWith('image/'),
      isVideo: file.type.startsWith('video/')
    };
    
    mediaFiles.push(newFile);
    localStorage.setItem('mediaFiles', JSON.stringify(mediaFiles));
    return newFile;
  } catch (error) {
    console.error('Error saving media file:', error);
    return null;
  }
}

// Validate file type
function isValidMediaFile(file) {
  return ALL_SUPPORTED_TYPES.includes(file.type);
}

// Get file type label
function getFileTypeLabel(mimeType) {
  if (SUPPORTED_MEDIA_TYPES.images.includes(mimeType)) {
    return 'Изображение';
  } else if (SUPPORTED_MEDIA_TYPES.videos.includes(mimeType)) {
    return 'Видео';
  }
  return 'Неизвестно';
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Create media item element
function createMediaItemElement(mediaFile) {
  const mediaItem = document.createElement('div');
  mediaItem.className = 'media-item';
  mediaItem.dataset.mediaId = mediaFile.id;
  
  let previewContent = '';
  
  if (mediaFile.isImage) {
    previewContent = `<img src="${mediaFile.preview}" alt="${mediaFile.name}">`;
  } else if (mediaFile.isVideo) {
    previewContent = `
      <video width="200" height="200" controls style="width: 100%; height: 100%; object-fit: cover;">
        <source src="${mediaFile.preview}" type="${mediaFile.type}">
        Ваш браузер не поддерживает видео тег.
      </video>
    `;
  }
  
  const uploadDate = new Date(mediaFile.uploadDate).toLocaleDateString('ru-RU');
  const fileSize = formatFileSize(mediaFile.size);
  const fileType = getFileTypeLabel(mediaFile.type);
  
  mediaItem.innerHTML = `
    <div class="media-preview">
      ${previewContent}
    </div>
    <div class="media-info">
      <p class="media-name" title="${mediaFile.name}">${mediaFile.name}</p>
      <p class="media-meta">${fileSize} • ${fileType} • ${uploadDate}</p>
      <div class="media-actions">
        <button class="btn-small media-download" title="Скачать"><i class="fas fa-download"></i></button>
        <button class="btn-small media-delete btn-danger" title="Удалить"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
  
  // Add event listeners
  mediaItem.querySelector('.media-delete').addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      deleteMediaFile(mediaFile.id);
      mediaItem.remove();
    }
  });
  
  return mediaItem;
}

// Delete media file
function deleteMediaFile(fileId) {
  try {
    const mediaFiles = getAllMediaFiles();
    const filteredFiles = mediaFiles.filter(f => f.id !== fileId);
    localStorage.setItem('mediaFiles', JSON.stringify(filteredFiles));
  } catch (error) {
    console.error('Error deleting media file:', error);
  }
}

// Upload Button Handler
const uploadBtn = document.getElementById('uploadBtn');
const mediaInput = document.getElementById('mediaInput');

if (uploadBtn && mediaInput) {
  uploadBtn.addEventListener('click', function() {
    mediaInput.click();
  });
  
  mediaInput.addEventListener('change', function(e) {
    const files = e.target.files;
    let validFiles = 0;
    let invalidFiles = [];
    
    // Process each file
    Array.from(files).forEach(file => {
      if (isValidMediaFile(file)) {
        validFiles++;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(event) {
          const preview = event.target.result;
          const mediaFile = saveMediaFile(file, preview);
          
          if (mediaFile) {
            // Add to media grid
            const mediaGrid = document.getElementById('mediaGrid');
            const emptyState = document.getElementById('mediaEmptyState');
            if (emptyState) emptyState.remove();
            const newItem = createMediaItemElement(mediaFile);
            mediaGrid.insertBefore(newItem, mediaGrid.firstChild);
          }
        };
        reader.readAsDataURL(file);
      } else {
        invalidFiles.push(file.name);
      }
    });
    
    // Show feedback
    if (invalidFiles.length > 0) {
      alert(`⚠️ Ошибка!\n\nПоддерживаемые типы файлов:\n• Изображения: JPEG, PNG\n• Видео: MP4, WebM, OGG, MOV\n\nНеподдерживаемые файлы:\n${invalidFiles.join('\n')}`);
    }
    
    if (validFiles > 0) {
      const fileNames = Array.from(files).filter(isValidMediaFile).map(f => f.name);
      if (validFiles === 1) {
        logActivity('media', 'Загружен файл', fileNames[0]);
      } else {
        logActivity('media', 'Загружены файлы', `Загружено ${validFiles} файл(ов)`);
      }
      alert(`✅ Успешно загружено ${validFiles} файл(ов)`);
    }
    
    // Reset input
    e.target.value = '';
  });
}

// ========== INITIALIZE MEDIA ON PAGE LOAD ==========
// Media storage is already initialized in DOMContentLoaded event

console.log('=== CMS Pro Media System ===');
console.log('Supported file types:');
console.log('  Images: JPEG, PNG');
console.log('  Videos: MP4, WebM, OGG, MOV');
console.log('');
console.log('API Functions:');
console.log('  getAllMediaFiles() - get all uploaded files');
console.log('  saveMediaFile(file, preview) - save new file to storage');
console.log('  deleteMediaFile(fileId) - delete file from storage');
console.log('  isValidMediaFile(file) - check if file type is supported');

// Upload Button (old code - kept for reference)
/*
const uploadBtn = document.getElementById('uploadBtn');
if (uploadBtn) {
  uploadBtn.addEventListener('click', function() {
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx';
    
    fileInput.addEventListener('change', function(e) {
      const files = e.target.files;
      if (files.length > 0) {
        let fileNames = [];
        for (let file of files) {
          fileNames.push(file.name);
        }
        alert(`Загружено файлов: ${fileNames.length}\n${fileNames.join('\n')}`);
      }
    });
    
    fileInput.click();
  });
}
*/

// ========== EDIT BUTTONS IN TABLES ==========
const createBackupBtn = document.getElementById('createBackupBtn');
if (createBackupBtn) {
  createBackupBtn.addEventListener('click', function() {
    if (confirm('Создать резервную копию?')) {
      const backupsTableBody = document.getElementById('backupsTableBody');
      if (!backupsTableBody) return;

      const today = new Date();
      const dateStr = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, '0')}_${String(today.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
      const sizeMb = (150 + Math.random() * 20).toFixed(0);

      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td><strong>backup_${dateStr}_full.zip</strong></td>
        <td>${sizeMb} MB</td>
        <td>${timeStr}</td>
        <td><span class="badge badge-warning">Создается...</span></td>
        <td>
          <button class="btn-icon" title="Восстановить"><i class="fas fa-undo"></i></button>
          <button class="btn-icon" title="Скачать"><i class="fas fa-download"></i></button>
          <button class="btn-icon btn-danger" title="Удалить"><i class="fas fa-trash"></i></button>
        </td>
      `;
      const backupsEmptyRow = document.getElementById('backupsEmptyRow');
      if (backupsEmptyRow) backupsEmptyRow.remove();
      backupsTableBody.prepend(newRow);
      logActivity('backup', 'Резервная копия создается', `backup_${dateStr}_full.zip (${sizeMb} MB)`);

      // Навешиваем обработчики на новые кнопки строки
      newRow.querySelectorAll('.btn-icon').forEach(actionBtn => {
        actionBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const icon = this.querySelector('i');
          const row = this.closest('tr');
          if (icon.classList.contains('fa-trash')) {
            if (confirm('Вы уверены, что хотите удалить?')) {
              const name = row.querySelector('td strong').textContent;
              logActivity('delete', 'Резервная копия удалена', `"${name}" удалена`);
              row.style.transition = 'opacity 0.25s ease';
              row.style.opacity = '0';
              setTimeout(() => {
                row.remove();
                const backupsTableBodyNow = document.getElementById('backupsTableBody');
                if (backupsTableBodyNow && !backupsTableBodyNow.querySelector('tr:not(#backupsEmptyRow)')) {
                  backupsTableBodyNow.innerHTML = '<tr id="backupsEmptyRow"><td colspan="5" class="table-empty">Резервных копий пока нет. Нажмите «Создать резервную копию», чтобы создать первую.</td></tr>';
                }
              }, 250);
            }
          } else if (icon.classList.contains('fa-undo')) {
            if (confirm('Вы уверены, что хотите восстановить данные из этой копии?')) {
              const badge = row.querySelector('.badge');
              const name = row.querySelector('td strong').textContent;
              if (badge) {
                badge.textContent = 'Восстановлено';
                badge.className = 'badge badge-info';
              }
              logActivity('restore', 'Данные восстановлены', `Восстановление из "${name}" завершено`);
              alert('Данные успешно восстановлены из резервной копии!');
            }
          } else if (icon.classList.contains('fa-download')) {
            const fileName = row.querySelector('td strong').textContent;
            alert(`Скачивание "${fileName}" начато (демо-режим, реального файла нет)`);
          }
        });
      });

      // Имитация процесса создания копии — статус меняется на "Завершено" через 2 секунды
      setTimeout(() => {
        const badge = newRow.querySelector('.badge');
        if (badge) {
          badge.textContent = 'Завершено';
          badge.className = 'badge badge-success';
        }
        const name = newRow.querySelector('td strong').textContent;
        logActivity('backup', 'Резервная копия завершена', `"${name}" успешно создана`);
      }, 2000);
    }
  });
}

// Logout Button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Вы уверены, что хотите выйти?')) {
      alert('До встречи!');
      window.location.href = '../index.html';
    }
  });
}

// Search functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    // Add search functionality here
    console.log('Search query:', query);
  });
}

// Notification Button — выпадающий список с реальными событиями активности
const notificationWrapper = document.getElementById('notificationWrapper');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const notificationDropdownList = document.getElementById('notificationDropdownList');
const notificationBadge = document.getElementById('notificationBadge');
const notificationClearBtn = document.getElementById('notificationClearBtn');

let notificationUnreadCount = notificationBadge ? (parseInt(notificationBadge.textContent, 10) || 0) : 0;

function updateNotificationBadge() {
  if (!notificationBadge) return;
  if (notificationUnreadCount > 0) {
    notificationBadge.textContent = notificationUnreadCount > 9 ? '9+' : notificationUnreadCount;
    notificationBadge.classList.remove('hidden');
  } else {
    notificationBadge.textContent = '0';
    notificationBadge.classList.add('hidden');
  }
}
updateNotificationBadge();

// Добавляет новое уведомление в выпадающий список (вызывается из logActivity)
function pushNotification(iconClass, title, description) {
  if (!notificationDropdownList) return;

  const emptyState = notificationDropdownList.querySelector('.notification-empty');
  if (emptyState) emptyState.remove();

  const item = document.createElement('div');
  item.className = 'notification-dropdown-item';
  item.innerHTML = `
    <div class="activity-icon">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="activity-content">
      <p class="activity-title">${title}</p>
      <p class="activity-description">${description}</p>
      <span class="activity-time">только что</span>
    </div>
  `;
  notificationDropdownList.prepend(item);

  const items = notificationDropdownList.querySelectorAll('.notification-dropdown-item');
  if (items.length > 8) {
    items[items.length - 1].remove();
  }

  notificationUnreadCount += 1;
  updateNotificationBadge();
}

function closeNotificationDropdown() {
  if (!notificationDropdown) return;
  notificationDropdown.classList.remove('open');
}

if (notificationBtn && notificationDropdown) {
  notificationBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const willOpen = !notificationDropdown.classList.contains('open');
    notificationDropdown.classList.toggle('open', willOpen);

    if (willOpen) {
      // Открыли список — считаем уведомления прочитанными
      notificationUnreadCount = 0;
      updateNotificationBadge();
    }
  });

  notificationDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  document.addEventListener('click', function(e) {
    if (notificationWrapper && !notificationWrapper.contains(e.target)) {
      closeNotificationDropdown();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeNotificationDropdown();
  });
}

if (notificationClearBtn) {
  notificationClearBtn.addEventListener('click', function() {
    if (!notificationDropdownList) return;
    notificationDropdownList.innerHTML = '<div class="notification-empty">Новых уведомлений нет</div>';
    notificationUnreadCount = 0;
    updateNotificationBadge();
  });
}

// Settings menu items
document.querySelectorAll('.settings-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    
    document.querySelectorAll('.settings-item').forEach(i => {
      i.classList.remove('active');
    });
    
    this.classList.add('active');
    console.log('Settings section changed:', this.textContent);
  });
});

// Save Settings Button
document.querySelectorAll('.settings-right .btn-primary').forEach(btn => {
  btn.addEventListener('click', function() {
    const panel = this.closest('.settings-right');
    const inputs = panel ? panel.querySelectorAll('input, select, textarea') : [];
    const values = [];
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        values.push(`${input.name || input.id || 'опция'}: ${input.checked ? 'включено' : 'выключено'}`);
      } else {
        values.push(`${input.previousElementSibling ? input.previousElementSibling.textContent : ''}: ${input.value}`);
      }
    });

    // Визуальное подтверждение сохранения
    this.textContent = 'Сохранено ✓';
    this.classList.add('btn-success');
    logActivity('settings', 'Настройки обновлены', 'Изменения в настройках системы сохранены');
    setTimeout(() => {
      this.textContent = 'Сохранить изменения';
      this.classList.remove('btn-success');
    }, 1500);
  });
});

// ========== PAGES TAB: SEARCH + STATUS FILTER ==========
const pagesSearchInput = document.getElementById('pagesSearchInput');
const pagesStatusFilter = document.getElementById('pagesStatusFilter');
const pagesTableBodyEl = document.getElementById('pagesTableBody');

function applyPagesFilters() {
  if (!pagesTableBodyEl) return;

  // Реальные строки страниц — без служебных строк "пусто"/"не найдено"
  const dataRows = Array.from(pagesTableBodyEl.querySelectorAll('tr')).filter(
    row => row.id !== 'pagesEmptyRow' && row.id !== 'pagesNoResultsRow'
  );

  // Если страниц вообще нет — фильтровать нечего, пустое состояние уже показано
  if (dataRows.length === 0) return;

  const searchTerm = pagesSearchInput ? pagesSearchInput.value.trim().toLowerCase() : '';
  const statusValue = pagesStatusFilter ? pagesStatusFilter.value : 'Все статусы';

  let visibleCount = 0;

  dataRows.forEach(row => {
    const titleEl = row.querySelector('td strong');
    const badgeEl = row.querySelector('.badge');
    const title = titleEl ? titleEl.textContent.toLowerCase() : '';
    const status = badgeEl ? badgeEl.textContent.trim() : '';

    const matchesSearch = !searchTerm || title.includes(searchTerm);
    const matchesStatus = statusValue === 'Все статусы' || status === statusValue;
    const visible = matchesSearch && matchesStatus;

    row.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  // Строка "ничего не найдено", если фильтр/поиск не дал результатов
  let noResultsRow = document.getElementById('pagesNoResultsRow');
  if (visibleCount === 0) {
    if (!noResultsRow) {
      noResultsRow = document.createElement('tr');
      noResultsRow.id = 'pagesNoResultsRow';
      noResultsRow.innerHTML = '<td colspan="5" class="table-empty">Ничего не найдено по заданным фильтрам.</td>';
      pagesTableBodyEl.appendChild(noResultsRow);
    }
  } else if (noResultsRow) {
    noResultsRow.remove();
  }
}

if (pagesSearchInput) {
  pagesSearchInput.addEventListener('input', applyPagesFilters);
}
if (pagesStatusFilter) {
  pagesStatusFilter.addEventListener('change', applyPagesFilters);
}

// ========== USERS TAB: SEARCH + ROLE FILTER ==========
const usersSearchInput = document.getElementById('usersSearchInput');
const usersRoleFilter = document.getElementById('usersRoleFilter');
const usersTableBodyEl = document.getElementById('usersTableBody');

function applyUsersFilters() {
  if (!usersTableBodyEl) return;

  const dataRows = Array.from(usersTableBodyEl.querySelectorAll('tr')).filter(
    row => row.id !== 'usersEmptyRow' && row.id !== 'usersNoResultsRow'
  );

  // Если пользователей вообще нет — фильтровать нечего
  if (dataRows.length === 0) return;

  const searchTerm = usersSearchInput ? usersSearchInput.value.trim().toLowerCase() : '';
  const roleValue = usersRoleFilter ? usersRoleFilter.value : 'Все роли';

  let visibleCount = 0;

  dataRows.forEach(row => {
    const nameEl = row.querySelector('td strong');
    const emailEl = row.querySelectorAll('td')[1];
    const roleEl = row.querySelector('.badge');
    const name = nameEl ? nameEl.textContent.toLowerCase() : '';
    const email = emailEl ? emailEl.textContent.toLowerCase() : '';
    const role = roleEl ? roleEl.textContent.trim() : '';

    const matchesSearch = !searchTerm || name.includes(searchTerm) || email.includes(searchTerm);
    const matchesRole = roleValue === 'Все роли' || role === roleValue;
    const visible = matchesSearch && matchesRole;

    row.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  let noResultsRow = document.getElementById('usersNoResultsRow');
  if (visibleCount === 0) {
    if (!noResultsRow) {
      noResultsRow = document.createElement('tr');
      noResultsRow.id = 'usersNoResultsRow';
      noResultsRow.innerHTML = '<td colspan="6" class="table-empty">Ничего не найдено по заданным фильтрам.</td>';
      usersTableBodyEl.appendChild(noResultsRow);
    }
  } else if (noResultsRow) {
    noResultsRow.remove();
  }
}

if (usersSearchInput) {
  usersSearchInput.addEventListener('input', applyUsersFilters);
}
if (usersRoleFilter) {
  usersRoleFilter.addEventListener('change', applyUsersFilters);
}

// Filter functionality (остальные select-фильтры на других вкладках — пока заглушка)
document.querySelectorAll('.filter-select').forEach(select => {
  if (select.id === 'pagesStatusFilter' || select.id === 'usersRoleFilter') return;
  select.addEventListener('change', function() {
    console.log('Filter changed:', this.value);
  });
});

// Content editor enhancements
const contentEditor = document.getElementById('contentEditor');
if (contentEditor) {
  // Toolbar button functionality
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const icon = this.querySelector('i');
      const textarea = contentEditor;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      
      let newText = selectedText;
      
      if (icon.classList.contains('fa-bold')) {
        newText = `**${selectedText}**`;
      } else if (icon.classList.contains('fa-italic')) {
        newText = `*${selectedText}*`;
      } else if (icon.classList.contains('fa-underline')) {
        newText = `__${selectedText}__`;
      } else if (icon.classList.contains('fa-heading')) {
        newText = `# ${selectedText}`;
      } else if (icon.classList.contains('fa-list')) {
        newText = `- ${selectedText}`;
      } else if (icon.classList.contains('fa-quote-left')) {
        newText = `> ${selectedText}`;
      } else if (icon.classList.contains('fa-link')) {
        newText = `[${selectedText}](url)`;
      } else if (icon.classList.contains('fa-image')) {
        newText = `![alt](image-url)`;
      } else if (icon.classList.contains('fa-table')) {
        newText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`;
      }
      
      textarea.value = before + newText + after;
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    });
  });
}

// Save content button
const saveContentBtn = document.getElementById('saveContentBtn');
if (saveContentBtn) {
  saveContentBtn.addEventListener('click', function() {
    const titleInput = document.querySelector('#module-content .editor-left .form-control');
    const title = titleInput ? titleInput.value : '';
    logActivity('page', 'Страница сохранена', `Изменения страницы "${title}" сохранены`);
    alert(`Страница "${title}" сохранена!`);
  });
}

// Preview content button
const previewContentBtn = document.getElementById('previewContentBtn');
if (previewContentBtn) {
  previewContentBtn.addEventListener('click', function() {
    const titleInput = document.querySelector('#module-content .editor-left .form-control');
    const title = titleInput ? titleInput.value : 'Без названия';
    const content = contentEditor ? contentEditor.value : '';

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Предпросмотр: ${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.6; color: #1a2847; }
          h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>${title || 'Без названия'}</h1>
        <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '(содержание пока не введено)'}</pre>
      </body>
      </html>
    `);
    previewWindow.document.close();
  });
}

// ========== PROFILE MODULE ==========
// Заполняем поля профиля данными текущего пользователя
function fillProfileFields() {
  const session = window.currentUserSession;
  if (!session) return;

  const nameInput = document.getElementById('profileNameInput');
  const emailInput = document.getElementById('profileEmailInput');
  const displayName = document.getElementById('profileDisplayName');
  const displayEmail = document.getElementById('profileDisplayEmail');

  const account = getAccountByEmail(session.email) || session;

  if (nameInput) nameInput.value = account.name || '';
  if (emailInput) emailInput.value = account.email || '';
  if (displayName) displayName.textContent = account.name || 'Пользователь';
  if (displayEmail) displayEmail.textContent = account.email || '';
}

document.addEventListener('DOMContentLoaded', fillProfileFields);

// Сохранение личных данных профиля
const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', function() {
    const session = window.currentUserSession;
    if (!session) {
      alert('Сессия не найдена. Пожалуйста, войдите снова.');
      return;
    }

    const nameInput = document.getElementById('profileNameInput');
    const emailInput = document.getElementById('profileEmailInput');
    const newName = nameInput ? nameInput.value.trim() : '';
    const newEmail = emailInput ? emailInput.value.trim() : '';

    if (!newName || !newEmail) {
      alert('Имя и email не могут быть пустыми');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Пожалуйста, введите корректный email адрес');
      return;
    }

    // Обновляем запись в базе аккаунтов (по текущему email из сессии)
    const updated = updateAccount(session.email, { name: newName, email: newEmail });

    // Обновляем сессию
    session.name = newName;
    session.email = newEmail;
    window.currentUserSession = session;
    localStorage.setItem('userSession', JSON.stringify(session));

    // Обновляем отображение в шапке и в карточке профиля
    const userNameHeader = document.querySelector('.user-name');
    if (userNameHeader) userNameHeader.textContent = newName;

    const displayName = document.getElementById('profileDisplayName');
    const displayEmail = document.getElementById('profileDisplayEmail');
    if (displayName) displayName.textContent = newName;
    if (displayEmail) displayEmail.textContent = newEmail;

    if (typeof logActivity === 'function') {
      logActivity('settings', 'Профиль обновлён', `Данные профиля "${newName}" сохранены`);
    }

    alert('Профиль успешно обновлён!');
  });
}

// Смена пароля
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', function() {
    const session = window.currentUserSession;
    if (!session) {
      alert('Сессия не найдена. Пожалуйста, войдите снова.');
      return;
    }

    const currentPasswordInput = document.getElementById('profileCurrentPassword');
    const newPasswordInput = document.getElementById('profileNewPassword');
    const confirmPasswordInput = document.getElementById('profileConfirmPassword');

    const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
    const newPassword = newPasswordInput ? newPasswordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const account = getAccountByEmail(session.email);
    if (!account || account.password !== currentPassword) {
      alert('Текущий пароль указан неверно');
      return;
    }

    if (newPassword.length < 10) {
      alert('Новый пароль должен содержать минимум 10 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    updateAccount(session.email, { password: newPassword });

    if (typeof logActivity === 'function') {
      logActivity('settings', 'Пароль изменён', 'Пароль вашего аккаунта был успешно обновлён');
    }

    alert('Пароль успешно изменён!');

    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
  });
}

// Initialize tooltips and animations
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin Panel loaded successfully!');
  
  // Add ripple effect to buttons
  document.querySelectorAll('.btn, .btn-icon, .btn-small').forEach(btn => {
    btn.addEventListener('click', function(e) {
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
  
  // Add ripple animation style
  if (!document.querySelector('style[data-ripple-admin]')) {
    const style = document.createElement('style');
    style.setAttribute('data-ripple-admin', 'true');
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
  
  // Add scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInUp 0.6s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.stat-card, .activity-item').forEach(el => {
    observer.observe(el);
  });
});

// Add slideInUp animation
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(animStyle);

// Handle window resize for responsive sidebar
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    document.querySelector('.sidebar').classList.remove('active');
  }
});

// ========== LIVE DASHBOARD STATS ==========
// Считает реальные данные и обновляет карточки на главной

function updateDashboardStats() {
  // --- Страницы: считаем строки таблицы, кроме заглушек ---
  const pagesBody = document.getElementById('pagesTableBody');
  const pageCount = pagesBody
    ? Array.from(pagesBody.querySelectorAll('tr')).filter(
        r => r.id !== 'pagesEmptyRow' && r.id !== 'pagesNoResultsRow'
      ).length
    : 0;

  // --- Пользователи: берём из cmsPro_accounts ---
  let userCount = 0;
  let newUsersThisMonth = 0;
  try {
    const accounts = JSON.parse(localStorage.getItem('cmsPro_accounts') || '[]');
    userCount = accounts.length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    newUsersThisMonth = accounts.filter(a => a.createdAt && a.createdAt >= monthStart).length;
  } catch (e) {}

  // --- Файлы: из mediaFiles в localStorage ---
  let fileCount = 0;
  try {
    const files = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
    fileCount = files.length;
  } catch (e) {}

  // --- Просмотры: имитируем реалистичный счётчик ---
  // Храним базу + накапливаем при каждом визите
  let viewsData = { base: 12500, sessions: 0 };
  try {
    const saved = localStorage.getItem('cmsPro_views');
    if (saved) viewsData = JSON.parse(saved);
  } catch (e) {}

  // Увеличиваем на случайное число при каждой загрузке страницы (только раз)
  if (!window._viewsUpdated) {
    window._viewsUpdated = true;
    const increment = Math.floor(Math.random() * 5) + 1;
    viewsData.sessions = (viewsData.sessions || 0) + increment;
    try { localStorage.setItem('cmsPro_views', JSON.stringify(viewsData)); } catch (e) {}
  }

  const totalViews = viewsData.base + (viewsData.sessions || 0);

  function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    return String(n);
  }

  // --- Записываем в DOM ---
  const cards = document.querySelectorAll('.stat-card');
  if (cards.length >= 4) {
    // Страницы
    const pNum = cards[0].querySelector('.stat-number');
    const pSub = cards[0].querySelector('.stat-change');
    if (pNum) pNum.textContent = pageCount;
    if (pSub) {
      if (pageCount === 0) {
        pSub.textContent = 'Нет страниц — создайте первую';
        pSub.className = 'stat-change';
      } else {
        pSub.textContent = `${pageCount} ${pageCount === 1 ? 'страница' : pageCount < 5 ? 'страницы' : 'страниц'} опубликовано`;
        pSub.className = 'stat-change positive';
      }
    }

    // Пользователи
    const uNum = cards[1].querySelector('.stat-number');
    const uSub = cards[1].querySelector('.stat-change');
    if (uNum) uNum.textContent = formatNum(userCount);
    if (uSub) {
      if (newUsersThisMonth > 0) {
        uSub.textContent = `+${newUsersThisMonth} этот месяц`;
        uSub.className = 'stat-change positive';
      } else {
        uSub.textContent = userCount === 0 ? 'Нет пользователей' : 'Нет новых в этом месяце';
        uSub.className = 'stat-change';
      }
    }

    // Файлы
    const fNum = cards[2].querySelector('.stat-number');
    const fSub = cards[2].querySelector('.stat-change');
    if (fNum) fNum.textContent = fileCount;
    if (fSub) {
      if (fileCount === 0) {
        fSub.textContent = 'Нет файлов — загрузите первый';
        fSub.className = 'stat-change';
      } else {
        fSub.textContent = `${fileCount} ${fileCount === 1 ? 'файл' : fileCount < 5 ? 'файла' : 'файлов'} в медиатеке`;
        fSub.className = 'stat-change positive';
      }
    }

    // Просмотры
    const vNum = cards[3].querySelector('.stat-number');
    const vSub = cards[3].querySelector('.stat-change');
    if (vNum) vNum.textContent = formatNum(totalViews);
    if (vSub) {
      const weekGrowth = ((viewsData.sessions || 0) / viewsData.base * 100).toFixed(1);
      vSub.textContent = `+${weekGrowth}% от прошлой недели`;
      vSub.className = 'stat-change positive';
    }
  }
}

// Запускаем при загрузке и при переходах между модулями
document.addEventListener('DOMContentLoaded', function() {
  updateDashboardStats();

  // Обновляем при каждом клике на "Главная"
  document.querySelectorAll('[data-module="dashboard"]').forEach(el => {
    el.addEventListener('click', () => setTimeout(updateDashboardStats, 50));
  });
});

// Перехватываем события добавления/удаления чтобы обновлять цифры на лету
const _origLogActivity = typeof logActivity === 'function' ? logActivity : null;
// Переопределяем через MutationObserver — надёжнее
const _statsObserver = new MutationObserver(() => {
  // Дебаунс чтобы не спамить
  clearTimeout(window._statsTimer);
  window._statsTimer = setTimeout(updateDashboardStats, 100);
});

document.addEventListener('DOMContentLoaded', function() {
  ['pagesTableBody', 'usersTableBody', 'mediaGrid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) _statsObserver.observe(el, { childList: true, subtree: true });
  });
});

// ========== LOAD USERS FROM LOCALSTORAGE ON STARTUP ==========
function renderUsersFromStorage() {
  const usersTableBody = document.getElementById('usersTableBody');
  if (!usersTableBody) return;

  const accounts = getAllAccounts();
  if (!accounts.length) return;

  // Очищаем заглушку
  const emptyRow = document.getElementById('usersEmptyRow');
  if (emptyRow) emptyRow.remove();

  // Удаляем всё что было в DOM (старые рендеры)
  usersTableBody.innerHTML = '';

  const roleBadgeMap = {
    'Администратор': 'badge-info',
    'Редактор': 'badge-primary',
    'Автор': 'badge-warning',
    'Подписчик': 'badge-secondary'
  };

  accounts.forEach(acc => {
    const roleBadgeClass = roleBadgeMap[acc.role] || 'badge-secondary';
    const statusBadge = acc.status === 'active'
      ? '<span class="badge badge-success">Активен</span>'
      : '<span class="badge badge-danger">Неактивен</span>';

    const row = document.createElement('tr');
    row.dataset.accountId = acc.id;
    row.innerHTML = `
      <td><strong>${acc.name}</strong></td>
      <td>${acc.email}</td>
      <td><span class="badge ${roleBadgeClass}">${acc.role}</span></td>
      <td>${statusBadge}</td>
      <td>${acc.dateStr || ''}</td>
      <td>
        <button class="btn-icon" title="Редактировать"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-danger" title="Удалить"><i class="fas fa-trash"></i></button>
      </td>
    `;

    row.querySelector('.btn-danger').addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Вы уверены, что хотите удалить?')) {
        const accId = parseInt(row.dataset.accountId);
        const remaining = getAllAccounts().filter(a => a.id !== accId);
        localStorage.setItem('cmsPro_accounts', JSON.stringify(remaining));
        row.style.transition = 'opacity 0.25s ease';
        row.style.opacity = '0';
        setTimeout(() => {
          row.remove();
          const tbody = document.getElementById('usersTableBody');
          if (tbody && !tbody.querySelector('tr:not(#usersEmptyRow)')) {
            tbody.innerHTML = '<tr id="usersEmptyRow"><td colspan="6" class="table-empty">Пользователей пока нет. Нажмите «Новый пользователь», чтобы добавить первого.</td></tr>';
          }
        }, 250);
      }
    });

    usersTableBody.appendChild(row);
  });

  if (!usersTableBody.children.length) {
    usersTableBody.innerHTML = '<tr id="usersEmptyRow"><td colspan="6" class="table-empty">Пользователей пока нет. Нажмите «Новый пользователь», чтобы добавить первого.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', renderUsersFromStorage);

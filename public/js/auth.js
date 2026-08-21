/**
 * Stella-Nime - Authentication (Username & Password) & Cloud Sync Controller
 */

const AUTH_STORAGE_KEY = 'stella_nime_user';

const AuthManager = {
  user: null,
  activeTab: 'login', // 'login' | 'register'

  init() {
    this.loadUserFromStorage();
    this.setupNavbarAuth();
    this.setupAuthModal();

    // If logged in, perform background sync with server
    if (this.isLoggedIn()) {
      this.syncWithServer();
    }
  },

  loadUserFromStorage() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      this.user = stored ? JSON.parse(stored) : null;
    } catch (e) {
      this.user = null;
    }
  },

  isLoggedIn() {
    return !!(this.user && this.user.id && this.user.username);
  },

  getUser() {
    return this.user;
  },

  setUser(userData) {
    this.user = userData;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    this.renderNavbarAuth();
  },

  logout() {
    this.user = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.renderNavbarAuth();
    window.location.reload();
  },

  /**
   * Handle User Login Form Submit
   */
  async handleLogin(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const alertBox = document.getElementById('authAlertBox');
    const submitBtn = document.getElementById('btnLoginSubmit');

    const username = usernameInput?.value?.trim();
    const password = passwordInput?.value;

    if (!username || !password) {
      this.showAlert('Harap isi username dan password!', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width: 18px; height: 18px; margin: 0 auto;"></div>';
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const json = await res.json();

      if (json.success && json.data) {
        this.showAlert('Login berhasil! Menyinkronkan data...', 'success');
        setTimeout(() => {
          this.onLoginSuccess(json.data);
        }, 600);
      } else {
        this.showAlert(json.message || 'Username atau password salah.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      this.showAlert('Gagal terhubung ke server. Pastikan server aktif.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Masuk ke Akun';
      }
    }
  },

  /**
   * Handle User Register Form Submit
   */
  async handleRegister(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('regName');
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('regConfirmPassword');
    const submitBtn = document.getElementById('btnRegSubmit');

    const name = nameInput?.value?.trim();
    const username = usernameInput?.value?.trim();
    const password = passwordInput?.value;
    const confirmPassword = confirmInput?.value;

    if (!username || !password) {
      this.showAlert('Username dan password wajib diisi!', 'error');
      return;
    }

    if (password.length < 6) {
      this.showAlert('Password minimal harus 6 karakter!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showAlert('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner" style="width: 18px; height: 18px; margin: 0 auto;"></div>';
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password })
      });

      const json = await res.json();

      if (json.success && json.data) {
        this.showAlert('Pendaftaran berhasil! Selamat datang!', 'success');
        setTimeout(() => {
          this.onLoginSuccess(json.data);
        }, 700);
      } else {
        this.showAlert(json.message || 'Gagal mendaftar.', 'error');
      }
    } catch (err) {
      console.error('Register error:', err);
      this.showAlert('Gagal terhubung ke server.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Daftar Sekarang';
      }
    }
  },

  onLoginSuccess(userData) {
    this.setUser(userData);
    this.closeModal();

    // Merge server history & bookmarks to localStorage
    if (userData.history && Array.isArray(userData.history)) {
      const localHistory = StorageManager.getHistory();
      const merged = [...userData.history];
      localHistory.forEach(lh => {
        if (!merged.some(mh => mh.animeSlug === lh.animeSlug)) {
          merged.push(lh);
        }
      });
      localStorage.setItem('stella_nime_history', JSON.stringify(merged));
    }

    if (userData.bookmarks && Array.isArray(userData.bookmarks)) {
      const localBookmarks = StorageManager.getBookmarks();
      const merged = [...userData.bookmarks];
      localBookmarks.forEach(lb => {
        if (!merged.some(mb => mb.slug === lb.slug)) {
          merged.push(lb);
        }
      });
      localStorage.setItem('stella_nime_bookmarks', JSON.stringify(merged));
    }

    // Trigger sync to cloud
    this.syncWithServer();

    // Refresh page if on bookmarks
    if (window.location.pathname.includes('bookmarks')) {
      window.location.reload();
    }
  },

  /**
   * Sync LocalStorage history & bookmarks to Cloud Database
   */
  async syncWithServer() {
    if (!this.isLoggedIn()) return;

    try {
      const localHistory = StorageManager.getHistory();
      const localBookmarks = StorageManager.getBookmarks();

      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.user.id,
          history: localHistory,
          bookmarks: localBookmarks
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        this.user = json.data;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(json.data));
      }
    } catch (err) {
      console.warn('Sync note:', err.message);
    }
  },

  /**
   * Setup Navbar Auth Chip / Login Button
   */
  setupNavbarAuth() {
    this.renderNavbarAuth();
  },

  renderNavbarAuth() {
    const authContainers = document.querySelectorAll('.nav-right, #navAuthContainer');

    authContainers.forEach(container => {
      let authBtn = container.querySelector('.btn-vivid-purple, .user-nav-chip-wrapper');
      if (!authBtn) return;

      if (this.isLoggedIn()) {
        const user = this.user;
        const avatar = user.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`;
        const name = user.name || user.username;

        const userHtml = `
          <div class="user-nav-chip-wrapper" style="position: relative;">
            <button class="user-nav-chip" id="userMenuBtn" onclick="AuthManager.toggleDropdown(event)">
              <img src="${avatar}" alt="${name}" class="user-avatar-img">
              <span class="user-name-text">${name.split(' ')[0]}</span>
              <i class="fa-solid fa-chevron-down" style="font-size: 0.68rem; color: var(--text-dim);"></i>
            </button>

            <!-- Dropdown Menu -->
            <div class="user-dropdown-menu" id="userDropdownMenu">
              <div class="user-dropdown-header">
                <img src="${avatar}" alt="${name}" class="user-avatar-img" style="width: 38px; height: 38px;">
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                  <div style="font-size: 0.72rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-circle-check"></i> @${user.username}
                  </div>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <a href="/bookmarks" class="dropdown-item">
                <i class="fa-solid fa-bookmark" style="color: var(--primary-light);"></i>
                <span>Library Tersimpan</span>
              </a>

              <a href="/bookmarks#historySection" class="dropdown-item">
                <i class="fa-solid fa-clock-rotate-left" style="color: var(--accent-cyan);"></i>
                <span>Riwayat Tontonan</span>
              </a>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item logout-btn" onclick="AuthManager.logout()">
                <i class="fa-solid fa-right-from-bracket" style="color: #ef4444;"></i>
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        `;

        authBtn.outerHTML = userHtml;
      } else {
        const loginHtml = `
          <button class="btn-vivid-purple" onclick="AuthManager.openModal('login')">
            <i class="fa-solid fa-user"></i> Masuk
          </button>
        `;
        authBtn.outerHTML = loginHtml;
      }
    });
  },

  toggleDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
      menu.classList.toggle('show');
    }
  },

  /**
   * Switch between 'login' and 'register' modal tabs
   */
  switchTab(tab) {
    this.activeTab = tab;
    const tabLoginBtn = document.getElementById('tabBtnLogin');
    const tabRegBtn = document.getElementById('tabBtnRegister');
    const formLogin = document.getElementById('formLoginContainer');
    const formReg = document.getElementById('formRegContainer');
    const alertBox = document.getElementById('authAlertBox');

    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.textContent = '';
    }

    if (tab === 'login') {
      tabLoginBtn?.classList.add('active');
      tabRegBtn?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg) formReg.style.display = 'none';
    } else {
      tabRegBtn?.classList.add('active');
      tabLoginBtn?.classList.remove('active');
      if (formReg) formReg.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
    }
  },

  showAlert(message, type = 'error') {
    const alertBox = document.getElementById('authAlertBox');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `auth-alert ${type}`;
    alertBox.style.display = 'block';
  },

  /**
   * Setup & Inject Username & Password Auth Modal
   */
  setupAuthModal() {
    if (document.getElementById('authModalOverlay')) return;

    const modalHtml = `
      <div class="auth-modal-overlay" id="authModalOverlay" onclick="if(event.target === this) AuthManager.closeModal()">
        <div class="auth-box-pro">
          <!-- Close Button -->
          <button class="auth-modal-close" onclick="AuthManager.closeModal()"><i class="fa-solid fa-xmark"></i></button>

          <!-- Header -->
          <div class="auth-box-header">
            <div class="auth-brand-logo">Stella<span>Nime</span></div>
            <p class="auth-box-sub">Simpan & sinkronkan riwayat anime Anda di mana saja.</p>
          </div>

          <!-- Tabs Switcher -->
          <div class="auth-tabs-nav">
            <button class="auth-tab-btn active" id="tabBtnLogin" onclick="AuthManager.switchTab('login')">
              <i class="fa-solid fa-right-to-bracket"></i> Masuk
            </button>
            <button class="auth-tab-btn" id="tabBtnRegister" onclick="AuthManager.switchTab('register')">
              <i class="fa-solid fa-user-plus"></i> Daftar Akun
            </button>
          </div>

          <!-- Alert Box -->
          <div id="authAlertBox" class="auth-alert" style="display: none;"></div>

          <!-- 1. LOGIN FORM -->
          <div id="formLoginContainer">
            <form onsubmit="AuthManager.handleLogin(event)" class="auth-form">
              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-user"></i> Username</label>
                <input type="text" id="loginUsername" class="auth-input-control" placeholder="Masukkan username Anda" required autocomplete="username">
              </div>

              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-lock"></i> Password</label>
                <div class="password-input-wrapper">
                  <input type="password" id="loginPassword" class="auth-input-control" placeholder="Masukkan password" required autocomplete="current-password">
                  <button type="button" class="btn-toggle-pw" onclick="AuthManager.togglePasswordVisibility('loginPassword', this)">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <button type="submit" id="btnLoginSubmit" class="btn-auth-submit">
                Masuk ke Akun
              </button>
            </form>

            <div class="auth-box-footer">
              Belum memiliki akun? <a href="javascript:void(0)" onclick="AuthManager.switchTab('register')">Daftar sekarang</a>
            </div>
          </div>

          <!-- 2. REGISTER FORM -->
          <div id="formRegContainer" style="display: none;">
            <form onsubmit="AuthManager.handleRegister(event)" class="auth-form">
              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-id-card"></i> Nama Lengkap / Panggilan</label>
                <input type="text" id="regName" class="auth-input-control" placeholder="Contoh: Zocan Lunox">
              </div>

              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-at"></i> Username (Huruf & Angka)</label>
                <input type="text" id="regUsername" class="auth-input-control" placeholder="Contoh: zocan_anime" required autocomplete="username">
              </div>

              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-lock"></i> Password (Min. 6 Karakter)</label>
                <div class="password-input-wrapper">
                  <input type="password" id="regPassword" class="auth-input-control" placeholder="Buat password aman" required autocomplete="new-password">
                  <button type="button" class="btn-toggle-pw" onclick="AuthManager.togglePasswordVisibility('regPassword', this)">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <div class="auth-input-group">
                <label class="auth-label"><i class="fa-solid fa-shield-check"></i> Konfirmasi Password</label>
                <div class="password-input-wrapper">
                  <input type="password" id="regConfirmPassword" class="auth-input-control" placeholder="Ulangi password" required autocomplete="new-password">
                  <button type="button" class="btn-toggle-pw" onclick="AuthManager.togglePasswordVisibility('regConfirmPassword', this)">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <button type="submit" id="btnRegSubmit" class="btn-auth-submit">
                Daftar Sekarang
              </button>
            </form>

            <div class="auth-box-footer">
              Sudah punya akun? <a href="javascript:void(0)" onclick="AuthManager.switchTab('login')">Masuk di sini</a>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Close dropdown on outside click
    document.addEventListener('click', e => {
      const dropdown = document.getElementById('userDropdownMenu');
      if (dropdown && !e.target.closest('.user-nav-chip-wrapper')) {
        dropdown.classList.remove('show');
      }
    });
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  },

  openModal(tab = 'login') {
    const modal = document.getElementById('authModalOverlay');
    if (modal) {
      this.switchTab(tab);
      modal.classList.add('show');
    }
  },

  closeModal() {
    const modal = document.getElementById('authModalOverlay');
    if (modal) modal.classList.remove('show');
  }
};

// Expose globally
window.AuthManager = AuthManager;

document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});

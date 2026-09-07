let books = JSON.parse(localStorage.getItem('bm_books')) || [];
let seriesList = JSON.parse(localStorage.getItem('bm_series')) || ['Classics', 'Fantasy'];
let profile = JSON.parse(localStorage.getItem('bm_profile')) || {
  name: 'Mahinbonu',
  avatar: 'https://via.placeholder.com/120',
  theme: 'dark'
};

let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('pageTitle');

// Modal Elements
const addBookBtn = document.getElementById('addBookBtn');
const bookModal = document.getElementById('bookModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addBookForm = document.getElementById('addBookForm');
const bookCoverFile = document.getElementById('bookCoverFile');
const bookSeriesSelect = document.getElementById('bookSeriesSelect');

// Profile Elements
const profileNameInput = document.getElementById('profileNameInput');
const profileNameDisplay = document.getElementById('profileNameDisplay');
const profileAvatar = document.getElementById('profileAvatar');
const avatarUpload = document.getElementById('avatarUpload');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const darkThemeBtn = document.getElementById('darkThemeBtn');
const lightThemeBtn = document.getElementById('lightThemeBtn');

function saveData() {
  localStorage.setItem('bm_books', JSON.stringify(books));
  localStorage.setItem('bm_series', JSON.stringify(seriesList));
  localStorage.setItem('bm_profile', JSON.stringify(profile));
}

// Navigation Tabs
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetTab = item.dataset.tab;

    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    tabContents.forEach(tab => {
      tab.classList.add('hidden');
      if (tab.id === `tab-${targetTab}`) {
        tab.classList.remove('hidden');
      }
    });

    const titles = {
      calendar: 'Reading Calendar',
      library: 'My Library',
      series: 'Book Series',
      stats: 'Statistics',
      profile: 'Profile'
    };
    pageTitle.textContent = titles[targetTab] || 'Library';

    if (targetTab === 'series') renderSeries();
  });
});

// Theme Switching
function applyTheme(theme) {
  profile.theme = theme;
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    lightThemeBtn?.classList.add('active-theme');
    darkThemeBtn?.classList.remove('active-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    darkThemeBtn?.classList.add('active-theme');
    lightThemeBtn?.classList.remove('active-theme');
  }
  saveData();
}

darkThemeBtn?.addEventListener('click', () => applyTheme('dark'));
lightThemeBtn?.addEventListener('click', () => applyTheme('light'));

// Profile Init
function initProfile() {
  if (profileNameDisplay) profileNameDisplay.textContent = profile.name;
  if (profileNameInput) profileNameInput.value = profile.name;
  if (profile.avatar && profileAvatar) profileAvatar.src = profile.avatar;
  applyTheme(profile.theme || 'dark');
}

saveProfileBtn?.addEventListener('click', () => {
  profile.name = profileNameInput.value.trim() || 'User';
  profileNameDisplay.textContent = profile.name;
  saveData();
});

avatarUpload?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      profile.avatar = evt.target.result;
      profileAvatar.src = profile.avatar;
      saveData();
    };
    reader.readAsDataURL(file);
  }
});

// Render Books
function renderBooks() {
  if (!booksGrid) return;
  booksGrid.innerHTML = '';

  let filtered = books.filter(b => {
    const matchesFilter = currentFilter === 'all' || b.status === currentFilter;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery) || b.author.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filtered.forEach(book => {
    const total = Number(book.totalPages) || 1;
    const read = Number(book.readPages) || 0;
    const progress = Math.min(100, Math.round((read / total) * 100));

    const card = document.createElement('div');
    card.className = 'book-card lace-card';
    card.innerHTML = `
      <div class="book-card__cover">
        ${book.cover ? `<img src="${book.cover}" alt="${book.title}" />` : `<div class="book-card__placeholder">${book.title.charAt(0)}</div>`}
      </div>
      <h3 class="book-card__title">${book.title}</h3>
      <p class="book-card__author">${book.author}</p>
      <div class="book-card__progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="book-card__pages-row">
        <span>${read} / ${total} pages</span>
        <span>${progress}%</span>
      </div>
      <div class="book-card__actions">
        <button class="btn-icon delete-btn" data-id="${book.id}">🗑️</button>
      </div>
    `;

    card.querySelector('.delete-btn')?.addEventListener('click', () => {
      books = books.filter(b => b.id !== book.id);
      saveData();
      renderBooks();
    });

    booksGrid.appendChild(card);
  });

  updateStats();
}

// Filter Tabs Event
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderBooks();
  });
});

// Search Input
searchInput?.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderBooks();
});

function updateStats() {
  document.getElementById('statTotal').textContent = books.length;
  document.getElementById('statReading').textContent = books.filter(b => b.status === 'reading').length;
  document.getElementById('statRead').textContent = books.filter(b => b.status === 'read').length;
  document.getElementById('statPages').textContent = books.reduce((acc, b) => acc + (Number(b.readPages) || 0), 0);
}

// Series
function renderSeries() {
  const grid = document.getElementById('seriesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (bookSeriesSelect) {
    bookSeriesSelect.innerHTML = '<option value="">No Series</option>';
    seriesList.forEach(s => {
      bookSeriesSelect.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }

  seriesList.forEach(s => {
    const seriesBooks = books.filter(b => b.series === s);
    const card = document.createElement('div');
    card.className = 'series-card lace-card';
    card.innerHTML = `
      <h3>${s}</h3>
      <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.4rem;">${seriesBooks.length} Books</p>
    `;
    grid.appendChild(card);
  });
}

document.getElementById('addSeriesBtn')?.addEventListener('click', () => {
  const input = document.getElementById('newSeriesInput');
  const val = input.value.trim();
  if (val && !seriesList.includes(val)) {
    seriesList.push(val);
    input.value = '';
    saveData();
    renderSeries();
  }
});

// Modal Actions
addBookBtn?.addEventListener('click', () => {
  addBookForm.reset();
  renderSeries();
  bookModal.classList.remove('hidden');
});

closeModalBtn?.addEventListener('click', () => bookModal.classList.add('hidden'));
cancelModalBtn?.addEventListener('click', () => bookModal.classList.add('hidden'));

addBookForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  let cover = null;

  if (bookCoverFile.files && bookCoverFile.files[0]) {
    cover = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => resolve(evt.target.result);
      reader.readAsDataURL(bookCoverFile.files[0]);
    });
  }

  const newBook = {
    id: Date.now().toString(),
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    status: document.getElementById('bookStatus').value,
    series: bookSeriesSelect.value,
    totalPages: Number(document.getElementById('totalPages').value) || 0,
    readPages: Number(document.getElementById('readPages').value) || 0,
    cover
  };

  books.push(newBook);
  saveData();
  renderBooks();
  bookModal.classList.add('hidden');
});

// Init
initProfile();
renderBooks();
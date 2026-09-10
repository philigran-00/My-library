let books = JSON.parse(localStorage.getItem('bm_books')) || [];
let seriesList = JSON.parse(localStorage.getItem('bm_series')) || ['Classics', 'Fantasy'];
let profile = JSON.parse(localStorage.getItem('bm_profile')) || {
  name: 'Mahinbonu',
  avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%232d2d2d"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="%23ffffff" font-size="40" font-family="sans-serif">M</text></svg>',
  theme: 'dark'
};

let currentFilter = 'all';
let searchQuery = '';


const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('pageTitle');


const addBookBtn = document.getElementById('addBookBtn');
const bookModal = document.getElementById('bookModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addBookForm = document.getElementById('addBookForm');
const bookCoverInput = document.getElementById('bookCoverInput');
const bookSeriesSelect = document.getElementById('bookSeriesSelect');
const genreSelect = document.getElementById('bookGenreSelect');
const customGenreInput = document.getElementById('customGenreInput');


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


filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderBooks();
  });
});


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



genreSelect?.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    customGenreInput?.classList.remove('hidden');
    customGenreInput?.focus();
  } else {
    customGenreInput?.classList.add('hidden');
    if (customGenreInput) customGenreInput.value = '';
  }
});



function openAddModal() {
  addBookForm.reset();
  
  
  if (customGenreInput) {
    customGenreInput.classList.add('hidden');
    customGenreInput.value = '';
  }

  
  const bookIdInput = document.getElementById('bookId');
  if (bookIdInput) bookIdInput.value = '';

  
  const defaultFormat = document.querySelector('input[name="format"][value="eBook"]');
  if (defaultFormat) defaultFormat.checked = true;

  bookModal.classList.remove('hidden');
}

function editBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const bookIdInput = document.getElementById('bookId');
  if (bookIdInput) bookIdInput.value = book.id;

  document.getElementById('bookTitle').value = book.title || '';
  document.getElementById('bookAuthor').value = book.author || '';
  
  const startDateInput = document.getElementById('startDate');
  if (startDateInput) startDateInput.value = book.startDate || '';

  const finishDateInput = document.getElementById('finishDate');
  if (finishDateInput) finishDateInput.value = book.finishDate || '';

  document.getElementById('bookStatus').value = book.status || 'planned';

  const descInput = document.getElementById('bookDescription');
  if (descInput) descInput.value = book.description || '';

  const genreInput = document.getElementById('bookGenreSelect');
  if (genreInput) genreInput.value = book.genre || 'Fiction';

  const pubInput = document.getElementById('bookPublisher');
  if (pubInput) pubInput.value = book.publisher || '';

  const yearInput = document.getElementById('publicationYear');
  if (yearInput) yearInput.value = book.publicationYear || '';

  document.getElementById('totalPages').value = book.totalPages || '';

  // Переключатель формата
  const formatRadio = document.querySelector(`input[name="format"][value="${book.format}"]`);
  if (formatRadio) formatRadio.checked = true;

  bookModal.classList.remove('hidden');
}

addBookBtn?.addEventListener('click', openAddModal);
closeModalBtn?.addEventListener('click', () => bookModal.classList.add('hidden'));
cancelModalBtn?.addEventListener('click', () => bookModal.classList.add('hidden'));


addBookForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  let cover = null;

  if (bookCoverInput?.files && bookCoverInput.files[0]) {
  cover = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (evt) => resolve(evt.target.result);
    reader.readAsDataURL(bookCoverInput.files[0]);
  });
}

  const selectedFormat = document.querySelector('input[name="format"]:checked')?.value || 'eBook';

 
  let selectedGenre = genreSelect?.value || 'Fiction';
  if (selectedGenre === 'custom') {
    selectedGenre = customGenreInput?.value.trim() || 'Other';
  }

  const newBook = {
    id: Date.now().toString(),
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    format: selectedFormat,
    startDate: document.getElementById('startDate')?.value || '',
    finishDate: document.getElementById('finishDate')?.value || '',
    status: document.getElementById('bookStatus').value,
    description: document.getElementById('bookDescription')?.value.trim() || '',
    genre: selectedGenre,
    publisher: document.getElementById('bookPublisher')?.value.trim() || '',
    publicationYear: document.getElementById('publicationYear')?.value || '',
    totalPages: Number(document.getElementById('totalPages').value) || 0,
    readPages: 0,
    cover
  };

  books.push(newBook);
  saveData();
  renderBooks();
  addBookForm.reset();
  bookModal.classList.add('hidden');
});


initProfile();
renderBooks();


const sortDropdown = document.getElementById('sortDropdown');

if (sortDropdown) {
  const trigger = sortDropdown.querySelector('.dropdown-trigger');
  const menu = sortDropdown.querySelector('.dropdown-menu');
  const label = sortDropdown.querySelector('.dropdown-label');
  const options = sortDropdown.querySelectorAll('.dropdown-option');

  
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('open');
    menu.classList.toggle('hidden');
  });

  
  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('selected'));
      option.classList.add('selected');
      label.textContent = option.textContent;

      menu.classList.add('hidden');
      sortDropdown.classList.remove('open');

      
      if (typeof renderBooks === 'function') {
        renderBooks();
      }
    });
  });

  
  document.addEventListener('click', () => {
    menu.classList.add('hidden');
    sortDropdown.classList.remove('open');
  });
}



function setupCustomDropdown(dropdownId, onChangeCallback) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const trigger = dropdown.querySelector('.dropdown-trigger');
  const menu = dropdown.querySelector('.dropdown-menu');
  const label = dropdown.querySelector('.dropdown-label');
  const options = dropdown.querySelectorAll('.dropdown-option');
  const hiddenInput = dropdown.querySelector('input[type="hidden"]');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    
    document.querySelectorAll('.custom-dropdown').forEach(d => {
      if (d !== dropdown) {
        d.classList.remove('open');
        d.querySelector('.dropdown-menu')?.classList.add('hidden');
      }
    });
    dropdown.classList.toggle('open');
    menu.classList.toggle('hidden');
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('selected'));
      option.classList.add('selected');
      label.textContent = option.textContent;

      const val = option.dataset.value;
      if (hiddenInput) hiddenInput.value = val;

      menu.classList.add('hidden');
      dropdown.classList.remove('open');

      if (onChangeCallback) onChangeCallback(val);
    });
  });
}


setupCustomDropdown('statusDropdown');
setupCustomDropdown('genreDropdown', (val) => {
  if (val === 'custom') {
    customGenreInput?.classList.remove('hidden');
    customGenreInput?.focus();
  } else {
    customGenreInput?.classList.add('hidden');
    if (customGenreInput) customGenreInput.value = '';
  }
});



let currentSelectedBook = null;

function openBookDetail(book) {
  currentSelectedBook = book;
  
  document.getElementById('detailTitle').textContent = book.title || '';
  document.getElementById('detailAuthor').textContent = book.author || '';
  document.getElementById('detailCover').src = book.cover || 'placeholder.png';
  document.getElementById('detailStatusBadge').textContent = book.status || 'Want to read';
  document.getElementById('detailPagesRead').textContent = book.pagesRead || 0;
  document.getElementById('detailTotalPages').textContent = book.totalPages || 0;
  document.getElementById('detailStartDate').textContent = book.startDate || '—';
  document.getElementById('detailFormat').textContent = book.format || '📱 eBook';
  document.getElementById('detailDescription').textContent = book.description || 'No description available.';

  const total = parseInt(book.totalPages) || 1;
  const read = parseInt(book.pagesRead) || 0;
  const percent = Math.min(Math.round((read / total) * 100), 100);
  
  document.getElementById('detailProgressBar').style.width = `${percent}%`;
  document.getElementById('detailProgressPercent').textContent = `${percent}%`;

  document.getElementById('bookDetailModal').classList.remove('hidden');
}


document.getElementById('closeDetailBtn')?.addEventListener('click', () => {
  document.getElementById('bookDetailModal').classList.add('hidden');
});

document.getElementById('openBookSettingsBtn')?.addEventListener('click', () => {
  document.getElementById('bookSettingsSheet').classList.remove('hidden');
});

document.getElementById('closeSettingsSheetBtn')?.addEventListener('click', () => {
  document.getElementById('bookSettingsSheet').classList.add('hidden');
});


document.getElementById('editBookBtn')?.addEventListener('click', () => {
  document.getElementById('bookSettingsSheet').classList.add('hidden');
  document.getElementById('bookDetailModal').classList.add('hidden');
  
  if (currentSelectedBook) {
    document.getElementById('bookTitle').value = currentSelectedBook.title || '';
    document.getElementById('bookAuthor').value = currentSelectedBook.author || '';
    document.getElementById('bookDescription').value = currentSelectedBook.description || '';
    if (document.getElementById('totalPages')) {
      document.getElementById('totalPages').value = currentSelectedBook.totalPages || '';
    }
    
    document.getElementById('bookModal').classList.remove('hidden');
  }
});


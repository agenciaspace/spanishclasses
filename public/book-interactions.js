/* =====================================
   📖 INTERACTIVE BOOK FUNCTIONALITY
   ===================================== */

class EnhancedBookReader {
  constructor() {
    this.isScrollPaused = false;
    this.isAutoScrolling = true;
    this.currentPage = 1;
    this.totalPages = 1;
    this.virtualPages = [];
    this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    this.notes = JSON.parse(localStorage.getItem('notes') || '{}');
    this.currentTheme = localStorage.getItem('reading-theme') || 'default';
    this.isImmersiveMode = false;
    this.scrollSpeed = parseInt(localStorage.getItem('scroll-speed') || '1');
    this.fontSize = parseInt(localStorage.getItem('font-size') || '16');
    
    this.initializeEnhancedControls();
    this.initializePageSystem();
    this.initializeKeyboardShortcuts();
    this.initializeBookmarks();
    this.initializeNotes();
    this.applyTheme();
    this.appleFontSize();
  }

  /* =====================================
     🎛️ ENHANCED CONTROLS SYSTEM
     ===================================== */
  
  initializeEnhancedControls() {
    // Create enhanced controls interface
    const audioControls = document.querySelector('.audio-controls');
    if (audioControls) {
      audioControls.innerHTML = this.generateEnhancedControlsHTML();
      this.bindControlEvents();
    }
    
    // Add scroll progress indicator
    this.addScrollProgressIndicator();
  }
  
  generateEnhancedControlsHTML() {
    return `
      <div class="enhanced-audio-controls">
        <div class="controls-grid">
          <div class="audio-section">
            <audio id="audioPlayer" controls preload="metadata">
              <source src="/audio/el-principito.mp3" type="audio/mpeg">
              Tu navegador no soporta el elemento de audio.
            </audio>
            <div class="audio-controls-row">
              <div class="controls-help">
                <small>🎯 <strong>Atalhos:</strong> Espaço (play/pause) • S (pausar scroll) • F (modo foco) • ← → (navegar)</small>
              </div>
            </div>
          </div>
          
          <div class="scroll-controls">
            <div class="scroll-status">Auto-Scroll</div>
            <button id="scrollToggle" class="scroll-toggle-btn">
              <span class="scroll-icon">⏸️</span>
              <span class="scroll-text">Pausar</span>
            </button>
            <div class="scroll-speed-control">
              <label for="scrollSpeed">Velocidade:</label>
              <input type="range" id="scrollSpeed" min="1" max="5" value="${this.scrollSpeed}" class="speed-slider">
            </div>
          </div>
          
          <div class="reading-mode-controls">
            <div class="scroll-status">Modo Leitura</div>
            <button id="immersiveToggle" class="mode-toggle-btn">
              <span>🎯</span>
              <span>Modo Foco</span>
            </button>
            <div class="theme-controls">
              <select id="themeSelector" class="theme-select">
                <option value="default">📖 Clássico</option>
                <option value="sepia">🟤 Sépia</option>
                <option value="dark">🌙 Noturno</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="sync-controls">
          <label>⚙️ Sincronização:</label>
          <button onclick="app.adjustSync(-5)">-5s</button>
          <button onclick="app.adjustSync(-1)">-1s</button>
          <span id="syncOffset">0s</span>
          <button onclick="app.adjustSync(1)">+1s</button>
          <button onclick="app.adjustSync(5)">+5s</button>
          <button onclick="app.resetSync()">Reset</button>
        </div>
      </div>
      
      <!-- Notes Panel -->
      <div class="notes-panel" id="notesPanel">
        <div class="notes-header">
          <h3>📝 Minhas Anotações</h3>
          <button class="notes-close" onclick="bookReader.toggleNotesPanel()">✕</button>
        </div>
        <div class="notes-content" id="notesContent">
          <!-- Notes will be populated here -->
        </div>
        <div class="notes-input">
          <textarea id="newNote" placeholder="Adicionar nova anotação..." rows="3"></textarea>
          <button onclick="bookReader.addNote()" class="add-note-btn">Adicionar</button>
        </div>
      </div>
      
      <!-- Notes Toggle Button -->
      <button class="notes-toggle" onclick="bookReader.toggleNotesPanel()">📝</button>
      
      <!-- Reading Focus Mode -->
      <div class="reading-focus-mode" id="focusMode">
        <button class="focus-close" onclick="bookReader.toggleImmersiveMode()">✕</button>
        <div class="focus-content" id="focusContent"></div>
      </div>
    `;
  }
  
  bindControlEvents() {
    // Scroll toggle
    const scrollToggle = document.getElementById('scrollToggle');
    if (scrollToggle) {
      scrollToggle.addEventListener('click', () => this.toggleAutoScroll());
    }
    
    // Immersive mode toggle
    const immersiveToggle = document.getElementById('immersiveToggle');
    if (immersiveToggle) {
      immersiveToggle.addEventListener('click', () => this.toggleImmersiveMode());
    }
    
    // Theme selector
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
      themeSelector.value = this.currentTheme;
      themeSelector.addEventListener('change', (e) => this.changeTheme(e.target.value));
    }
    
    // Scroll speed control
    const scrollSpeed = document.getElementById('scrollSpeed');
    if (scrollSpeed) {
      scrollSpeed.addEventListener('input', (e) => this.changeScrollSpeed(e.target.value));
    }
  }
  
  addScrollProgressIndicator() {
    const progressHTML = `
      <div class="scroll-progress">
        <div class="scroll-progress-bar" id="scrollProgressBar"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', progressHTML);
  }
  
  /* =====================================
     📚 AUTO-SCROLL CONTROL SYSTEM
     ===================================== */
  
  toggleAutoScroll() {
    this.isScrollPaused = !this.isScrollPaused;
    const scrollToggle = document.getElementById('scrollToggle');
    const scrollIcon = scrollToggle.querySelector('.scroll-icon');
    const scrollText = scrollToggle.querySelector('.scroll-text');
    
    if (this.isScrollPaused) {
      scrollToggle.classList.add('paused');
      scrollIcon.textContent = '▶️';
      scrollText.textContent = 'Retomar';
      this.showScrollStatus('Scroll pausado - áudio continua');
    } else {
      scrollToggle.classList.remove('paused');
      scrollIcon.textContent = '⏸️';
      scrollText.textContent = 'Pausar';
      this.showScrollStatus('Auto-scroll ativado');
    }
    
    // Save preference
    localStorage.setItem('scroll-paused', this.isScrollPaused);
  }
  
  changeScrollSpeed(speed) {
    this.scrollSpeed = parseInt(speed);
    localStorage.setItem('scroll-speed', this.scrollSpeed);
    this.showScrollStatus(`Velocidade: ${this.scrollSpeed}x`);
  }
  
  showScrollStatus(message) {
    // Create temporary status message
    const statusDiv = document.createElement('div');
    statusDiv.className = 'scroll-status-message';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(40, 167, 69, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      z-index: 1001;
      font-size: 14px;
      animation: slideInOut 2s ease-in-out forwards;
    `;
    
    document.body.appendChild(statusDiv);
    setTimeout(() => statusDiv.remove(), 2000);
  }
  
  // Override the original highlightCurrentSegment to respect scroll pause
  highlightCurrentSegment() {
    const currentTime = app.audio.currentTime - app.syncOffset;
    const paragraphs = document.querySelectorAll('.paragraph');
    let currentSegment = null;
    
    paragraphs.forEach(p => {
      const start = parseFloat(p.dataset.start);
      const end = parseFloat(p.dataset.end);
      
      if (currentTime >= start && currentTime <= end) {
        currentSegment = p;
        p.classList.add('current-segment');
        
        // Only auto-scroll if not paused
        if (!this.isScrollPaused && this.isAutoScrolling) {
          this.smoothScrollToElement(p);
        }
      } else {
        p.classList.remove('current-segment');
      }
    });
    
    this.updateScrollProgress();
    return currentSegment;
  }
  
  smoothScrollToElement(element) {
    const behavior = this.scrollSpeed === 1 ? 'smooth' : 'auto';
    const block = 'center';
    
    element.scrollIntoView({ 
      behavior, 
      block,
      inline: 'nearest'
    });
  }
  
  updateScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    if (progressBar && app.audio.duration) {
      const progress = (app.audio.currentTime / app.audio.duration) * 100;
      progressBar.style.width = progress + '%';
    }
  }
  
  /* =====================================
     📖 PAGE SYSTEM
     ===================================== */
  
  initializePageSystem() {
    // Will be implemented when content is loaded
    this.setupPageNavigation();
  }
  
  setupPageNavigation() {
    // Add page navigation controls
    const content = document.getElementById('bookContent');
    if (content) {
      const navHTML = `
        <div class="page-navigation">
          <button class="page-nav-btn" id="prevPage" onclick="bookReader.previousPage()">
            ← Página Anterior
          </button>
          <div class="page-info">
            <div class="page-counter">
              Página <span id="currentPageNum">1</span> de <span id="totalPagesNum">1</span>
            </div>
            <div class="reading-progress">
              <div class="progress-text">Progresso da leitura</div>
            </div>
          </div>
          <button class="page-nav-btn" id="nextPage" onclick="bookReader.nextPage()">
            Próxima Página →
          </button>
        </div>
      `;
      content.insertAdjacentHTML('beforeend', navHTML);
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.navigateToPage(this.currentPage);
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.navigateToPage(this.currentPage);
    }
  }
  
  navigateToPage(pageNumber) {
    // Animate page transition
    const currentPageElement = document.querySelector('.virtual-page.current');
    if (currentPageElement) {
      currentPageElement.classList.add('page-flip-animation');
      setTimeout(() => {
        currentPageElement.classList.remove('current', 'page-flip-animation');
      }, 400);
    }
    
    // Show new page
    setTimeout(() => {
      const newPageElement = document.querySelector(`[data-page="${pageNumber}"]`);
      if (newPageElement) {
        newPageElement.classList.add('current');
        newPageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.updatePageNavigation();
    }, 400);
  }
  
  updatePageNavigation() {
    const currentPageNum = document.getElementById('currentPageNum');
    const totalPagesNum = document.getElementById('totalPagesNum');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (currentPageNum) currentPageNum.textContent = this.currentPage;
    if (totalPagesNum) totalPagesNum.textContent = this.totalPages;
    
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
  }
  
  /* =====================================
     ⌨️ KEYBOARD SHORTCUTS
     ===================================== */
  
  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          this.toggleAutoScroll();
          break;
        case 'f':
          e.preventDefault();
          this.toggleImmersiveMode();
          break;
        case 'n':
          e.preventDefault();
          this.toggleNotesPanel();
          break;
        case 'b':
          e.preventDefault();
          this.toggleBookmark();
          break;
        case 'arrowup':
          e.preventDefault();
          this.previousPage();
          break;
        case 'arrowdown':
          e.preventDefault();
          this.nextPage();
          break;
        case '1':
        case '2':
        case '3':
          e.preventDefault();
          this.changeTheme(['default', 'sepia', 'dark'][parseInt(e.key) - 1]);
          break;
      }
    });
  }
  
  /* =====================================
     🔖 BOOKMARKS SYSTEM
     ===================================== */
  
  initializeBookmarks() {
    // Add bookmark indicators to paragraphs
    this.updateBookmarkIndicators();
  }
  
  updateBookmarkIndicators() {
    document.querySelectorAll('.paragraph').forEach((p, index) => {
      const isBookmarked = this.bookmarks.includes(index);
      
      if (!p.querySelector('.bookmark-indicator')) {
        const bookmarkBtn = document.createElement('div');
        bookmarkBtn.className = 'bookmark-indicator';
        bookmarkBtn.innerHTML = isBookmarked ? '🔖' : '📌';
        bookmarkBtn.onclick = () => this.toggleBookmark(index);
        p.appendChild(bookmarkBtn);
      }
      
      if (isBookmarked) {
        p.classList.add('bookmarked');
      }
    });
  }
  
  toggleBookmark(index = null) {
    if (index === null) {
      // Find current segment
      const currentSegment = document.querySelector('.paragraph.current-segment');
      if (currentSegment) {
        const paragraphs = Array.from(document.querySelectorAll('.paragraph'));
        index = paragraphs.indexOf(currentSegment);
      }
    }
    
    if (index !== null) {
      const bookmarkIndex = this.bookmarks.indexOf(index);
      if (bookmarkIndex > -1) {
        this.bookmarks.splice(bookmarkIndex, 1);
      } else {
        this.bookmarks.push(index);
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
      this.updateBookmarkIndicators();
      this.showBookmarkStatus(bookmarkIndex > -1 ? 'removed' : 'added');
    }
  }
  
  showBookmarkStatus(action) {
    const message = action === 'added' ? '🔖 Bookmark adicionado!' : '📌 Bookmark removido!';
    this.showScrollStatus(message);
  }
  
  /* =====================================
     📝 NOTES SYSTEM
     ===================================== */
  
  initializeNotes() {
    this.renderNotes();
  }
  
  toggleNotesPanel() {
    const notesPanel = document.getElementById('notesPanel');
    if (notesPanel) {
      notesPanel.classList.toggle('open');
    }
  }
  
  addNote() {
    const newNoteInput = document.getElementById('newNote');
    const noteText = newNoteInput.value.trim();
    
    if (noteText) {
      const timestamp = Date.now();
      const currentTime = app.audio ? app.audio.currentTime : 0;
      
      this.notes[timestamp] = {
        text: noteText,
        time: currentTime,
        timestamp: new Date().toLocaleString(),
        page: this.currentPage
      };
      
      localStorage.setItem('notes', JSON.stringify(this.notes));
      newNoteInput.value = '';
      this.renderNotes();
      this.showScrollStatus('📝 Nota adicionada!');
    }
  }
  
  renderNotes() {
    const notesContent = document.getElementById('notesContent');
    if (!notesContent) return;
    
    const notesArray = Object.entries(this.notes).sort((a, b) => b[0] - a[0]);
    
    if (notesArray.length === 0) {
      notesContent.innerHTML = '<p class="no-notes">Nenhuma anotação ainda.</p>';
      return;
    }
    
    notesContent.innerHTML = notesArray.map(([id, note]) => `
      <div class="note-item">
        <div class="note-header">
          <span class="note-time">${note.timestamp}</span>
          <button onclick="bookReader.deleteNote('${id}')" class="delete-note">×</button>
        </div>
        <div class="note-text">${note.text}</div>
        <div class="note-actions">
          <button onclick="bookReader.jumpToNoteTime(${note.time})" class="jump-to-time">
            🎧 ${app.formatTime ? app.formatTime(note.time) : Math.floor(note.time) + 's'}
          </button>
        </div>
      </div>
    `).join('');
  }
  
  deleteNote(id) {
    delete this.notes[id];
    localStorage.setItem('notes', JSON.stringify(this.notes));
    this.renderNotes();
    this.showScrollStatus('📝 Nota removida!');
  }
  
  jumpToNoteTime(time) {
    if (app.audio) {
      app.audio.currentTime = time;
      if (app.audio.paused) {
        app.audio.play();
      }
    }
    this.toggleNotesPanel();
  }
  
  /* =====================================
     🎨 THEME SYSTEM
     ===================================== */
  
  changeTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('reading-theme', theme);
    this.applyTheme();
    this.showScrollStatus(`🎨 Tema: ${this.getThemeName(theme)}`);
  }
  
  applyTheme() {
    const container = document.querySelector('.container');
    if (container) {
      container.className = container.className.replace(/theme-\w+/g, '');
      if (this.currentTheme !== 'default') {
        container.classList.add(`theme-${this.currentTheme}`);
      }
    }
  }
  
  getThemeName(theme) {
    const names = {
      'default': 'Clássico',
      'sepia': 'Sépia',
      'dark': 'Noturno'
    };
    return names[theme] || 'Clássico';
  }
  
  /* =====================================
     🎯 IMMERSIVE READING MODE
     ===================================== */
  
  toggleImmersiveMode() {
    this.isImmersiveMode = !this.isImmersiveMode;
    const focusMode = document.getElementById('focusMode');
    
    if (this.isImmersiveMode) {
      document.body.classList.add('reading-mode');
      this.enterImmersiveMode();
      focusMode.classList.add('active');
    } else {
      document.body.classList.remove('reading-mode');
      focusMode.classList.remove('active');
    }
  }
  
  enterImmersiveMode() {
    const focusContent = document.getElementById('focusContent');
    const currentSegment = document.querySelector('.paragraph.current-segment');
    
    if (currentSegment && focusContent) {
      // Get surrounding context (current + next few paragraphs)
      const allParagraphs = Array.from(document.querySelectorAll('.paragraph'));
      const currentIndex = allParagraphs.indexOf(currentSegment);
      const contextParagraphs = allParagraphs.slice(currentIndex, currentIndex + 5);
      
      focusContent.innerHTML = contextParagraphs.map(p => `
        <div class="focus-paragraph ${p.classList.contains('current-segment') ? 'current' : ''}">
          ${p.innerHTML}
        </div>
      `).join('');
    }
  }
  
  /* =====================================
     💾 SETTINGS PERSISTENCE
     ===================================== */
  
  appleFontSize() {
    document.documentElement.style.setProperty('--book-font-size', this.fontSize + 'px');
  }
  
  changeFontSize(size) {
    this.fontSize = parseInt(size);
    localStorage.setItem('font-size', this.fontSize);
    this.appleFontSize();
  }
  
  exportSettings() {
    const settings = {
      bookmarks: this.bookmarks,
      notes: this.notes,
      theme: this.currentTheme,
      scrollSpeed: this.scrollSpeed,
      fontSize: this.fontSize
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'el-principito-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  importSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        
        if (settings.bookmarks) {
          this.bookmarks = settings.bookmarks;
          localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        }
        
        if (settings.notes) {
          this.notes = settings.notes;
          localStorage.setItem('notes', JSON.stringify(this.notes));
        }
        
        if (settings.theme) {
          this.changeTheme(settings.theme);
        }
        
        if (settings.scrollSpeed) {
          this.changeScrollSpeed(settings.scrollSpeed);
        }
        
        if (settings.fontSize) {
          this.changeFontSize(settings.fontSize);
        }
        
        this.updateBookmarkIndicators();
        this.renderNotes();
        this.showScrollStatus('⚙️ Configurações importadas!');
        
      } catch (error) {
        this.showScrollStatus('❌ Erro ao importar configurações');
      }
    };
    reader.readAsText(file);
  }
}

/* =====================================
   🚀 INITIALIZATION
   ===================================== */

// CSS Animations for status messages
const animationCSS = `
  @keyframes slideInOut {
    0% { transform: translateX(100%); opacity: 0; }
    20% { transform: translateX(0); opacity: 1; }
    80% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  
  .scroll-status-message {
    animation: slideInOut 2s ease-in-out forwards;
  }
  
  .note-item {
    background: white;
    padding: 15px;
    margin: 10px 0;
    border-radius: 8px;
    border-left: 4px solid #667eea;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .note-time {
    font-size: 12px;
    color: #666;
  }
  
  .delete-note {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 20px;
    height: 20px;
  }
  
  .note-text {
    margin: 8px 0;
    line-height: 1.5;
  }
  
  .note-actions {
    margin-top: 8px;
  }
  
  .jump-to-time {
    background: #667eea;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .no-notes {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
  }
  
  .speed-slider {
    width: 60px;
    margin-left: 5px;
  }
  
  .theme-select {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    margin-top: 5px;
  }
`;

// Add CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
let bookReader;

// Function to initialize the enhanced book reader
function initializeEnhancedBookReader() {
  if (!bookReader) {
    bookReader = new EnhancedBookReader();
    
    // Override the original highlightCurrentSegment if it exists
    if (window.app && typeof app.highlightCurrentSegment === 'function') {
      app.originalHighlightCurrentSegment = app.highlightCurrentSegment;
      app.highlightCurrentSegment = () => bookReader.highlightCurrentSegment();
    }
    
    // Export for global access
    window.bookReader = bookReader;
  }
  return bookReader;
}

// Try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeEnhancedBookReader, 1000);
  });
} else {
  // DOM is already loaded
  setTimeout(initializeEnhancedBookReader, 1000);
}

// Also try to initialize when the main app is ready
setTimeout(() => {
  if (window.app && !bookReader) {
    initializeEnhancedBookReader();
  }
}, 2000);
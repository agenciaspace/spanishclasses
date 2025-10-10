/* =====================================
   📚 WORD-BY-WORD KINDLE-STYLE READER
   ===================================== */

class WordByWordReader {
  constructor() {
    this.words = [];
    this.currentWordIndex = 0;
    this.wordsPerSecond = 3; // Velocidade padrão
    this.isPlaying = false;
    this.audio = null;
    this.segments = [];
    this.wordTimings = [];
    this.scrollPaused = false;
    this.chapters = [];
    this.syncActive = false;
    this.initialSeekTime = null; // Para guardar o tempo de seek inicial
    
    this.initializeReader();
  }

  addSyncIndicator() {
    if (!document.getElementById('syncIndicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'syncIndicator';
      indicator.className = 'sync-indicator';
      indicator.innerHTML = 'Sincronização Ativa';
      document.body.appendChild(indicator);
    }
  }

  updateSyncIndicator(active) {
    const indicator = document.getElementById('syncIndicator');
    if (indicator) {
      if (active) {
        indicator.classList.add('active');
        indicator.innerHTML = 'Sincronização Ativa';
      } else {
        indicator.classList.remove('active');
      }
    }
  }

  async initializeReader() {
    console.log('Initializing word-by-word reader...');
    // Aguardar a transcrição ser carregada
    await this.loadTranscription();
    this.setupAudioControls();
    this.bindEvents();
    this.loadLastPosition(); // Carregar última posição salva
    console.log('Reader initialization completed');
  }

  async loadTranscription() {
    try {
      const response = await fetch('/transcriptions/el-principito.json');
      if (response.ok) {
        const transcription = await response.json();
        this.segments = transcription.segments;
        this.processTextForWordByWord();
      } else {
        console.log('Transcription not ready yet');
        setTimeout(() => this.loadTranscription(), 5000);
      }
    } catch (error) {
      console.log('Waiting for transcription...', error);
      setTimeout(() => this.loadTranscription(), 5000);
    }
  }

  processTextForWordByWord() {
    const content = document.getElementById('bookContent');
    const bookPageContainer = content.querySelector('.book-page-container');
    
    if (!bookPageContainer) {
      console.error('Book page container not found');
      return;
    }

    // Adicionar indicador de sincronização
    this.addSyncIndicator();

    let html = '';
    let globalWordIndex = 0;

    this.words = [];
    this.wordTimings = [];

    this.segments.forEach((segment, segmentIndex) => {
      let text = segment.text.trim();
      
      // Chapter detection logic remains the same...
      const chapterRegex = /Cap[íi]tulo\s*(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciséis|diecisiete|dieciocho|diecinueve|veinte|veintiuno)|(?:^|\.\s+)\d+\.\s+/gi;
      const chapterMatches = text.match(chapterRegex);
      
      if (chapterMatches) {
        chapterMatches.forEach(match => {
          let chapterNum = 0;
          const chapterTitle = match.trim().replace(/\.$/, '');
          const spanishNumbers = {
            'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
            'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
            'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
            'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
            'veinte': 20, 'veintiuno': 21
          };
          const numMatch = chapterTitle.match(/(\d+)/);
          const wordMatch = chapterTitle.toLowerCase().match(/uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciséis|diecisiete|dieciocho|diecinueve|veinte|veintiuno/);
          
          if (numMatch) {
            chapterNum = parseInt(numMatch[1]);
          } else if (wordMatch) {
            chapterNum = spanishNumbers[wordMatch[0]];
          } else if (match.match(/^\d+\.?$/)) {
            chapterNum = parseInt(match);
          }
          
          const toRoman = (num) => {
            const romanNumerals = [
              ['XXI', 21], ['XX', 20], ['XIX', 19], ['XVIII', 18], ['XVII', 17],
              ['XVI', 16], ['XV', 15], ['XIV', 14], ['XIII', 13], ['XII', 12],
              ['XI', 11], ['X', 10], ['IX', 9], ['VIII', 8], ['VII', 7],
              ['VI', 6], ['V', 5], ['IV', 4], ['III', 3], ['II', 2], ['I', 1]
            ];
            for (const [roman, value] of romanNumerals) {
              if (num >= value) return roman;
            }
            return 'I';
          };
          
          const romanNum = toRoman(chapterNum);
          const standardizedTitle = `Capítulo ${romanNum}`;
          
          this.chapters.push({
            title: standardizedTitle,
            start: segment.start,
            wordIndex: globalWordIndex,
            segmentIndex: segmentIndex
          });
          
          html += `<div class="chapter-marker">
            <div class="chapter-ornament">✦</div>
            <div class="chapter-title">${standardizedTitle}</div>
            <div class="chapter-ornament">✦</div>
          </div>`;
        });
        
        text = text.replace(chapterRegex, ' ');
      }

      const words = this.extractWords(text);
      const segmentDuration = segment.end - segment.start;
      const wordsInSegment = words.length;
      
      if (wordsInSegment > 0) {
        html += '<p class="text-paragraph">';
        
        words.forEach((word, wordIndex) => {
          const wordStartTime = segment.start + (wordIndex / wordsInSegment) * segmentDuration;
          const wordEndTime = segment.start + ((wordIndex + 1) / wordsInSegment) * segmentDuration;
          
          const wordId = `word-${globalWordIndex}`;
          html += `<span class="word" 
                     id="${wordId}" 
                     data-start="${wordStartTime}" 
                     data-end="${wordEndTime}"
                     data-index="${globalWordIndex}">${word}</span> `;
          
          this.words.push({
            text: word,
            start: wordStartTime,
            end: wordEndTime,
            index: globalWordIndex,
            segmentIndex: segmentIndex
          });

          globalWordIndex++;
        });
        
        html += '</p>';
      }
    });

    bookPageContainer.innerHTML = html;

    this.createChapterMenu();
  }

  extractWords(text) {
    // Limpar texto e dividir em palavras, preservando pontuação
    return text
      .replace(/^\s*/, '') // Remover espaços iniciais
      .split(/(\s+)/) // Dividir mantendo espaços
      .filter(word => word.trim().length > 0) // Remover strings vazias
      .map(word => word.trim()); // Limpar espaços
  }

  setupAudioControls() {
    console.log('Setting up audio controls...');
    this.audio = document.getElementById('audioPlayer');
    
    if (!this.audio) {
      console.log('Audio element not found, retrying in 1 second...');
      // Tentar novamente após um delay caso o header ainda não esteja visível
      setTimeout(() => {
        this.setupAudioControls();
      }, 1000);
      return;
    }
    
    console.log('Audio element found:', this.audio);
    
    if (this.audio) {
      // Event listener para pular para o tempo certo quando o áudio carregar
      this.audio.addEventListener('loadedmetadata', () => {
        console.log('Audio loaded, duration:', Math.round(this.audio.duration / 60), 'minutes');
        if (this.initialSeekTime) {
          console.log(`Seeking to initial time: ${this.initialSeekTime}s`);
          this.audio.currentTime = this.initialSeekTime;
          this.initialSeekTime = null; // Usar apenas uma vez
        }
      });
      
      this.audio.addEventListener('error', (e) => {
        console.error('Audio error:', e, this.audio.error);
      });
      
      // Sincronização mais precisa com throttling
      let lastUpdateTime = 0;
      this.audio.addEventListener('timeupdate', () => {
        const now = Date.now();
        // Atualizar no máximo 10 vezes por segundo para melhor performance
        if (now - lastUpdateTime > 100) {
          this.updateCurrentWord();
          this.updateCurrentChapter();
          lastUpdateTime = now;
        }
      });

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.syncActive = true;
        this.updateSyncIndicator(true);
        console.log('✅ Sincronização ativada');
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.syncActive = false;
        this.updateSyncIndicator(false);
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.resetHighlighting();
      });
      
      // Adicionar listeners para debug
      this.audio.addEventListener('loadeddata', () => {
        console.log('✅ Audio data loaded - ready to play');
      });
      
      this.audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio can play through without buffering');
      });
      
      console.log('Audio controls setup completed successfully');
    }
  }
  
  testAudioPlayback() {
    console.log('Testing audio playback...');
    console.log('Audio src:', this.audio.src);
    console.log('Audio readyState:', this.audio.readyState);
    console.log('Audio networkState:', this.audio.networkState);
    console.log('Audio paused:', this.audio.paused);
    console.log('Audio currentTime:', this.audio.currentTime);
    console.log('Audio duration:', this.audio.duration);
    
    // Try to play programmatically
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('✅ Audio can play successfully');
        // Pause immediately after testing
        this.audio.pause();
        this.audio.currentTime = 0;
      }).catch(error => {
        console.error('❌ Audio play failed:', error);
      });
    }
  }

  updateCurrentWord() {
    if (!this.audio || this.words.length === 0) return;

    const currentTime = this.audio.currentTime;
    
    // Encontrar palavra atual baseada no tempo com melhor precisão
    let targetWordIndex = -1;
    let closestWordIndex = -1;
    let minTimeDiff = Infinity;
    
    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];
      
      // Palavra exata para o tempo atual
      if (currentTime >= word.start && currentTime <= word.end) {
        targetWordIndex = i;
        break;
      }
      
      // Encontrar palavra mais próxima como backup
      const timeDiff = Math.abs(currentTime - word.start);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestWordIndex = i;
      }
    }

    // Se não encontrou palavra exata, usar a mais próxima
    if (targetWordIndex === -1 && closestWordIndex !== -1) {
      // Só usar a palavra mais próxima se estiver dentro de 2 segundos
      if (minTimeDiff < 2) {
        targetWordIndex = closestWordIndex;
      }
    }

    // Atualizar highlight se mudou de palavra
    if (targetWordIndex !== -1 && targetWordIndex !== this.currentWordIndex) {
      this.highlightWord(targetWordIndex, false);
      this.updateCurrentChapter();
    }
  }

  highlightWord(wordIndex, isManualSelection) {
    // Remover highlight anterior
    document.querySelectorAll('.word.current, .word.highlight').forEach(word => {
      word.classList.remove('current', 'highlight');
    });

    const currentWordElement = document.getElementById(`word-${wordIndex}`);
    if (currentWordElement) {
      // Se for seleção manual (clique) ou ao carregar a página, usar a classe 'highlight'
      // Se for durante a reprodução do áudio, usar a classe 'current'
      const className = (isManualSelection || !this.isPlaying) ? 'highlight' : 'current';
      currentWordElement.classList.add(className);

      if (this.isPlaying && !this.scrollPaused) {
        this.smartScrollToWord(currentWordElement);
      }
      
      // Marcar parágrafo atual
      document.querySelectorAll('.text-paragraph.current-paragraph').forEach(p => {
        p.classList.remove('current-paragraph');
      });
      const currentParagraph = currentWordElement.closest('.text-paragraph');
      if (currentParagraph) {
        currentParagraph.classList.add('current-paragraph');
      }
    }

    this.currentWordIndex = wordIndex;
  }

  scrollToWord(wordElement) {
    // Scroll contínuo sem limitação de páginas
    const rect = wordElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const headerHeight = 80;
    
    // Se a palavra estiver fora da área visível, fazer scroll suave
    if (rect.top < headerHeight + 50 || rect.bottom > windowHeight - 100) {
      // Posicionar palavra no terço superior da tela
      const targetPosition = windowHeight * 0.3;
      const currentScroll = window.pageYOffset;
      const elementTop = rect.top + currentScroll;
      const newScroll = elementTop - targetPosition;
      
      window.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  }

  smartScrollToWord(wordElement) {
    const rect = wordElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const headerHeight = 80; // Altura aproximada do header
    const margin = 100; // Margem de segurança
    
    // Calcular posição ideal (1/3 da tela)
    const idealPosition = windowHeight * 0.33;
    
    // Só fazer scroll se a palavra estiver fora da zona de leitura confortável
    if (rect.top < headerHeight + margin || rect.top > windowHeight - margin * 2) {
      // Calcular o offset para centralizar a palavra na posição ideal
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + currentScroll;
      const targetScroll = elementTop - idealPosition;
      
      // Scroll suave com controle de velocidade
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
    
    // Verificar se chegou ao final do documento e continuar scrolling
    const documentHeight = document.documentElement.scrollHeight;
    const scrollBottom = window.pageYOffset + windowHeight;
    
    // Se estiver próximo ao final (90% do documento), continuar scrolling automático
    if (scrollBottom > documentHeight * 0.9 && this.isPlaying) {
      // Adicionar mais conteúdo ou continuar com scroll suave
      const nextParagraph = wordElement.closest('.text-paragraph').nextElementSibling;
      if (nextParagraph) {
        nextParagraph.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  setupPageNavigation() {
    this.currentSpread = 1;
    this.totalSpreads = document.querySelectorAll('.book-spread').length;
    
    // Mostrar apenas o primeiro spread
    this.showSpread(1);
    
    // Adicionar botões de navegação se não existirem
    this.createNavigationButtons();
  }

  createNavigationButtons() {
    const existingNav = document.querySelector('.page-navigation');
    if (existingNav) return;
    
    const navHTML = `
      <div class="page-navigation">
        <button id="prevSpread" onclick="wordReader.previousSpread()" disabled>◀ Anterior</button>
        <span id="spreadIndicator">Páginas 1-2 de ${this.totalSpreads * 2}</span>
        <button id="nextSpread" onclick="wordReader.nextSpread()">Próximo ▶</button>
      </div>
    `;
    
    const bookContainer = document.querySelector('.book-page-container');
    if (bookContainer) {
      bookContainer.insertAdjacentHTML('afterend', navHTML);
    }
  }

  getCurrentSpread() {
    return this.currentSpread;
  }

  isWordOnCurrentSpread(wordPage) {
    const spreadStart = (this.currentSpread - 1) * 2 + 1;
    const spreadEnd = this.currentSpread * 2;
    return wordPage >= spreadStart && wordPage <= spreadEnd;
  }

  goToSpreadWithPage(pageNumber) {
    const targetSpread = Math.ceil(pageNumber / 2);
    this.showSpread(targetSpread);
  }

  showSpread(spreadNumber) {
    // Ocultar todos os spreads
    document.querySelectorAll('.book-spread').forEach(spread => {
      spread.style.display = 'none';
      spread.classList.remove('current');
    });
    
    // Mostrar spread atual
    const targetSpread = document.querySelector(`[data-spread="${spreadNumber}"]`);
    if (targetSpread) {
      targetSpread.style.display = 'flex';
      targetSpread.classList.add('current');
      this.currentSpread = spreadNumber;
      this.updateNavigationButtons();
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevSpread');
    const nextBtn = document.getElementById('nextSpread');
    const indicator = document.getElementById('spreadIndicator');
    
    if (prevBtn) prevBtn.disabled = (this.currentSpread <= 1);
    if (nextBtn) nextBtn.disabled = (this.currentSpread >= this.totalSpreads);
    
    if (indicator) {
      const startPage = (this.currentSpread - 1) * 2 + 1;
      const endPage = Math.min(this.currentSpread * 2, this.getTotalPages());
      indicator.textContent = `Páginas ${startPage}-${endPage} de ${this.getTotalPages()}`;
    }
  }

  previousSpread() {
    if (this.currentSpread > 1) {
      this.showSpread(this.currentSpread - 1);
    }
  }

  nextSpread() {
    if (this.currentSpread < this.totalSpreads) {
      this.showSpread(this.currentSpread + 1);
    }
  }

  getTotalPages() {
    const pages = document.querySelectorAll('.book-page:not(.empty-page)');
    return pages.length;
  }

  jumpToWord(wordIndex) {
    if (wordIndex >= 0 && wordIndex < this.words.length) {
      const word = this.words[wordIndex];
      if (this.audio) {
        // Se o áudio já estiver carregado, pule para o tempo. Senão, guarde para mais tarde.
        if (this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
          this.audio.currentTime = word.start;
        } else {
          this.initialSeekTime = word.start;
        }
        this.highlightWord(wordIndex, true);
      }
    }
  }

  jumpToTime(time) {
    if (this.audio) {
      this.audio.currentTime = time;
      if (this.audio.paused) {
        this.audio.play();
      }
    }
  }

  toggleScrollPause() {
    this.scrollPaused = !this.scrollPaused;
    return this.scrollPaused;
  }

  resetHighlighting() {
    // Remover todos os highlights
    document.querySelectorAll('.word.current, .word.read').forEach(word => {
      word.classList.remove('current', 'read');
    });
    this.currentWordIndex = 0;
  }

  bindEvents() {
    // Adicionar controles de teclado
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key.toLowerCase()) {
        case 'arrowleft':
          e.preventDefault();
          this.jumpToPreviousWord();
          break;
        case 'arrowright':
          e.preventDefault();
          this.jumpToNextWord();
          break;
        case 'space':
          e.preventDefault();
          this.toggleAudio();
          break;
        case 's':
          e.preventDefault();
          this.toggleScrollPause();
          this.showScrollStatus(this.scrollPaused ? 'Scroll pausado' : 'Scroll ativado');
          break;
      }
    });

    // Event listener para cliques nas palavras
    const bookPageContainer = document.querySelector('.book-page-container');
    if (bookPageContainer) {
      bookPageContainer.addEventListener('click', (event) => {
        const wordElement = event.target.closest('.word');
        if (wordElement && wordElement.id) {
          const wordIndex = parseInt(wordElement.dataset.index);
          if (!isNaN(wordIndex)) {
            this.jumpToWord(wordIndex);
            this.savePosition(wordElement.id);
          }
        }
      });
    }
  }

  savePosition(wordId) {
    if (wordId) {
      localStorage.setItem('lastReadWordId', wordId);
      console.log(`Posição salva: ${wordId}`);
    }
  }

  loadLastPosition() {
    const lastReadWordId = localStorage.getItem('lastReadWordId');
    if (lastReadWordId) {
      console.log(`Carregando última posição: ${lastReadWordId}`);
      const lastWordElement = document.getElementById(lastReadWordId);
      if (lastWordElement) {
        const wordIndex = parseInt(lastWordElement.dataset.index);
        if (!isNaN(wordIndex)) {
          // Chamar jumpToWord para preparar o tempo do áudio e destacar
          this.jumpToWord(wordIndex);
          // Rolar para a palavra de forma suave
          lastWordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  jumpToPreviousWord() {
    if (this.currentWordIndex > 0) {
      this.jumpToWord(this.currentWordIndex - 1);
    }
  }

  jumpToNextWord() {
    if (this.currentWordIndex < this.words.length - 1) {
      this.jumpToWord(this.currentWordIndex + 1);
    }
  }

  toggleAudio() {
    if (this.audio) {
      if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    }
  }

  showScrollStatus(message) {
    // Criar mensagem de status temporária
    const statusDiv = document.createElement('div');
    statusDiv.className = 'scroll-status-message';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(59, 130, 246, 0.9);
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

  // Métodos para integração com controles existentes
  adjustSync(seconds) {
    // Implementar ajuste de sincronização se necessário
    if (this.audio) {
      this.audio.currentTime += seconds;
    }
  }

  getCurrentProgress() {
    if (this.words.length === 0) return 0;
    return (this.currentWordIndex / this.words.length) * 100;
  }

  getReadingStats() {
    return {
      totalWords: this.words.length,
      currentWord: this.currentWordIndex + 1,
      progress: this.getCurrentProgress(),
      wordsPerMinute: this.calculateWPM()
    };
  }

  calculateWPM() {
    if (!this.audio || this.audio.currentTime === 0) return 0;
    const minutesElapsed = this.audio.currentTime / 60;
    return Math.round((this.currentWordIndex + 1) / minutesElapsed);
  }

  createChapterMenu() {
    console.log('Creating floating chapter menu');
    this.createFloatingChapterMenu();
  }

  createFloatingChapterMenu() {
    // Aguardar um pouco para garantir que os capítulos foram processados
    setTimeout(() => {
      console.log(`Attempting to create floating menu with ${this.chapters.length} chapters`);
      console.log('Chapters detected:', this.chapters.map(c => c.title));
      
      const chapterCount = document.querySelector('.chapter-count');
      const chapterContainer = document.getElementById('floatingChapterList');
      
      if (!chapterCount || !chapterContainer) {
        console.log('Floating menu elements not found');
        return;
      }
      
      if (this.chapters.length === 0) {
        chapterCount.textContent = 'Nenhum capítulo detectado';
        chapterContainer.innerHTML = '<div class="loading-chapters">Nenhum capítulo encontrado</div>';
        return;
      }
      
      // Update chapter count
      chapterCount.textContent = `${this.chapters.length} capítulos`;
      
      // Create chapter list
      const chapterListHTML = this.chapters.map((chapter, index) => `
        <div class="floating-chapter-item">
          <a href="#" class="floating-chapter-link" onclick="jumpToChapter(${index}); closeFloatingMenu();" data-chapter="${index}">
            <span class="floating-chapter-number">${index + 1}</span>
            <span class="floating-chapter-title">${chapter.title}</span>
          </a>
        </div>
      `).join('');
      
      chapterContainer.innerHTML = chapterListHTML;
      console.log('Floating chapter menu populated');
      
      // Mostrar navegação de páginas após carregar conteúdo
      const pageNav = document.querySelector('.page-navigation');
      if (pageNav) {
        pageNav.style.display = 'flex';
      }
    }, 100);
  }

  recreateChapterMenu() {
    // For floating menu, just recreate the content
    console.log('Recreating floating chapter menu');
    this.createFloatingChapterMenu();
  }

  jumpToChapter(chapterIndex) {
    if (chapterIndex >= 0 && chapterIndex < this.chapters.length) {
      const chapter = this.chapters[chapterIndex];
      console.log(`Jumping to chapter ${chapterIndex + 1}: ${chapter.title} at time ${chapter.start}s`);
      
      if (this.audio) {
        this.audio.currentTime = chapter.start;
        
        // Forçar o start do áudio se não estiver tocando
        if (this.audio.paused) {
          this.audio.play().catch(e => console.log('Auto-play prevented:', e));
        }
        
        // Atualizar highlight depois de um pequeno delay
        setTimeout(() => {
          this.highlightWord(chapter.wordIndex);
          this.updateCurrentChapter();
        }, 100);
      } else {
        console.log('Audio not available for chapter jump');
      }
      closeFloatingMenu();
    } else {
      console.log('Invalid chapter index:', chapterIndex);
    }
  }

  updateCurrentChapter() {
    if (!this.audio || this.chapters.length === 0) return;
    
    const currentTime = this.audio.currentTime;
    let currentChapter = 0;
    
    for (let i = 0; i < this.chapters.length; i++) {
      if (currentTime >= this.chapters[i].start) {
        currentChapter = i;
      } else {
        break;
      }
    }
    
    // Atualizar indicador visual no menu
    document.querySelectorAll('.chapter-link').forEach(link => {
      link.classList.remove('current');
    });
    
    const currentLink = document.querySelector(`[data-chapter="${currentChapter}"]`);
    if (currentLink) {
      currentLink.classList.add('current');
    }

    // Atualizar display no header
    const headerDisplay = document.getElementById('currentChapterDisplay');
    if (headerDisplay && this.chapters[currentChapter]) {
      headerDisplay.textContent = `Cap. ${currentChapter + 1}: ${this.chapters[currentChapter].title}`;
    }
  }
}

/* =====================================
   🎨 ENHANCED UI INTEGRATION
   ===================================== */

// Controles simplificados - sem logs de debug
function updateReadingStats() {
  // Removido logging para experiência limpa
  return;
}

// Função para toggle de scroll pause
function toggleWordScrollPause() {
  if (window.wordReader) {
    const isPaused = wordReader.toggleScrollPause();
    const button = document.getElementById('scrollToggle');
    const icon = button.querySelector('.scroll-icon');
    const text = button.querySelector('.scroll-text');
    
    if (isPaused) {
      button.classList.add('paused');
      icon.textContent = '▶️';
      text.textContent = 'Retomar Scroll';
    } else {
      button.classList.remove('paused');
      icon.textContent = '⏸️';
      text.textContent = 'Pausar Scroll';
    }
  }
}

// Atualizar estatísticas de leitura
function updateReadingStats() {
  if (window.wordReader) {
    const stats = wordReader.getReadingStats();
    
    const currentWordNum = document.getElementById('currentWordNum');
    const totalWords = document.getElementById('totalWords');
    const readingProgress = document.getElementById('readingProgress');
    const wpmCounter = document.getElementById('wpmCounter');
    
    if (currentWordNum) currentWordNum.textContent = stats.currentWord;
    if (totalWords) totalWords.textContent = stats.totalWords;
    if (readingProgress) readingProgress.textContent = stats.progress.toFixed(1) + '%';
    if (wpmCounter) wpmCounter.textContent = stats.wordsPerMinute;
  }
}

/* =====================================
   🚀 INITIALIZATION
   ===================================== */

// CSS adicional para os novos controles
const wordReaderCSS = `
  .reading-stats {
    background: rgba(59, 130, 246, 0.1);
    padding: 10px 15px;
    border-radius: 8px;
    margin-top: 10px;
    font-size: 14px;
  }
  
  .stats-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .stat-item {
    color: #1e40af;
    font-weight: 500;
  }
  
  .word-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 15px;
    background: rgba(255,255,255,0.5);
    border-radius: 10px;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  
  .word-nav {
    display: flex;
    gap: 8px;
  }
  
  .nav-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .nav-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    .stats-row {
      flex-direction: column;
      text-align: center;
    }
    
    .word-nav {
      flex-direction: column;
      width: 100%;
    }
    
    .nav-btn {
      width: 100%;
    }
  }
`;

// Adicionar CSS ao documento
const wordReaderStyleSheet = document.createElement('style');
wordReaderStyleSheet.textContent = wordReaderCSS;
document.head.appendChild(wordReaderStyleSheet);

// Inicializar o leitor palavra por palavra
let wordReader;

function initializeWordByWordReader() {
  if (!wordReader) {
    console.log('📚 Initializing Word-by-Word Reader...');
    wordReader = new WordByWordReader();
    
    // Adicionar função para testar sincronização
    window.testSync = function() {
      if (wordReader && wordReader.audio) {
        console.log('🎵 Testing synchronization...');
        console.log('Current time:', wordReader.audio.currentTime);
        console.log('Current word index:', wordReader.currentWordIndex);
        console.log('Total words:', wordReader.words.length);
        
        // Forçar atualização
        wordReader.updateCurrentWord();
        
        const currentWord = document.querySelector('.word.current');
        if (currentWord) {
          console.log('✅ Current word highlighted:', currentWord.textContent);
        } else {
          console.log('⚠️ No word currently highlighted');
        }
      } else {
        console.log('❌ Reader not initialized');
      }
    };
    
    // Adicionar listener para garantir sincronização quando áudio carrega
    const checkAudioReady = setInterval(() => {
      const audio = document.getElementById('audioPlayer');
      if (audio && audio.readyState >= 2) {
        clearInterval(checkAudioReady);
        console.log('✅ Audio ready, sync enabled');
        
        // Garantir que o evento timeupdate está funcionando
        if (!audio.ontimeupdate) {
          let lastUpdateTime = 0;
          audio.addEventListener('timeupdate', () => {
            const now = Date.now();
            if (now - lastUpdateTime > 100) {
              wordReader.updateCurrentWord();
              wordReader.updateCurrentChapter();
              lastUpdateTime = now;
            }
          });
        }
      }
    }, 500);
  }
  
  // Disponibilizar globalmente
  window.wordReader = wordReader;
  return wordReader;
}

// Function to test audio manually from console
window.testAudio = function() {
  const audio = document.getElementById('audioPlayer');
  if (!audio) {
    console.error('❌ Audio element not found');
    return;
  }
  
  console.log('🔍 Testing audio playback...');
  console.log('📊 Audio state:', {
    src: audio.src,
    readyState: audio.readyState,
    duration: audio.duration,
    paused: audio.paused,
    currentTime: audio.currentTime
  });
  
  console.log('🎵 Attempting to play...');
  audio.play()
    .then(() => console.log('✅ SUCCESS: Audio is playing!'))
    .catch(error => console.error('❌ FAILED:', error.message));
};

// Simple play function
window.playAudio = function() {
  const audio = document.getElementById('audioPlayer');
  if (audio) {
    audio.play();
    console.log('Play command sent');
  } else {
    console.error('Audio not found');
  }
};

// Funções globais para o menu
function toggleChapterMenu() {
  console.log('toggleChapterMenu called');
  const menu = document.getElementById('chapterMenu');
  const overlay = document.getElementById('menuOverlay');
  
  console.log('Menu element:', menu);
  console.log('Overlay element:', overlay);
  
  if (menu && overlay) {
    const isOpen = menu.classList.contains('open');
    console.log('Menu is currently open:', isOpen);
    
    menu.classList.toggle('open');
    overlay.classList.toggle('open');
    
    console.log('Menu toggled, now open:', menu.classList.contains('open'));
  } else {
    console.error('Menu or overlay not found');
    // Try to recreate the menu if it doesn't exist
    if (window.wordReader && window.wordReader.chapters.length > 0) {
      console.log('Attempting to recreate menu...');
      window.wordReader.recreateChapterMenu();
    }
  }
}

function closeChapterMenu() {
  const menu = document.getElementById('chapterMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (menu && overlay) {
    menu.classList.remove('open');
    overlay.classList.remove('open');
  }
}


// Funções globais para o floating menu
function toggleFloatingMenu() {
  console.log('toggleFloatingMenu called');
  const overlay = document.getElementById('floatingMenuOverlay');
  
  if (!overlay) {
    console.log('Floating menu overlay not found');
    return;
  }
  
  const isVisible = overlay.classList.contains('show');
  
  if (isVisible) {
    closeFloatingMenu();
  } else {
    showFloatingMenu();
  }
}

function showFloatingMenu() {
  console.log('Showing floating menu');
  const overlay = document.getElementById('floatingMenuOverlay');
  
  if (overlay) {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeFloatingMenu() {
  console.log('Closing floating menu');
  const overlay = document.getElementById('floatingMenuOverlay');
  
  if (overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Global function to jump to chapter
function jumpToChapter(chapterIndex) {
  console.log(`Jumping to chapter ${chapterIndex}`);
  if (window.wordReader) {
    window.wordReader.jumpToChapter(chapterIndex);
  } else {
    console.log('WordReader not available');
  }
}

// Attach functions to window object for global access
window.toggleFloatingMenu = toggleFloatingMenu;
window.showFloatingMenu = showFloatingMenu;
window.closeFloatingMenu = closeFloatingMenu;
window.jumpToChapter = jumpToChapter;
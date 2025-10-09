# Audiobooks - Biblioteca Interactiva

Uma aplicação web minimalista para audiolivros com sincronização palavra por palavra e interface escura elegante.

## ✨ Características

- **Interface Minimalista**: Design escuro e limpo inspirado em Apple/Netflix
- **Sincronização Palavra por Palavra**: Acompanhe o áudio com destaque de texto em tempo real
- **Navegação por Capítulos**: Sistema inteligente de detecção e navegação de capítulos
- **Tradução Interativa**: Clique em palavras para ver traduções instantâneas
- **Upload de Audiolivros**: Interface drag-and-drop para adicionar novos livros
- **Responsivo**: Otimizado para desktop e mobile

## 🎨 Design System

### Cores
- **Background Principal**: `#000` (preto puro)
- **Texto Primário**: `rgba(255,255,255,0.9)` (branco com 90% opacidade)
- **Texto Secundário**: `rgba(255,255,255,0.5)` (branco com 50% opacidade)
- **Elementos Interativos**: `rgba(255,255,255,0.1)` com bordas `rgba(255,255,255,0.2)`
- **Hover Estados**: `rgba(255,255,255,0.15)` com bordas `rgba(255,255,255,0.4)`

### Tipografia
- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Título Principal**: `2.5rem`, peso `200`, `letter-spacing: -1px`
- **Texto Corpo**: `1.125rem`, `line-height: 1.8`
- **Elementos UI**: `0.9rem` para controles

### Efeitos
- **Backdrop Filter**: `blur(20px)` para elementos flutuantes
- **Border Radius**: `12px` para containers, `6px` para botões
- **Transições**: `all 0.3s` para hover states
- **Animações**: `fadeInUp` para entrada de elementos

## 📁 Estrutura do Projeto

```
spanishclasses/
├── public/
│   ├── index.html          # Página principal da biblioteca
│   ├── book.html           # Interface de leitura
│   ├── upload.html         # Upload de audiolivros
│   ├── book-styles.css     # Estilos do leitor
│   ├── word-by-word-reader.js  # Engine de sincronização
│   ├── book-interactions.js    # Interações do leitor
│   └── audio/
│       └── el-principito.mp3
├── transcriptions/         # Arquivos JSON do Whisper
└── scripts/               # Scripts de processamento
```

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
npm start
```

### 2. Acessar a Aplicação
- **Biblioteca**: `http://localhost:3000/`
- **Upload**: `http://localhost:3000/upload.html`
- **Leitor**: `http://localhost:3000/book.html`

### 3. Navegar pelo Livro
- **Reprodução**: Use o player de áudio no topo
- **Capítulos**: Clique no botão 📖 para abrir o menu de capítulos
- **Palavras**: Clique em qualquer palavra para tradução
- **Páginas**: Use os botões de navegação no canto inferior direito

## 🔧 Funcionalidades Técnicas

### Sincronização de Áudio
- Utiliza transcrições JSON geradas pelo Whisper AI
- Detecção automática de capítulos em espanhol (uno, dos, tres...)
- Conversão para numeração romana (I, II, III...)
- Highlight em tempo real da palavra sendo reproduzida

### Sistema de Capítulos
```javascript
// Detecção de capítulos com regex
const chapterRegex = /Cap[íi]tulo\s*(\d+|uno|dos|tres|cuatro|cinco|...)/gi

// Conversão para romano
function toRoman(num) {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', ...];
  return romanNumerals[num - 1] || num.toString();
}
```

### Navegação por Spreads
- Sistema de paginação inteligente
- Controles de página anterior/próxima
- Indicador de posição atual

## 📱 Interface Responsiva

### Desktop
- Header fixo com backdrop-filter
- Layout centrado com max-width: 900px
- Controles flutuantes com hover effects

### Mobile
- Header colapsível em modo de leitura limpa
- Layout de coluna única
- Controles otimizados para touch

## 🎯 Modo de Leitura Limpa

```css
body.reading-mode .book-header {
  transform: translateY(-100%);
}

body.reading-mode .page-navigation {
  transform: translateY(100px);
}
```

- Header e controles se escondem automaticamente
- Reaparecem no hover para experiência imersiva
- Áreas de hover invisíveis para fácil acesso

## 🔄 Upload de Audiolivros

### Formatos Suportados
- **MP3**: Formato principal
- **M4A**: Apple Audio
- **WAV**: Audio não comprimido
- **Limite**: 500MB por arquivo

### Processo
1. Drag & drop ou seleção de arquivos
2. Validação de formato e tamanho
3. Simulação de upload com barra de progresso
4. Processamento via Whisper AI (simulado)
5. Adição automática à biblioteca

## 🌐 Internacionalização

### Idiomas
- **Português**: Interface padrão
- **Espanhol**: Conteúdo dos audiolivros
- **Detecção**: Automática via Whisper

### Elementos Traduzíveis
- Títulos de capítulos
- Estados de upload
- Mensagens do sistema
- Tooltips e labels

## 🎨 Customização

### Cores do Tema
Edite as variáveis CSS para personalizar:

```css
:root {
  --bg-primary: #000;
  --text-primary: rgba(255,255,255,0.9);
  --text-secondary: rgba(255,255,255,0.5);
  --border-subtle: rgba(255,255,255,0.1);
  --hover-bg: rgba(255,255,255,0.1);
}
```

### Componentes Reutilizáveis
- `.btn`: Botões padrão
- `.floating-menu`: Menus modais
- `.book-page-container`: Container de conteúdo
- `.chapter-marker`: Marcadores de capítulo

## 📊 Performance

### Otimizações
- CSS inline para carregamento rápido
- Lazy loading de áudio
- Throttling em scroll/resize events
- Animações GPU-aceleradas

### Métricas
- **First Paint**: <1s
- **Interactive**: <2s
- **Bundle Size**: Mínimo (sem frameworks)

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Suporte a múltiplos idiomas
- [ ] Bookmarks e notas
- [ ] Velocidade de reprodução variável
- [ ] Tema claro opcional
- [ ] API para biblioteca externa
- [ ] Download offline

### Melhorias Técnicas
- [ ] Service Worker para cache
- [ ] Progressive Web App
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 📄 Licença

Este projeto é de uso educacional e demonstrativo.

---

**Desenvolvido com ❤️ para uma experiência de leitura imersiva e minimalista.**
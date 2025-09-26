const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/transcriptions', express.static('transcriptions'));

// API para listar livros disponíveis
app.get('/api/books', (req, res) => {
  try {
    const audioDir = path.join(__dirname, 'public', 'audio');
    const audioFiles = fs.readdirSync(audioDir)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.m4a'))
      .map(file => {
        const stats = fs.statSync(path.join(audioDir, file));
        const fileNameWithoutExt = path.parse(file).name;
        
        // Mapear informações específicas dos livros
        const bookInfo = getBookInfo(fileNameWithoutExt);
        
        return {
          id: fileNameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: bookInfo.title,
          author: bookInfo.author,
          audioFile: file,
          duration: bookInfo.duration,
          chapters: bookInfo.chapters,
          language: bookInfo.language,
          narrator: bookInfo.narrator,
          description: bookInfo.description,
          fileSize: Math.round(stats.size / (1024 * 1024)) + ' MB'
        };
      });
    
    res.json(audioFiles);
  } catch (error) {
    console.error('Error listing books:', error);
    res.status(500).json({ error: 'Failed to list books' });
  }
});

function getBookInfo(fileName) {
  const bookDatabase = {
    'el-principito': {
      title: 'El Principito',
      author: 'Antoine de Saint-Exupéry',
      duration: '01:42:30',
      chapters: 27,
      language: 'Español',
      narrator: 'Adolfo Ruiz',
      description: 'Un clásico universal sobre la amistad, el amor y la búsqueda del sentido de la vida.'
    }
  };
  
  return bookDatabase[fileName] || {
    title: fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    author: 'Autor Desconocido',
    duration: 'N/A',
    chapters: 'N/A',
    language: 'Español',
    narrator: 'N/A',
    description: 'Audiolivro em espanhol com tradução interativa.'
  };
}

app.post('/translate', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('Translating text:', text);
    
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: process.env.DEEPL_API_KEY,
        text,
        target_lang: 'EN'
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('Translation response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Translation failed', details: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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
    
    // Check if DeepL API key is available and valid
    if (!process.env.DEEPL_API_KEY || process.env.DEEPL_API_KEY === 'test_key') {
      // Fallback to simple dictionary-based translation
      const translation = await fallbackTranslation(text);
      return res.json({
        translations: [{ text: translation }]
      });
    }
    
    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        {
          text: [text], // O texto deve ser um array
          target_lang: 'PT-BR'
        },
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      console.log('DeepL translation successful');
      res.json(response.data);
    } catch (deeplError) {
      console.log('DeepL API failed, using fallback translation');
      // Log detalhado do erro
      if (deeplError.response) {
        console.error('DeepL Error Details:', deeplError.response.data);
      } else {
        console.error('DeepL Error Details:', deeplError.message);
      }
      const translation = await fallbackTranslation(text);
      res.json({
        translations: [{ text: translation }]
      });
    }
    
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

// Fallback translation function with common Spanish-English words
async function fallbackTranslation(text) {
  const commonTranslations = {
    // Basic words
    'hola': 'hello',
    'adiós': 'goodbye',
    'gracias': 'thank you',
    'por favor': 'please',
    'sí': 'yes',
    'no': 'no',
    'casa': 'house',
    'niño': 'child',
    'niña': 'girl',
    'hombre': 'man',
    'mujer': 'woman',
    'agua': 'water',
    'comida': 'food',
    'libro': 'book',
    'tiempo': 'time',
    'día': 'day',
    'noche': 'night',
    'sol': 'sun',
    'luna': 'moon',
    'estrella': 'star',
    'amor': 'love',
    'amigo': 'friend',
    'familia': 'family',
    'vida': 'life',
    'mundo': 'world',
    'tierra': 'earth',
    'cielo': 'sky',
    'mar': 'sea',
    'montaña': 'mountain',
    'ciudad': 'city',
    'pueblo': 'town',
    'corazón': 'heart',
    'alma': 'soul',
    'mente': 'mind',
    'ojos': 'eyes',
    'manos': 'hands',
    'cabeza': 'head',
    'cuerpo': 'body',
    
    // El Principito specific words
    'principito': 'little prince',
    'príncipe': 'prince',
    'planeta': 'planet',
    'rosa': 'rose',
    'flor': 'flower',
    'flores': 'flowers',
    'cordero': 'lamb',
    'serpiente': 'snake',
    'boa': 'boa',
    'elefante': 'elephant',
    'desierto': 'desert',
    'aviador': 'aviator',
    'piloto': 'pilot',
    'avión': 'airplane',
    'viaje': 'journey',
    'aventura': 'adventure',
    'dibujo': 'drawing',
    'baobab': 'baobab tree',
    'volcán': 'volcano',
    'volcanes': 'volcanoes',
    'astros': 'stars',
    'asteroide': 'asteroid',
    'capítulo': 'chapter',
    'historia': 'story',
    'cuento': 'tale',
    'adultos': 'adults',
    'personas mayores': 'grown-ups',
    'secreto': 'secret',
    'misterio': 'mystery',
    'importante': 'important',
    'esencial': 'essential',
    'invisible': 'invisible',
    'visible': 'visible',
    'domesticar': 'to tame',
    'responsable': 'responsible',
    'únicamente': 'only',
    'solamente': 'only',
    'verdad': 'truth',
    'mentira': 'lie',
    'real': 'real',
    'imaginación': 'imagination',
    'sueño': 'dream',
    'despertar': 'to wake up',
    'dormir': 'to sleep'
  };
  
  const lowerText = text.toLowerCase().trim();
  
  // Check for exact matches first
  if (commonTranslations[lowerText]) {
    return commonTranslations[lowerText];
  }
  
  // Check for partial matches
  for (const [spanish, english] of Object.entries(commonTranslations)) {
    if (lowerText.includes(spanish)) {
      return english + ' (partial match)';
    }
  }
  
  // If no match found, return a helpful message
  return `Translation not available for "${text}" - DeepL API key needed for full translation`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
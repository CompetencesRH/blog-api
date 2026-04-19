const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('articles'));

const ARTICLES_DIR = path.join(__dirname, 'articles');

async function getArticles({ category, limit = 10 } = {}) {
  try {
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
    const articles = files.map(f => {
      const data = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
      return { id: f.replace('.json', ''), ...JSON.parse(data) };
    });
    
    let result = articles;
    if (category) result = result.filter(a => a.category === category);
    return result.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  } catch(e) {
    return [];
  }
}

app.get('/api/articles', async (req, res) => res.json(await getArticles(req.query)));
app.get('/api/articles/:id', async (req, res) => {
  const articles = await getArticles();
  const article = articles.find(a => a.id === req.params.id);
  res.json(article || { error: 'Not found' });
});

app.get('/api/sitemap-posts.xml', async (req, res) => {
  const articles = await getArticles();
  let xml = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  articles.forEach(a => {
    xml += `<url><loc>https://competencesrh.fr/blog/${a.slug}</loc><lastmod>${a.date}</lastmod><priority>0.8</priority></url>`;
  });
  res.set('Content-Type', 'text/xml').send(xml + '</urlset>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Blog API sur port ${port}`));

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('articles'));

const ARTICLES_DIR = path.join(__dirname, 'articles');

async function getArticles({ category, limit = 10 } = {}) {
  try

import axios from 'axios';
async function run() {
  const url = 'https://www.daraz.com.np/products/gold-star-shoes-for-men-g10-109-black-i105436377-s1027150190.html';
  const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 }).catch(e => ({ data: '' }));
  if (!html) return console.log('Fetch failed');
  const m = html.match(/"skuGalleries"\s*:\s*(\{[\s\S]{1,2000}\})/);
  if (m) console.log('Found:', m[1].substring(0, 500));
  else console.log('no match skuGalleries');

  const og = html.match(/property="og:image"\s+content="([^"]+)"/);
  if (og) console.log('OG Image:', og[1]);
}
run();

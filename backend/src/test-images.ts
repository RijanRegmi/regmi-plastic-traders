import axios from 'axios';

async function check() {
  const url = 'https://www.daraz.com.np/products/gold-star-shoes-for-men-g10-109-black-i105436377-s1027150190.html';
  const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }, timeout: 10000 }).catch(e => ({ data: '' }));
  
  if (!html) console.log('FAILED TO FETCH');
  
  const modIdx = html.indexOf('__moduleData__');
  if (modIdx !== -1) {
      console.log('found moduleData');
      const galleryM = html.slice(modIdx, modIdx + 50000).match(/"skuGalleries"\s*:\s*(\{[\s\S]*?\})\s*,\s*"skuInfos"/);
      if (galleryM) {
          const galleries = JSON.parse(galleryM[1]);
          console.log('galleries keys:', Object.keys(galleries));
          for (const imgs of Object.values(galleries)) {
              if (Array.isArray(imgs)) {
                  console.log('Images sample:', imgs.slice(0, 2));
              }
          }
      } else {
          console.log('skuGalleries regex no match');
      }
  } else {
      console.log('No module data');
  }
}
check();

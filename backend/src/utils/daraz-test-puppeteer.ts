import puppeteer from 'puppeteer-core';

async function testDaraz() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const u = response.url();
    if (u.includes('mtop') || u.includes('getPrice') || u.includes('itemDetail') || u.includes('pdp')) {
      const text = await response.text().catch(() => '');
      if (text) {
        console.log('--- RESPONSE MATCH ---');
        console.log('URL:', u);
        console.log('Text substring:', text.substring(0, 1000));
        
        const pM = text.match(/"(?:salePrice|sale_price|discountedPrice|currentPrice|price)"\s*:\s*([\d.]+)/);
        if (pM) console.log('Parsed SALE price:', pM[1]);
        const oM = text.match(/"(?:originalPrice|original_price|retailPrice)"\s*:\s*([\d.]+)/);
        if (oM) console.log('Parsed ORIGINAL price:', oM[1]);
      }
    }
  });

  const url = 'https://www.daraz.com.np/products/smart-watches-for-men-women-i135118712-s1031388636.html';
  await page.goto('https://www.daraz.com.np/');
  // let's grab random product link from homepage
  const link = await page.$eval('.card-jfy-item', el => el.getAttribute('href')).catch(() => null);
  if (link) {
      console.log('Found product:', link);
      await page.goto(link.startsWith('http') ? link : 'https:' + link, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 5000));
  } else {
      console.log('No item found on homepage');
  }

  await browser.close();
}

testDaraz().catch(console.error);

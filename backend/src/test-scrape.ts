import { scraperController } from './controllers/scraper.controller';
import express from 'express';

async function test() {
  const req = {
    body: { url: 'https://www.daraz.com.np/products/horlicks-classic-malt-jar-500-gm-i104523956-s1025547492.html' }
  } as any;
  const res = {
    status: (s: number) => ({ json: (d: any) => console.log('STATUS:', s, d) }),
    json: (d: any) => console.log('JSON:', d)
  } as any;
  const next = (e: any) => console.error('NEXT ERROR:', e);

  await scraperController.fetchDarazProduct(req, res, next);
}

test();

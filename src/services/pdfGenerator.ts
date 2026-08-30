// src/services/pdfGenerator.ts
/*
  PDF Generator Service
  --------------------
  Uses Puppeteer to render an EJS template into HTML and then generate a PDF buffer.
  The service sanitises all injected data to prevent XSS and ensures the output
  is text‑selectable (no rasterisation).
*/

import path from 'path';
import ejs from 'ejs';
import puppeteer from 'puppeteer';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialise DOMPurify with a JSDOM window (server‑side usage)
const window = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(window as any);

/**
 * Render a resume template (EJS) with the supplied data and return a PDF buffer.
 * @param templateId - Identifier of the template (e.g., "clean-1").
 * @param data - The resume JSON payload (contact, summary, experience, ...).
 */
export async function generatePdf(templateId: string, data: any): Promise<any> {
  const templatePath = path.resolve(__dirname, '..', 'templates', `${templateId}.ejs`);

  // Sanitize all string fields recursively
  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [k, v] of Object.entries(obj)) {
        result[k] = sanitize(v);
      }
      return result;
    }
    if (typeof obj === 'string') {
      return purify.sanitize(obj);
    }
    return obj;
  };
  const safeData = sanitize(data);

  // Render the EJS template with the safe data
  const html = await ejs.renderFile(templatePath, { data: safeData }, { async: true });

  // Launch puppeteer (headless Chromium). In production the container must
  // provide Chromium; we pass typical args to run in a sandboxed env.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'load' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
  });

  await browser.close();
  return pdfBuffer;
}

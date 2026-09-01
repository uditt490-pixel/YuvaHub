/**
 * PDF Generator Service using EJS templating and Puppeteer (headless Chrome).
 */

import path from 'path';
import ejs from 'ejs';
// @ts-ignore
import puppeteer from 'puppeteer';
import DOMPurify from 'dompurify';
// @ts-ignore
import { JSDOM } from 'jsdom';

// Initialise DOMPurify with a JSDOM window (server‑side usage)
const window = new JSDOM('').window as any;
const purify = DOMPurify(window);

/**
 * Render a resume template (EJS) with the supplied data and return a PDF buffer.
 * @param templateId - Identifier of the template (e.g., "clean-1").
 * @param data - The resume JSON payload (contact, summary, experience, ...).
 * @returns PDF buffer suitable for HTTP response or file storage.
 */
export const generatePdf = async (templateId: string, data: any): Promise<Buffer> => {
  // Sanitize all string fields in data before rendering
  const sanitizedData = sanitizeResumeData(data);

  // Locate the template file
  const templatePath = path.resolve(
    process.cwd(),
    'src',
    'templates',
    'resume',
    `${templateId}.ejs`
  );

  // Render EJS HTML
  const html = await ejs.renderFile(templatePath, { resume: sanitizedData });

  // Launch Puppeteer headless browser to print PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
};

/**
 * Recursively sanitize string values in an object to prevent XSS.
 */
const sanitizeResumeData = (obj: any): any => {
  if (typeof obj === 'string') {
    return purify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeResumeData);
  }
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeResumeData(obj[key]);
    }
    return cleaned;
  }
  return obj;
};

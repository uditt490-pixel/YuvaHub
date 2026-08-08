import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vite Bundle Visualizer Integration (#600)', () => {
  it('should have rollup-plugin-visualizer registered in package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkgRaw = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgRaw);

    expect(pkg.devDependencies['rollup-plugin-visualizer']).toBeDefined();
    expect(pkg.scripts['build:analyze']).toBeDefined();
    expect(pkg.scripts['analyze']).toBeDefined();
  });

  it('should verify BUNDLE_ANALYSIS documentation exists', () => {
    const docPath = path.resolve(process.cwd(), 'docs/BUNDLE_ANALYSIS.md');
    expect(fs.existsSync(docPath)).toBe(true);

    const content = fs.readFileSync(docPath, 'utf-8');
    expect(content).toContain('Vite Bundle Visualizer');
    expect(content).toContain('stats.html');
    expect(content).toContain('lucide-react');
  });
});

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const pages = [
  'index.html',
  'BMS电池模拟器_交互工具.html',
];

for (const page of pages) {
  test(`${page}: dashboard visual refresh structure is present`, () => {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');

    assert.match(html, /\/\* ===== VISUAL REFRESH ===== \*\//);
    assert.match(html, /class="header-topline"/);
    assert.match(html, /class="brand-mark"/);
    assert.match(html, /(?:id="serial-panel" class="card serial-panel"|class="card serial-panel" id="serial-panel")/);
    assert.match(html, /--surface-soft:\s*#f7f9fc/);
  });
}

test('dashboard entry pages share the same visual refresh', () => {
  const read = page => fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  const getVisualBlock = html => html.match(/\/\* ===== VISUAL REFRESH ===== \*\/([\s\S]*?)<\/style>/)?.[1].replace(/\s+/g, ' ').trim();

  assert.equal(getVisualBlock(read(pages[0])), getVisualBlock(read(pages[1])));
});

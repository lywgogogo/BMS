const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const pages = [
  'index.html',
  'BMS电池模拟器_交互工具.html',
];

function loadZoomFunction(page) {
  const source = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  const match = source.match(
    /function calculateChartYZoom\([\s\S]*?\n}\n\/\/ END calculateChartYZoom/
  );

  assert.ok(match, `${page} should define calculateChartYZoom`);

  const context = {};
  vm.runInNewContext(`${match[0].replace('\n// END calculateChartYZoom', '')}; this.zoom = calculateChartYZoom;`, context);
  return context.zoom;
}

function assertRange(actual, expected) {
  assert.ok(Math.abs(actual.min - expected.min) < 1e-12);
  assert.ok(Math.abs(actual.max - expected.max) < 1e-12);
}

for (const page of pages) {
  test(`${page}: wheel zoom keeps its direction at voltage boundaries`, () => {
    const zoom = loadZoomFunction(page);

    const bottom = zoom(0, 3, 1, 120);
    assertRange(bottom, { min: 0, max: 3.54 });

    const top = zoom(7, 10, 0, 120);
    assertRange(top, { min: 6.46, max: 10 });
  });

  test(`${page}: wheel zoom is centered on the mouse voltage`, () => {
    const zoom = loadZoomFunction(page);
    const result = zoom(2, 5, 0.25, -120);

    assert.ok(Math.abs((result.max - result.min) - 2.55) < 1e-12);
    assert.ok(Math.abs(result.min - 2.3375) < 1e-12);
    assert.ok(Math.abs(result.max - 4.8875) < 1e-12);
  });

  test(`${page}: wheel zoom clamps the supported range without collapsing it`, () => {
    const zoom = loadZoomFunction(page);

    assertRange(zoom(0, 10, 0.5, 120), { min: 0, max: 10 });

    const minimum = zoom(3.9, 4.1, 0.5, -120);
    assert.ok(Math.abs((minimum.max - minimum.min) - 0.2) < 1e-12);
  });
}

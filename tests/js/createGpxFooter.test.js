// createGpxFooter.test.js
import { createGpxFooter } from '../../admin_rust_wasm/www/createGpxFileAsString';

describe('createGpxFooter', () => {
  it('returns the correct footer string', () => {
    const expectedFooter = '</gpx>';
    const actualFooter = createGpxFooter();
    expect(actualFooter).toBe(expectedFooter);
  });

  it('returns a string', () => {
    const footer = createGpxFooter();
    expect(typeof footer).toBe('string');
  });
});
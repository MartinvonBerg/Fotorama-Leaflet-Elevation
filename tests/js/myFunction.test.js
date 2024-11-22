// myFunction.test.js
//const add = require('./myFunction');
import { add } from './myFunction';


describe('add', () => {
    test('adds numbers correctly', () => {
        expect(1 + 1).toBe(2);
    });
    test('call add', () => {
        expect(add(1, 1)).toBe(2);
    });
    
    test('adds 1 + 2 to equal 3', () => {
        let c = add(1,2);
        expect(c).toBe(3);
    });
    
    test('adds negative numbers', () => {
        expect(add(-1, -1)).toBe(-2);
    });
    
});

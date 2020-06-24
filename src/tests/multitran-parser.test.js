import prescriptionEN from './mocks/prescription.en.html';
import { parser } from '../js/translate-engine/multitran-parser.js';

describe('Parser', () => {
    test('should math snapshot', () => {
        expect(parser(prescriptionEN)).toMatchSnapshot();
    });
});

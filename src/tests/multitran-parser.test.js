import prescriptionEN from './mocks/prescription.en.html';
import notFound from './mocks/not-found.html';
import otherLangs from './mocks/other-lang.html';
import { parser } from '../js/translate-engine/multitran-parser.js';

describe('Parser', () => {
    test('should match snapshot', () => {
        expect(parser(prescriptionEN).data).toMatchSnapshot();
    });
    test("data should be empty if word isn't found", () => {
        expect(parser(notFound).data).toHaveLength(0);
        expect(parser(notFound).otherLang).toHaveLength(0);
    });
    test('should return links to other languages', () => {
        expect(parser(otherLangs).data).toHaveLength(0);
        const { otherLang } = parser(otherLangs);
        expect(otherLang).toHaveLength(2);
        expect(otherLang[0].getAttribute('href')).toBe('https://www.multitran.com/m.exe?l1=17&l2=2&s=日');
        expect(otherLang[0].textContent).toBe('Chinese');
        expect(otherLang[1].getAttribute('href')).toBe('https://www.multitran.com/m.exe?l1=28&l2=2&s=日');
        expect(otherLang[1].textContent).toBe('Japanese');
    });
});

import prescriptionEN from './mocks/prescription.en.html';
import prescriptionRU from './mocks/prescription.html';
import notFound from './mocks/not-found.html';
import otherLangs from './mocks/other-lang.html';
import { langIds } from '../js/configs.js';
import { parser } from '../js/translate-engine/multitran-parser.js';
import { multitranData } from '../js/translate-engine/multitran.js';

describe('Parser', () => {
    test('should match snapshot', async () => {
        window.fetch = jest.fn(async (url) => {
            expect(url).toBe('https://www.multitran.com/m.exe?l1=1&l2=2&SHL=1&s=prescription');
            return {
                status: 200,
                text: jest.fn(async () => prescriptionEN),
            };
        });
        const data = await multitranData('prescription', langIds.English, langIds.Russian, langIds.English);

        expect(data).toMatchSnapshot();
    });

    test('should match snapshot 2', async () => {
        window.fetch = jest.fn(async (url) => {
            expect(url).toBe('https://www.multitran.com/m.exe?l1=1&l2=2&SHL=2&s=prescription');
            return {
                status: 200,
                text: jest.fn(async () => prescriptionRU),
            };
        });
        const data = await multitranData('prescription', langIds.English, langIds.Russian, langIds.Russian);

        expect(data).toMatchSnapshot();
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

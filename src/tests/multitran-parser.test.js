import { testFiles } from './mocks/index.js';
import { langIds } from '../js/constants.js';
import { parser } from '../js/translate-engine/multitran-parser.js';
import { multitranData } from '../js/translate-engine/multitran.js';

const { notFound, prescriptionRU, prescriptionEN, otherLangs } = testFiles;

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

    test('should return error', async () => {
        const msg = 'NetworkError when attempting to fetch resource.';
        window.fetch = jest.fn(async () => {
            throw new TypeError(msg);
        });
        const { data, error } = await multitranData('prescription', langIds.English, langIds.Russian, langIds.English);

        expect(data).toBeUndefined();
        expect(error.message).toBe(msg);
    });
});

import { Unit } from '@openmeteo/sdk/unit';
import { unitDisplayMap, wmoCodeDescriptions } from './openmeteoConstants';

describe('unitDisplayMap', () => {
    it('maps celsius to °C', () => {
        expect(unitDisplayMap[Unit.celsius]).toBe('°C');
    });

    it('maps percentage to %', () => {
        expect(unitDisplayMap[Unit.percentage]).toBe('%');
    });

    it('maps kilometres_per_hour to km/h', () => {
        expect(unitDisplayMap[Unit.kilometres_per_hour]).toBe('km/h');
    });

    it('maps wmo_code to wmo', () => {
        expect(unitDisplayMap[Unit.wmo_code]).toBe('wmo');
    });

    it('maps dimensionless_integer to empty string', () => {
        expect(unitDisplayMap[Unit.dimensionless_integer]).toBe('');
    });
});

describe('wmoCodeDescriptions', () => {
    it('returns Clear sky for code 0', () => {
        expect(wmoCodeDescriptions[0]).toBe('Clear sky');
    });

    it('returns Mainly clear for code 1', () => {
        expect(wmoCodeDescriptions[1]).toBe('Mainly clear');
    });

    it('returns Partly cloudy for code 2', () => {
        expect(wmoCodeDescriptions[2]).toBe('Partly cloudy');
    });

    it('returns Overcast for code 3', () => {
        expect(wmoCodeDescriptions[3]).toBe('Overcast');
    });

    it('returns Fog for code 45', () => {
        expect(wmoCodeDescriptions[45]).toBe('Fog');
    });

    it('returns Depositing rime fog for code 48', () => {
        expect(wmoCodeDescriptions[48]).toBe('Depositing rime fog');
    });

    it('returns Light drizzle for code 51', () => {
        expect(wmoCodeDescriptions[51]).toBe('Light drizzle');
    });

    it('returns Heavy rain for code 65', () => {
        expect(wmoCodeDescriptions[65]).toBe('Heavy rain');
    });

    it('returns Slight snowfall for code 71', () => {
        expect(wmoCodeDescriptions[71]).toBe('Slight snowfall');
    });

    it('returns Snow grains for code 77', () => {
        expect(wmoCodeDescriptions[77]).toBe('Snow grains');
    });

    it('returns Violent rain showers for code 82', () => {
        expect(wmoCodeDescriptions[82]).toBe('Violent rain showers');
    });

    it('returns Thunderstorm for code 95', () => {
        expect(wmoCodeDescriptions[95]).toBe('Thunderstorm');
    });

    it('returns Thunderstorm with slight hail for code 96', () => {
        expect(wmoCodeDescriptions[96]).toBe('Thunderstorm with slight hail');
    });

    it('returns Thunderstorm with heavy hail for code 99', () => {
        expect(wmoCodeDescriptions[99]).toBe('Thunderstorm with heavy hail');
    });

    it('returns undefined for unknown code', () => {
        expect(wmoCodeDescriptions[999]).toBeUndefined();
    });
});

import { describe, it, expect } from 'vitest';
import {
  getVoivodeshipNames,
  getPowiatsForVoivodeship,
  isValidVoivodeship,
  isValidPoviat,
  VOIVODESHIPS,
} from '../locations';

describe('getVoivodeshipNames', () => {
  it('should return all voivodeship names', () => {
    const names = getVoivodeshipNames();
    expect(names).toBeInstanceOf(Array);
    expect(names.length).toBeGreaterThan(0);
  });

  it('should return exactly 16 voivodeships (Poland has 16)', () => {
    const names = getVoivodeshipNames();
    expect(names.length).toBe(16);
  });

  it('should return all keys from VOIVODESHIPS', () => {
    const names = getVoivodeshipNames();
    const expectedNames = Object.keys(VOIVODESHIPS);
    expect(names).toEqual(expectedNames);
  });

  it('should include Mazowieckie', () => {
    const names = getVoivodeshipNames();
    expect(names).toContain('Mazowieckie');
  });

  it('should include all major voivodeships', () => {
    const names = getVoivodeshipNames();
    const majorVoivodeships = [
      'Mazowieckie',
      'Śląskie',
      'Wielkopolskie',
      'Małopolskie',
      'Dolnośląskie',
    ];
    for (const voivodeship of majorVoivodeships) {
      expect(names).toContain(voivodeship);
    }
  });

  it('should return names in consistent order', () => {
    const names1 = getVoivodeshipNames();
    const names2 = getVoivodeshipNames();
    expect(names1).toEqual(names2);
  });
});

describe('getPowiatsForVoivodeship', () => {
  it('should return powiats for existing voivodeship', () => {
    const powiats = getPowiatsForVoivodeship('Mazowieckie');
    expect(powiats).toBeInstanceOf(Array);
    expect(powiats.length).toBeGreaterThan(0);
  });

  it('should return correct powiats for Mazowieckie', () => {
    const powiats = getPowiatsForVoivodeship('Mazowieckie');
    expect(powiats).toContain('Warszawa');
    expect(powiats).toContain('Radom');
    expect(powiats).toContain('Płock');
  });

  it('should return empty array for non-existent voivodeship', () => {
    const powiats = getPowiatsForVoivodeship('NonExistent');
    expect(powiats).toEqual([]);
  });

  it('should return empty array for empty string', () => {
    const powiats = getPowiatsForVoivodeship('');
    expect(powiats).toEqual([]);
  });

  it('should be case-sensitive', () => {
    const powiatsLower = getPowiatsForVoivodeship('mazowieckie');
    const powiatsUpper = getPowiatsForVoivodeship('MAZOWIECKIE');
    expect(powiatsLower).toEqual([]);
    expect(powiatsUpper).toEqual([]);
  });

  it('should return correct powiats for Śląskie', () => {
    const powiats = getPowiatsForVoivodeship('Śląskie');
    expect(powiats).toContain('Katowice');
    expect(powiats).toContain('Bielsko-Biała');
    expect(powiats).toContain('Częstochowa');
  });

  it('should return correct powiats for Małopolskie', () => {
    const powiats = getPowiatsForVoivodeship('Małopolskie');
    expect(powiats).toContain('Kraków');
    expect(powiats).toContain('Nowy Sącz');
    expect(powiats).toContain('Tarnów');
  });

  it('should return all powiats from VOIVODESHIPS data', () => {
    const voivodeship = 'Mazowieckie';
    const powiats = getPowiatsForVoivodeship(voivodeship);
    const expectedPowiats = VOIVODESHIPS[voivodeship]?.powiats || [];
    expect(powiats).toEqual(expectedPowiats);
  });
});

describe('isValidVoivodeship', () => {
  it('should return true for existing voivodeship', () => {
    expect(isValidVoivodeship('Mazowieckie')).toBe(true);
  });

  it('should return true for all voivodeships in VOIVODESHIPS', () => {
    const voivodeships = getVoivodeshipNames();
    for (const voivodeship of voivodeships) {
      expect(isValidVoivodeship(voivodeship)).toBe(true);
    }
  });

  it('should return false for non-existent voivodeship', () => {
    expect(isValidVoivodeship('NonExistent')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidVoivodeship('')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(isValidVoivodeship('mazowieckie')).toBe(false);
    expect(isValidVoivodeship('MAZOWIECKIE')).toBe(false);
    expect(isValidVoivodeship('Mazowieckie')).toBe(true);
  });

  it('should return false for strings with extra whitespace', () => {
    expect(isValidVoivodeship(' Mazowieckie')).toBe(false);
    expect(isValidVoivodeship('Mazowieckie ')).toBe(false);
    expect(isValidVoivodeship(' Mazowieckie ')).toBe(false);
  });

  it('should return true for all 16 Polish voivodeships', () => {
    const allVoivodeships = [
      'Dolnośląskie',
      'Kujawsko-Pomorskie',
      'Lubelskie',
      'Lubuskie',
      'Łódzkie',
      'Małopolskie',
      'Mazowieckie',
      'Opolskie',
      'Podkarpackie',
      'Podlaskie',
      'Pomorskie',
      'Śląskie',
      'Świętokrzyskie',
      'Warmińsko-Mazurskie',
      'Wielkopolskie',
      'Zachodniopomorskie',
    ];
    for (const voivodeship of allVoivodeships) {
      expect(isValidVoivodeship(voivodeship)).toBe(true);
    }
  });
});

describe('isValidPoviat', () => {
  it('should return true for valid poviat in voivodeship', () => {
    expect(isValidPoviat('Mazowieckie', 'Warszawa')).toBe(true);
  });

  it('should return false for non-existent poviat', () => {
    expect(isValidPoviat('Mazowieckie', 'NonExistent')).toBe(false);
  });

  it('should return false for poviat from different voivodeship', () => {
    // Kraków is in Małopolskie, not Mazowieckie
    expect(isValidPoviat('Mazowieckie', 'Kraków')).toBe(false);
  });

  it('should return false for non-existent voivodeship', () => {
    expect(isValidPoviat('NonExistent', 'Warszawa')).toBe(false);
  });

  it('should return false for empty voivodeship', () => {
    expect(isValidPoviat('', 'Warszawa')).toBe(false);
  });

  it('should return false for empty poviat', () => {
    expect(isValidPoviat('Mazowieckie', '')).toBe(false);
  });

  it('should be case-sensitive for voivodeship', () => {
    expect(isValidPoviat('mazowieckie', 'Warszawa')).toBe(false);
    expect(isValidPoviat('MAZOWIECKIE', 'Warszawa')).toBe(false);
  });

  it('should be case-sensitive for poviat', () => {
    expect(isValidPoviat('Mazowieckie', 'warszawa')).toBe(false);
    expect(isValidPoviat('Mazowieckie', 'WARSZAWA')).toBe(false);
  });

  it('should return true for correct combinations', () => {
    const testCases = [
      { voivodeship: 'Mazowieckie', poviat: 'Warszawa' },
      { voivodeship: 'Mazowieckie', poviat: 'Radom' },
      { voivodeship: 'Mazowieckie', poviat: 'Płock' },
      { voivodeship: 'Śląskie', poviat: 'Katowice' },
      { voivodeship: 'Śląskie', poviat: 'Bielsko-Biała' },
      { voivodeship: 'Małopolskie', poviat: 'Kraków' },
      { voivodeship: 'Małopolskie', poviat: 'Nowy Sącz' },
      { voivodeship: 'Wielkopolskie', poviat: 'Poznań' },
    ];

    for (const testCase of testCases) {
      expect(isValidPoviat(testCase.voivodeship, testCase.poviat)).toBe(true);
    }
  });

  it('should return false for incorrect combinations', () => {
    const testCases = [
      { voivodeship: 'Mazowieckie', poviat: 'Kraków' }, // Kraków is in Małopolskie
      { voivodeship: 'Śląskie', poviat: 'Warszawa' }, // Warszawa is in Mazowieckie
      { voivodeship: 'Małopolskie', poviat: 'Katowice' }, // Katowice is in Śląskie
    ];

    for (const testCase of testCases) {
      expect(isValidPoviat(testCase.voivodeship, testCase.poviat)).toBe(false);
    }
  });

  it('should handle powiats with special characters', () => {
    // Test powiats with hyphens, spaces, and Polish characters
    expect(isValidPoviat('Śląskie', 'Bielsko-Biała')).toBe(true);
    expect(isValidPoviat('Mazowieckie', 'Ostrów Mazowiecka')).toBe(true);
    expect(isValidPoviat('Wielkopolskie', 'Czarnkowsko-Trzcianecki')).toBe(true);
  });

  it('should return false for strings with extra whitespace', () => {
    expect(isValidPoviat(' Mazowieckie', 'Warszawa')).toBe(false);
    expect(isValidPoviat('Mazowieckie', ' Warszawa')).toBe(false);
    expect(isValidPoviat('Mazowieckie ', 'Warszawa')).toBe(false);
    expect(isValidPoviat('Mazowieckie', 'Warszawa ')).toBe(false);
  });
});




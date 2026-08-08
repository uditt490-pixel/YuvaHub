import { describe, it, expect } from 'vitest';
import { isToxic } from '../src/services/toxicity';

describe('Toxicity Checker — Issue #537 Fix', () => {
  describe('standalone toxic word detection (true positives)', () => {
    it('should flag common toxic words as standalone tokens', async () => {
      expect(await isToxic('This is shit')).toBe(true);
      expect(await isToxic('You are a bitch')).toBe(true);
      expect(await isToxic('fuck off')).toBe(true);
      expect(await isToxic('cock')).toBe(true);
      expect(await isToxic('die')).toBe(true);
      expect(await isToxic('asshole')).toBe(true);
      expect(await isToxic('cunt')).toBe(true);
      expect(await isToxic('dick')).toBe(true);
      expect(await isToxic('bastard')).toBe(true);
      expect(await isToxic('retard')).toBe(true);
      expect(await isToxic('idiot')).toBe(true);
      expect(await isToxic('moron')).toBe(true);
    });

    it('should flag multi-word toxic phrases', async () => {
      expect(await isToxic('I hate you')).toBe(true);
      expect(await isToxic('kill yourself')).toBe(true);
      expect(await isToxic('just kill yourself now')).toBe(true);
    });

    it('should flag toxic words surrounded by punctuation', async () => {
      expect(await isToxic('What the fuck!')).toBe(true);
      expect(await isToxic('You are an asshole.')).toBe(true);
      expect(await isToxic('cock?')).toBe(true);
      expect(await isToxic('"die"')).toBe(true);
      expect(await isToxic('(bitch)')).toBe(true);
      expect(await isToxic('shit,')).toBe(true);
    });
  });

  describe('false-positive prevention (legitimate words)', () => {
    it('should NOT flag words that merely contain toxic substrings', async () => {
      // "cock" inside larger words
      expect(await isToxic('I saw a peacock today')).toBe(false);
      expect(await isToxic('Woodcock is a bird')).toBe(false);

      // "die" inside larger words
      expect(await isToxic('I am on a diet')).toBe(false);
      expect(await isToxic('This is a diesel engine')).toBe(false);
      expect(await isToxic('He is a diehard fan')).toBe(false);
      expect(await isToxic('Goodbye and take care')).toBe(false);

      // "shit" inside larger words
      expect(await isToxic('I love shitake mushrooms')).toBe(false);

      // "cunt" inside larger words (Scunthorpe problem)
      expect(await isToxic('Scunthorpe is a town in England')).toBe(false);

      // "dick" inside names
      expect(await isToxic('Charles Dickens is a great author')).toBe(false);
      expect(await isToxic('Dickinson wrote beautiful poetry')).toBe(false);

      // "retard" inside technical terms
      expect(await isToxic('These are fire retardant materials')).toBe(false);

      // "ass" is not in the list, but "asshole" is — verify boundaries
      expect(await isToxic('Pass the glass')).toBe(false);
      expect(await isToxic('Class is in session')).toBe(false);
    });

    it('should NOT flag partial phrase matches', async () => {
      // "hate you" should not match "hate yogurt"
      expect(await isToxic('I hate yogurt')).toBe(false);
      // "kill yourself" should not match "kill your self-esteem"
      expect(await isToxic('Do not kill your self-esteem')).toBe(false);
    });
  });

  describe('case insensitivity', () => {
    it('should remain case-insensitive', async () => {
      expect(await isToxic('FUCK YOU')).toBe(true);
      expect(await isToxic('You Are A BITCH')).toBe(true);
      expect(await isToxic('PEACOCK')).toBe(false);
      expect(await isToxic('DIET')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty or invalid input gracefully', async () => {
      expect(await isToxic('')).toBe(false);
      expect(await isToxic('   ')).toBe(false);
      expect(await isToxic(null as any)).toBe(false);
      expect(await isToxic(undefined as any)).toBe(false);
      expect(await isToxic(123 as any)).toBe(false);
    });

    it('should not flag clean sentences', async () => {
      expect(await isToxic('Hello world, nothing toxic here')).toBe(false);
      expect(await isToxic('This platform is amazing')).toBe(false);
      expect(await isToxic('Looking forward to the hackathon')).toBe(false);
    });
  });
});

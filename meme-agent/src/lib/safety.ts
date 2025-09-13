/**
 * safety.ts - Content safety utilities
 */
import { CaptionOption } from './zypher';

// Simple dictionary of bad words to replace
const BAD_WORDS_EN = [
  'badword1',
  'badword2',
  // Add more English bad words here
];

const BAD_WORDS_JA = [
  '悪い言葉1',
  '悪い言葉2',
  // Add more Japanese bad words here
];

/**
 * Replace bad words with asterisks
 * @param text Input text to sanitize
 * @returns Sanitized text
 */
export function safeRewrite(text: string): string {
  if (!text) return text;
  
  let result = text;
  
  // Replace English bad words
  BAD_WORDS_EN.forEach(word => {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  });
  
  // Replace Japanese bad words
  BAD_WORDS_JA.forEach(word => {
    result = result.replace(new RegExp(word, 'g'), '*'.repeat(word.length));
  });
  
  return result;
}

/**
 * Apply safeRewrite to a caption option
 * @param option Caption option to sanitize
 * @returns Sanitized caption option
 */
export function safeRewriteOption(option: CaptionOption): CaptionOption {
  return {
    ...option,
    top: safeRewrite(option.top),
    bottom: safeRewrite(option.bottom),
    alt_text: safeRewrite(option.alt_text),
  };
}

/**
 * Apply safeRewrite to an array of caption options
 * @param options Array of caption options to sanitize
 * @returns Array of sanitized caption options
 */
export function safeRewriteOptions(options: CaptionOption[]): CaptionOption[] {
  return options.map(safeRewriteOption);
}
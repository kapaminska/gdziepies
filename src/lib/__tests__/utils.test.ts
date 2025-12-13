import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('should combine multiple class strings', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle undefined values', () => {
    const result = cn('class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle null values', () => {
    const result = cn('class1', null, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle empty strings', () => {
    const result = cn('class1', '', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('should merge conflicting Tailwind classes (twMerge)', () => {
    // twMerge should resolve conflicts, keeping the last one
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('should handle mixed inputs', () => {
    const result = cn(
      'class1',
      ['class2', 'class3'],
      {
        'class4': true,
        'class5': false,
      },
      'class6',
      undefined,
      null
    );
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
    expect(result).toContain('class4');
    expect(result).toContain('class6');
    expect(result).not.toContain('class5');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle only undefined/null values', () => {
    const result = cn(undefined, null, undefined);
    expect(result).toBe('');
  });

  it('should handle whitespace-only strings', () => {
    const result = cn('  ', 'class1', '  ');
    expect(result).toBe('class1');
  });

  it('should merge Tailwind responsive classes correctly', () => {
    const result = cn('p-4 md:p-6', 'p-2');
    // Should keep responsive variant and override base
    expect(result).toContain('p-2');
    expect(result).toContain('md:p-6');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('disabled-class');
  });

  it('should handle complex Tailwind class conflicts', () => {
    // Test that twMerge properly handles Tailwind utility conflicts
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should preserve non-conflicting classes', () => {
    const result = cn('p-4', 'text-red-500', 'bg-blue-500');
    expect(result).toContain('p-4');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });
});





/**
 * Data normalizer utility
 * Text and date normalization functions ported from legacy
 */

export class DataNormalizer {
  /**
   * Normalize date value (ported from legacy Deliverables_QA_QC)
   */
  public static normalizeDate(value: any): string {
    if (typeof value !== 'string') return String(value || '');

    const trimmedValue = value.trim();
    if (!trimmedValue) return '';

    // Try multiple formats
    const formats = [
      /^\d{2}\.\d{2}\.\d{4}$/,  // 13.03.2025
      /^\d{2}\/\d{2}\/\d{4}$/,  // 13/03/2025
      /^\d{2}\.\w{3}\.\d{4}$/i, // 13.MAR.2025
      /^\d{2}\/\d{2}\/\d{2}$/   // 13/03/25
    ];

    // First, see if input matches one of the patterns
    const isKnownFormat = formats.some(regex => regex.test(trimmedValue));
    if (!isKnownFormat) {
      // Fallback to default JS Date parse
      const fallbackDate = new Date(trimmedValue);
      if (!isNaN(fallbackDate.getTime())) {
        // Convert to dd/mm/yyyy for consistency
        return fallbackDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      // Return original string if parsing fails
      return trimmedValue;
    }

    // If it does match, parse accordingly
    const monthMap: { [key: string]: string } = { 
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', 
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' 
    };

    const standardized = trimmedValue
      .replace(/\./g, '/')  // Convert dots to slashes
      .replace(/([A-Za-z]{3})/i, (m) => {
        return monthMap[m.toUpperCase()] || m;
      });

    const parsedDate = new Date(standardized);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }

    return trimmedValue;
  }

  /**
   * Normalize text value (ported from legacy Deliverables_QA_QC)
   */
  public static normalizeText(value: any): string {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ').toUpperCase();
    }
    return String(value || '');
  }

  /**
   * Normalize file name for comparison
   */
  public static normalizeFileName(fileName: string): string {
    // Remove extension and normalize
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    return this.normalizeText(nameWithoutExt);
  }

  /**
   * Parse date from various formats
   */
  public static parseDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;

    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    // Try to parse the date
    const parsedDate = new Date(trimmedValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Try with normalized format
    const normalized = this.normalizeDate(value);
    const normalizedDate = new Date(normalized);
    if (!isNaN(normalizedDate.getTime())) {
      return normalizedDate;
    }

    return null;
  }

  /**
   * Format date for display
   */
  public static formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Trim and normalize whitespace
   */
  public static trimWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  /**
   * Remove special characters for comparison
   */
  public static removeSpecialChars(value: string): string {
    return value.replace(/[^\w\s]/gi, '').toLowerCase();
  }

  /**
   * Compare two normalized values
   */
  public static compareNormalized(value1: any, value2: any): boolean {
    const norm1 = this.normalizeText(value1);
    const norm2 = this.normalizeText(value2);
    return norm1 === norm2;
  }

  /**
   * Strip file extension (ported from legacy)
   */
  public static stripExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  /**
   * Normalize for file comparison (ported from legacy)
   */
  public static normalizeForComparison(fileName: string): string {
    const withoutExtension = this.stripExtension(fileName);
    return withoutExtension.toLowerCase().normalize().replace(/\s+/g, ' ').trim();
  }
}

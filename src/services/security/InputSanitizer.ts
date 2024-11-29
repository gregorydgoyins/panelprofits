import xss from 'xss';

export class InputSanitizer {
  private static instance: InputSanitizer;

  private constructor() {}

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  sanitizeInput(input: string): string {
    return xss(input, {
      whiteList: {}, // No tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  sanitizeHTML(html: string): string {
    return xss(html, {
      whiteList: {
        p: ['class'],
        br: [],
        b: [],
        i: [],
        strong: [],
        em: [],
        h1: ['class'],
        h2: ['class'],
        h3: ['class'],
        h4: ['class'],
        h5: ['class'],
        h6: ['class'],
        ul: ['class'],
        ol: ['class'],
        li: ['class'],
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading']
      },
      css: false
    });
  }

  sanitizeObject<T extends object>(obj: T): T {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized as T;
  }
}
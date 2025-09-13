// Type definitions for gif.js
declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | null;
    dither?: boolean;
    debug?: boolean;
    repeat?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(imageElement: HTMLImageElement | HTMLCanvasElement, options?: { delay?: number; copy?: boolean; dispose?: number });
    on(event: string, callback: (data: any) => void): void;
    render(): void;
  }

  export default GIF;
}
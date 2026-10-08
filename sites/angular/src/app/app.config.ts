import { ApplicationConfig, Provider, provideBrowserGlobalErrorListeners } from '@angular/core';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Replaced at build time by `ng build --define` in package.json.
declare const BUNNY_OPTIMIZER: string;

// Off by default, so NgOptimizedImage uses its built-in loader and serves the original file.
const bunnyLoader: Provider = {
  provide: IMAGE_LOADER,
  useValue: ({ src, width }: ImageLoaderConfig) => {
    const url = new URL(src, 'http://localhost');
    if (width) url.searchParams.set('width', String(width));
    url.searchParams.set('quality', '75');
    return url.pathname + url.search;
  },
};

const optimizer = typeof BUNNY_OPTIMIZER !== 'undefined' && BUNNY_OPTIMIZER === 'true';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...(optimizer ? [bunnyLoader] : []),
  ],
};

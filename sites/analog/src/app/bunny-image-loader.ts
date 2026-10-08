import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { Provider } from '@angular/core';

// Bunny Optimizer resizes `?width=` requests at the edge. Off by default,
// so NgOptimizedImage keeps its built-in loader and serves the original file.
export const bunnyImageLoader: Provider[] =
  import.meta.env.VITE_BUNNY_OPTIMIZER === 'true'
    ? [
        {
          provide: IMAGE_LOADER,
          useValue: ({ src, width }: ImageLoaderConfig) =>
            `${src}?width=${width ?? 1280}&quality=75`,
        },
        { provide: IMAGE_CONFIG, useValue: { breakpoints: [640, 960, 1280, 1920] } },
      ]
    : [];

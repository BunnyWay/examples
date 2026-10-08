import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter } from '@analogjs/router';

import { bunnyImageLoader } from './bunny-image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideClientHydration(withEventReplay()),
    bunnyImageLoader,
  ],
};

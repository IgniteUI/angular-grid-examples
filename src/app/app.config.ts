import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { cacheInterceptor, skipOnServerInterceptor } from './cache.interceptor';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([cacheInterceptor, skipOnServerInterceptor]), withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(routes),
    // No `withEventReplay()`: in Angular 22 it keeps every element that gets a template listener after
    // hydration reachable for the life of the page (angular/angular#66506), and the grids re-create
    // their rows and cells on scrolling, filtering and tab switches.
    provideAnimations(), provideClientHydration(withNoIncrementalHydration()),
  ],
};

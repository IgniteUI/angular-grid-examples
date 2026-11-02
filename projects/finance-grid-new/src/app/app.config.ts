import { provideHttpClient, withXhr } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideClientHydration, withNoIncrementalHydration } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // No `withEventReplay()`: in Angular 22 it keeps every element that gets a
    // template listener after hydration reachable for the life of the page
    // (angular/angular#66506), and the grid re-creates its rows and cells on
    // every filter and layout change.
    provideClientHydration(withNoIncrementalHydration()),
    provideAnimations(),
    provideHttpClient(withXhr())
  ],
};

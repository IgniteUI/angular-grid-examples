import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideClientHydration, withNoIncrementalHydration } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // No `withEventReplay()`: in Angular 22 it keeps every element that gets a
    // template listener after hydration reachable for the life of the page
    // (angular/angular#66506), and the grid re-creates its rows, cells and
    // detail views on every scroll, filter and expand.
    provideClientHydration(withNoIncrementalHydration()),
    provideAnimations()
  ],
};

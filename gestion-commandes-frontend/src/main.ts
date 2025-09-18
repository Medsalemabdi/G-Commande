import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

const config = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations()
  ]
};

bootstrapApplication(AppComponent, config)
  .catch(err => console.error(err));


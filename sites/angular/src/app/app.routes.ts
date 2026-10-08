import { Routes } from '@angular/router';
import { Home } from './home';
import { About } from './about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
];

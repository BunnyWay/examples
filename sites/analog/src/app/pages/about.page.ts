import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  template: `
    <h1>About</h1>
    <p><a routerLink="/">Home</a></p>
  `,
})
export default class About {}

import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage],
  template: `
    <h1>Angular on Bunny Storage</h1>
    <p>With Bunny Optimizer on, each width in this image's srcset is resized at the edge.</p>
    <img ngSrc="/images/hero.png" width="1737" height="893" sizes="100vw" priority alt="A bunny watching a machine turn HTML into Markdown" />
  `,
})
export class Home {}

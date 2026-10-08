import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <h1>Analog on Bunny Storage</h1>
    <p><a routerLink="/about">About</a></p>
    <img ngSrc="/images/hero.png" width="1737" height="893" sizes="100vw" alt="A bunny watching a machine turn HTML into Markdown" />
  `,
})
export default class Home {}

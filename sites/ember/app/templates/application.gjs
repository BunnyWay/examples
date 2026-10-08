import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';

<template>
  {{pageTitle "Ember on Bunny Storage"}}
  <nav>
    <LinkTo @route="index">Home</LinkTo>
    <LinkTo @route="about">About</LinkTo>
  </nav>

  {{outlet}}
</template>

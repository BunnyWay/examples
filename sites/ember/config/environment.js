'use strict';

module.exports = function (environment) {
  return {
    modulePrefix: 'my-app',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {},
    },
    APP: {},
  };
};

import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_BUNNY_OPTIMIZER: {
		public: true,
		static: true,
		description: 'Set to "true" to serve images through Bunny Optimizer',
		schema: (value) => value === 'true'
	}
});

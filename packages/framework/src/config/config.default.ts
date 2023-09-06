import { defineConfig } from '../common/define.config';

export default defineConfig(() => {
  return {
    logger: {},
    state: {
      name: 'state',
      defaults: {
        theme: 'default',
      },
    },
  };
});

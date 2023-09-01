import { IConfig } from '../interface/config';

export default (): IConfig => {
  return {
    logger: {},
    state: {
      name: 'state',
      defaults: {
        theme: 'default',
      },
    },
  } as IConfig;
};

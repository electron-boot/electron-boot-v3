import { type Plugin } from 'vite';
export interface ElectronOptions {
    main: {
        entry: string;
        watch?: string[];
    };
}
export default function electron(options: ElectronOptions): Plugin[];

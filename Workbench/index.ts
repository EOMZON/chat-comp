import dynamic from 'next/dynamic';

export default dynamic(() => import('./Workbench'), { ssr: false });

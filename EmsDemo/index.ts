import dynamic from 'next/dynamic';

export default dynamic(() => import('./EmsDemo'), { ssr: false });

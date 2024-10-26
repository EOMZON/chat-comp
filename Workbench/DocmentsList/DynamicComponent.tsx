import { Input, Button } from 'antd';
import InputComponent from './comps/InputComponent';
import DisplayComponent from './comps/DisplayComponent';
import LoadingComponent from './comps/LoadingComponent';
import { infoConfig } from './infoConfig';

interface DynamicComponentProps {
  type: 'input' | 'display' | 'loading';
  infoConfig?: {
    label: string;
    placeholder: string;
  }[];
  title?: string;
  onButtonClick?: () => void;
}

export const DynamicComponent: React.FC<DynamicComponentProps> = ({
  type,
  title,
  onButtonClick,
}) => {
  const inputValues = JSON.parse(localStorage.getItem('inputValues') || '{}');
  console.log(inputValues);
  switch (type) {
    case 'input':
      return <InputComponent infoConfig={infoConfig} onButtonClick={onButtonClick} />;
    case 'display':
      return <DisplayComponent title={title || ''} inputValues={inputValues} />;
    case 'loading':
      return <LoadingComponent />;
    default:
      return <div>暂无内容</div>;
  }
};

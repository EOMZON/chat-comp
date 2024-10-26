import React, { useState } from 'react';
import { Input } from 'antd'; // 请替换为你实际使用的UI库
import { FileCard } from './FileCard';

interface InputComponentProps {
  infoConfig: any;
  onChange?: (value: string) => void;
  info?: string;
  onButtonClick?: () => void;
}

const InputComponent: React.FC<InputComponentProps> = ({
  info,
  infoConfig,
  onChange,
  onButtonClick,
}) => {
  // console.log(infoConfig);

  // 使用useState钩子来存储输入值
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // 更新状态中的值
    setInputValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
    // 如果提供了onChange函数，则调用它
    if (onChange) {
      onChange(value);
    }
  };

  const handleConfirm = () => {
    console.log(inputValues);
    onButtonClick && onButtonClick();
    localStorage.setItem('inputValues', JSON.stringify(inputValues));
  };

  return (
    <FileCard info={info} onButtonClick={handleConfirm}>
      {infoConfig.map((item: any, index: any) => {
        return (
          <div key={index}>
            <div className="align-center mt-[12px] flex w-[100%] items-center gap-[8px]">
              <div className="w-[70px] text-[12px]">{item.label} :</div>
              {item.inputType === 'area' ? (
                <div className="flex w-[100%] items-center gap-[10px]">
                  <Input
                    placeholder={item.placeholder}
                    className=" text-[gray]"
                    value={inputValues[index] || ''}
                    onChange={(event) => handleInputChange(index, event)}
                  />
                  <span>m²</span>
                </div>
              ) : (
                <Input
                  placeholder={item.placeholder}
                  className="w-[100%] text-[gray]"
                  value={inputValues[index] || ''}
                  onChange={(event) => handleInputChange(index, event)}
                />
              )}
            </div>
          </div>
        );
      })}
    </FileCard>
  );
};

export default InputComponent;

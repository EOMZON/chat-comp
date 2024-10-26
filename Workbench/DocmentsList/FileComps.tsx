import React, { useState } from 'react';
import { DynamicComponent } from './DynamicComponent';

export const FileComps = () => {
  const [componentType, setComponentType] = useState<'input' | 'loading' | 'display'>('input');

  const handleStartLoad = () => {
    setComponentType('loading');
    // 模拟异步操作，例如数据加载
    setTimeout(() => {
      setComponentType('display');
    }, 3000); // 3秒后显示展示组件
  };

  return (
    <div className="flex flex-col gap-4">
      {componentType === 'input' && (
        <DynamicComponent
          type="input"
          onButtonClick={handleStartLoad} // 将按钮点击事件传递给输入组件
        />
      )}
      {componentType === 'loading' && <DynamicComponent type="loading" />}
      {componentType === 'display' && <DynamicComponent type="display" />}
      {/* <DynamicComponent type="loading" /> */}
      {/* <DynamicComponent type="display" /> */}
    </div>
  );
};

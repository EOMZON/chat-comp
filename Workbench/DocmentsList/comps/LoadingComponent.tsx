import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import { FileCard } from './FileCard';

const LoadingComponent: React.FC = () => {
  // 进度条的当前进度状态
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // 模拟进度条从0到100的过程
    const interval = setInterval(() => {
      if (percent < 100) {
        setPercent((prevPercent) => prevPercent + 20);
      } else {
        clearInterval(interval);
      }
    }, 1000); // 每秒更新一次进度

    return () => {
      // 组件卸载时清除定时器
      clearInterval(interval);
    };
  }, [percent]);

  return (
    <FileCard buttonText="取消" info="正在加载，请稍后...">
      {/* 进度条组件，隐藏数字 */}
      <div className="mx-auto w-[90%]">
        <Progress percent={percent} strokeColor="#BDCBFF" strokeWidth={20} showInfo={false} />
      </div>
    </FileCard>
  );
};

export default LoadingComponent;

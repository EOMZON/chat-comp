import React from 'react';
import { FileCard } from './FileCard';

interface DisplayComponentProps {
  title: string;
  info?: string;
  inputValues?: any;
}

const DisplayComponent: React.FC<DisplayComponentProps> = ({ title, info, inputValues }) => {
  const filePath = '/documents/中鑫新能源光储项目合作方案.pdf';
  const fileName = '中鑫新能源光储项目合作方案.pdf';
  const handleDownload = () => {
    // 创建一个隐藏的 <a> 元素
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;

    // 将链接添加到文档中
    document.body.appendChild(link);

    // 模拟点击链接
    link.click();

    // 清理：从文档中移除链接
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open(filePath, '_blank');
  };

  console.log(inputValues);

  return (
    <FileCard
      buttonText="下载"
      info={'已成功生成报告, 请点击查看:'}
      onButtonClick={handleDownload}
      noButton={true}
    >
      <div className=" mt-2  flex cursor-pointer flex-col  gap-6   text-start">
        <div className="m-2 flex h-[50px] items-center justify-center rounded-lg bg-[#ffffff]">
          <p
            className="cursor-pointer  text-wrap text-[13px] font-bold text-[#4769b2] hover:underline"
            onClick={handlePreview}
            style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.5' }}
          >
            《{inputValues[0]}光伏项目建议书》
          </p>
        </div>
        <p className=" mb-2 text-[12px] text-[#c2c2c2]">生成时间： 2024年10月22日 9:55</p>
      </div>
    </FileCard>
  );
};

export default DisplayComponent;

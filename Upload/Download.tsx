import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface DownloadProps {
  filePath?: string;
  fileName?: string;
}

const Download: React.FC<DownloadProps> = () => {
  const filePath = '/documents/demo.pptx';
  const fileName = '苏州某园区光伏项目建议书.pptx';
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

  return (
    <Button icon={<DownloadOutlined />} onClick={handleDownload}>
      下载 PPT
    </Button>
  );
};

export default Download;

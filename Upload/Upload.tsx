import React, { useState } from 'react';
import { Upload, message, Button } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadSuccess: (file: UploadFile, imageUrl: string) => void;
  userInfo: any;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, userInfo }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('您只能上传 JPG/PNG 图片文件');
    }

    return isJpgOrPng;
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      // 生成预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        console.log(reader, imageUrl);

        setPreviewUrl(imageUrl);

        onUploadSuccess(info.file, imageUrl);
      };
      reader.readAsDataURL(info.file.originFileObj as Blob);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  const uploadButton = (
    <div
      style={{
        position: 'absolute', // 设置为绝对定位
        bottom: 20, // 距离容器底部的位置
        left: 0, // 距离容器左边的位置
        right: 0, // 距离容器右边的位置
        margin: 'auto', // 平均分配剩余空间
        display: 'flex', // 使用flex布局
        justifyContent: 'center', // 水平居中
        alignItems: 'center', // 垂直居中
      }}
    >
      <Button icon={<UploadOutlined />}>更换展示背景</Button>
    </div>
  );

  return (
    <div>
      <Upload listType="text" maxCount={1} beforeUpload={beforeUpload} onChange={handleChange}>
        {previewUrl ? null : uploadButton}
      </Upload>
      {previewUrl && (
        <div
          style={{
            position: 'absolute', // 设置为绝对定位
            top: 0, // 从顶部开始
            left: 0, // 从左边开始
            right: 0, // 延伸到右边
            bottom: 0, // 延伸到底部
            zIndex: 1, // 确保在其他内容之上
          }}
        >
          <Image
            src={previewUrl}
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
            unoptimized
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

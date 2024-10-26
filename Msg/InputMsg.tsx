import { Input, InputNumber, Button } from 'antd';
import { groupedInfoConfig } from '../Chat/mock/dataInfo/groupedInfoConfig';
import { useState } from 'react';
import { useInputStore } from '@/store/inputStore';
interface FormData {
  [key: string]: string[];
}

// 主组件
const InputMsg = () => {
  // 创建一个状态来存储输入的数据
  const [formData, setFormData] = useState<FormData>({});
  const { setInputText } = useInputStore();

  // 处理输入变化的函数
  const handleInputChange = (e: any, category: any, field: any) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
      },
    });
  };

  // 处理确定按钮点击的函数
  const handleConfirm = () => {
    // 构建打印的数据结构
    const printedData = Object.entries(formData)
      .map(([section, data]) => {
        return [
          // `- ${section}`,
          ...Object.entries(data).map(([field, value]) => `- ${field}：${value}`),
        ];
      })
      .flat();

    const message = printedData.join('\n');

    // 打印结果
    console.log(message);

    const messageGeneratePrompt = '请根据以下信息生成光伏项目建议书：\n' + message;

    // 使用 setInputText 设置输入框的文本
    setInputText(messageGeneratePrompt);

    // 清空表单数据
    setFormData({});
    // 这里可以进行后续的操作，比如发送数据到后端

    // 构建后端需要的数据结构
    const backendData = Object.entries(formData).flatMap(([section, data]) => {
      return Object.entries(data).map(([field, value]) => ({
        key: field,
        value: value,
        type: section,
      }));
    });

    // 打印后端需要的数据结构
    console.log(backendData);
  };
  return (
    <div>
      <div
        className="mt-[12px] border-t border-[#c8c8e3] leading-[0.3] dark:border-[#106399]"
        data-tag="Analysis Process"
      >
        {Object.entries(groupedInfoConfig).map(([key, { label, data }], index) => (
          <div
            key={index}
            className="mt-[12px] flex flex-col gap-[12px]  rounded-[8px] bg-[#dbe4fd] p-[12px]"
          >
            <div className="mt-[8px]  font-bold">{label}</div>
            {data.map((item, subIndex) => (
              <div key={subIndex} className="align-center flex w-[100%] items-center gap-[8px]">
                <div className="w-[90px] text-[12px]">
                  {item.label} <span className="text-[#b85454]">* </span>:
                </div>
                <Input
                  className="text-[gray]"
                  onChange={(e) => handleInputChange(e, key, item.label)}
                />
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-end">
          <Button className="mt-[12px] flex justify-end " onClick={handleConfirm}>
            确定信息 生成报告
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputMsg;

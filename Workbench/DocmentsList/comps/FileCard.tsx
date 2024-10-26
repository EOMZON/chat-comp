import { Button } from 'antd';
export const FileCard: React.FC<{
  children: React.ReactNode;
  buttonText?: string;
  num?: number;
  title?: string;
  info?: string;
  onButtonClick?: () => void;
  noButton?: boolean;
}> = ({ children, buttonText, num, title, info, onButtonClick, noButton }) => {
  return (
    <div className=" rounded-lg  bg-[#f9fafd]  p-4 shadow-sm ">
      <div className="ml-4 mt-2 text-start ">
        <div className="text-[14px] font-bold text-[#333]">{title || '光伏项目建议书'}</div>
        <div className="mb-2 mt-1 w-[100%]  text-[12px] text-[gray] ">
          {info || '请在下方输入必填项后，点击确定按钮生成报告'}
        </div>
      </div>

      {/* TODO: 这里的宽度要根据实际长度自适应 目前超长会出现错误的样式 */}
      <div
        className="ml-4  mt-[12px] flex  w-[90%] flex-col align-top leading-[0.3]"
        data-tag="展示内容"
      >
        {children}
      </div>
      {!noButton && (
        <div className="flex justify-end">
          <Button className="mt-[12px] flex justify-end " onClick={onButtonClick}>
            {buttonText || '确定'}
          </Button>
        </div>
      )}
    </div>
  );
};

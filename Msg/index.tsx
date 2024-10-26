import react, { memo, useCallback } from 'react';
import type { MessageProps } from '@/libs/chatui';
import { Bubble } from '@/libs/chatui';
import { FEEDBACK_TYPE } from '@/services/feedback';
import { Popconfirm, Collapse, ConfigProvider, Spin, Input } from 'antd';
import { isLocalMsgID, parseJSON } from '@/utils';
import { msgStringToArr, msgContentStringToArr } from '@/utils/v1/msg';

import { CheckCircleOutlined, CaretRightOutlined, LoadingOutlined } from '@ant-design/icons';
import FucBar from './MsgFucBar';
import MsgChart from '@/components/common/Charts';
import MsgTable from '@/components/common/Table';
import MsgMarkdown from '@/components/common/Markdown';
import { chartsStore, conversationStore } from '@/store';
import InputMsg from './InputMsg';

const ContentToDom = memo(function ContentToDom({
  attrJSON,
  text,
  _key,
  msg,
}: {
  attrJSON: any[];
  text: string;
  _key: string;
  msg: MessageProps;
}) {
  const _conversationStore = conversationStore();
  const _chartsStore = chartsStore();

  const onPined = useCallback(
    async (callback: (isSuccess: boolean) => void) => {
      const contentId = attrJSON[1];
      const isSuccess = await _chartsStore.handleAdd(
        contentId, // content_id
        msg._id,
        _conversationStore.currentConversation.conversation_id as string,
      );
      callback?.(isSuccess);
    },
    [attrJSON, msg],
  );

  // console.log('======attrJSON:', attrJSON, text);
  switch (attrJSON[0]) {
    case 'text':
      return <MsgMarkdown key={_key} text={text} />;
    case 'chart':
      // 渲染 chart 时 要打开工作台
      // toggleWorkbench(true)
      return (
        <div key={_key} className="px-[20px]] my-[10px] overflow-x-auto rounded-md bg-[#fff]">
          <MsgChart
            from="chat"
            contentId={attrJSON[1]}
            echartsOptionsString={text}
            pined={attrJSON[2]}
            onPined={onPined}
          />
        </div>
      );
    case 'table':
    case 'addtion_table':
      return (
        <div key={_key} className="my-[5px] overflow-x-auto rounded-md">
          <MsgTable
            from="chat"
            contentType={attrJSON[0]}
            contentId={attrJSON[1]}
            dataString={text}
            pined={attrJSON[2]}
            onPined={onPined}
          />
        </div>
      );
    case 'placeholder':
      return (
        <span className="mt-[10px] block text-[gray]" key={_key}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} /> {text}
        </span>
      );
    default:
      return <span key={_key}>{text}</span>;
  }
});
interface MessageContentProps {
  msg: MessageProps;
  isTyping: boolean;
  // eslint-disable-next-line no-unused-vars
  updateMsgCheck: (_msg: MessageProps, _checked: boolean) => void;
  updateMsgShowTime: (_msg: MessageProps, show: boolean) => void;
}

export default memo(function MessageContent(props: MessageContentProps) {
  const { msg, isTyping, updateMsgCheck, updateMsgShowTime } = props;
  // console.log('renderMessageContent msg:', msg, ' isTyping:', isTyping);

  const isReceivedMsg = msg.position === 'left';

  const analysis_fold = msg.analysis_fold ? undefined : ['1'];

  const handlerCollapse = (key: string | string[]) => {
    console.log(key);
  };

  return (
    <Bubble
      content={
        <div
          className="group relative flex items-center "
          onMouseEnter={() => updateMsgShowTime(msg, true)}
          onMouseLeave={() => updateMsgShowTime(msg, false)}
        >
          <div className="relative flex items-center overflow-hidden">
            <Popconfirm
              data-tag="赞踩收藏"
              trigger="hover"
              zIndex={isTyping || !msg.content?.text || isLocalMsgID(msg._id) ? -1 : 1}
              overlayInnerStyle={{ padding: 0 }}
              mouseEnterDelay={0.4}
              title={
                <div className="px-[10px] py-[5px]">
                  <FucBar
                    msgID={msg._id}
                    onlyStar={!isReceivedMsg}
                    onLikeClick={() => {}}
                    onDislikeClick={() => {}}
                    onStarClick={() => {}}
                    likeActive={msg.feedback_type === FEEDBACK_TYPE.THUMB_UP}
                    dislikeActive={msg.feedback_type === FEEDBACK_TYPE.THUMB_DOWN}
                    starActive={!!msg.favorite_time}
                  />
                </div>
              }
              placement="bottomRight"
              showCancel={false}
              showArrow={false}
              okButtonProps={{ style: { display: 'none' } }}
              icon={null}
            >
              <div className="min-h-[10px] min-w-[40px] max-w-full text-[12px] dark:text-white">
                {/* 对话消息的文字内容展示 */}
                {msg.content?.text ? (
                  msgStringToArr(msg.content.text).map((text, index) => {
                    const [attrJSONstring, content] = msgContentStringToArr(text);
                    const attrJSON = parseJSON(attrJSONstring);
                    // console.log('attrJSON:', attrJSON, content);
                    if (attrJSON) {
                      return isReceivedMsg ? (
                        <ContentToDom
                          attrJSON={attrJSON}
                          text={content}
                          _key={msg._id}
                          key={msg._id}
                          msg={msg}
                        />
                      ) : (
                        content
                      );
                    } else {
                      return null;
                    }
                  })
                ) : msg.content?.analysis_process ? (
                  <span className="text-[gray] dark:text-[#fef7f7c2]">分析中......</span>
                ) : null}
                {/* 分析过程 */}
                {isReceivedMsg && msg.content?.analysis_process ? (
                  // <div
                  //   className="mt-[12px] border-t border-[#c8c8e3] leading-[0.3] dark:border-[#106399]"
                  //   data-tag="分析过程"
                  // >
                  //   <ConfigProvider
                  //     theme={{
                  //       components: {
                  //         Collapse: {
                  //           headerPadding: '4px',
                  //           contentPadding: 0,
                  //           headerBg: '#fff',
                  //         },
                  //       },
                  //     }}
                  //   >
                  //     <Collapse
                  //       ghost
                  //       destroyInactivePanel
                  //       activeKey={analysis_fold}
                  //       onChange={handlerCollapse}
                  //       expandIconPosition="start"
                  //       expandIcon={({ isActive }) => (
                  //         <CaretRightOutlined
                  //           className="!text-blue-600"
                  //           rotate={isActive ? 90 : 0}
                  //         />
                  //       )}
                  //       items={[
                  //         {
                  //           key: '1',
                  //           label: (
                  //             <span className="text-xs font-bold text-blue-600 dark:text-[#007EFF]">
                  //               【分析过程】
                  //             </span>
                  //           ),
                  //           children: (
                  //             <div className="text-[12px]">
                  //               <MsgMarkdown text={msg.content.analysis_process} />
                  //               {/* <MsgChart /> */}
                  //             </div>
                  //           ),
                  //         },
                  //       ]}
                  //     ></Collapse>
                  //   </ConfigProvider>
                  // </div>
                  // <InputMsg />
                  <></>
                ) : null}
              </div>
            </Popconfirm>
          </div>
          {isTyping || !msg.content?.text || isLocalMsgID(msg._id) ? null : (
            <div
              data-tag="消息选中按钮"
              className={`absolute ${
                isReceivedMsg ? '-right-[40px] justify-end' : '-left-[40px] justify-start'
              }  flex h-full w-[40px] items-center`}
            >
              {/* 对话框中的对话气泡选择框 */}
              <CheckCircleOutlined
                onClick={() => {
                  updateMsgCheck(msg, !msg.checked);
                }}
                className={`cursor-pointer text-[16px]  ${
                  msg.checked
                    ? '!text-[#2F59F0] dark:!text-[#009BFF]'
                    : '!text-[#E3E5ED] group-hover:!text-[#2f59f05e] dark:!text-[#0E527E] dark:group-hover:!text-[#009BFF5e]'
                }`}
              />
            </div>
          )}
        </div>
      }
    />
  );
});

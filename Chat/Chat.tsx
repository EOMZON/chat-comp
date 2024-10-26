import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { App, Tooltip } from 'antd';
import { useRouter } from 'next/router';
import { Resizable } from 're-resizable';
import { setWorkbenchActiveKey, ActiveKey } from '@/store/workbench';
import { loadChartsList } from '@/store/charts';
import { ShareAltOutlined, ProductOutlined, CloseOutlined } from '@ant-design/icons';
import Chat, { useMessages } from '@/libs/chatui';
import type { QuickReplyItemProps, MessageProps } from '@/libs/chatui';
import type { ComposerHandle } from '@/libs/chatui/components/Composer';
import { mockCreateMsg, mockGetConversationDetailApi } from './mock/mockApi';
import { useInputStore } from '@/store/inputStore';
import WordTyping from './wordTyping';

import {
  isInIframe,
  onParentMsg,
  businessLoginCallback,
  businessLogoutCallback,
  toggleWorkbench,
  chatStartOnMsg,
} from '@/utils/v1/iframeMessage';
import { msgArrToString, msgSingleContentToString } from '@/utils/v1/msg';
import { getLocalMsgID, parseJSON } from '@/utils';
import { log } from '@/utils/v1/log';

import { userStore, conversationStore, workbenchStore } from '@/store';
import { login, loginV1, logout } from '@/services/auth';
import { MESSAGE_TYPE, createMsg, STOP_FLAG } from '@/services/conversations';

import Workbench from '@/components/Workbench';
import UserPanel from './Modals/UserInfoModal';
import LoginModal from './Modals/LoginModal';
import ShareModal from './Modals/ShareModal';
import MessageContent from '@/components/Msg';
import MsgTail from '@/components/Msg/MsgTail';

const robotAvatar = '/assets/logo.png';
const userAvatar = '/assets/user.jpg';

export default function App1() {
  const _userStore = userStore();
  const _conversationStore = conversationStore();
  const _workbenchStore = workbenchStore();
  const { message } = App.useApp();

  const userConfig = _userStore.userConfig;

  const router = useRouter();
  const modelType = router.query.t as string;

  const { messages, appendMsg, updateMsg, deleteMsg, resetList } = useMessages([]);
  const { inputText, setInputText } = useInputStore();
  useEffect(() => {
    if (inputText) {
      chatRef.current?.setText(inputText);
      setInputText(''); // 清空 store 中的文本
    }
  }, [inputText, setInputText]);

  const [shareModalShow, setShareModalShow] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  // 快捷短语
  // const [guideList, setGuideList] = useState<QuickReplyItemProps[]>([]);

  const controller = useRef<AbortController | null>(null);

  // 回复是否结束
  const isRepFinish = useRef(true);

  const currentReceiveMsgID = useRef('');
  const currentSendMsgID = useRef('');
  const hasReceivedMsg = useRef(false);

  const chatRef = useRef<ComposerHandle>(null);

  const analysisRef = useRef<any>(null);
  const analysisContentRef = useRef<any>(''); // 这里用来暂存分析过程内容，在对话渲染结束时，再渲染一次。因为对话接口，存在对话完成后，分析过程会动态变化的情况
  const answerRef = useRef<any>(null);

  const messagesListRef = useRef<MessageProps[]>([]);
  const messagesContainerRef = useRef<any>(null);

  const notLogin = !_userStore.user;

  // 消息更新
  const MsgTool = useMemo(
    () => ({
      /** 发送消息 */
      appendSendMsg: (msgID: string, content: string) => {
        appendMsg({
          _id: msgID,
          type: 'text',
          content: { text: msgSingleContentToString(content) },
          user: { avatar: userAvatar },
          position: 'right',
        });
      },
      /** 接收消息 */
      appendTypingMsg: (msgID: string) => {
        appendMsg({
          _id: msgID,
          type: 'typing',
          user: { avatar: robotAvatar },
        });
      },
      /** 更新消息 */
      updateCurrentMsg: ({
        msgID = currentReceiveMsgID.current,
        newMsgID = '',
        content = '',
        type = 'text',
        analysis_process,
        expert_agents = [],
        analysis_fold,
      }: {
        msgID?: string;
        newMsgID?: string;
        content?: string;
        analysis_process?: string;
        type?: 'text' | 'table';
        expert_agents?: string[];
        analysis_fold?: boolean;
      }) => {
        const msg = messagesListRef.current.find((item) => item._id === msgID);

        if (!msg) {
          message.error(`消息 id: ${msgID} 不存在.`);
          return;
        }
        msg.content = msg.content || { text: '' };

        if (newMsgID) {
          msg._id = newMsgID;
          hasReceivedMsg.current = true;
        }

        if (content) {
          msg.content.text = content;
        }

        if (analysis_process) {
          msg.content.analysis_process = analysis_process;
        }

        if (type) {
          msg.type = type;
        }

        if (expert_agents) {
          msg.expert_agents = expert_agents;
        }

        if (typeof analysis_fold === 'boolean') {
          console.warn(`更新折叠状态：`, analysis_fold);
          msg.analysis_fold = analysis_fold;
        }

        updateMsg(msgID, {
          ...msg,
        });
      },
      updateMsgCheck: (msg: MessageProps, checked: boolean) => {
        updateMsg(msg._id, {
          ...msg,
          checked: checked,
        });
      },
      updateMsgShowTime: (msg: MessageProps, show: boolean) => {
        // updateMsg(msg._id, {
        //   ...msg,
        //   hasTime: show,
        // });
      },
      getLatestMsgContent() {
        return messagesListRef.current[messagesListRef.current.length - 1]?.content?.text;
      },
      deleteMsg(msgID: string = currentReceiveMsgID.current) {
        deleteMsg(msgID);
      },
      resetMsgList(list?: MessageProps[]) {
        resetList(list as any);
      },
    }),
    [],
  );

  const quickReplies = useMemo(() => {
    const quickArray = userConfig?.guide_questions;
    quickArray?.includes('光伏项目建议书') || quickArray?.unshift('光伏项目建议书');
    return quickArray
      ?.filter((item) => item && item.trim())
      .map((item, index) => {
        console.log('userConfig item-------------------------->', item, index);

        return { name: item, key: index };
      });
  }, [userConfig?.guide_questions]);

  const handleMsgCheckClick = useCallback(async () => {
    if (!canShare) return;
    const msgs = messagesListRef.current.filter((msg) => msg.checked);
    console.log(msgs);
    setShareModalShow(true);
  }, [messagesListRef.current]);

  const handleShareModalCancel = useCallback(async () => {
    setShareModalShow(false);
    setCanShare(false);
    messagesListRef.current.forEach((msg) => {
      MsgTool.updateMsgCheck(msg, false);
    });
  }, [messagesListRef.current]);

  const renderMessageContent = useCallback((msg: MessageProps) => {
    return (
      <MessageContent
        msg={msg}
        key={msg._id}
        isTyping={sendButtonDisabled}
        updateMsgCheck={MsgTool.updateMsgCheck}
        updateMsgShowTime={MsgTool.updateMsgShowTime}
      />
    );
  }, []);

  const renderMessageTail = useCallback((msg: MessageProps) => <MsgTail {...msg} />, []);

  // 停止回复
  const stopGen = useCallback(() => {
    console.warn(`消息打断`);
    if (!isRepFinish.current) {
      isRepFinish.current = true;
      controller.current?.abort('手动终止请求');
    }

    setSendButtonDisabled(false);

    answerRef.current?.destroy(false);
    analysisRef.current?.destroy(false);
  }, []);

  // 收藏列表点击消息回填的回调
  function onFavoriteMsgToInput(msg: string) {
    chatRef.current?.setText(msg);
  }

  // 发送按钮逻辑
  const handleSend = useCallback(async (type: string, val: string) => {
    console.warn('发送消息');
    if (sendButtonDisabled) return;

    // if (notLogin) {
    //   return message.error(`请先登录`);
    // }

    setSendButtonDisabled(true);

    messagesContainerRef.current.scrollToEnd({ animated: true, force: true });

    isRepFinish.current = false;
    if (type === 'text' && val.trim()) {
      // 先设置一个唯一的msgID
      currentReceiveMsgID.current = getLocalMsgID();
      currentSendMsgID.current = getLocalMsgID();

      MsgTool.appendSendMsg(currentSendMsgID.current, val);

      MsgTool.appendTypingMsg(currentReceiveMsgID.current);

      try {
        if (controller.current) {
          controller.current.abort();
        }

        analysisRef.current = new WordTyping('analysisRef', (content, isDone) => {
          console.log('analysisRef----------------------->', isDone);

          if (isDone) {
            console.warn(`分析过程-打字结束`);
            // 分析过程结束 则折叠
            MsgTool.updateCurrentMsg({
              analysis_fold: true,
              analysis_process: content,
            });

            // 开始打字渲染结果
            answerRef.current.start();
          } else {
            MsgTool.updateCurrentMsg({
              analysis_process: content,
            });
          }
        });
        answerRef.current = new WordTyping(
          'answerRef',
          (content, isDone, expertAgents, contentId) => {
            console.log('answerRef----------------------->', isDone);

            if (isDone) {
              // 全部打字完成
              // console.warn(`全部-打字结束`, content, expertAgents, contentId);
              setSendButtonDisabled(false);

              // 最后再渲染一次分析过程 解决分析过程后来会发生变化的情况
              if (analysisContentRef.current) {
                MsgTool.updateCurrentMsg({
                  analysis_process: analysisContentRef.current,
                });
                analysisContentRef.current = '';
              }

              // 有尾标 - 专家智能体
              if (expertAgents?.length) {
                MsgTool.updateCurrentMsg({
                  expert_agents: expertAgents,
                  content,
                });
              }
              _conversationStore.refreshCurrentConversationTitle();

              // 激活高亮工作台
              if (contentId) {
                // 临时在这里激活工作台
                setWorkbenchActiveKey(ActiveKey.CHART_LIST);
                loadChartsList(true, contentId);
                setTimeout(() => {
                  toggleWorkbench(true);
                }, 400);
              }
            } else {
              MsgTool.updateCurrentMsg({
                content,
              });
            }
          },
        );
        const project = parseJSON(localStorage.getItem('__extdata__') || '');

        mockCreateMsg(val, project, String(modelType).slice(0, 10), (data: any, ctl: any) => {
          controller.current = ctl;
          toggleWorkbench(!_workbenchStore.opened);

          if (data?.code === 200) {
            if (data.data === null) {
              console.log('data.data === null', data, data.msg);

              // 消息接收完毕
              if (data.msg === STOP_FLAG) {
                console.warn('接收远程消息完毕');
                answerRef.current.updateContent({ isLast: true });
                analysisRef.current.updateContent({ isLast: true });
                isRepFinish.current = true;
              }
            } else {
              console.log('data.data !== null');

              const msgData = data.data;

              // console.log(
              //   msgData,
              //   msgData.message_id !== currentReceiveMsgID.current,
              //   msgData.message_id,
              //   msgData.question_id !== currentSendMsgID.current,
              //   msgData.question_id,
              //   answerRef,
              // );

              // 更新本地初始的 消息 id
              if (msgData.message_id && msgData.message_id !== currentReceiveMsgID.current) {
                console.warn('更新消息receive id:', msgData.message_id);
                MsgTool.updateCurrentMsg({
                  msgID: currentReceiveMsgID.current,
                  newMsgID: msgData.message_id,
                });
                currentReceiveMsgID.current = msgData.message_id;
              }
              if (msgData.question_id && msgData.question_id !== currentSendMsgID.current) {
                console.warn('更新消息send id:', msgData.question_id);
                MsgTool.updateCurrentMsg({
                  msgID: currentSendMsgID.current,
                  newMsgID: msgData.question_id,
                });
                currentSendMsgID.current = msgData.question_id;
              }

              console.log(msgData.expert_agents, msgData.analysis_process, !msgData.contents);

              // 更新角标
              if (msgData.expert_agents) {
                answerRef.current.updateContent({ expertAgents: msgData.expert_agents });
              }

              // 更新分析过程
              if (msgData.analysis_process && !msgData.contents) {
                analysisRef.current.updateContent({ content: msgData.analysis_process });
                // 直接开始打字渲染
                analysisRef.current.start();
              } else if (msgData.contents) {
                // 暂存分析过程 用在最后再次渲染一次
                analysisContentRef.current = msgData.analysis_process;

                // 更新结果
                analysisRef.current.updateContent({ isLast: true });
                answerRef.current.updateContent({ content: msgArrToString(msgData.contents) });
                if (!msgData.analysis_process) {
                  // 没有分析过程 直接打字渲染
                  answerRef.current.start();
                }
              }
            }
          } else {
            console.error(`消息接收异常：`, data);
            if (data.code === 401) {
              // message.error(`${data?.msg}`);
            } else {
              message.error(`消息异常: ${data?.msg}`);
            }

            MsgTool.deleteMsg();
            setSendButtonDisabled(false);

            analysisRef.current.destroy();
            answerRef.current.destroy();

            // _conversationStore.refreshCurrentConversation();
          }
        });
      } catch (error) {
        console.error('请求失败:', error);
        setSendButtonDisabled(false);
        isRepFinish.current = true;
      }
    }
  }, []);

  // 监听当前会话更新
  useEffect(() => {
    // 停止正在进行的会话
    stopGen();

    const msgs: MessageProps[] =
      _conversationStore.currentConversation.message_details?.map((detail) => {
        return {
          _id: detail.message_id,
          type: 'text',
          content: {
            text: msgArrToString(detail.contents),
            analysis_process: detail.analysis_process,
          },
          analysis_fold: true,
          user: {
            avatar: detail.message_type === MESSAGE_TYPE.ANSWER ? robotAvatar : userAvatar,
          },
          favorite_time: detail.favorite_time,
          feedback_type: detail.feedback_type,
          expert_agents: detail.expert_agents ? detail.expert_agents : [],
          position: detail.message_type === MESSAGE_TYPE.ANSWER ? 'left' : 'right',
        };
      }) || [];

    // console.log('msgs:', msgs);
    MsgTool.resetMsgList(msgs);

    setTimeout(() => {
      messagesContainerRef.current.scrollToEnd({ animated: false, force: true });
    }, 200);
  }, [_conversationStore.currentConversation]);

  useEffect(() => {
    messagesListRef.current = messages;

    setCanShare(!!messages.find((msg) => msg.checked));
  }, [messages]);

  useEffect(() => {
    if (notLogin) {
      MsgTool.resetMsgList();
    }
  }, [_userStore.user]);

  useEffect(() => {
    _conversationStore.loadConversationList().then(async (list) => {
      // 激活新一个会话

      if (list?.[0]) {
        _conversationStore.refreshCurrentConversation(list[0].conversation_id);
      } else {
        _conversationStore.refreshCurrentConversation('', true).then((res: any) => {
          if (res === true) {
            message.success('创建会话成功');
          } else {
            // message.error(`创建会话失败${res ? ':' + res : ''}`);
          }
        });
      }
    });

    // 初始化缓存租户信息 后面login 接口传参需要用到
    // _tenantStore.loadTenant();

    return () => {};
  }, []);

  useEffect(() => {
    const messageFun = async (event: MessageEvent) => {
      // 处理接收到的父页面(业务页面)消息
      switch (event.data.type) {
        case 'toggleWorkbench':
          // 工作台开关逻辑： {chat ->} parent -> chat
          log('onmessage - toggleWorkbench:', event.data);
          _workbenchStore.toogleOpened(!!event.data.msg);
          break;
        case 'login':
          log('onmessage -  login:', event.data);
          const { bid, userToken, access_token, auth_type } = JSON.parse(event.data.msg);
          let fetchRes = null;
          if (access_token) {
            fetchRes = await loginV1(access_token);
          } else {
            if (!userToken) {
              return console.error(`userToken 缺失`);
            }
            if (!bid) {
              return console.error(`bid 缺失`);
            }

            fetchRes = await login(bid, userToken, auth_type);
          }

          log(`业务初始化ecmas结果:`, JSON.stringify(fetchRes));
          let jssdkData = {};
          if (fetchRes.code === 200) {
            console.log('set-local');
            await _userStore.setUser(fetchRes.data);
            _userStore.setUserErrMsg(null);
            jssdkData = {
              name: fetchRes.data.nick_name || fetchRes.data.name,
              id: fetchRes.data.id,
              avatar: fetchRes.data.avatar,
            };
          } else {
            await _userStore.setUser(null);
            _userStore.setUserErrMsg(`${fetchRes.msg || '鉴权异常'}`);
          }

          businessLoginCallback(jssdkData, fetchRes.code, fetchRes.msg);

          setTimeout(() => {
            // 登录成功后 刷新下chat页面 触发初始化
            log('location.reload');
            location.reload();
          }, 50);

          break;
        case 'logout':
          log('onmessage - logout:', event.data);
          const res = await logout();
          if (res) {
            await _userStore.setUser(null);
            _userStore.setUserErrMsg(null);
            businessLogoutCallback(0, 'ok');
          }
          break;
        case 'extdata':
          log('onmessage - extdata:', event.data);
          if (event.data.msg) {
            const { project } = JSON.parse(event.data.msg);
            localStorage.setItem('__extdata__', JSON.stringify(project));
          }

          break;

        default:
          break;
      }
    };

    const msgDispose = onParentMsg(messageFun);

    // 告诉jssdk 我已经准备好接收消息
    chatStartOnMsg();

    return () => {
      msgDispose();
      controller.current?.abort();
    };
  }, []);

  // 快速回复
  function handleQuickReplyClick(item: QuickReplyItemProps) {
    handleSend('text', item.name);
  }

  return (
    <div className={`flex h-[100vh] w-full justify-end bg-[#F5F5F5] dark:bg-[#0C2637]`}>
      <div
        className={`absolute mr-[14px] w-[500px] overflow-hidden bg-white dark:bg-[#103751] ${_workbenchStore.opened ? 'left-0' : '-right-[1000px]'}`}
      >
        <Workbench />
      </div>
      <Resizable
        defaultSize={{
          width: isInIframe() ? '500px' : '100%',
          height: '100%',
        }}
        maxHeight="100%"
        minWidth="500px"
        enable={false}
        onResizeStart={(event) => {
          console.log('onResizeStart:', event);
        }}
        onResize={(event) => {
          console.log('onResize:', event);
        }}
        onResizeStop={(event) => {
          console.log('onResizeStop:', event);
        }}
        className={`relative shrink-0 bg-[black]`}
      >
        {sendButtonDisabled && (
          <div
            onClick={stopGen}
            className="absolute bottom-[106px] left-1/2 z-20 -ml-[40px] flex min-w-[64px] cursor-pointer items-center justify-around rounded-xl border border-solid border-[#ffd0bf] bg-[#ffffffed] px-2 py-1 text-center text-xs text-[#757373] hover:text-[#323131] dark:border-[#3399ff] dark:bg-[#113f5d] dark:text-[#f3eaea] dark:hover:text-white"
          >
            <CloseOutlined />
            停止
          </div>
        )}
        <Chat
          composerRef={chatRef}
          messagesRef={messagesContainerRef}
          navbar={{
            title: (
              <div className="h-[66px]">
                <div className="text-[18px]"> ECMAS能碳助手 </div>
                <div className="text-xs text-gray-500">
                  正在为您服务
                  {/* TODO: 20241011 在录制中鑫视频demo过程中先关闭开发环境标识，后续需要打开 */}
                  {/* {process.env.NODE_ENV === 'development' ? '（开发环境）' : ''} */}
                </div>
              </div>
            ),
            leftContent: {
              label: (
                <div className="px-[4px]">
                  <ProductOutlined
                    className={
                      _workbenchStore.opened
                        ? '!text-[#2F59F0] dark:!text-[#009BFF]'
                        : 'dark:!text-white'
                    }
                  />
                </div>
              ),
              size: 'md',
              onClick() {
                toggleWorkbench(!_workbenchStore.opened);
              },
            },
            rightContent: [
              {
                size: 'md',
                label: (
                  <div
                    className={`px-[4px] ${
                      canShare
                        ? 'cursor-pointer dark:!text-[#009BFF]'
                        : 'cursor-not-allowed text-[#ccc]'
                    }`}
                  >
                    <ShareAltOutlined />
                  </div>
                ),
                onClick: handleMsgCheckClick,
              },
            ],
          }}
          messages={messages}
          renderMessageContent={renderMessageContent}
          renderMessageTail={renderMessageTail}
          quickReplies={quickReplies}
          onQuickReplyClick={handleQuickReplyClick}
          onSend={handleSend}
          sendButtonDisabled={sendButtonDisabled}
          sendButtonNotShow={false}
          quickRepliesDisabled={sendButtonDisabled}
          onAvatarClick={(userInfo) => {
            if (userInfo.isLoginUser) {
              setShowUserPanel(true);
            }
          }}
          // 创建新会话
          ExtraButton={
            <Tooltip title="创建新会话" color="blue">
              <div
                onClick={() => {
                  console.log('主动触发创建会话');
                  _conversationStore.refreshCurrentConversation('', true).then((res: any) => {
                    if (res === true) {
                      message.success('创建会话成功');
                    } else {
                      // message.error(`创建会话失败:${res}`);
                    }
                  });
                }}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-md text-black ${
                  notLogin || sendButtonDisabled
                    ? 'pointer-events-none cursor-not-allowed bg-[#ccc]'
                    : 'cursor-pointer dark:invert'
                }`}
              >
                <img alt="" src="/assets/create-session.png" width="50%" />
              </div>
            </Tooltip>
          }
        />
        <UserPanel
          isOpen={showUserPanel}
          onClose={() => setShowUserPanel(false)}
          onFavoriteMsgToInput={onFavoriteMsgToInput}
        />
      </Resizable>

      <LoginModal />
      <ShareModal show={shareModalShow} messages={messages} onCancel={handleShareModalCancel} />
    </div>
  );
}

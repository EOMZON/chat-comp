import { ConversationDetail } from '@/services/conversations';
import { log } from 'async';

// 最初的展示
export const mockGetConversationDetailApi = (
  conversation_id: string,
): Promise<{
  code: number;
  msg: string;
  data: ConversationDetail;
}> => {
  const mockData = require('./mock_before.json');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: mockData.data,
      });
    }, 300); // 模拟网络延迟
  });
};
interface Report {
  title: string;
  content: string;
  data: any;
}
// 输入过程展示
export const mockCreateMsg = (val: any, project: any, modelType: any, callback: any) => {
  console.log(val);
  const firstQ = require('./doc-questions/1-firstQuestion.json');
  const areaScale = require('./doc-questions/2-areaScale.json');
  const doc = require('./doc-questions/generateDoc.json');

  const dataMapping: { [key: string]: Report } = {
    生成光伏项目建议书: firstQ,
    张江模力社区: areaScale,
  };

  const mockData = firstQ;

  console.log('mockData------------------->', mockData);

  // 模拟接收到第一个数据包
  setTimeout(() => {
    callback({
      code: 200,
      data: mockData.data,
    });
  }, 300);

  const STOP_FLAG = '[DONE]';

  // 模拟接收到最后一个数据包，包含 STOP_FLAG
  setTimeout(() => {
    callback({
      code: 200,
      msg: STOP_FLAG, // 假设 STOP_FLAG 的值是 'STOP'
      data: null,
    });
  }, 1500); // 在第一个数据包之后再等待 800ms
};

// 最后的展示
export const mockGetConversationDetailApi_FINAL = (
  conversation_id: string,
): Promise<{
  code: number;
  msg: string;
  data: ConversationDetail;
}> => {
  const mockData = require('./mock_final.json');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: mockData.data,
      });
    }, 300); // 模拟网络延迟
  });
};

// 打字效果封装
import { msgStringToArr, msgContentStringToArr } from '@/utils/v1/msg';
import { parseJSON } from '@/utils';

type TypingCallbackFun = (
  typingContent: string,
  isDone: boolean,
  expertAgents?: string[],
  contentId?: string,
) => void;

const FRAME_TICK = 1000 / 60;
export default class WordTyping {
  public isTyping = false;
  /** 用于标记 没实际作用 */
  private id = '';
  /** 打字速度 */
  private tick = 50;
  private typingTimer: NodeJS.Timeout | null = null;
  /** 消息接收完毕后 打字效果多久结束 */
  private maxWait = 1000;
  /** 最大缓冲区 避免堆积 */
  private maxBuffer: number = 0;
  /** 当前打字位置 */
  private pos: number = 0;
  /** 当前所有消息内容  */
  private content: string = '';
  /** 如果包含图表(含明细表)，则记录图表的id，便于激活工作台时高亮闪烁 */
  private contentId: string = '';

  private get typedContent() {
    return this.content.substring(0, Math.min(this.content.length, this.pos));
  }
  private get retainTextLength() {
    return Math.max(0, this.content.length - this.pos);
  }
  private recentTickAndLetterCnt = () => {
    if (this.retainTextLength <= 0) {
      return { tick: this.tick, letterCount: 0 };
    }

    // 根据剩余长度和最大缓冲区数量计算间隔时间
    const tempTick = Math.min(
      this.tick,
      Math.round(this.tick * (this.maxBuffer / this.retainTextLength)),
    );

    // 间隔时间和帧间隔时间比较
    if (tempTick < FRAME_TICK) {
      return {
        tick: FRAME_TICK,
        /** 限制最小值 1 */
        letterCount: Math.max(1, Math.round((this.retainTextLength - this.maxBuffer) / FRAME_TICK)),
      };
    }

    return { tick: tempTick, letterCount: 1 };
  };

  private expertAgents: string[] = [];
  /**是否是最后一次更新 消息接收完毕 */
  private isLastUpdate: boolean = false;
  /** 要打字的内容回传 */
  private typingCallback: TypingCallbackFun = () => {};

  private log(...msg: any[]) {
    console.warn(`wordTyping[${this.id}]`, ...msg);
  }

  constructor(id: string, typingCallback: TypingCallbackFun) {
    this.id = id;
    this.typingCallback = typingCallback;
    this.maxBuffer = Math.floor(this.maxWait / this.tick);
    this.pos = Math.max(0, this.content.length - this.maxBuffer);
  }

  /** 不断更新内容长度 */
  public updateContent = ({
    isLast,
    content,
    expertAgents,
  }: {
    isLast?: boolean;
    content?: string;
    expertAgents?: string[];
  }) => {
    console.log('updateContent called:', {
      isLast,
      contentLength: content?.length,
      currentIsLastUpdate: this.isLastUpdate,
    });

    if (isLast && !this.isLastUpdate) {
      this.isLastUpdate = isLast;

      // 针对接收完毕但是没有内容返回的情况
      if (!this.isTyping && this.content.length === 0) {
        console.warn('wordTyping[updateContent] 接收完毕但是没有内容返回');
        this.typingCallback('', true);
      }
      console.log('isLastUpdate set to true');
    }

    // this.log(`=====content:`, content);

    if (typeof content === 'string') {
      this.content = content || this.content;
      // 针对placeholder -> chart 情况
      const contentArr = msgStringToArr(this.content);
      const latestContent = contentArr.pop();
      if (latestContent) {
        const [arrJSONStr] = msgContentStringToArr(latestContent);
        const arrJSON = parseJSON(arrJSONStr);
        // this.log('绘制图表：', arrJSON);
        if (['chart', 'table'].includes(arrJSON?.[0])) {
          this.log('绘制图表开始：', arrJSON);
          // 图表则直接返回全部数据
          this.pos = this.content.length;
          this.contentId = arrJSON?.[1];
        }
      }
    }

    if (expertAgents?.length && expertAgents.length !== this.expertAgents.length) {
      this.log('更新tail:', expertAgents);
      this.expertAgents = [...expertAgents];
    }
  };

  public start = () => {
    if (this.isTyping) return;
    this.log(`\n ${this.id} start print`);

    this.isTyping = true;

    this.execCallback();
  };

  private execCallback = () => {
    // console.log(this.pos === this.content.length, this.isLastUpdate);

    const isDone = this.isLastUpdate && this.pos === this.content.length;

    const { tick, letterCount } = this.recentTickAndLetterCnt();

    // this.log('execCallback：', isDone, this.pos, this.content.length);

    if (isDone) {
      // this.log('isDone=true: ', this.content);
      this.typingCallback(this.content, true, this.expertAgents, this.contentId);
      this.stop();
    } else {
      if (letterCount !== 0) {
        this.pos += letterCount;
        this.typingCallback(this.typedContent, false);
      }

      this.typingTimer = setTimeout(() => {
        this.execCallback();
      }, tick);
    }
  };

  /**
   * 销毁
   * @param isAuto 是自动结束还是手动打断
   */
  public destroy = (isAuto: boolean = true) => {
    // this.log(`=====打字destroy被调用`, this.typingTimer);
    this.stop();
    this.typingCallback(
      isAuto ? this.content : this.typedContent,
      true,
      this.expertAgents,
      this.contentId,
    );
    this.typingCallback = () => {};
    this.content = '';
  };

  private stop = () => {
    // this.log(`=====打字stop被调用`, this.typingTimer);
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  };
}

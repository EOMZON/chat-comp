import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { App, Table, Tooltip, Collapse, ConfigProvider } from 'antd';
import download from 'licia/download';
import { parseJSON } from '@/utils';
import { runes } from 'runes2';
import { themeStore } from '@/store';
import { createStyles } from 'antd-style';
import { DownloadOutlined } from '@ant-design/icons';
import { CaretRightOutlined } from '@ant-design/icons';
import { downloadTableExcel } from '@/services/charts';
import EventBus from '@/utils/v1/eventBus';

const useStyles = createStyles(({ token }) => {
  return {
    collapse: {
      '.ant-collapse-content-box': {
        paddingBlockStart: '0 !important',
      },
    },
  };
});

interface TableMsgProps {
  contentId: string;
  contentType: 'table' | 'addtion_table' | 'text' | 'chart';
  workbenchId?: string;
  title?: string;
  /** echarts options字符串 */
  dataString: string;
  className?: string;

  /** 来自工作台还是对话框还是分享页 */
  from: 'chat' | 'workbench' | 'share';

  /** 是否钉在工作台 from='chat' 时有效 */
  pined?: boolean;
  onPined?: (callback: (isSuccess: boolean) => void) => Promise<void>;
}

const TableMsg: React.FC<TableMsgProps> = ({
  contentId,
  contentType,
  workbenchId,
  title,
  dataString,
  className,
  from,
  pined = false,
  onPined = () => {},
}) => {
  const { message } = App.useApp();
  const [isPined, setIsPined] = useState(pined);
  const [tableFold, setTableFold] = useState(false);

  const { styles } = useStyles();

  const isPinedRef = useRef(pined);
  const contentIdRef = useRef(contentId);

  const data = parseJSON(dataString);

  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  const isFromChat = from === 'chat';
  const isFromWorkbench = from === 'workbench';
  const isAddtionTable = contentType === 'addtion_table';
  const isTable = contentType === 'table';

  const chartTitle = title || data?.title;

  // console.log(`=======data:`, data);

  // 计算宽度 横向滚动
  let tWidth = 0;
  // 加工表格数据
  const tColumns =
    data?.data?.[0].map((title: string) => {
      // 标题长度
      const twid = runes(title).length * 12;
      tWidth += twid;

      const tableTitle: any = {
        title,
        dataIndex: title,
      };
      // 针对所为的附加表格做定制
      if (isAddtionTable) {
        tableTitle.width = twid;
      }

      return tableTitle;
    }) || [];

  // 测试超宽
  // ['test', 'test1', 'test2', 'test3', 'test4'].forEach((title) => {
  //   const twid = runes(title).length * 10;
  //   tWidth += twid;
  //   tColumns.push({ title, dataIndex: title });
  // });

  const tData =
    data?.data?.slice(1)?.map((items: any[], idx: number) => {
      const objs: any = { index: idx, key: idx };
      tColumns.forEach((colObj: any, index: number) => {
        objs[colObj.dataIndex] = items[index] || '1111';
      });
      return objs;
    }) || [];

  const handlePined = useCallback(() => {
    if (isPinedRef.current) {
      return;
    }

    onPined((isSuccess) => {
      if (isSuccess) {
        message.info(`图表 ⌜${chartTitle}⌟ 已经保存到工作台`);
        setIsPined(true);
        isPinedRef.current = true;
      }
    });
  }, []);

  useEffect(() => {
    const updatePinedCallback = (contentId: string, isPined: boolean) => {
      if (contentIdRef.current === contentId) {
        setIsPined(isPined);
      }
    };

    if (isFromChat) {
      EventBus.on('updatePined', updatePinedCallback);
    }

    return () => {
      if (isFromChat) {
        EventBus.off('updatePined', updatePinedCallback);
      }
    };
  }, []);

  useEffect(() => {
    isPinedRef.current = isPined;
  }, [isPined]);

  // console.log(`=====table:`, data.data, tColumns, tData, tWidth);

  const tableDom = (
    <Table
      columns={tColumns}
      bordered
      dataSource={tData}
      pagination={false}
      scroll={{ y: 300, x: tWidth * 2 }}
      size="small"
      rowClassName={(_, index) => {
        return index % 2 === 0
          ? 'bg-white dark:bg-[#21232b65]'
          : 'bg-[#7186de15] dark:bg-[#353d6065]';
      }}
    />
  );

  return (
    <div className={`flex flex-col ${styles.collapse}`}>
      {tColumns.length === 0 ? (
        <span className="text-[gray] dark:text-[#fef7f7c2]">表格渲染中......</span>
      ) : (
        <>
          {isAddtionTable ? (
            <ConfigProvider
              theme={{
                components: {
                  Collapse: {
                    headerPadding: '4px',
                    contentPadding: 0,
                    headerBg: '#fff',
                  },
                },
              }}
            >
              <Collapse
                ghost
                destroyInactivePanel
                activeKey={tableFold ? '1' : ''}
                onChange={() => setTableFold(!tableFold)}
                expandIconPosition="start"
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined className="!text-blue-600" rotate={isActive ? 90 : 0} />
                )}
                items={[
                  {
                    key: '1',
                    label: (
                      <span className="text-xs font-bold text-blue-600 dark:text-[#007EFF]">
                        {chartTitle}
                      </span>
                    ),
                    children: tableDom,
                  },
                ]}
              ></Collapse>
            </ConfigProvider>
          ) : (
            tableDom
          )}
          {isTable && (
            <div className="mt-3 flex">
              {isFromChat ? (
                <Tooltip title={isPined ? '已添加到工作台' : '点击添加到工作台'}>
                  <img
                    className="h-[16px] w-[20px] cursor-pointer"
                    src={isPined ? '/assets/unpin.svg' : '/assets/pin.png'}
                    onClick={handlePined}
                  />
                </Tooltip>
              ) : null}
              {isFromWorkbench ? (
                <Tooltip title="导出excel">
                  <DownloadOutlined
                    className="cursor-pointer text-[18px] dark:!text-[#7da2e6] dark:hover:!text-[#d5d2d2]"
                    onClick={() => {
                      downloadTableExcel(workbenchId as string).then((res) =>
                        download(res, `${title}.xlsx`),
                      );
                    }}
                  />
                </Tooltip>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(TableMsg);

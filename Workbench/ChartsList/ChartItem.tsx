import { Input, App, Tooltip, Button } from 'antd';
import {
  FormOutlined,
  VerticalAlignTopOutlined,
  MinusOutlined,
  CloseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState, memo } from 'react';
import useCustomModal from '@/components/common/Modal/useModal';
import type { ChartListItem } from '@/services/charts';
import { chartsStore, conversationStore, themeStore } from '@/store';
import { formatTimestamp } from '@/utils/common';
import EventBus from '@/utils/v1/eventBus';

import MsgChart from '@/components/common/Charts';
import MsgTable from '@/components/common/Table';

interface ChartItemProps {
  onDelete: (item: ChartListItem) => void;
  onTop: (item: ChartListItem) => void;
  onCollapse: (item: ChartListItem) => void;
  onTitleChange: (item: ChartListItem) => void;
  item: ChartListItem;
}

function ChartItem(props: ChartItemProps) {
  const { onDelete, onTop, onCollapse, onTitleChange, item } = props;

  const { message } = App.useApp();

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [isCollapse, setIsCollapse] = useState(false);

  const { showModal, ModalPortal, hideModal } = useCustomModal();
  const _chartsStore = chartsStore();
  const _conversationStore = conversationStore();

  const isTable = ['table', 'addtion_table'].includes(item.content_type);

  const isFlash = _chartsStore.flashContentId === item.content_id;

  const _themeStore = themeStore();

  const handleTitleInputUpdate = () => {
    if (!title) return;
    if (isTitleEditing) {
      if (title.length < 2 || title.length > 30) {
        return message.info('标题长度需要在 2-30 之间');
      }
      _chartsStore.updateTitle(item.workbench_id, title);
    }
    setIsTitleEditing(!isTitleEditing);
  };

  const handleChartTypeChange = async (chartType: string) => {
    _chartsStore.updateChartType(item.workbench_id, chartType);
  };

  const handleCollapseChange = () => {
    setIsCollapse(!isCollapse);
    onCollapse(item);
  };

  const handleDelete = () => {
    showModal({
      onOkButtonClick: async () => {
        const isSuccess = await _chartsStore.handleDelete(`${item.workbench_id}`);
        if (isSuccess) {
          console.log('删除图表成功：', item.workbench_id, item.content_id);
          EventBus.emit('updatePined', item.content_id, false);
        }
        hideModal();
      },
      onCancelButtonClick: () => {},
      okText: '确认',
      cancelText: '取消',
      content: <p>{`是否确认删除`}</p>,
    });

    onDelete(item);
  };
  const handleTop = async () => {
    await _chartsStore.updateTop(item.workbench_id, !item.top);
    onTop(item);
  };

  return (
    <div
      className={`${isFlash ? 'animate-flash' : ''} !w-full overflow-hidden rounded-md border border-[#E9EDFC] bg-[#F8F9FC] dark:border-[#104D75] dark:bg-[#0E4163]`}
    >
      <div
        data-tag="header"
        className="relative flex h-[45px] items-center justify-between px-[16px] py-[12.5px]"
      >
        {item.top ? (
          <div className="absolute -left-[23px] -top-[14px] h-[50%] w-[75px] rotate-[138deg] bg-[#93A9F6] dark:bg-[#009BFF]"></div>
        ) : null}
        <div className="flex ">
          {isTitleEditing ? (
            <Input
              size="small"
              width={100}
              defaultValue={item.title}
              value={title}
              maxLength={30}
              minLength={2}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              onPressEnter={handleTitleInputUpdate}
            />
          ) : (
            <span
              onDoubleClick={handleTitleInputUpdate}
              title={title}
              className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold dark:text-white"
            >
              {title}
            </span>
          )}

          <FormOutlined
            onClick={handleTitleInputUpdate}
            className="ml-2 font-bold text-[#999] dark:!text-[#4782AB]"
          />
        </div>
        <div>
          <span className="text-gray-400">{formatTimestamp(item.create_time)}</span>

          <Tooltip title={item.top ? '取消置顶' : '置顶此图表'}>
            <VerticalAlignTopOutlined
              onClick={handleTop}
              className={`ml-2 cursor-pointer rounded-[4px] p-[6px] font-bold dark:bg-[#114D75] ${item.top ? 'bg-[rgba(218,226,254,1)] text-[#2F59F0] dark:!text-[#009BFF]' : 'bg-[rgba(189,203,255,.2)] text-[#999] dark:!text-[#6B9CBC]'} `}
            />
          </Tooltip>

          <Tooltip title={isCollapse ? '展开此图表' : '折叠此图表'}>
            <MinusOutlined
              onClick={handleCollapseChange}
              className="ml-2 cursor-pointer rounded-[4px] bg-[rgba(189,203,255,.2)] p-[6px]  font-bold text-[#999] dark:bg-[#114D75] dark:!text-[#6B9CBC]"
            />
          </Tooltip>

          <Tooltip title="删除此图表">
            <CloseOutlined
              onClick={handleDelete}
              className="ml-2 cursor-pointer rounded-[4px] bg-[rgba(189,203,255,.2)] p-[6px]  text-[#999] dark:bg-[#114D75] dark:!text-[#6B9CBC]"
            />
          </Tooltip>
        </div>
      </div>
      <div
        data-tag="body"
        className={`transition-height border-t border-[#E9EDFC] px-[10px] duration-500 dark:border-[#104D75] ${isCollapse ? 'hidden' : ''}`}
      >
        {isTable ? (
          <div className="flex flex-col gap-2 p-4">
            <MsgTable
              contentType={item.content_type}
              workbenchId={item.workbench_id}
              dataString={item.content}
              contentId={item.content_id}
              title={title}
              from="workbench"
            />
          </div>
        ) : (
          <MsgChart
            echartsOptionsString={item.content}
            contentId={item.content_id}
            title={title}
            from="workbench"
            onChartTypeChange={handleChartTypeChange}
            className="!w-full"
          />
        )}
      </div>
      {ModalPortal && <ModalPortal />}
    </div>
  );
}
export default memo(ChartItem);

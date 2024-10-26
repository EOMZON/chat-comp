import { Spin } from 'antd';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import EventBus from '@/utils/v1/eventBus';
import ChartItem from './ChartItem';
import type { ChartListItem } from '@/services/charts';
import { chartsStore, themeStore } from '@/store';

export default function ChartList() {
  const _chartsStore = chartsStore();
  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  useEffect(() => {
    _chartsStore.loadChartsList();
  }, []);

  const onDelete = (item: ChartListItem) => {
    console.log('onDelete', item);
  };
  const onTop = (item: ChartListItem) => {
    console.log('onTop', item);
  };
  const onCollapse = (item: ChartListItem) => {
    console.log('onCollapse', item);
  };
  const onTitleChange = (item: ChartListItem) => {
    console.log('onTitleChange', item);
  };

  return (
    <div
      id="chartlist-body"
      className="h-[calc(100vh-132px)] overflow-y-auto"
      style={{
        scrollbarColor: isDark ? '#0B6098 #0E4163' : '',
        scrollbarWidth: 'thin',
      }}
    >
      {_chartsStore.isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center">
          <img alt="" className="h-[130px] w-[204px]" src="/assets/chart-empty.png" />
          <div className="my-[10px] text-[16px] font-bold text-black dark:text-white">
            {/* 暂无数据图表 */}
            暂无生成的文档
          </div>
          <div className="text-sm text-[#666] dark:text-[#CDD1D5]">
            {/* 对话过程中生成的数据图表将自动展示在这里 */}
            对话过程中生成的文档将自动展示在这里
          </div>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={_chartsStore.chartsList.length}
          next={_chartsStore.loadChartsList}
          hasMore={!!_chartsStore.cursor}
          style={{ overflowY: 'hidden' }}
          loader={<Spin className="w-full text-center" size="small" />}
          endMessage={
            _chartsStore.chartsList.length ? (
              <div className="mt-[10px] p-1 text-center text-[14px] text-gray-400">
                已无更多记录
              </div>
            ) : null
          }
          scrollableTarget="chartlist-body"
        >
          <ul>
            {_chartsStore.chartsList.map((item) => (
              <li key={item.workbench_id} className="mb-[20px]">
                <ChartItem
                  item={item}
                  onDelete={onDelete}
                  onTop={onTop}
                  onCollapse={onCollapse}
                  onTitleChange={onTitleChange}
                />
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </div>
  );
}

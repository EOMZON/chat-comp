import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { createStyles } from 'antd-style';
import SessionList from './ChatList';
import ChartList from './ChartsList';
import DocmentsList from './DocmentsList';
import { EnabledTabsEnum } from '@/types';
import { workbenchStore, ActiveKey, userStore } from '@/store';

const useStyles = createStyles(({ token }) => {
  return {
    tabs: {
      '.ant-tabs-nav:before': {
        borderColor: token.colorPrimaryBorder,
      },
    },
  };
});

export default function Workbench() {
  const _workbenchStore = workbenchStore();
  const _userStore = userStore();
  const { styles } = useStyles();
  const [tabs, setTabs] = useState<any[]>([]);

  useEffect(() => {
    const tbs = _userStore.userConfig?.enabled_tabs || [];
    const tts = [];
    tts.push({
      key: ActiveKey.CHART_LIST,
      label: '文档专家',
      // children: <ChartList />,
      children: <DocmentsList />,
    });

    // if (tbs.includes(EnabledTabsEnum.DATA_ANALYSIS)) {
    //   tts.push({
    //     key: ActiveKey.CHART_LIST,
    //     label: '文档专家',
    //     // children: <ChartList />,
    //     children: <DocmentsList />,
    //   });
    // }
    if (tbs.includes(EnabledTabsEnum.CONVERSATION_HISTORY)) {
      tts.push({
        key: ActiveKey.SESSION_LIST,
        label: '数据分析',
        children: <ChartList />,
      });
      tts.push({
        key: ActiveKey.SESSION_LIST,
        label: '历史记录',
        children: <SessionList />,
      });
    }

    _workbenchStore.setActiveKey(tts?.[0]?.key);
    setTabs(tts);
  }, [_userStore.userConfig]);

  return (
    <div className="flex h-screen flex-col px-[20px] text-center">
      <div className="mb-[3px] h-[66px] border-b border-b-[#eee] p-[12px] leading-[23px] dark:border-b-[#0D4B74]">
        <div className="text-[18px] font-bold text-[#333] dark:text-white">
          动态工作台一高效工作空间
        </div>
        <span className="text-xs font-normal text-[#666] dark:text-[#CDD1D5]">
          动态工作台会根据场景和交互内容动态变化为您打造专属高效工作空间
        </span>
      </div>
      {/* <img src="/assets/workbench.png" alt="" className="w-[330px]" /> */}
      <Tabs
        defaultActiveKey={ActiveKey.CHART_LIST}
        activeKey={_workbenchStore.activeKey}
        className={styles.tabs}
        centered
        indicator={{ size: (origin) => origin - 30 }}
        items={tabs}
        onChange={(key) => _workbenchStore.setActiveKey(key as ActiveKey)}
        tabBarGutter={100}
      />
    </div>
  );
}

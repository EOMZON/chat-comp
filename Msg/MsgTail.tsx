import type { MessageProps } from '@/libs/chatui';
import React, { useMemo } from 'react';
import { themeStore } from '@/store';

export default function MsgTail(msg: MessageProps) {
  const { position, expert_agents } = msg;
  const _themeStore = themeStore();

  const colorStyle = { color: _themeStore.isDarkThemes() ? '#009BFF' : 'rgb(65 102 223)' };

  const newTails = useMemo(() => {
    if (position !== 'left' || !expert_agents?.length) return null;

    const tails =
      expert_agents.length === 1 ? (
        <span style={colorStyle}>{expert_agents[0]}</span>
      ) : (
        expert_agents.map((item, index) => (
          <span key={index}>
            <span style={colorStyle}>{item}</span>
            {index === expert_agents.length - 2
              ? ' 和 '
              : index < expert_agents.length - 2
                ? '、'
                : ''}
          </span>
        ))
      );

    return (
      <span className="rounded-sm bg-[#d5defc61] p-[4px] pl-[6px] text-gray-600 dark:bg-[#0F486E] dark:text-[#A6B3BF]">
        以上内容由 {tails} 生成
      </span>
    );
  }, [expert_agents, position]);

  return newTails;
}

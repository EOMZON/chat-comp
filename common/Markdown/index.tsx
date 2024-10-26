//@ts-nocheck
// https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins
// https://github.com/remarkjs/react-markdown?tab=readme-ov-file#use
import React from 'react';
import Markdown from 'react-markdown';
import { memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { themeStore } from '@/store';
// import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';

function preprocessMarkdownText(text: string) {
  // 替换序号以避免自动转换为列表
  // const replacedNumbers = text.replace(/(\n)?(\d+)\./g, '$1 $2、');
  return text;
}

interface MarkdownMsgProps {
  text: string;
}

// const mock = `123 \n 456 <br/> 789
// |标题1|标题2|
// |----|----|
// |123|456|
// |321|11<br/>2225|
// `;

const MarkdownMsg: React.FC<MarkdownMsgProps> = ({ text }) => {
  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  // text = mock;

  return (
    <Markdown
      children={text ? preprocessMarkdownText(text) : ''}
      remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkBreaks]}
      rehypePlugins={[rehypeRaw]} // 添加rehypeRaw插件
      className="whitespace-normal dark:text-white"
      unwrapDisallowed
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              PreTag="div"
              children={String(children).replace(/\n$/, '')}
              language={match[1]}
              style={dark}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div
              className="my-[6px] overflow-x-auto"
              style={{
                scrollbarColor: isDark ? '#0B6098 #0E4163' : '',
                scrollbarWidth: 'thin',
              }}
            >
              <table className="border-collapse">{children}</table>
            </div>
          );
        },
        ul({ node, ...rest }) {
          return <ul className="list-decimal pl-[20px]" {...rest} />;
        },
        ol({ node, ...rest }) {
          return <ol className="list-decimal pl-[20px]" {...rest} />;
        },
        li({ node, ...rest }) {
          return <li className="my-2 list-item list-decimal" {...rest} />;
        },
        th: ({ children }) => {
          return <th className="text-nowrap border border-[#d2cbcb] px-[4px]">{children}</th>;
        },
        td: ({ children }) => {
          return <td className="text-nowrap border border-[#d2cbcb] px-[4px]">{children}</td>;
        },
        // 修正 <pre></pre> 不换行问题
        pre: ({ children, node }) => {
          return <p>{children}</p>;
        },
      }}
    />
  );
};

export default memo(MarkdownMsg);

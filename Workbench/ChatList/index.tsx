import { Input, List, Button, Checkbox, Spin, message } from 'antd';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { debounce } from 'licia';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { SearchOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import useCustomModal from '@/components/common/Modal/useModal';
import styles from '@/components/common/List/List.module.css';
import { conversationStore, themeStore } from '@/store';
import { formatTimestamp } from '@/utils/common';
import { HighlightedText } from '@/utils';

export default function SessionList() {
  const [_, contextHolder] = message.useMessage({ maxCount: 2 });
  const [showCheckbox, setShowCheckbox] = useState<boolean>(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null); // 添加 ref
  const { showModal, ModalPortal, hideModal } = useCustomModal();

  const [editIndex, setEditIntex] = useState<number>(-1);
  const [editTitle, setEditTitle] = useState<string>('');
  const handleTitleUpdate = async (index: number) => {
    const currItem = _conversationStore.conversationList[index];
    // 激活编辑态: 全新激活 、 或者存在激活的情况下直接激活另一个
    if (editIndex === -1 || editIndex !== index) {
      setEditIntex(index);
      setEditTitle(currItem.title);
      return;
    }

    if (!editTitle.trim()) return;

    // 执行保存
    setEditIntex(-1);
    await _conversationStore.updateConversation(currItem.conversation_id, editTitle);
    setEditTitle('');
  };

  const _conversationStore = conversationStore();
  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  useEffect(() => {
    const pageSize = Math.ceil(listRef.current?.clientHeight! / 46);
    console.warn('session list pageSize:', pageSize);
    _conversationStore.setPageSize(pageSize);
    _conversationStore.loadConversationList().then(async () => {
      // // 激活新一个会话
    });
  }, []);

  const handleSelect = (index: number) => {
    const newSelectedIndices = new Set(selectedIndices);
    if (newSelectedIndices.has(index)) {
      newSelectedIndices.delete(index);
    } else {
      newSelectedIndices.add(index);
    }
    setSelectedIndices(newSelectedIndices);
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      const allIndices = new Set(_conversationStore.conversationList.map((_, index) => index));
      setSelectedIndices(allIndices);
    } else {
      setSelectedIndices(new Set());
    }
  };

  const isAllSelected =
    _conversationStore.conversationList.length > 0 &&
    selectedIndices.size === _conversationStore.conversationList.length;

  const handleDelete = () => {
    if (!showCheckbox) {
      setShowCheckbox(true);
    } else if (selectedIndices.size === 0) {
      setShowCheckbox(false);
    } else {
      showModal({
        onOkButtonClick: async () => {
          const ids = _conversationStore.conversationList
            .filter((item, index) => selectedIndices.has(index))
            .map((item) => item.conversation_id);

          await _conversationStore.handleDelete(ids.join(','));
          hideModal();
          selectedIndices.clear();
          setShowCheckbox(false);
        },
        onCancelButtonClick: () => {},
        okText: '确认',
        cancelText: '取消',
        content: <p>{`是否确认删除选中的${selectedIndices.size}条记录`}</p>,
      });
    }
  };

  const handlerSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value?.trim();
    _conversationStore.setKeyword(val);
    handlerSearch();
  };

  const handlerSearch = useCallback(
    debounce(() => {
      _conversationStore.handlerSearch();
      console.error('触发搜索');
    }, 500),
    [_conversationStore],
  );

  return (
    <div
      className={`flex h-[calc(100vh-132px)] grow flex-col overflow-hidden rounded bg-white dark:bg-[#103751] ${styles.myListContainer}`}
      style={{ scrollbarColor: isDark ? '#0B6098 #0E4163' : '', scrollbarWidth: 'thin' }}
    >
      {contextHolder}
      <div className="mb-[15px] h-[32px]">
        <Input
          // onPressEnter={handlerSearch}
          onChange={handlerSearchValueChange}
          value={_conversationStore.keyword}
          size="large"
          prefix={<SearchOutlined className="dark:!text-[#009BFF]" />}
          placeholder="搜索历史会话"
        />
      </div>
      <div className="grow overflow-y-auto" id="conversation-body" ref={listRef}>
        {/* <Spin tip="加载中..." spinning={loading} className="mt-[40px] w-full text-center"></Spin> */}
        {
          <InfiniteScroll
            dataLength={_conversationStore.conversationList.length}
            next={_conversationStore.loadConversationList}
            hasMore={!!_conversationStore.cursor}
            style={{ overflowY: 'hidden' }}
            loader={<Spin className="w-full text-center" size="small" />}
            endMessage={
              _conversationStore.conversationList.length ? (
                <div className="mt-[10px] p-1 text-center text-[14px] text-gray-400">
                  已无更多历史会话记录
                </div>
              ) : null
            }
            scrollableTarget="conversation-body"
          >
            <List
              dataSource={_conversationStore.conversationList}
              className={`${styles.customList}`}
              loading={{
                spinning: _conversationStore.isConversationListLoading,
                delay: 100,
              }}
              locale={{
                emptyText: (
                  <div className="flex h-full flex-col items-center justify-center">
                    <img alt="" className="mt-8 w-[100px]" src="/assets/chat-empty.png" />
                    <div className="mt-5 text-sm text-[#666] dark:text-[#CDD1D5]">暂无相关记录</div>
                  </div>
                ),
              }}
              renderItem={(item, index) => (
                <List.Item className="flex items-center">
                  {/* 移除 Skeleton 组件 */}
                  {showCheckbox && (
                    <Checkbox
                      checked={selectedIndices.has(index)}
                      onChange={() => handleSelect(index)}
                      className="mr-[10px]"
                    />
                  )}
                  <div
                    onClick={() => {
                      if (
                        item.conversation_id ===
                        _conversationStore.currentConversation.conversation_id
                      ) {
                        return;
                      }

                      _conversationStore.refreshCurrentConversation(item.conversation_id);
                    }}
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-md border border-solid bg-[#f8f9fc] px-[10px] py-[5px]  dark:bg-[#0E4163] dark:text-white ${
                      _conversationStore.currentConversation.conversation_id ===
                      item.conversation_id
                        ? 'border-[#BDCBFF] dark:border-[#0B5586]'
                        : 'border-[#f8f9fc] hover:border-[#BDCBFF] dark:border-[#0E4163] dark:hover:border-[#0B5586]'
                    }`}
                  >
                    <span className="mr-8 flex flex-grow items-center overflow-hidden">
                      {editIndex === index ? (
                        <Input
                          size="small"
                          className="mr-[25px]"
                          defaultValue={item.title}
                          value={editTitle}
                          onClick={(e) => e.stopPropagation()}
                          onPressEnter={() => handleTitleUpdate(index)}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      ) : (
                        <span
                          title={item.title}
                          className="mr-[25px] overflow-hidden text-ellipsis whitespace-nowrap"
                          dangerouslySetInnerHTML={{
                            __html: HighlightedText(
                              item.title,
                              _conversationStore.keyword,
                              // isDark ? '#009bfe' : '',
                            ),
                          }}
                        ></span>
                      )}
                      <FormOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleUpdate(index);
                        }}
                        className="opacity-0 group-hover:opacity-100"
                      />
                    </span>

                    <span className="mr-[10px] w-[68px] whitespace-nowrap dark:text-[#AAB4BF]">
                      {formatTimestamp(item.create_time)}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </InfiniteScroll>
        }
      </div>
      <div className="flex h-[90px] items-center py-[4px]">
        {showCheckbox && (
          <Checkbox
            id="checkALl"
            onChange={handleSelectAll}
            checked={isAllSelected}
            // className="mr-4"
            indeterminate={!isAllSelected && selectedIndices.size > 0}
          />
        )}
        {_conversationStore.conversationList.length > 0 && (
          <Button
            type={selectedIndices.size > 0 ? 'primary' : 'default'}
            shape="circle"
            onClick={handleDelete}
            className="ml-[7px]"
            icon={<DeleteOutlined />}
          />
        )}
        {showCheckbox && selectedIndices.size === 0 ? (
          <span className="ml-4 text-xs text-[#666]">选择并删除会话</span>
        ) : null}
      </div>
      {ModalPortal && <ModalPortal />}
    </div>
  );
}

import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Clipboard from 'react-clipboard.js';
import { ConfigProvider, Modal, Avatar, App, List, Spin } from 'antd';
import { userStore, favoriteStore, shareStore } from '@/store';
import { formatTimestamp } from '@/utils/common';
import type { FavoriteListItem } from '@/services/favorites';
import {
  IdcardOutlined,
  BankOutlined,
  StarOutlined,
  ProfileOutlined,
  CloseOutlined,
  LeftOutlined,
  DeleteOutlined,
  SelectOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import styles from '@/components/common/List/List.module.css';
import { ShareListItem } from '@/services/share';
import { isAnswerMsg } from '@/utils';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onFavoriteMsgToInput: (msg: string) => void;
}

export default function UserPanel(props: UserPanelProps) {
  const { isOpen, onClose, onFavoriteMsgToInput } = props;

  const [openFavorite, setOpenFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [openShare, setOpenShare] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const user = userStore();
  const _favoriteStore = favoriteStore();
  const _shareStore = shareStore();
  const { message } = App.useApp();

  // 显示收藏列表
  const handlerFavoriteShow = async () => {
    setOpenFavorite(true);
    setFavoriteLoading(true);
    await _favoriteStore.loadFavoriteList(true);
    setFavoriteLoading(false);
  };
  // 显示分享列表
  const handlerShareShow = async () => {
    setOpenShare(true);
    setShareLoading(true);
    await _shareStore.loadShareList(true);
    setShareLoading(false);
  };
  // 消息收藏回退
  const handlerFavoriteBack = () => {
    setOpenFavorite(false);
  };
  const handlerShareBack = () => {
    setOpenShare(false);
  };
  // 收藏的消息回填
  const handlerFavoriteUse = (item: FavoriteListItem) => {
    onClose();
    setOpenFavorite(false);
    onFavoriteMsgToInput(item.contents?.[0]?.content);
  };
  // 消息收藏列表 - 删
  const handlerFavoriteDel = async (item: FavoriteListItem) => {
    setFavoriteLoading(true);
    await _favoriteStore.handleDelete(item.message_id);
    setFavoriteLoading(false);
  };

  const handlerShareDel = async (item: ShareListItem) => {
    setFavoriteLoading(true);
    await _shareStore.handleDelete(String(item.message_share_id));
    setFavoriteLoading(false);
  };

  return (
    <ConfigProvider
      modal={{
        // classNames,
        styles: {
          content: {
            padding: '0 0 0 0',
          },
          header: {
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F6F7FB',
            height: 50,
          },

          footer: {
            textAlign: 'center',
          },
        },
      }}
    >
      <Modal
        title={false}
        width={400}
        open={isOpen && !!user.user}
        getContainer={false}
        footer={false}
        closable={false}
      >
        <div className="h-[447px] text-[16px]">
          <div
            id="userInfo"
            className={`flex h-full dark:bg-[#175277] flex-col ${openShare || openFavorite ? 'hidden' : ''}`}
          >
            <div
              id="userInfo-header"
              className="flex h-[40px] items-center rounded-t-lg bg-[#EEF0F5] dark:bg-[#1F6C9C] dark:text-white px-[15px] "
            >
              <CloseOutlined className="w-[20px] cursor-pointer text-[#666] dark:text-white" onClick={onClose} />
              <span className="mr-[20px]  grow text-center font-bold">用户信息</span>
            </div>
            <div id="userInfo-body" className="grow pl-[25px] pt-[15px]">
              <Avatar src={user.user?.avatar} size={60}>
                <img alt="" className="h-full w-full rounded-full" src="/assets/user.jpg"></img>
              </Avatar>
              <span className="ml-[14px] text-[18px] dark:text-white">{user.user?.nick_name}</span>
              <div className="mt-[15px] text-[14px] text-[gray] dark:text-white">
                <IdcardOutlined />
                <span className="ml-[8px]">{user.user?.post}</span>
              </div>
              <div className="mt-[10px] text-[14px] text-[gray] dark:text-white">
                <BankOutlined />
                <span className="ml-[8px]">{user.user?.company}</span>
              </div>
            </div>

            <div id="userInfo-footer" className="mb-[16px] flex justify-center">
              <div
                onClick={handlerFavoriteShow}
                className="mr-[20px] flex h-[38px] w-[150px] cursor-pointer items-center justify-center rounded-md border border-[#697ec84b] bg-[#d8dbe433] text-[#2f59f0] dark:bg-[#1F6C9C] dark:text-white dark:border-[#009BFF]"
              >
                <StarOutlined />
                <span className="ml-[8px]">收藏记录</span>
              </div>
              <div
                onClick={handlerShareShow}
                className="flex h-[38px] w-[150px] cursor-pointer items-center justify-center rounded-md border border-[#697ec84b] bg-[#d8dbe433] text-[#2f59f0] dark:bg-[#1F6C9C] dark:text-white dark:border-[#009BFF]"
              >
                <ProfileOutlined />
                <span className="ml-[8px]">分享清单</span>
              </div>
            </div>
          </div>

          <div
            id="favoriteRecord"
            className={`flex h-full flex-col ${openFavorite ? '' : 'hidden'} dark:bg-[#175277] `}
          >
            <div
              id="favoriteRecord-header"
              className="flex h-[40px] min-h-[40px] items-center rounded-t-lg bg-[#EEF0F5] dark:bg-[#1F6C9C] dark:text-white px-[15px]"
              onClick={handlerFavoriteBack}
            >
              <LeftOutlined className="w-[20px] cursor-pointer text-[#666]" />
              <span className="mr-[20px]  grow text-center font-bold">收藏记录</span>
            </div>
            <div id="favoriteRecord-body" className="grow overflow-y-auto">
              <Spin
                tip="加载中..."
                spinning={shareLoading}
                className="mt-[40px] w-full text-center"
              ></Spin>
              {!shareLoading && (
                <InfiniteScroll
                  dataLength={_favoriteStore.favoriteList.length}
                  next={_favoriteStore.loadFavoriteList}
                  hasMore={!!_favoriteStore.cursor}
                  loader={<Spin className="w-full text-center" size="small" />}
                  endMessage={
                    _favoriteStore.favoriteList.length ? (
                      <div className="my-[10px] p-1 text-center text-[14px] text-gray-400">
                        已无更多收藏记录
                      </div>
                    ) : null
                  }
                  scrollableTarget="favoriteRecord-body"
                >
                  <List
                    dataSource={_favoriteStore.favoriteList}
                    className={styles.customList}
                    renderItem={(item) => (
                      <List.Item className="flex items-center">
                        <div
                          style={{ width: 'calc(100% - 22px)' }}
                          className="w-[calc(100% - 22px)] group relative ml-[6px] flex cursor-pointer items-center justify-between rounded-md border border-solid border-[#f8f9fc] bg-[#f5f5f5] dark:bg-[#1B5E88] dark:border-[#1B5E88] px-[10px] py-[5px]"
                        >
                          <span
                            title={item.contents?.[0]?.content || '-'}
                            className="mr-[25px] overflow-hidden text-ellipsis whitespace-nowrap dark:text-white"
                          >
                            {item.contents?.[0]?.content || '-'}
                          </span>
                          <span className="w-[82px]  whitespace-nowrap text-[#999]">
                            {formatTimestamp(item.create_time || '1711776830000')}
                          </span>
                          <div
                            className={`absolute right-0 z-10 flex h-full ${isAnswerMsg(item.message_type) ? 'w-[44px]' : 'w-[88px]'} items-center justify-evenly rounded-md bg-[#e2e2e2e8] dark:bg-[#113F5D] dark:text-white opacity-0 group-hover:opacity-90`}
                          >
                            {isAnswerMsg(item.message_type) ? null : (
                              <>
                                <SelectOutlined
                                  onClick={() => handlerFavoriteUse(item)}
                                  className="cursor-pointer text-[20px] text-[#666] hover:text-[#2F59F0] dark:hover:text-[#009BFF]"
                                />{' '}
                                <div className="pointer-events-none h-[20px] w-[1px] bg-[#BEBEBE]"></div>
                              </>
                            )}

                            <DeleteOutlined
                              onClick={() => handlerFavoriteDel(item)}
                              className="cursor-pointer text-[20px] text-[#666] hover:text-[#2F59F0] dark:hover:text-[#009BFF]"
                            />
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </InfiniteScroll>
              )}
            </div>
          </div>

          <div id="shareList" className={`flex h-full flex-col ${openShare ? '' : 'hidden'} dark:bg-[#175277]`}>
            <div
              id="shareList-header"
              className="flex h-[40px] min-h-[40px] items-center rounded-t-lg bg-[#EEF0F5] dark:bg-[#1F6C9C] dark:text-white  px-[15px]"
              onClick={handlerShareBack}
            >
              <LeftOutlined className="w-[20px] cursor-pointer text-[#666]" />
              <span className="mr-[20px]  grow text-center font-bold">分享清单</span>
            </div>
            <div id="shareList-body" className="grow overflow-y-auto">
              <Spin
                tip="加载中..."
                spinning={favoriteLoading}
                className="mt-[40px] w-full text-center"
              ></Spin>
              {!favoriteLoading && (
                <InfiniteScroll
                  dataLength={_shareStore.shareList.length}
                  next={_shareStore.loadShareList}
                  hasMore={!!_shareStore.cursor}
                  loader={<Spin className="w-full text-center" size="small" />}
                  endMessage={
                    _shareStore.shareList.length ? (
                      <div className="my-[10px] p-1 text-center text-[14px] text-gray-400">
                        您的分享链接有效时间为30天
                      </div>
                    ) : null
                  }
                  scrollableTarget="shareList-body"
                >
                  <List
                    dataSource={_shareStore.shareList}
                    className={styles.customList}
                    renderItem={(item) => (
                      <List.Item className="flex items-center">
                        <div
                          style={{ width: 'calc(100% - 22px)' }}
                          className="w-[calc(100% - 22px)] group relative ml-[6px] flex cursor-pointer items-center justify-between rounded-md border border-solid border-[#f8f9fc] bg-[#f5f5f5] px-[10px] py-[5px]"
                        >
                          <span
                            title={item.title}
                            className="mr-[25px] overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {item.title}
                          </span>
                          <span className="w-[82px]  whitespace-nowrap text-[#999]">
                            {formatTimestamp(item.create_time || '1711776830000')}
                          </span>
                          <div className="absolute right-0 z-10 flex h-full w-[88px] items-center justify-evenly rounded-md bg-[#e2e2e2e8] opacity-0 group-hover:opacity-100">
                            <Clipboard
                              data-clipboard-text={`${origin}/share/${encodeURIComponent(item.share_id)}`}
                              onSuccess={() => message.success('分享链接复制成功')}
                            >
                              <CopyOutlined className="cursor-pointer text-[16px] text-[#666] hover:text-[#2F59F0]" />
                            </Clipboard>

                            <div className="pointer-events-none h-[20px] w-[1px] bg-[#BEBEBE]"></div>
                            <DeleteOutlined
                              onClick={() => handlerShareDel(item)}
                              className="cursor-pointer text-[20px] text-[#666] hover:text-[#2F59F0]"
                            />
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </InfiniteScroll>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

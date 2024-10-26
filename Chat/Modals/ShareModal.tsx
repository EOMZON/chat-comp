import React, { useEffect } from 'react';
import { App } from 'antd';
import type { MessageProps } from '@/libs/chatui';
import useCustomModal from '@/components/common/Modal/useModal';
import { createShareApi } from '@/services/share';
import { copy } from 'licia';

interface ShareModalProps {
  show: boolean;
  messages: MessageProps[];
  onCancel: () => void;
}

export default function ShareModal(props: ShareModalProps) {
  const { messages, onCancel, show } = props;
  const { showModal, ModalPortal, hideModal } = useCustomModal();
  const { message } = App.useApp();

  useEffect(() => {
    if (show) {
      showModal({
        onOkButtonClick: async () => {
          const ids = messages.filter((item) => item.checked).map((item) => String(item._id));
          console.log('分享', ids);
          const r = await createShareApi({ message_ids: ids });
          if (r.code === 200) {
            copy(`${origin}/share/${encodeURIComponent(r.data.share_id)}`, () => {
              message.success('分享链接已复制');
            });
          } else {
            message.error(`分享失败 [${r.code}] ${r.msg}`);
          }
          onCancel();
        },
        onCancelButtonClick: () => {
          onCancel();
          console.log('分享');
        },
        okText: '确定',
        content: (
          <div className="flex flex-col items-center">
            <img src="/assets/share.png" width={120} height={79} alt="" />
            <span className="mt-[10px] text-[16px] font-normal">是否确认分享您的内容？</span>
          </div>
        ),
      });
    } else {
      hideModal();
    }
  }, [show, hideModal, messages, onCancel, showModal]);

  return <>{ModalPortal && <ModalPortal />}</>;
}

import React, { useState, useCallback } from 'react';
import { Modal, ConfigProvider, Button } from 'antd';
import type { ModalProps } from 'antd';
import ReactDOM from 'react-dom';
import { themeStore } from '@/store';

interface CustomModalProps extends ModalProps {
  onOkButtonClick?: () => void; // 主按钮点击事件
  onCancelButtonClick?: () => void; // 默认按钮点击事件
  content?: React.ReactNode; // 内容
  cancelWidth?: string;
  okWidth?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  onOkButtonClick,
  onCancelButtonClick,
  ...props
}) => {
  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();
  return (
    <ConfigProvider
      modal={{
        // classNames,
        styles: {
          content: {
            padding: '0 0 20px 0',
            background: isDark ? '#0B6098' : '#fff',
            color: isDark ? '#fff' : '#000',
          },
          header: {
            width: '100%',
            height: '50px',
            marginBottom: '0',
            background:
              'linear-gradient(180deg, rgba(47, 89, 240, 0.102) 0%, rgba(255, 255, 255, 0) 100%)',
          },

          footer: {
            textAlign: 'center',
          },
        },
      }}
    >
      {' '}
      <Modal
        title={<div></div>}
        width={400}
        {...props}
        footer={() => {
          return (
            <>
              {onCancelButtonClick && (
                <Button
                  onClick={onCancelButtonClick}
                  className={props.cancelWidth ? `w-[${props.cancelWidth}]` : 'w-[100px]'}
                >
                  {props.cancelText || '取消'}
                </Button>
              )}
              {onOkButtonClick && (
                <Button
                  onClick={onOkButtonClick}
                  className={onCancelButtonClick ? 'w-[100px]' : 'w-[200px]'}
                  type="primary"
                >
                  {props.okText || '确认'}
                </Button>
              )}
            </>
          );
        }}
        closeIcon={false} // 隐藏右上角的关闭按钮
      >
        <div className="mb-5 text-center text-[16px]">{props.content}</div>
      </Modal>
    </ConfigProvider>
  );
};

const useCustomModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalProps, setModalProps] = useState<CustomModalProps>({});

  const showModal = useCallback((props: CustomModalProps) => {
    setModalProps(props);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  const onCancelButtonClick = modalProps?.onCancelButtonClick;
  if (onCancelButtonClick) {
    modalProps.onCancelButtonClick = () => {
      hideModal();
      onCancelButtonClick();
    };
  }

  const renderModal = () => <CustomModal {...modalProps} open={visible} />;

  // Render the modal to a portal if it's visible
  return {
    showModal,
    hideModal,
    ModalPortal: visible ? () => ReactDOM.createPortal(renderModal(), document.body) : null,
  };
};

export default useCustomModal;

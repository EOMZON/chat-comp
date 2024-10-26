import React, { useEffect } from 'react';
import { userStore } from '@/store';
import useCustomModal from '@/components/common/Modal/useModal';
import { businessGotoLogin } from '@/utils/v1/iframeMessage';

export default function LoginModal() {
  const user = userStore();
  const { showModal, ModalPortal, hideModal } = useCustomModal();

  // useEffect(() => {
  //   if (!user.user) {
  //     const hasErrMsg = user.userErrMsg;
  //     showModal({
  //       onOkButtonClick: hasErrMsg
  //         ? undefined
  //         : () => {
  //             businessGotoLogin();
  //           },
  //       okText: '去登录',
  //       content: (
  //         <div className="flex flex-col items-center">
  //           <img src="/assets/login.png" width={120} height={79} alt="" />
  //           <span className="mt-[10px] p-3 text-[16px] font-normal">
  //             {hasErrMsg || '您处于未登录状态'}
  //           </span>
  //         </div>
  //       ),
  //     });
  //   } else {
  //     hideModal();
  //   }
  // }, [user.user, hideModal, showModal]);

  return <>{ModalPortal && <ModalPortal />}</>;
}

import { LikeOutlined, DislikeOutlined, StarOutlined } from '@ant-design/icons';
import { postFeedbackApi, FEEDBACK_TYPE } from '@/services/feedback';
import { createFavoritesApi, deleteFavoriteApi } from '@/services/favorites';
// import { conversationStore } from '@/store';
import { App } from 'antd';
import { useState } from 'react';
import { themeStore } from '@/store';

interface MsgFucBarProps {
  msgID: string;
  onlyStar?: boolean;
  onLikeClick?: () => void;
  onDislikeClick?: () => void;
  onStarClick?: () => void;
  likeActive?: boolean;
  dislikeActive?: boolean;
  starActive: boolean;
}
export default function MsgFucBar(props: MsgFucBarProps) {
  const { message } = App.useApp();
  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  const {
    msgID,
    onlyStar = false,
    onLikeClick,
    onDislikeClick,
    onStarClick,
    likeActive,
    dislikeActive,
    starActive,
  } = props;

  const [start, setStar] = useState(starActive);
  const [dislike, setDislike] = useState(dislikeActive);
  const [like, setLike] = useState(likeActive);

  const iconActiveColor = isDark ? '#00CCFF' : '#2f59f0';
  const iconDefaultColor = isDark ? '#fff' : '';

  return (
    <div>
      {!onlyStar && (
        <span>
          <LikeOutlined
            style={{ fontSize: '18px', color: like ? iconActiveColor : iconDefaultColor }}
            onClick={async () => {
              console.log(`主动触发反馈`);
              const res = await postFeedbackApi(msgID, {
                feedback_type: FEEDBACK_TYPE.THUMB_UP,
                reason: '默认原因',
              });
              console.log(`postFeedbackApi res:`, res);

              if (res.code === 200) {
                if (!like) {
                  message.success('您的反馈已提交', 1);
                  if (dislike) {
                    setDislike(false);
                  }
                }

                setLike(!like);
              }

              // _conversationStore.refreshCurrentConversation();

              onLikeClick?.();
            }}
          />
          <DislikeOutlined
            onClick={async () => {
              console.log(`主动触发反馈`);
              const res = await postFeedbackApi(msgID, {
                feedback_type: FEEDBACK_TYPE.THUMB_DOWN,
                reason: '默认原因',
              });
              console.log(`postFeedbackApi res:`, res);
              if (res.code === 200) {
                if (!dislike) {
                  message.success('您的反馈已提交', 1);

                  if (like) {
                    setLike(false);
                  }
                }

                setDislike(!dislike);
              }

              onDislikeClick?.();
            }}
            style={{
              fontSize: '18px',
              color: dislike ? iconActiveColor : iconDefaultColor,
              marginRight: '10px',
              marginLeft: '10px',
              borderLeft: '1px solid #eaedf6',
              borderRight: '1px solid #eaedf6',
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          />
        </span>
      )}
      <StarOutlined
        onClick={async () => {
          console.log(`主动触发收藏`);
          let res = null;
          if (start) {
            res = await deleteFavoriteApi(msgID);
            console.log('deleteFavoriteApi res:', res);
          } else {
            res = await createFavoritesApi({
              message_id: msgID,
            });
            console.log('createFavoritesApi res:', res);
            if (res.code === 200) {
              message.success('您已收藏该条记录，可在收藏记录中查看并插入下次对话', 2);
            }
          }

          if (res.code === 200) {
            setStar(!start);
          }

          onStarClick?.();
        }}
        style={{ fontSize: '18px', color: start ? iconActiveColor : iconDefaultColor }}
      />
    </div>
  );
}

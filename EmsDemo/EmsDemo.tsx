import React, { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { getTenantListApi } from '@/services/auth';
import {
  Input,
  Button,
  Select,
  message,
  Spin,
  Avatar,
  Space,
  ConfigProvider,
  Checkbox,
} from 'antd';
import { TenantInfo } from '@/types';
import { parseJSON } from '@/utils/common';
import ImageUpload from '@/components/Upload/Upload';
import Download from '@/components/Upload/Download';

// const projects = [
//   { label: '东莞星河城', value: '18b20bf4b2d04e169c3175f113960db1' },
//   { label: '厦门乾照光电有限公司', value: 'd45b3254dafe4eed8c1c1260c3db5e8e' },
// ];
const projects = [
  {
    label: '没权限效果验证',
    value: 'xxxxxxxxxxx',
  },
  {
    label: '新疆昌吉',
    value:
      'eyJhcHBJZCI6ImFfZDU4Njk2YzQxZjI2NGM4ODhkMmFiZWVkZGEyMTlmY2YiLCJjdXN0b21lclRlbmFudElkIjoiZDEzMjM3YTQtZWVmZC00ZWJlLTkyOWQtNGVjYWNlNTgzNTU5IiwiY3VzdG9tZXJVc2VySWQiOiJ6aHV0aWFueXUiLCJjdXJyZW50VGltZSI6IjE3MjY3NDIzODA0NjEiLCJzaWduYXR1cmUiOiI5NTgzMjM5MTg5OTc1NGM3YjY3NWUyYjRiNDA4ZGZlMWNlZmQ3NTg2M2IxMzM4MDAyNTc5ZDA3MWMyYTNkZDBjIiwiYXV0aFR5cGUiOjB9',
  },
  {
    label: '东莞星河城',
    value:
      'eyJhcHBJZCI6ImFfMTVjMTQwMzkwZGU1NDk0OGFmODhhZDliMzlkMWZkMmYiLCJjdXN0b21lclRlbmFudElkIjoiMThiMjBiZjRiMmQwNGUxNjljMzE3NWYxMTM5NjBkYjEiLCJjdXN0b21lclVzZXJJZCI6IjM2MmE2ZDBjLTg3YjgtNDhjYy1iNDBlLWE0ZWMwMWQ2YmViNyIsImN1cnJlbnRUaW1lIjoiMTcyNjMyNTQ3NTMzNCIsInNpZ25hdHVyZSI6IjRiNGU5YWQxYzZiZWVjNmVmYjM3ZDg4YmQwOWUxMGVkYmFiZTVkN2E4YmE5NjFmOWYxZDVhZmViYWI3ZDk2MDciLCJhdXRoVHlwZSI6MH0=',
  },
];

const localStorageKey = '__ems-demo-user__';
export default function EMSDemo() {
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2 });
  const router = useRouter();
  const [userToken, setUserToken] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [authNew, setAuthNew] = useState(false);
  const QRLoginObj = useRef(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantInfo>();
  const [bidList, setBidList] = useState<TenantInfo[]>([]);
  const qrContainerRef = useRef<any>();
  const feishuGotoUrl = useRef('');
  const qrLoginParams = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOauth = (t = currentTenant) => t?.auth_type === 'oauth2';

  const handleLogin = (config: {
    userToken?: string;
    bid?: string;
    access_token?: string;
    auth_type?: string;
    cb?: (isSuccess: boolean) => void;
  }) => {
    console.log(`authNew:`, authNew, '  config:', config);
    // const params = authNew ? { access_token: userToken } : { userToken, bid };
    __ECMASSDK__.login(config, (res: any) => {
      if (res.code === 200) {
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({
            ...res.data,
            authNew,
          }),
        );
        setUserInfo(res.data);
        // 所为
        // if (authNew) {
        //   // __ECMASSDK__.setExtData({
        //   //   project: { project_name: projects[0].label, project_id: projects[0].value },
        //   // });
        //   setAuthNew(true);
        // } else {
        //   // __ECMASSDK__.setExtData({
        //   //   project: null,
        //   // });
        //   setAuthNew(false);
        // }
        config?.cb?.(true);
      } else {
        config?.cb?.(false);
      }

      messageApi.info(res.msg);
    });
  };

  const loadTenant = useCallback(() => {
    getTenantListApi().then(async (res) => {
      if (!Array.isArray(res.data) || res.data.length === 0) {
        messageApi.error(`获取tenant失败：${res.msg}`);
        return;
      }
      setBidList(res.data);
      setCurrentTenant(res.data[0]);
    });
  }, [currentTenant]);

  useEffect(() => {
    const handleMessage = function (event: MessageEvent) {
      // 使用 matchOrigin 和 matchData 方法来判断 message 和来自的页面 url 是否合法
      if (
        (QRLoginObj.current as any)?.matchOrigin(event.origin) &&
        (QRLoginObj.current as any)?.matchData(event.data)
      ) {
        console.log(`扫码授权成功:`, event);

        // 在授权页面地址上拼接上参数 tmp_code，并跳转
        const loginTmpCode = event.data.tmp_code;
        const url = `${feishuGotoUrl.current}&tmp_code=${loginTmpCode}`;
        console.warn(`url:`, url);
        window.location.href = url;
      }
    };

    if (isOauth(currentTenant)) {
      feishuGotoUrl.current = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${global.__ENVCONFIG__?.FEISHU_APPID}&redirect_uri=${encodeURIComponent(
        `${location.origin}${location.pathname}?key=${router.query.key}&tenantId=${currentTenant!.id}&auth_type=${currentTenant!.auth_type}`,
      )}&response_type=code&state=success_login`;
      // 构造飞书二维码
      QRLoginObj.current = window.QRLogin({
        id: qrContainerRef.current.id,
        goto: feishuGotoUrl.current,
        width: '300',
        height: '300',
        //  style: 'width:500px;height:600px', //可选的，二维码html标签的style属性
      });

      window.addEventListener('message', handleMessage, false);
    } else {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
    }

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [currentTenant]);

  // 获取当前登录的用户信息
  useEffect(() => {
    const _useInfo = localStorage.getItem(localStorageKey);
    setUserInfo(_useInfo ? parseJSON(_useInfo) : null);
    const qs = router.query;
    console.warn(`====demo router.query`, qs, _useInfo);

    // 已登录
    if (_useInfo) {
      setLoading(false);
      setAuthNew(parseJSON(_useInfo).authNew);
    } else {
      // 未登录 url参数里含有预期的参数(场景是飞书sso登录回调的时候)，则先缓存下来，等jssdk初始化完再登录
      if (qs.code && qs.tenantId) {
        // login(qs.code as string, Number(qs.tenantId));
        qrLoginParams.current.push(qs.code as string, Number(qs.tenantId), qs.auth_type);
        console.log(`缓存url参数:`, qrLoginParams.current);
      } else {
        setLoading(false);
      }

      loadTenant();
    }
  }, []);

  useEffect(() => {
    console.log('business page(demo page):', router.query);
  }, [router.query]);

  function handleTenantChange(tenantId: number) {
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
    const tenant = bidList.find((item) => item.id === tenantId);
    setCurrentTenant(tenant);
  }

  return (
    <div
      className={`text-400 flex h-dvh w-full justify-center bg-[#102039]  bg-cover bg-no-repeat p-20 text-center text-3xl text-white`}
    >
      {contextHolder}

      <Script
        src={`/ecmas-jssdk.min.js?time=${Date.now()}&modelType=${router.query.t}&zIndex=77777&themes=${router.query.themes}&buttonTop=100px`}
        onLoad={() => {
          if (!userInfo) {
            //@ts-ignore
            //__ECMASSDK__.logout();
          }
          console.warn(`__ECMASSDK__ ready.`);
          const params = qrLoginParams.current;
          // 飞书扫码后回跳
          if (params.length === 3) {
            handleLogin({
              userToken: params[0],
              bid: params[1],
              auth_type: params[2],
              cb: () => {
                setLoading(false);
              },
            });
          }
          //chat通知业务系统要退出登录了
          __ECMASSDK__.onChatCallback(({ type }: { type: string }) => {
            if (type === 'gotoLogin') {
              localStorage.removeItem(localStorageKey);
              loadTenant();
              setUserInfo(null);
            }
          });
        }}
      />
      <Spin
        tip={
          <span className="text-white" style={{ textShadow: 'none' }}>
            请稍候...
          </span>
        }
        spinning={loading}
        wrapperClassName=""
      >
        <div
          className={`rounded-2xl  p-5 ${loading ? 'h-[400px] bg-white opacity-0' : ' bg-[#ebf1ef5e]'} `}
        >
          ECMAS能碳助手
          <ConfigProvider
            theme={{
              components: {
                Select: {
                  colorBgContainer: '#626d7c',
                  // colorText: '#fff',
                  // colorBgBase: 'gray',
                },
                Input: {
                  colorText: '#fff',
                },
              },
            }}
          >
            {userInfo && authNew ? (
              <div
                className="mt-3 flex items-center justify-center bg-[#626d7c]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Space.Compact className="">
                  <Input
                    className="w-[140px] text-center text-white"
                    defaultValue="测试项目切换效果"
                    disabled
                  />
                  <Select
                    className="w-[200px]"
                    placeholder="请选择"
                    labelInValue
                    onChange={(v: any) => {
                      console.log(v);
                      // __ECMASSDK__.setExtData({
                      //   project: { project_name: v.label, project_id: v.value },
                      // });
                      handleLogin({
                        access_token: v.value,
                        cb: (isSuccess) => {
                          isSuccess && message.info(`切换项目${v.label}成功`);
                        },
                      });
                    }}
                    defaultValue={projects[0].value}
                    options={projects}
                  />
                </Space.Compact>
              </div>
            ) : null}
          </ConfigProvider>
          <div className="m-auto mt-9 flex min-w-[440px] flex-col items-center justify-around">
            {userInfo ? (
              <div>
                {userInfo.avatar ? (
                  <Avatar
                    size={60}
                    className=" z-[1] border border-white"
                    src={userInfo.avatar}
                    icon={<img src="/assets/user.jpg" />}
                  />
                ) : null}
                <div className="z-10 mt-1 rounded-lg border border-white  px-6 py-2 text-xs">
                  {Object.keys(userInfo).map((key) => {
                    if (key === 'avatar') return null;
                    return (
                      <div key={key} className="flex justify-around text-sm">
                        <span className="mr-3">{key}:</span>
                        <span>{userInfo[key]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-center">
                <div className="flex items-center justify-center">
                  <span className="mr-2 w-[100px] text-[16px]">使用新鉴权:</span>
                  <Checkbox
                    value={authNew}
                    className="text-[#e6e9ec]"
                    onChange={(e) => {
                      console.log(`checked = ${e.target.checked}`);
                      setAuthNew(e.target.checked);
                    }}
                  >
                    access_token方式
                  </Checkbox>
                </div>

                {authNew ? null : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2 w-[100px] text-[16px]">选择租户:</span>
                    <Select
                      value={currentTenant?.id}
                      className="w-[296px]"
                      onChange={handleTenantChange}
                      options={bidList.map(({ id, name }) => ({
                        value: id,
                        label: name,
                      }))}
                    />
                  </div>
                )}
                <div className="ml-6 mt-2">
                  {isOauth() ? (
                    <div
                      className={`border-red flex w-[371px] flex-col items-center rounded-md border border-solid bg-white p-1`}
                    >
                      <div className="text-[16px] text-black">请使用飞书扫码登录</div>
                      <div ref={qrContainerRef} id="qrContainer"></div>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center`}>
                      <span className="mr-0 w-[94px] text-[16px]">输入账号:</span>
                      <Input.Group compact>
                        <Input
                          className="!w-[230px]"
                          value={userToken}
                          onChange={(e) => {
                            setUserToken(e.target.value);
                          }}
                          placeholder="请输入登录用户token"
                        />
                        <Button
                          type="primary"
                          disabled={!userToken || !!userInfo}
                          onClick={() => {
                            handleLogin(
                              authNew
                                ? { access_token: userToken }
                                : {
                                    userToken: userToken,
                                    bid: `${currentTenant!.id}`,
                                    auth_type: currentTenant?.auth_type,
                                  },
                            );
                          }}
                        >
                          登录
                        </Button>
                      </Input.Group>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              {userInfo ? (
                <Button
                  type="primary"
                  onClick={() => {
                    localStorage.removeItem(localStorageKey);
                    setUserInfo(null);
                    //@ts-ignore
                    __ECMASSDK__.logout((res) => {
                      if (res.code === 0) {
                      }
                      loadTenant();

                      messageApi.info(res.msg);
                    });
                  }}
                  className="ml-3"
                >
                  退出登录
                </Button>
              ) : null}
            </div>
          </div>
          <Script onReady={() => {}} src="/LarkSSOSDKWebQRCode-1.0.3.js" />
        </div>
      </Spin>

      {/* 20241012 增加上传背景图片 以便于演示在不同项目背景中的效果 */}
      <ImageUpload onUploadSuccess={() => {}} userInfo={userInfo} />
      {userInfo && <Download />}
    </div>
  );
}

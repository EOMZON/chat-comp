import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type { EChartsOption, EChartsType, SeriesOption } from 'echarts';
import { ErrorBoundary } from 'react-error-boundary';
import { App } from 'antd';
import { parseJSON } from '@/utils';
import * as echarts from 'echarts/core';
import dark from './themes-dark';
import {
  LineChart,
  BarChart,
  PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from 'echarts/charts';
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  // CalendarComponent,
  // GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  // AxisPointerComponent,
  // BrushComponent,
  TitleComponent,
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  LegendComponent,
  // LegendScrollComponent,
  // LegendPlainComponent,
  DataZoomComponent,
  // DataZoomInsideComponent,
  // DataZoomSliderComponent,
  // VisualMapComponent,
  // VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  // AriaComponent,
  // TransformComponent,
  DatasetComponent,
} from 'echarts/components';
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers';
import { TitleOption } from 'echarts/types/dist/shared.js';
import EventBus from '@/utils/v1/eventBus';

import { themeStore } from '@/store';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  BarChart,
  DatasetComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
]);

echarts.registerTheme('ecmas-dark', {
  ...dark,
});

interface EChartsMsgProps {
  contentId: string;
  title?: string;
  /** echarts options字符串 */
  echartsOptionsString: string;
  className?: string;

  /** 来自工作台还是对话框还是分享页 */
  from: 'chat' | 'workbench' | 'share';

  /** 是否钉在工作台 from='chat' 时有效 */
  pined?: boolean;
  onPined?: (callback: (isSuccess: boolean) => void) => Promise<void>;
  onChartTypeChange?: (chartType: string) => Promise<void>;
}

const EChartsMsg: React.FC<EChartsMsgProps> = ({
  contentId,
  title,
  echartsOptionsString,
  className,
  from,
  pined = false,
  onPined = () => {},
  onChartTypeChange = () => {},
}) => {
  const { message } = App.useApp();
  const [isPined, setIsPined] = useState(pined);

  const isPinedRef = useRef(pined);
  const contentIdRef = useRef(contentId);
  const echartsInstanceRef = useRef<EChartsType | null>(null);

  const echartsOptions = parseJSON(echartsOptionsString);

  const _themeStore = themeStore();
  const isDark = _themeStore.isDarkThemes();

  const [chartType, setChartType] = useState((echartsOptions?.series as SeriesOption[])?.[0]?.type);

  const isFromChat = from === 'chat';

  const chartTitle = title || (echartsOptions?.title as TitleOption)?.text;

  const isPieChart = chartType === 'pie';
  const isBarChart = chartType === 'bar';
  const isLineChart = chartType === 'line';

  useEffect(() => {
    const updatePinedCallback = (contentId: string, isPined: boolean) => {
      // console.log(`====${contentIdRef.current}:`, contentId, isPined);
      if ((contentIdRef.current = contentId)) {
        setIsPined(isPined);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        echartsInstanceRef.current?.resize();
      }
    };

    if (isFromChat) {
      EventBus.on('updatePined', updatePinedCallback);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      echartsInstanceRef.current?.dispose?.();
      // isPinedRef.current = false;
      echartsInstanceRef.current = null;

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (isFromChat) {
        EventBus.off('updatePined', updatePinedCallback);
      }
    };
  }, []);

  useEffect(() => {
    isPinedRef.current = isPined;
  }, [isPined]);

  useEffect(() => {
    contentIdRef.current = contentId;
  }, [contentId]);

  // const magictypechanged = useCallback((event: any) => {
  //   console.log('切换事件：', event.currentType);
  //   onChartTypeChange(event.currentType);
  // }, []);

  const handlePined = useCallback(() => {
    if (isPinedRef.current) {
      return;
    }

    onPined((isSuccess) => {
      if (isSuccess) {
        message.info(`图表 ⌜${chartTitle}⌟ 已经保存到工作台`);
        setIsPined(true);
        isPinedRef.current = true;
      }
    });
  }, []);

  const handleBarClick = useCallback(() => {
    setChartType('bar');
    onChartTypeChange('bar');
  }, []);
  const handleLineClick = useCallback(() => {
    setChartType('line');
    onChartTypeChange('line');
  }, []);

  const handleChartReady = useCallback((chart: EChartsType) => {
    // 在图表准备就绪时，保存 echarts 实例的引用
    echartsInstanceRef.current = chart;
  }, []);

  if (!echartsOptions) return <span>表格处理中</span>;

  const workbenchTools = {
    saveAsImage: {
      // 保存图表
      title: '',
      name: chartTitle,
      onclick() {},
    },
  };

  if (!isPieChart) {
    Object.assign(workbenchTools, {
      myBarBtn: {
        show: true,
        title: '',
        icon: 'M6.7,22.9h10V48h-10V22.9zM24.9,13h10v35h-10V13zM43.2,2h10v46h-10V2zM3.1,58h53.7',
        iconStyle: {
          borderColor: isBarChart ? '#3E98C5' : '#666666',
        },
        onclick: handleBarClick,
      },
      myLineBtn: {
        show: true,
        title: '',
        icon: 'M4.1,28.9h7.1l9.3-22l7.4,38l9.7-19.7l3,12.8h14.9M4.1,58h51.4',
        iconStyle: {
          borderColor: isLineChart ? '#3E98C5' : '#666666',
        },
        onclick: handleLineClick,
      },
    });
  }

  const newOption: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#0B6098' : '#fff', // 设置背景色
      textStyle: {
        color: isDark ? '#fff' : '#000', // 设置文本颜色
      },
      appendToBody: true,
      formatter: isPieChart ? '{d}% {b}' : '',
      position: function (point, params, dom, rect, size) {
        const [x, y] = point;
        const [viewWidth, viewHeight] = size.viewSize;
        const [boxWidth, boxHeight] = size.contentSize;

        let tooltipX = x;
        let tooltipY = y;

        if (x + boxWidth > viewWidth) {
          tooltipX -= boxWidth;
        }
        if (y + boxHeight > viewHeight) {
          tooltipY -= boxHeight;
        }

        return [tooltipX, tooltipY];
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: 80,
      top: 30,
      containLabel: true,
    },
    dataZoom: [
      // 底部缩放控制条
      // {
      //   type: 'inside',
      //   start: 0,
      //   end: 10,
      // },
      {
        type: 'slider',
        start: 0,
        end: 100,
        left: 70,
        right: 83,
        height: 20,
        labelFormatter: (value, valueStr) => {
          return valueStr;
        },
        textStyle: {
          fontSize: 10,
          color: isDark ? '#fff' : '#000',
          distance: 1,
          ellipsis: 'break',
          position: 'right',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    toolbox: {
      feature: isFromChat
        ? {
            myTools: {
              show: true,
              title: isPined ? '图表已保存到工作台' : '保存图表到工作台',
              icon: isPined ? 'image:///assets/unpin.svg' : 'image:///assets/pin.png',
              iconStyle: {},
              onclick: handlePined,
            },
          }
        : workbenchTools,
      bottom: 50,
      left: 20,
    },
    legend: {
      // 图例 可切换的图例
      align: 'left',
      left: isFromChat || isPieChart ? 50 : 100,
      right: 10,
      bottom: 50,
      type: 'scroll',
      pageIconColor: isDark ? '#fff' : '#888', // 导航按钮的颜色
      pageIconInactiveColor: isDark ? 'gray' : '#ddd', // 导航按钮不激活时的颜色
      pageTextStyle: {
        color: isDark ? '#fff' : '#000', // 导航页码文本的颜色
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      // axisLabel: {
      //   margin: 20, // 设置偏移量，避免与数据标签重叠
      // },
    },
  };

  if (echartsOptions.dataset) {
    newOption.dataset = echartsOptions.dataset;
  }

  if (echartsOptions.series) {
    let series = echartsOptions.series;
    if (!Array.isArray(series)) {
      series = [series];
    }

    newOption.series = series.map((item: SeriesOption) => {
      // 调整饼图的大小和位置等
      return {
        center: ['50%', '40%'],
        radius: '50%',
        data: item.data,
        name: item.name,
        type: isPieChart ? 'pie' : chartType,
        labelLine: {
          length: 10, // 饼图伸出来的触须的长度
        },

        label: isPieChart
          ? {
              // 饼图显示每块的数据详情 触须
              alignTo: 'edge',
              // https://echarts.apache.org/examples/zh/editor.html?c=pie-legend
              // https://echarts.apache.org/zh/option.html#series-line.label.formatter
              formatter: '{d}% {b}',

              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                c: {
                  // 格式化富文本
                  fontSize: 10,
                  color: '#999',
                },
              },
            }
          : {
              // 柱状图和折线图在内部显示数据详情
              position: 'top',
              show: !isFromChat,
              offset: [40, -40], // 调整偏移量，避免与 Y 坐标轴重叠
            },
        // labelLine: {// 数据引导线
        //   length: 15,
        //   length2: 0,
        //   maxSurfaceAngle: 80,
        // },
        labelLayout: {
          hideOverlap: true, // 自动隐藏重叠的标签
        },
      };
    });
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="mx-[20px] my-[20px] border border-dashed border-[#cdd0bc] text-center text-gray-300">
          图表渲染异常
        </div>
      }
    >
      <ReactEChartsCore
        echarts={echarts}
        onChartReady={handleChartReady}
        option={newOption}
        className={`h-[200px] min-w-[260px] ${className}`}
        theme={isDark ? 'ecmas-dark' : undefined}
        // onEvents={{ magictypechanged }}
      />
    </ErrorBoundary>
  );
};
export default memo(EChartsMsg);

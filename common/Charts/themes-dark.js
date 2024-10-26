// https://github.com/apache/echarts/blob/master/theme/dark.js
// https://echarts.apache.org/zh/theme-builder.html

export default {
  color: ['#2f59f1', '#00b930', '#ff8029', '#c1c828', '#b96666'],
  backgroundColor: '#0e4163',
  textStyle: {},
  title: {
    textStyle: {
      color: '#ffffff',
    },
    subtextStyle: {
      color: '#dddddd',
    },
  },
  line: {
    itemStyle: {
      borderWidth: '4',
    },
    lineStyle: {
      width: '1',
    },
    symbolSize: '1',
    symbol: 'emptyCircle',
    // symbolSize: '0',
    // symbol: 'circle',
    // symbolBorderWidth: '4',
    smooth: true,
  },
  radar: {
    itemStyle: {
      borderWidth: '4',
    },
    lineStyle: {
      width: '1',
    },
    symbolSize: '1',
    symbol: 'emptyRoundRect',
    smooth: true,
  },
  bar: {
    itemStyle: {
      barBorderWidth: '0',
      barBorderColor: '#1755e2',
    },
  },
  pie: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  scatter: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  boxplot: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  parallel: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  sankey: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  funnel: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  gauge: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
  },
  candlestick: {
    itemStyle: {
      color: '#fc97af',
      color0: 'transparent',
      borderColor: '#fc97af',
      borderColor0: '#87f7cf',
      borderWidth: '2',
    },
  },
  graph: {
    itemStyle: {
      borderWidth: '0',
      borderColor: '#1755e2',
    },
    lineStyle: {
      width: '1',
      color: '#ffffff',
    },
    symbolSize: '1',
    symbol: 'emptyRoundRect',
    smooth: true,
    color: ['#2f59f0', '#00b930', '#ff8029', '#c1c828', '#b96666'],
    label: {
      color: '#293441',
    },
  },
  map: {
    itemStyle: {
      areaColor: '#f3f3f3',
      borderColor: '#999999',
      borderWidth: 0.5,
    },
    label: {
      color: '#893448',
    },
    emphasis: {
      itemStyle: {
        areaColor: 'rgba(255,178,72,1)',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
      label: {
        color: 'rgb(137,52,72)',
      },
    },
  },
  geo: {
    itemStyle: {
      areaColor: '#f3f3f3',
      borderColor: '#999999',
      borderWidth: 0.5,
    },
    label: {
      color: '#893448',
    },
    emphasis: {
      itemStyle: {
        areaColor: 'rgba(255,178,72,1)',
        borderColor: '#eb8146',
        borderWidth: 1,
      },
      label: {
        color: 'rgb(137,52,72)',
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#286187',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#104d75',
      },
    },
    axisLabel: {
      show: true,
      color: '#b6cfdf',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#104d75'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#286187',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#104d75',
      },
    },
    axisLabel: {
      show: true,
      color: '#b6cfdf',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#104d75'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#286187',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#104d75',
      },
    },
    axisLabel: {
      show: true,
      color: '#b6cfdf',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#104d75'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#286187',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#104d75',
      },
    },
    axisLabel: {
      show: true,
      color: '#b6cfdf',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#104d75'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)'],
      },
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: '#7396d9',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#ffffff',
      },
    },
  },
  legend: {
    textStyle: {
      color: '#b6cfdf',
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#cccccc',
        width: 1,
      },
      crossStyle: {
        color: '#cccccc',
        width: 1,
      },
    },
  },
  timeline: {
    lineStyle: {
      color: '#87f7cf',
      width: '2',
    },
    itemStyle: {
      color: '#87f7cf',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#87f7cf',
      borderColor: '#87f7cf',
      borderWidth: '1',
    },
    checkpointStyle: {
      color: '#fc97af',
      borderColor: '#fc97af',
    },
    label: {
      color: '#87f7cf',
    },
    emphasis: {
      itemStyle: {
        color: '#f7f494',
      },
      controlStyle: {
        color: '#87f7cf',
        borderColor: '#87f7cf',
        borderWidth: '1',
      },
      label: {
        color: '#87f7cf',
      },
    },
  },
  visualMap: {
    color: ['#9a97fc', '#87f7cf'],
  },
  dataZoom: {
    backgroundColor: 'rgba(255,255,255,0)',
    dataBackgroundColor: 'rgba(114,204,255,1)',
    fillerColor: 'rgba(114,204,255,0.2)',
    handleColor: '#72ccff',
    handleSize: '100%',
    textStyle: {
      color: '#333333',
    },
  },
  markPoint: {
    label: {
      color: '#293441',
    },
    emphasis: {
      label: {
        color: '#293441',
      },
    },
  },
};

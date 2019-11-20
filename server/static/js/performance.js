var performance = window.performance;

if (!performance) {
  console.log('您的浏览器不支持性能监控');
} else {
  document.onreadystatechange = function () {
    // 文档加载完成
    if (document.readyState === 'complete') {
      var timing = performance.timing;
      setTimeout(function () {
        if (timing.loadEventEnd - timing.navigationStart > 0) {
          var time = {
            // 页面加载耗时
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            // 从页面开始加载到DOM开始解析耗时
            domReadyResolve: timing.domLoading - timing.navigationStart,
            // DOM解析耗时
            domResolved: timing.domComplete - timing.domLoading,
            // 白屏时间
            firstPaint: timing.responseStart - timing.navigationStart,
            // 内容加载耗时
            contentLoad: timing.responseEnd - timing.requestStart,
            // 从内容开始加载到可交互耗时
            interactive: timing.domInteractive - timing.requestStart
          };
          console.table(time);
          console.log('各项资源加载情况：', performance.getEntries())
        } else {
          console.log('性能监控超时')
        }
      }, 2000)
    }
  };
}
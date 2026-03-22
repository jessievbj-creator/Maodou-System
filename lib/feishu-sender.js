// 飞书推送毛豆日报
function sendMaodouReportToFeishu(report) {
  const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/7a6925e6-27d3-4e9f-ac52-3d950da9cef6';
  
  const message = `${report.performanceEmoji} 毛豆今日学习报告

📊 今日表现：${report.performanceLevel}
🎯 今日积分：${report.totalScore}分
✅ 完成度：${report.completionRate}%

${report.performanceText}

📈 任务完成情况：
• 优秀（满分）：${report.excellentCount}个
• 良好：${report.goodCount}个
• 需要改进：${report.needsImprovementCount}个

💡 改善建议：
${report.suggestions.map(s => '• ' + s).join('\n')}

${report.habitSuggestion}

💬 给毛豆的话：
${report.encouragement}

---
加油，毛豆！💪`;

  const data = JSON.stringify({
    msg_type: 'text',
    content: {
      text: message
    }
  });

  const https = require('https');
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(FEISHU_WEBHOOK, options, (res) => {
    console.log(`飞书推送状态: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`飞书推送失败: ${e.message}`);
  });

  req.write(data);
  req.end();
}

module.exports = { sendMaodouReportToFeishu };

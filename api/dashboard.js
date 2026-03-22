module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>毛豆数据面板</title>
  <style>
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      overflow-x: hidden;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
      animation: slideIn 0.6s ease-out;
    }
    
    .header h1 {
      font-size: 36px;
      margin-bottom: 10px;
      animation: float 3s ease-in-out infinite;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .score-card {
      background: white;
      border-radius: 25px;
      padding: 35px;
      margin-bottom: 20px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
      animation: slideIn 0.6s ease-out 0.1s both;
      position: relative;
      overflow: hidden;
    }
    
    .score-display {
      font-size: 72px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
      animation: pulse 2s ease-in-out infinite;
      position: relative;
      z-index: 1;
    }
    
    .score-label {
      font-size: 16px;
      color: #999;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    
    .reward-info {
      background: linear-gradient(135deg, #FFE66D 0%, #95E1D3 100%);
      border-radius: 15px;
      padding: 18px;
      font-size: 14px;
      color: #333;
      font-weight: 600;
      position: relative;
      z-index: 1;
      box-shadow: 0 8px 20px rgba(255, 230, 109, 0.3);
    }
    
    .reward-info strong {
      color: #667eea;
      font-size: 16px;
    }
    
    .trend-section {
      background: white;
      border-radius: 25px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.6s ease-out 0.2s both;
    }
    
    .trend-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #333;
    }
    
    .trend-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 180px;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .trend-bar {
      flex: 1;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px 12px 0 0;
      position: relative;
      min-height: 15px;
      transition: all 0.3s;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      animation: slideIn 0.6s ease-out backwards;
    }
    
    .trend-bar:hover {
      transform: scaleY(1.1);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
    }
    
    .trend-label {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #999;
      white-space: nowrap;
      font-weight: 600;
    }
    
    .trend-value {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 13px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%);
      border-radius: 15px;
      padding: 20px;
      text-align: center;
      color: white;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
      animation: slideIn 0.6s ease-out 0.3s both;
    }
    
    .stat-card:nth-child(2) {
      background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
      box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
      animation-delay: 0.35s;
    }
    
    .stat-number {
      font-size: 28px;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .footer {
      text-align: center;
      color: white;
      font-size: 13px;
      margin-top: 30px;
      animation: slideIn 0.6s ease-out 0.4s both;
    }
    
    .link {
      color: white;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 毛豆数据面板</h1>
      <p id="dateDisplay"></p>
    </div>
    
    <div class="score-card">
      <div class="score-display" id="scoreDisplay">0</div>
      <div class="score-label">今日积分</div>
      <div class="reward-info" id="rewardInfo">
        还需要 <strong>60</strong> 分解锁 1 小时游戏时间
      </div>
    </div>
    
    <div class="trend-section">
      <div class="trend-title">📈 7天趋势</div>
      <div class="trend-chart" id="trendChart"></div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number" id="avgScore">0</div>
          <div class="stat-label">平均分</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" id="maxScore">0</div>
          <div class="stat-label">最高分</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><span class="link" onclick="window.location.href='/score'">✏️ 返回打分</span></p>
    </div>
  </div>
  
  <script>
    async function loadDashboard() {
      try {
        const res = await fetch('/api/today');
        const todayData = await res.json();
        
        const date = new Date(todayData.date);
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        document.getElementById('dateDisplay').textContent = 
          \`\${date.getFullYear()}年\${date.getMonth() + 1}月\${date.getDate()}日 \${dayNames[date.getDay()]}\`;
        
        document.getElementById('scoreDisplay').textContent = todayData.totalScore;
        updateRewardInfo(todayData.totalScore);
        loadTrend();
      } catch (err) {
        console.error('加载失败:', err);
      }
    }
    
    function updateRewardInfo(score) {
      let info = '';
      if (score < 60) {
        info = \`还需要 <strong>\${60 - score}</strong> 分解锁 1 小时游戏时间\`;
      } else if (score < 80) {
        info = \`还需要 <strong>\${80 - score}</strong> 分解锁 1.5 小时游戏时间\`;
      } else {
        info = \`🎉 已解锁 1.5 小时游戏时间！\`;
      }
      document.getElementById('rewardInfo').innerHTML = info;
    }
    
    async function loadTrend() {
      try {
        const res = await fetch('/api/trend');
        const trend = await res.json();
        
        const chart = document.getElementById('trendChart');
        chart.innerHTML = '';
        
        const scores = trend.map(t => t.score);
        const maxScore = Math.max(...scores, 100);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const maxScoreValue = Math.max(...scores);
        
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('maxScore').textContent = maxScoreValue;
        
        trend.forEach((item, index) => {
          const height = (item.score / maxScore) * 100;
          const bar = document.createElement('div');
          bar.className = 'trend-bar';
          bar.style.height = height + '%';
          
          const date = new Date(item.date);
          const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
          
          bar.innerHTML = \`
            <div class="trend-value">\${item.score}</div>
            <div class="trend-label">周\${dayNames[date.getDay()]}</div>
          \`;
          
          chart.appendChild(bar);
        });
      } catch (err) {
        console.error('加载趋势失败:', err);
      }
    }
    
    loadDashboard();
    setInterval(loadDashboard, 30000);
  </script>
</body>
</html>`);
};

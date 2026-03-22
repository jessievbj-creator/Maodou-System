const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const https = require('https');

// 飞书 Webhook URL
const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/7a6925e6-27d3-4e9f-ac52-3d950da9cef6';

// 简单的内存数据库
const db = {
  records: {}
};

// 加载数据
function loadData() {
  try {
    const data = fs.readFileSync('./data.json', 'utf8');
    Object.assign(db, JSON.parse(data));
  } catch (err) {
    console.log('首次运行，创建新数据库');
  }
}

// 保存数据
function saveData() {
  fs.writeFileSync('./data.json', JSON.stringify(db, null, 2));
}

// 发送飞书消息
function sendFeishuMessage(message) {
  const data = JSON.stringify({
    msg_type: 'text',
    content: {
      text: message
    }
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(FEISHU_WEBHOOK, options, (res) => {
    console.log(`飞书消息发送状态: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`飞书消息发送失败: ${e.message}`);
  });

  req.write(data);
  req.end();
}

// 获取任务配置
function getTasksConfig(dayType) {
  const configs = {
    weekday: [
      { id: 1, name: '吃晚饭不拖延', score: 10 },
      { id: 2, name: '学校作业视频打卡', score: 20 },
      { id: 3, name: '讯飞学习机练习', score: 15 },
      { id: 4, name: '姥姥卷子完成', score: 15 },
      { id: 5, name: '英语任务', score: 10 },
      { id: 6, name: '读书/听书15分钟', score: 10 },
      { id: 7, name: '9:30前上床', score: 10 }
    ],
    thursday: [
      { id: 1, name: '吃晚饭不拖延', score: 10 },
      { id: 2, name: '学校作业视频打卡', score: 20 },
      { id: 3, name: '学而思数学逻辑思维课', score: 20 },
      { id: 4, name: '课后作业完成', score: 15 },
      { id: 5, name: '英语任务', score: 10 },
      { id: 6, name: '读书/听书15分钟', score: 10 },
      { id: 7, name: '9:30前上床', score: 10 }
    ],
    saturday: [
      { id: 1, name: '起床后学习30分钟', score: 10 },
      { id: 2, name: '街舞课前准备不拖延', score: 10 },
      { id: 3, name: '街舞课认真上', score: 15 },
      { id: 4, name: '学而思英语课认真上', score: 15 },
      { id: 5, name: '读书/听书15分钟', score: 10 },
      { id: 6, name: '9:30前上床', score: 10 }
    ],
    sunday: [
      { id: 1, name: '早起不拖延', score: 10 },
      { id: 2, name: '吃完早饭', score: 10 },
      { id: 3, name: '上午学习1小时完成', score: 30 },
      { id: 4, name: '下午学习2小时完成', score: 30 },
      { id: 5, name: '晚饭后玩1小时+洗澡', score: 10 },
      { id: 6, name: '读书/听书15分钟', score: 10 }
    ]
  };
  
  return configs[dayType] || configs.weekday;
}

// 获取今天的日期和类型
function getTodayInfo() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dateStr = today.toISOString().split('T')[0];
  
  let dayType = 'weekday';
  if (dayOfWeek === 0) dayType = 'sunday';
  else if (dayOfWeek === 6) dayType = 'saturday';
  else if (dayOfWeek === 4) dayType = 'thursday';
  
  return { dateStr, dayOfWeek, dayType };
}

// 获取奖励信息
function getRewardInfo(totalScore) {
  if (totalScore < 60) {
    return { level: 'none', nextAt: 60, remaining: 60 - totalScore };
  } else if (totalScore < 80) {
    return { level: '60', nextAt: 80, remaining: 80 - totalScore };
  } else {
    return { level: '80', nextAt: null, remaining: 0 };
  }
}

// 创建服务器
const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // API: 获取今天的任务
  if (pathname === '/api/today' && req.method === 'GET') {
    const { dateStr, dayType } = getTodayInfo();
    const tasks = getTasksConfig(dayType);
    
    const record = db.records[dateStr] || { tasks: {}, totalScore: 0 };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      date: dateStr,
      dayType: dayType,
      tasks: tasks.map(t => ({
        ...t,
        completed: record.tasks[t.id] || false
      })),
      totalScore: record.totalScore
    }));
    return;
  }
  
  // API: 更新任务
  if (pathname === '/api/task-update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { taskId, completed } = JSON.parse(body);
        const { dateStr, dayType } = getTodayInfo();
        const tasks = getTasksConfig(dayType);
        
        if (!db.records[dateStr]) {
          db.records[dateStr] = { tasks: {}, totalScore: 0, dayType };
        }
        
        db.records[dateStr].tasks[taskId] = completed;
        
        const totalScore = tasks.reduce((sum, t) => {
          return sum + (db.records[dateStr].tasks[t.id] ? t.score : 0);
        }, 0);
        
        db.records[dateStr].totalScore = totalScore;
        saveData();
        
        // 发送飞书通知
        const task = tasks.find(t => t.id === taskId);
        const action = completed ? '✅ 完成' : '❌ 取消';
        const rewardInfo = getRewardInfo(totalScore);
        let message = `🎯 毛豆积分更新\n\n${action}：${task.name}\n当前积分：${totalScore}分`;
        
        if (rewardInfo.level === 'none') {
          message += `\n还需 ${rewardInfo.remaining} 分解锁 1 小时游戏`;
        } else if (rewardInfo.level === '60') {
          message += `\n还需 ${rewardInfo.remaining} 分解锁 1.5 小时游戏`;
        } else {
          message += `\n🎉 已解锁 1.5 小时游戏时间！`;
        }
        
        sendFeishuMessage(message);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, totalScore }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  // API: 获取7天趋势
  if (pathname === '/api/trend' && req.method === 'GET') {
    const today = new Date();
    const dates = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    
    const trend = dates.map(date => ({
      date,
      score: db.records[date] ? db.records[date].totalScore : 0
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(trend));
    return;
  }
  
  // 静态文件
  let filePath = pathname === '/' ? '/score.html' : pathname;
  if (pathname === '/score') filePath = '/score.html';
  if (pathname === '/dashboard') filePath = '/dashboard.html';
  filePath = path.join(__dirname, 'public', filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

loadData();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 毛豆积分系统运行在 http://localhost:${PORT}`);
  console.log(`📱 用浏览器打开上面的地址即可使用`);
});

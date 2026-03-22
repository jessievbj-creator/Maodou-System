const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const { generateMaodouReport } = require('./lib/report-generator');
const { sendMaodouReportToFeishu } = require('./lib/feishu-sender');

// 简单的内存数据库
const db = {
  records: {}
};

// 加载数据
function loadData() {
  // Vercel 环境不支持写文件，所以只在内存中存储
  // 如果需要持久化，可以改用数据库
}

// 保存数据
function saveData() {
  // Vercel 环境不支持写文件，数据只存在内存中
  // 刷新页面后数据会丢失，这是 Vercel 的限制
}

// 发送飞书消息
function sendFeishuMessage(message) {
  const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/7a6925e6-27d3-4e9f-ac52-3d950da9cef6';
  
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

// 获取任务配置（带三档选项）
function getTasksConfig(dayType) {
  const configs = {
    weekday: [
      { 
        id: 1, 
        name: '吃晚饭不拖延',
        maxScore: 10,
        options: [
          { label: '主动按时吃饭，吃得香', score: 10 },
          { label: '有点拖延，但最后吃完了', score: 6 },
          { label: '拖延很久、顶嘴或拒绝吃', score: 2 }
        ]
      },
      { 
        id: 2, 
        name: '学校作业视频打卡',
        maxScore: 20,
        options: [
          { label: '主动完成，认真看，有反馈', score: 20 },
          { label: '完成了，但有点被催或不够认真', score: 13 },
          { label: '拖延、顶嘴或强烈反抗', score: 5 }
        ]
      },
      { 
        id: 3, 
        name: '讯飞学习机练习',
        maxScore: 15,
        options: [
          { label: '主动做题，认真思考', score: 15 },
          { label: '做了，但有点不情愿或需要催', score: 9 },
          { label: '拖延、躺地上或强烈反抗', score: 3 }
        ]
      },
      { 
        id: 4, 
        name: '姥姥卷子完成',
        maxScore: 15,
        options: [
          { label: '主动完成，态度认真', score: 15 },
          { label: '完成了，但有点拖延或不够专注', score: 9 },
          { label: '拖延很久、顶嘴或拒绝做', score: 3 }
        ]
      },
      { 
        id: 5, 
        name: '英语任务',
        maxScore: 10,
        options: [
          { label: '主动完成，发音清晰', score: 10 },
          { label: '完成了，但有点不够认真', score: 6 },
          { label: '拖延或强烈反抗', score: 2 }
        ]
      },
      { 
        id: 6, 
        name: '读书/听书15分钟',
        maxScore: 10,
        options: [
          { label: '主动听书/看书，认真听', score: 10 },
          { label: '听了，但有点心不在焉', score: 6 },
          { label: '拒绝听或躺地上', score: 2 }
        ]
      },
      { 
        id: 7, 
        name: '9:30前上床',
        maxScore: 10,
        options: [
          { label: '主动上床，配合度高', score: 10 },
          { label: '有点拖延，但最后上床了', score: 6 },
          { label: '强烈反抗、顶嘴或躺地上', score: 2 }
        ]
      }
    ],
    thursday: [
      { 
        id: 1, 
        name: '吃晚饭不拖延',
        maxScore: 10,
        options: [
          { label: '主动按时吃饭，吃得香', score: 10 },
          { label: '有点拖延，但最后吃完了', score: 6 },
          { label: '拖延很久、顶嘴或拒绝吃', score: 2 }
        ]
      },
      { 
        id: 2, 
        name: '学校作业视频打卡',
        maxScore: 20,
        options: [
          { label: '主动完成，认真看，有反馈', score: 20 },
          { label: '完成了，但有点被催或不够认真', score: 13 },
          { label: '拖延、顶嘴或强烈反抗', score: 5 }
        ]
      },
      { 
        id: 3, 
        name: '学而思数学逻辑思维课',
        maxScore: 20,
        options: [
          { label: '认真听课，积极参与', score: 20 },
          { label: '听课了，但有点不够专注', score: 13 },
          { label: '拖延、顶嘴或强烈反抗', score: 5 }
        ]
      },
      { 
        id: 4, 
        name: '课后作业完成',
        maxScore: 15,
        options: [
          { label: '主动完成，认真做', score: 15 },
          { label: '完成了，但有点拖延', score: 9 },
          { label: '拖延很久或拒绝做', score: 3 }
        ]
      },
      { 
        id: 5, 
        name: '英语任务',
        maxScore: 10,
        options: [
          { label: '主动完成，发音清晰', score: 10 },
          { label: '完成了，但有点不够认真', score: 6 },
          { label: '拖延或强烈反抗', score: 2 }
        ]
      },
      { 
        id: 6, 
        name: '读书/听书15分钟',
        maxScore: 10,
        options: [
          { label: '主动听书/看书，认真听', score: 10 },
          { label: '听了，但有点心不在焉', score: 6 },
          { label: '拒绝听或躺地上', score: 2 }
        ]
      },
      { 
        id: 7, 
        name: '9:30前上床',
        maxScore: 10,
        options: [
          { label: '主动上床，配合度高', score: 10 },
          { label: '有点拖延，但最后上床了', score: 6 },
          { label: '强烈反抗、顶嘴或躺地上', score: 2 }
        ]
      }
    ],
    saturday: [
      { 
        id: 1, 
        name: '起床后学习30分钟',
        maxScore: 10,
        options: [
          { label: '主动学习，认真专注', score: 10 },
          { label: '学了，但有点拖延或不够认真', score: 6 },
          { label: '拖延很久或强烈反抗', score: 2 }
        ]
      },
      { 
        id: 2, 
        name: '街舞课前准备不拖延',
        maxScore: 10,
        options: [
          { label: '主动准备，配合度高', score: 10 },
          { label: '准备了，但有点拖延', score: 6 },
          { label: '拖延很久或顶嘴', score: 2 }
        ]
      },
      { 
        id: 3, 
        name: '街舞课认真上',
        maxScore: 15,
        options: [
          { label: '认真听课，积极参与', score: 15 },
          { label: '上课了，但有点不够认真', score: 9 },
          { label: '不认真或强烈反抗', score: 3 }
        ]
      },
      { 
        id: 4, 
        name: '学而思英语课认真上',
        maxScore: 15,
        options: [
          { label: '认真听课，积极参与', score: 15 },
          { label: '上课了，但有点不够认真', score: 9 },
          { label: '不认真或强烈反抗', score: 3 }
        ]
      },
      { 
        id: 5, 
        name: '读书/听书15分钟',
        maxScore: 10,
        options: [
          { label: '主动听书/看书，认真听', score: 10 },
          { label: '听了，但有点心不在焉', score: 6 },
          { label: '拒绝听或躺地上', score: 2 }
        ]
      },
      { 
        id: 6, 
        name: '9:30前上床',
        maxScore: 10,
        options: [
          { label: '主动上床，配合度高', score: 10 },
          { label: '有点拖延，但最后上床了', score: 6 },
          { label: '强烈反抗、顶嘴或躺地上', score: 2 }
        ]
      }
    ],
    sunday: [
      { 
        id: 1, 
        name: '早起不拖延',
        maxScore: 10,
        options: [
          { label: '主动起床，配合度高', score: 10 },
          { label: '起床了，但有点拖延', score: 6 },
          { label: '拖延很久或强烈反抗', score: 2 }
        ]
      },
      { 
        id: 2, 
        name: '吃完早饭',
        maxScore: 10,
        options: [
          { label: '主动吃饭，吃得香', score: 10 },
          { label: '吃了，但有点拖延', score: 6 },
          { label: '拖延很久或拒绝吃', score: 2 }
        ]
      },
      { 
        id: 3, 
        name: '上午学习1小时完成',
        maxScore: 30,
        options: [
          { label: '主动学习，认真专注1小时', score: 30 },
          { label: '学了，但有点拖延或不够认真', score: 18 },
          { label: '拖延很久或强烈反抗', score: 6 }
        ]
      },
      { 
        id: 4, 
        name: '下午学习2小时完成',
        maxScore: 30,
        options: [
          { label: '主动学习，认真专注2小时', score: 30 },
          { label: '学了，但有点拖延或不够认真', score: 18 },
          { label: '拖延很久或强烈反抗', score: 6 }
        ]
      },
      { 
        id: 5, 
        name: '晚饭后玩1小时+洗澡',
        maxScore: 10,
        options: [
          { label: '主动玩，按时洗澡，配合度高', score: 10 },
          { label: '玩了，但洗澡有点拖延', score: 6 },
          { label: '拖延很久或强烈反抗洗澡', score: 2 }
        ]
      },
      { 
        id: 6, 
        name: '读书/听书15分钟',
        maxScore: 10,
        options: [
          { label: '主动听书/看书，认真听', score: 10 },
          { label: '听了，但有点心不在焉', score: 6 },
          { label: '拒绝听或躺地上', score: 2 }
        ]
      }
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
    
    const record = db.records[dateStr] || { scores: {}, totalScore: 0 };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      date: dateStr,
      dayType: dayType,
      tasks: tasks.map(t => ({
        id: t.id,
        name: t.name,
        maxScore: t.maxScore,
        options: t.options,
        selectedScore: record.scores[t.id] || null
      })),
      totalScore: record.totalScore
    }));
    return;
  }
  
  // API: 提交所有成绩
  if (pathname === '/api/submit-scores' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { scores } = JSON.parse(body);
        const { dateStr, dayType } = getTodayInfo();
        const tasks = getTasksConfig(dayType);
        
        if (!db.records[dateStr]) {
          db.records[dateStr] = { scores: {}, totalScore: 0, dayType };
        }
        
        // 更新所有分数
        Object.assign(db.records[dateStr].scores, scores);
        
        const totalScore = tasks.reduce((sum, t) => {
          return sum + (db.records[dateStr].scores[t.id] || 0);
        }, 0);
        
        db.records[dateStr].totalScore = totalScore;
        
        // 生成日报
        const report = generateMaodouReport(dayType, totalScore, tasks, db.records[dateStr].scores);
        db.records[dateStr].report = report;
        db.records[dateStr].reportSent = true;
        
        saveData();
        
        // 发送飞书日报
        try {
          await sendMaodouReportToFeishu(report);
        } catch (err) {
          console.error('飞书推送失败:', err);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, totalScore, report }));
      } catch (err) {
        console.error('提交失败:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
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
  
  // 路由：/score 和 /dashboard
  if (pathname === '/score' || pathname === '/dashboard') {
    // 读取对应的 HTML 文件
    const fileName = pathname === '/score' ? 'score.html' : 'dashboard.html';
    const filePath = path.join(__dirname, 'public', fileName);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  
  // 默认路由
  if (pathname === '/') {
    const filePath = path.join(__dirname, 'public', 'score.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

loadData();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 毛豆积分系统运行在 http://localhost:${PORT}`);
});

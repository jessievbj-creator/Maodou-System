// 毛豆日报生成逻辑
function generateMaodouReport(dayType, totalScore, tasks, scores) {
  // 计算完成度
  const completedTasks = Object.keys(scores).length;
  const totalTasks = tasks.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  
  // 计算各档次的任务数
  let excellentCount = 0;  // 满分
  let goodCount = 0;       // 良好
  let needsImprovementCount = 0;  // 需要改进
  
  tasks.forEach(task => {
    const score = scores[task.id];
    if (score === task.maxScore) {
      excellentCount++;
    } else if (score > task.maxScore * 0.5) {
      goodCount++;
    } else if (score > 0) {
      needsImprovementCount++;
    }
  });
  
  // 生成表现评价
  let performanceLevel = '';
  let performanceEmoji = '';
  let performanceText = '';
  
  if (totalScore >= 90) {
    performanceLevel = '优秀';
    performanceEmoji = '🌟';
    performanceText = '毛豆今天表现超棒！主动完成任务，态度认真，配合度高。这就是我们期待的样子！';
  } else if (totalScore >= 75) {
    performanceLevel = '良好';
    performanceEmoji = '👍';
    performanceText = '毛豆今天表现不错。大部分任务完成得很好，只有个别地方需要加油。';
  } else if (totalScore >= 60) {
    performanceLevel = '及格';
    performanceEmoji = '😊';
    performanceText = '毛豆今天完成了基本任务，但还有改进空间。有些任务需要更认真对待。';
  } else {
    performanceLevel = '需要加油';
    performanceEmoji = '💪';
    performanceText = '毛豆今天表现一般，有些任务拖延或反抗。需要调整态度，重新出发！';
  }
  
  // 生成具体建议
  let suggestions = [];
  
  // 分析最差的任务
  let worstTask = null;
  let worstScore = Infinity;
  tasks.forEach(task => {
    const score = scores[task.id] || 0;
    if (score < worstScore) {
      worstScore = score;
      worstTask = task;
    }
  });
  
  if (worstTask && worstScore < worstTask.maxScore * 0.5) {
    suggestions.push(`📌 ${worstTask.name}是今天的薄弱环节。这个任务需要特别关注，可能是因为不够感兴趣或者拖延了。建议明天重点突破。`);
  }
  
  // 根据完成度给建议
  if (excellentCount === totalTasks) {
    suggestions.push('🎯 所有任务都完成得很好！这说明毛豆今天状态特别好，要保持这个势头。');
  } else if (needsImprovementCount > totalTasks * 0.3) {
    suggestions.push('⚠️ 有些任务完成度不理想。可能是因为拖延或者反抗。建议用激将法，比如"你敢不敢挑战这个"，而不是强制。');
  }
  
  // 根据性格特点给建议
  if (totalScore < 60) {
    suggestions.push('💡 毛豆聪明、有主见，不喜欢被强迫。建议用竞争、挑战的方式激励他，而不是命令。');
  }
  
  // 习惯养成建议
  let habitSuggestion = '';
  if (totalScore >= 80) {
    habitSuggestion = '🌱 毛豆今天表现很好，这是养成好习惯的最好时机。建议继续保持这个节奏，让他体验到坚持的快乐。';
  } else if (totalScore >= 60) {
    habitSuggestion = '🌱 毛豆还在适应阶段。建议多鼓励他的进步，即使只是小进步也要认可。这样能帮助他逐步养成习惯。';
  } else {
    habitSuggestion = '🌱 毛豆需要时间适应。不要急，建议从最容易的任务开始，让他体验成功的感觉，然后逐步增加难度。';
  }
  
  // 鼓励话语（从毛豆的角度）
  let encouragement = '';
  if (totalScore >= 90) {
    encouragement = '你今天真的很棒！妈妈看到你这么认真，特别开心。你就是这么聪明、这么能干的孩子。继续加油！';
  } else if (totalScore >= 75) {
    encouragement = '你今天做得不错！虽然有些地方还可以更好，但妈妈看到你的努力了。你很聪明，只要用心，没有什么做不到的。';
  } else if (totalScore >= 60) {
    encouragement = '你今天完成了任务，这很好。但妈妈知道你能做得更好。你这么聪明，只要你想，就能做到最好。明天加油！';
  } else {
    encouragement = '今天有点不理想，但没关系。你这么聪明，妈妈相信你明天会做得更好。我们一起加油，好吗？';
  }
  
  return {
    date: new Date().toISOString().split('T')[0],
    performanceLevel,
    performanceEmoji,
    performanceText,
    totalScore,
    completionRate,
    excellentCount,
    goodCount,
    needsImprovementCount,
    suggestions,
    habitSuggestion,
    encouragement
  };
}

// 导出函数
module.exports = { generateMaodouReport };

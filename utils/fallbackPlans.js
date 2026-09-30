const sampleTopics = {
  python: ['Python setup and first program', 'Variables and data types', 'Operators and expressions', 'Conditions and decision making', 'Loops and iteration', 'Lists and tuples', 'Dictionaries and sets', 'Functions and reusable code', 'Working with files', 'Errors and debugging', 'Modules and packages', 'Introductory data analysis', 'Practice and revision', 'Build a small data task', 'Python mini-project'],
  sql: ['Databases and SQL basics', 'SELECT and aliases', 'Filtering with WHERE', 'Sorting and limiting results', 'Aggregate functions', 'GROUP BY and HAVING', 'Joining tables', 'Subqueries', 'Working with dates and text', 'CASE expressions', 'Data changes and transactions', 'Database design basics', 'Practice and revision', 'Analyze a sample dataset', 'SQL mini-project'],
  'data analytics': ['Analytics workflow and questions', 'Spreadsheets and data types', 'Cleaning a dataset', 'Descriptive statistics', 'SQL for analysis', 'Grouping and joining data', 'Charts and visual storytelling', 'Dashboard principles', 'Python analysis basics', 'Exploratory data analysis', 'Finding trends and outliers', 'Communicating insights', 'Practice and revision', 'Analyze a real-world dataset', 'Analytics mini-project'],
  'web development': ['How the web works', 'HTML document structure', 'Semantic HTML and forms', 'CSS selectors and layout', 'Responsive design', 'JavaScript fundamentals', 'DOM and browser events', 'Form validation', 'Fetch and JSON basics', 'Accessibility and testing', 'Build reusable page sections', 'Publish a static website', 'Practice and revision', 'Plan a small web app', 'Web development mini-project']
};

function topicFor(course, dayIndex, totalDays) {
  const key = course.toLowerCase().trim();
  const topics = sampleTopics[key];
  if (topics && totalDays === 7) {
    const indexes = [0, 1, 3, 4, 7, 12, 14];
    return topics[indexes[dayIndex]];
  }
  if (topics) {
    const topicIndex = Math.floor(dayIndex * topics.length / totalDays);
    const topic = topics[topicIndex];
    if (totalDays <= topics.length) return topic;
    const firstDay = Math.ceil(topicIndex * totalDays / topics.length);
    const occurrences = Math.ceil((topicIndex + 1) * totalDays / topics.length) - firstDay;
    const occurrence = dayIndex - firstDay;
    const stages = ['Learn concepts', 'Guided practice', 'Independent practice', 'Project application'];
    const stage = stages[Math.min(Math.floor(occurrence * stages.length / occurrences), stages.length - 1)];
    return `${topic}: ${stage}`;
  }
  const common = [
    `Introduction to ${course}`, `${course} foundations`, `Core concepts in ${course}`,
    `Working with key tools for ${course}`, `Practical ${course} techniques`, `Apply ${course} to a small task`,
    `Review and practice ${course}`, `Build a ${course} project`
  ];
  if (dayIndex === totalDays - 1) return `${course} mini-project`;
  return common[Math.min(Math.floor(dayIndex * common.length / totalDays), common.length - 1)];
}

function makeFallbackPlan(course, level, goal, hours, totalDays) {
  const safeCourse = course.trim();
  return {
    title: `${safeCourse} ${goal === 'Job Preparation' ? 'for Career Preparation' : 'Study Plan'}`,
    description: `A ${totalDays}-day ${level.toLowerCase()} learning roadmap for ${safeCourse}, paced at ${hours} hour${hours === 1 ? '' : 's'} per day.`,
    totalDays,
    days: Array.from({ length: totalDays }, (_, index) => {
      const topic = topicFor(safeCourse, index, totalDays);
      return {
        day: index + 1,
        topic,
        description: `Study the essential ideas behind ${topic.toLowerCase()} and connect them to your ${goal.toLowerCase()} goal.`,
        objectives: [`Explain the key ideas in ${topic.toLowerCase()}`, `Apply ${safeCourse} concepts in a short exercise`, 'Review your notes and check your understanding'],
        estimatedHours: hours,
        practice: `Complete a small hands-on exercise related to ${topic.toLowerCase()} and note what you learned.`,
        searchQuery: `${safeCourse} ${topic} ${level.toLowerCase()} tutorial`
      };
    })
  };
}

module.exports = { makeFallbackPlan };
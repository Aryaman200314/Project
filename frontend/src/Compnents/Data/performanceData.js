// performanceData.js

// Dummy Task Data
const taskData = {
    total: 10,
    completed: 7,
    pending: 3,
    perMentor: [
      { mentor: "John", tasks: 600 },
      { mentor: "Jane", tasks: 400 },
    ],
    weeklySubmissions: [
      { week: "Week 1", tasks: 200 },
      { week: "Week 2", tasks: 300 },
      { week: "Week 3", tasks: 200 },
    ],
  };
  
  // Dummy Assignment Data
  const assignmentData = {
    total: 8,
    completed: 5,
    pending: 3,
    perMentor: [
      { mentor: "John", assignments: 5 },
      { mentor: "Jane", assignments: 3 },
    ],
    weeklySubmissions: [
      { week: "Week 1", assignments: 1 },
      { week: "Week 2", assignments: 2 },
      { week: "Week 3", assignments: 2 },
    ],
  };
  
  // Derived Data
  const getTaskCompletionRate = () => ((taskData.completed / taskData.total) * 100).toFixed(2);
  const getAssignmentCompletionRate = () => ((assignmentData.completed / assignmentData.total) * 100).toFixed(2);
  
  // Export all
  export {
    taskData,
    assignmentData,
    getTaskCompletionRate,
    getAssignmentCompletionRate,
  };
  
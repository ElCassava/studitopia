// Test script to verify analytics data flow
const baseUrl = 'http://localhost:3003';

async function testAnalyticsFlow() {
  try {
    console.log('1. Testing courses API...');
    const coursesResponse = await fetch(`${baseUrl}/api/courses-list`);
    const coursesData = await coursesResponse.json();
    const courses = coursesData.courses || [];
    console.log('Courses available:', courses.length);
    
    if (courses.length === 0) {
      console.log('No courses found. Exiting...');
      return;
    }

    const courseId = courses[0].id;
    console.log('Using course ID:', courseId);

    console.log('\n2. Testing test info API...');
    const testInfoResponse = await fetch(`${baseUrl}/api/get-test-info?courseId=${courseId}&learningStyleId=1`);
    const testInfo = await testInfoResponse.json();
    console.log('Test sections found:', testInfo.testSections?.length || 0);
    
    if (!testInfo.testSections || testInfo.testSections.length === 0) {
      console.log('No test sections found. Exiting...');
      return;
    }

    const testSection = testInfo.testSections[0];
    console.log('Using test section:', testSection.id);
    console.log('Questions in test:', testSection.questions?.length || 0);

    if (!testSection.questions || testSection.questions.length === 0) {
      console.log('No questions found. Exiting...');
      return;
    }

    console.log('\n3. Simulating test submission...');
    
    // Simulate answers for all questions
    const detailedAnswers = testSection.questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: question.correct, // Always select correct answer
      isCorrect: true,
      timeSpent: 15 + Math.random() * 20, // Random time between 15-35 seconds
      answeredAt: new Date().toISOString()
    }));

    const submissionData = {
      userId: 'test-user-id',
      courseId: courseId,
      testSectionId: testSection.test_section_id || testSection.id,
      questions: testSection.questions,
      answers: detailedAnswers,
      score: 100,
      startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      endTime: new Date().toISOString()
    };

    console.log('Submission data prepared:', {
      questionsCount: submissionData.questions.length,
      answersCount: submissionData.answers.length,
      score: submissionData.score
    });

    const submitResponse = await fetch(`${baseUrl}/api/save-test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    const submitResult = await submitResponse.json();
    console.log('Submission result:', submitResult);

    if (submitResult.success) {
      console.log('\n4. Checking analytics data...');
      
      // Wait a moment for data to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analyticsResponse = await fetch(`${baseUrl}/api/analytics?type=detailed`);
      const analyticsData = await analyticsResponse.json();
      
      console.log('Analytics data retrieved:');
      console.log('- Test attempts:', analyticsData.testDetails?.length || 0);
      console.log('- Quiz attempts:', analyticsData.quizDetails?.length || 0);
      
      if (analyticsData.testDetails && analyticsData.testDetails.length > 0) {
        console.log('✅ SUCCESS: Detailed test data is being stored!');
        console.log('Sample test detail:', analyticsData.testDetails[0]);
      } else {
        console.log('❌ ISSUE: No detailed test data found');
      }
    } else {
      console.log('❌ ISSUE: Test submission failed');
    }

  } catch (error) {
    console.error('Error testing analytics flow:', error);
  }
}

// Run the test
testAnalyticsFlow();

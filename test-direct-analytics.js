// Direct test of analytics data storage
const baseUrl = 'http://localhost:3003';

async function testAnalyticsDataStorage() {
  try {
    console.log('🧪 Testing direct analytics data storage...\n');

    // Create a simulated test submission with proper UUIDs
    const mockTestData = {
      userId: '7a94e960-9da8-4a20-820a-938b9f0ec14b', // Using existing admin user
      courseId: '0fa8d0b4-424b-46e8-b5a3-49069b060fa6', // Using real course ID
      testSectionId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID format
      questions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID format
          question_text: 'What is 2 + 2?',
          correct: 2
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003', // Valid UUID format  
          question_text: 'What is the capital of France?',
          correct: 1
        }
      ],
      answers: [
        {
          questionId: '550e8400-e29b-41d4-a716-446655440002',
          selectedAnswer: 2,
          isCorrect: true,
          timeSpent: 15,
          answeredAt: new Date().toISOString()
        },
        {
          questionId: '550e8400-e29b-41d4-a716-446655440003', 
          selectedAnswer: 1,
          isCorrect: true,
          timeSpent: 20,
          answeredAt: new Date().toISOString()
        }
      ],
      score: 100,
      startTime: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      endTime: new Date().toISOString()
    };

    console.log('1. Submitting test results...');
    console.log('Mock data:', {
      questionsCount: mockTestData.questions.length,
      answersCount: mockTestData.answers.length,
      score: mockTestData.score
    });

    const response = await fetch(`${baseUrl}/api/save-test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockTestData)
    });

    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response body:', result);

    if (result.success) {
      console.log('✅ Test submission successful!');
      console.log('Test attempt ID:', result.testAttemptId);
      
      // Wait a bit for data to propagate
      console.log('\n2. Waiting for data to propagate...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check analytics data
      console.log('3. Checking analytics data...');
      const analyticsResponse = await fetch(`${baseUrl}/api/analytics?type=detailed`);
      const analyticsData = await analyticsResponse.json();
      
      console.log('Analytics response:', analyticsData);
      
      if (analyticsData.testDetails && analyticsData.testDetails.length > 0) {
        console.log('🎉 SUCCESS: Found detailed test analytics data!');
        console.log('Number of test attempts:', analyticsData.testDetails.length);
        console.log('Sample test attempt:', analyticsData.testDetails[0]);
      } else {
        console.log('⚠️ No detailed test data found in analytics');
      }
      
    } else {
      console.log('❌ Test submission failed:', result.error);
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testAnalyticsDataStorage();

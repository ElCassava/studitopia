# Analytics Setup Instructions

## Current Status 🔍

The Studitopia analytics system has been **partially implemented**:

### ✅ **Working Analytics:**
- **Test Analytics**: Fully operational - tracks detailed test answers, scores, and timing
- **Quiz Analytics**: Partially working - tracks quiz attempts and detailed answers
- **Admin Dashboard**: Functional and displaying test + quiz data
- **Analytics API**: Working and serving data to the dashboard

### ❌ **Missing Components:**
- **Learn Analytics**: Not yet stored in database (tracking code is ready)
- **Quiz Questions Table**: Missing for enhanced quiz analytics
- **Some Database Views**: Learn analytics views not created yet

---

## 🚀 Quick Setup Guide

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard API Settings](https://supabase.com/dashboard/project/erozhukurioezrygpmtt/settings/api)
2. Copy the **service_role** key (not the anon/public key)
3. Add it to your `.env.local` file:

```bash
# Add this line to .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Apply Database Schemas

```bash
# Apply all missing tables and views
node apply-complete-schemas.js
```

### Step 3: Verify Everything Works

```bash
# Test the complete analytics system
node check-database.js
```

---

## 📊 What Each Analytics Type Tracks

### Test Analytics (✅ Working)
- **Test Attempts**: Start/end times, scores, completion status
- **Detailed Answers**: Each question answered, correctness, time taken
- **Performance Metrics**: Average time per question, accuracy rates
- **Learning Style Correlation**: Performance by learning style

### Quiz Analytics (⚠️ Partially Working)
**Currently Tracking:**
- Quiz attempts with basic timing and scores
- Individual quiz answers with correctness and timing

**Will Track After Schema Update:**
- Enhanced quiz question management
- Better quiz section organization
- More detailed quiz performance analytics

### Learn Analytics (❌ Not Yet Stored)
**Code Ready, Database Missing:**
- **Learn Sessions**: Time spent in each learning section
- **Interaction Tracking**: Clicks, scrolls, content views
- **Engagement Metrics**: Engagement scores, interaction patterns  
- **Content Analytics**: Time spent on specific content types
- **Completion Tracking**: Section completion percentages

---

## 🔧 Files Created/Modified

### New API Endpoints:
- `/src/app/api/save-learn-interactions/route.ts` - Learn analytics storage
- `/src/app/api/save-quiz-results/route.ts` - Enhanced quiz analytics (updated)

### Enhanced UI Components:
- `/src/app/courses/[courseId]/learn/page.tsx` - Learn interaction tracking (updated)

### Database Schema Files:
- `analytics_schema.sql` - Quiz analytics tables and views
- `learn_analytics_schema.sql` - Learn analytics tables and views

### Setup Scripts:
- `apply-complete-schemas.js` - Automated schema application
- `check-database.js` - Analytics system verification

---

## 🧪 Testing the Complete System

### Test Quiz Analytics:
1. Navigate to any course quiz section
2. Complete a quiz (answer the questions)
3. Submit the quiz
4. Check admin dashboard for updated quiz analytics

### Test Learn Analytics:
1. Navigate to any course learn section  
2. Read through the content (scroll, click around)
3. Spend some time on the page
4. Check admin dashboard for learn interaction data

### Verify Admin Dashboard:
1. Visit: `http://localhost:3004/admin/analytics`
2. Should show three tabs: **Tests**, **Quizzes**, **Learn**
3. Each tab should display relevant analytics data

---

## 📈 Analytics Dashboard Features

The admin dashboard provides:

### Test Analytics View:
- Student performance by course and test section
- Score distributions and timing analysis
- Learning style effectiveness comparison
- Question-level accuracy metrics

### Quiz Analytics View:
- Quiz completion rates and scores  
- Time spent analysis per quiz section
- Individual question performance
- Student engagement with quiz content

### Learn Analytics View (After Schema Update):
- Content interaction heatmaps
- Time spent per learning section
- Engagement score trends
- Content type effectiveness (text vs images vs interactive)

---

## 🛠️ Troubleshooting

### If Analytics Don't Show Up:
1. Check database tables exist: `node check-database.js`
2. Verify API endpoints work: Test at `http://localhost:3004/api/analytics`  
3. Check browser console for JavaScript errors
4. Ensure user is completing full interactions (not just visiting pages)

### If Schema Application Fails:
1. Verify service role key is correct in `.env.local`
2. Check Supabase project permissions
3. Try applying schemas manually through Supabase dashboard SQL editor

### Common Issues:
- **Missing Service Role Key**: Cannot create database tables
- **RLS Policies**: May need to adjust row-level security for analytics tables
- **Foreign Key Constraints**: Ensure user and course data exists before analytics

---

## 🎯 Next Development Steps

After completing the setup:

1. **Enhanced Reporting**: Add more sophisticated analytics visualizations
2. **Real-time Analytics**: Implement live analytics updates
3. **Predictive Analytics**: Use data to predict student performance
4. **Export Capabilities**: Allow exporting analytics data to CSV/Excel
5. **Mobile Analytics**: Track mobile-specific learning behaviors

---

## 🔐 Security Considerations

- Analytics data contains student performance information
- Ensure proper access controls on admin dashboard  
- Consider anonymizing data for research purposes
- Implement proper data retention policies
- Follow educational data privacy regulations (FERPA, etc.)

---

**Need help?** Run `node check-database.js` to see current system status and next steps.

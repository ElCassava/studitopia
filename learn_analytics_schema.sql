-- Learn Analytics Schema Extension
-- This extends the analytics_schema.sql with detailed learn interaction tracking

-- Learn Sessions Table - tracks each learning session
CREATE TABLE IF NOT EXISTS public.learn_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  learn_section_id uuid NOT NULL,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  total_time_spent integer DEFAULT 0 CHECK (total_time_spent >= 0), -- in seconds
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learn_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT learn_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT learn_sessions_learn_section_id_fkey FOREIGN KEY (learn_section_id) REFERENCES public.learn_sections(id) ON DELETE CASCADE
);

-- Learn Interaction Details Table - tracks detailed interactions within a learning session
CREATE TABLE IF NOT EXISTS public.learn_interaction_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  learn_session_id uuid NOT NULL,
  content_id text, -- identifier for specific content item (paragraph, image, video, etc.)
  interaction_type text NOT NULL CHECK (interaction_type = ANY (ARRAY['view'::text, 'scroll'::text, 'click'::text, 'pause'::text, 'resume'::text, 'complete'::text])),
  time_spent integer DEFAULT 0 CHECK (time_spent >= 0), -- time spent on this specific interaction in seconds
  engagement_score integer DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100), -- engagement score (0-100)
  interaction_data jsonb, -- additional data about the interaction (scroll position, click coordinates, etc.)
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT learn_interaction_details_pkey PRIMARY KEY (id),
  CONSTRAINT learn_interaction_details_learn_session_id_fkey FOREIGN KEY (learn_session_id) REFERENCES public.learn_sessions(id) ON DELETE CASCADE
);

-- Learn Content Items Table - defines trackable content items in learn sections
CREATE TABLE IF NOT EXISTS public.learn_content_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  learn_section_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'audio'::text, 'interactive'::text])),
  content_identifier text NOT NULL, -- unique identifier for this content item
  content_title text,
  content_description text,
  estimated_time_minutes integer DEFAULT 5, -- estimated time to consume this content
  content_order integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learn_content_items_pkey PRIMARY KEY (id),
  CONSTRAINT learn_content_items_learn_section_id_fkey FOREIGN KEY (learn_section_id) REFERENCES public.learn_sections(id) ON DELETE CASCADE
);

-- Create indexes for better performance on learn analytics queries
CREATE INDEX IF NOT EXISTS idx_learn_sessions_user_section ON public.learn_sessions(user_id, learn_section_id);
CREATE INDEX IF NOT EXISTS idx_learn_sessions_start_time ON public.learn_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_learn_sessions_completion ON public.learn_sessions(completion_percentage);

CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_session ON public.learn_interaction_details(learn_session_id);
CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_type ON public.learn_interaction_details(interaction_type);
CREATE INDEX IF NOT EXISTS idx_learn_interaction_details_timestamp ON public.learn_interaction_details(timestamp);

CREATE INDEX IF NOT EXISTS idx_learn_content_items_section ON public.learn_content_items(learn_section_id);
CREATE INDEX IF NOT EXISTS idx_learn_content_items_type ON public.learn_content_items(content_type);

-- Create analytics view for learn interactions
CREATE OR REPLACE VIEW student_learn_analytics AS
SELECT 
  u.id as user_id,
  u.username,
  u.learning_style_id,
  ls.name as learning_style,
  cs.course_id,
  c.course_name,
  lsec.id as learn_section_id,
  lsess.start_time,
  lsess.end_time,
  lsess.total_time_spent,
  lsess.completion_percentage,
  lsess.completed,
  COUNT(lid.id) as total_interactions,
  AVG(lid.engagement_score) as avg_engagement_score,
  COUNT(CASE WHEN lid.interaction_type = 'view' THEN 1 END) as view_interactions,
  COUNT(CASE WHEN lid.interaction_type = 'scroll' THEN 1 END) as scroll_interactions,
  COUNT(CASE WHEN lid.interaction_type = 'click' THEN 1 END) as click_interactions
FROM users u
JOIN learn_sessions lsess ON u.id = lsess.user_id
LEFT JOIN learn_interaction_details lid ON lsess.id = lid.learn_session_id
LEFT JOIN learn_sections lsec ON lsess.learn_section_id = lsec.id
LEFT JOIN course_sections cs ON lsec.course_section_id = cs.id
LEFT JOIN courses c ON cs.course_id = c.id
LEFT JOIN learning_styles ls ON u.learning_style_id = ls.id
WHERE lsess.end_time IS NOT NULL
GROUP BY u.id, u.username, u.learning_style_id, ls.name, cs.course_id, c.course_name, 
         lsec.id, lsess.start_time, lsess.end_time, lsess.total_time_spent, 
         lsess.completion_percentage, lsess.completed;

-- Grant appropriate permissions (adjust as needed for your RLS policies)
-- ALTER TABLE public.learn_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.learn_interaction_details ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.learn_content_items ENABLE ROW LEVEL SECURITY;

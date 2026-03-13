-- Expand service_requests.request_type constraint for all 17 request types
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_request_type_check;
ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_request_type_check
  CHECK (request_type IN (
    'site_audit', 'content_brief', 'keyword_research',
    'technical_audit', 'link_analysis', 'analytics_audit',
    'on_page_audit', 'meta_optimization', 'content_calendar',
    'topic_cluster_map', 'local_seo_audit', 'gbp_optimization',
    'geo_audit', 'entity_optimization', 'competitor_analysis',
    'monthly_report', 'content_decay_audit'
  ));

-- Expand deliverables.agent_name constraint for all 9 agents
ALTER TABLE public.deliverables DROP CONSTRAINT IF EXISTS deliverables_agent_name_check;
ALTER TABLE public.deliverables ADD CONSTRAINT deliverables_agent_name_check
  CHECK (agent_name IN (
    'haruki', 'sakura', 'kenji', 'yumi', 'takeshi',
    'mika', 'ryo', 'hana', 'daichi'
  ));

-- Expand deliverables.deliverable_type constraint for all deliverable types
ALTER TABLE public.deliverables DROP CONSTRAINT IF EXISTS deliverables_deliverable_type_check;
ALTER TABLE public.deliverables ADD CONSTRAINT deliverables_deliverable_type_check
  CHECK (deliverable_type IN (
    'audit_report', 'content_draft', 'keyword_list',
    'technical_report', 'link_report', 'competitive_report',
    'performance_report', 'decay_report', 'on_page_report',
    'meta_report', 'content_plan', 'cluster_map',
    'local_report', 'gbp_report', 'geo_report', 'entity_report'
  ));

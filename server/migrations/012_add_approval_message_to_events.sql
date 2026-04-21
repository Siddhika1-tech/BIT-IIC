ALTER TABLE event_details
  ADD COLUMN IF NOT EXISTS approval_message TEXT;

-- بروزرسانی شرط اعتبارسنجی نقش اعضای اتاق برای پذیرش ADMIN, GM و PLAYER
ALTER TABLE room_members DROP CONSTRAINT IF EXISTS room_members_role_check;
ALTER TABLE room_members ADD CONSTRAINT room_members_role_check CHECK (role IN ('ADMIN', 'GM', 'PLAYER'));
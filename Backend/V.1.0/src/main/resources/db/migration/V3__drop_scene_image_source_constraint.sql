-- حذف محدودیت اجباری بودن منبع عکس برای مجاز بودن صحنه‌های خالی (Blank Grid)
ALTER TABLE scenes DROP CONSTRAINT IF EXISTS chk_image_source;
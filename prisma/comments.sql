-- PE SOHO 外贸个人站 PostgreSQL 数据库中文说明。
-- Prisma schema 负责结构；本文件负责给 PostgreSQL 表和字段补充 COMMENT。
-- 执行方式：
--   psql "$DATABASE_URL" -f prisma/comments.sql

COMMENT ON TABLE admin_users IS '后台管理员表';
COMMENT ON TABLE product_categories IS '产品分类表';
COMMENT ON TABLE products IS '产品主表';
COMMENT ON TABLE product_images IS '产品图片表，支持 URL 和数据库 BYTEA 图片';
COMMENT ON TABLE product_translations IS '产品多语言内容表';
COMMENT ON TABLE product_specifications IS '产品规格参数表';
COMMENT ON TABLE inquiries IS '客户询盘表';
COMMENT ON TABLE inquiry_attachments IS '询盘附件表，支持 URL 和数据库 BYTEA 文件';
COMMENT ON TABLE inquiry_notes IS '询盘处理记录表';
COMMENT ON TABLE site_contents IS '公开页面内容表';
COMMENT ON TABLE site_settings IS '网站设置表';
COMMENT ON TABLE operation_logs IS '管理员操作日志表';

COMMENT ON COLUMN admin_users.id IS '管理员主键';
COMMENT ON COLUMN admin_users.email IS '登录邮箱';
COMMENT ON COLUMN admin_users.password_hash IS '加密后的登录密码';
COMMENT ON COLUMN product_categories.id IS '分类主键';
COMMENT ON COLUMN product_categories.slug IS '分类 URL 标识';
COMMENT ON COLUMN products.id IS '产品主键';
COMMENT ON COLUMN products.slug IS '产品 URL 标识';
COMMENT ON COLUMN products.status IS '产品状态：草稿、已发布、已下架';
COMMENT ON COLUMN products.category_id IS '所属分类 ID';
COMMENT ON COLUMN product_images.image_blob IS '图片二进制内容，优先于 image_url 使用';
COMMENT ON COLUMN inquiry_attachments.file_blob IS '数据库二进制文件内容';
COMMENT ON COLUMN inquiries.product_id IS '关联产品 ID，可为空';

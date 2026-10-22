-- PE SOHO 外贸个人站数据库中文说明。
-- Prisma schema 负责结构；本文件负责给 MySQL 表和字段补充 COMMENT。
-- 执行方式：
--   mysql -uroot -proot foreign_trade < prisma/comments.sql

ALTER TABLE admin_users COMMENT = '后台管理员表';
ALTER TABLE admin_users
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '管理员主键',
  MODIFY email VARCHAR(190) NOT NULL COMMENT '登录邮箱',
  MODIFY password_hash VARCHAR(255) NOT NULL COMMENT '加密后的登录密码',
  MODIFY name VARCHAR(100) NOT NULL DEFAULT 'Administrator' COMMENT '管理员姓名',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  MODIFY updated_at DATETIME(3) NOT NULL COMMENT '最后更新时间';

ALTER TABLE product_categories COMMENT = '产品分类表';
ALTER TABLE product_categories
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '分类主键',
  MODIFY slug VARCHAR(120) NOT NULL COMMENT '分类 URL 标识',
  MODIFY name VARCHAR(120) NOT NULL COMMENT '分类名称',
  MODIFY name_cn VARCHAR(120) NOT NULL COMMENT '分类中文名称',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  MODIFY updated_at DATETIME(3) NOT NULL COMMENT '最后更新时间';

ALTER TABLE products COMMENT = '产品主表';
ALTER TABLE products
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '产品主键',
  MODIFY slug VARCHAR(190) NOT NULL COMMENT '产品 URL 标识',
  MODIFY status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT' COMMENT '产品状态：草稿、已发布、已下架',
  MODIFY sku VARCHAR(100) NULL COMMENT '产品编号 / SKU',
  MODIFY category_id INT NOT NULL COMMENT '所属分类 ID',
  MODIFY moq VARCHAR(100) NULL COMMENT '最小起订量',
  MODIFY lead_time VARCHAR(100) NULL COMMENT '预计交期',
  MODIFY image_url VARCHAR(500) NULL COMMENT '产品主图地址',
  MODIFY sort_order INT NOT NULL DEFAULT 0 COMMENT '展示排序值，数值越小越靠前',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  MODIFY updated_at DATETIME(3) NOT NULL COMMENT '最后更新时间';

ALTER TABLE product_translations COMMENT = '产品多语言内容表';
ALTER TABLE product_translations
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '多语言记录主键',
  MODIFY product_id INT NOT NULL COMMENT '产品主表 ID',
  MODIFY language VARCHAR(10) NOT NULL COMMENT '语言代码，例如 en、zh',
  MODIFY name VARCHAR(190) NOT NULL COMMENT '产品名称',
  MODIFY short_description TEXT NULL COMMENT '产品简短描述',
  MODIFY description TEXT NULL COMMENT '产品详细描述',
  MODIFY applications TEXT NULL COMMENT '产品应用场景',
  MODIFY packaging TEXT NULL COMMENT '产品包装说明';

ALTER TABLE product_specifications COMMENT = '产品规格参数表';
ALTER TABLE product_specifications
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '规格主键',
  MODIFY product_id INT NOT NULL COMMENT '产品主表 ID',
  MODIFY sort_order INT NOT NULL DEFAULT 0 COMMENT '规格展示顺序',
  MODIFY label VARCHAR(100) NOT NULL COMMENT '参数名称，例如 Material',
  MODIFY value VARCHAR(255) NOT NULL COMMENT '参数值，例如 Stainless Steel 304';

ALTER TABLE inquiries COMMENT = '客户询盘表';
ALTER TABLE inquiries
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '询盘主键',
  MODIFY name VARCHAR(120) NOT NULL COMMENT '客户姓名',
  MODIFY company VARCHAR(190) NULL COMMENT '客户公司名称',
  MODIFY email VARCHAR(190) NOT NULL COMMENT '客户邮箱',
  MODIFY whatsapp VARCHAR(80) NULL COMMENT 'WhatsApp 或电话',
  MODIFY country VARCHAR(100) NULL COMMENT '客户所在国家',
  MODIFY quantity VARCHAR(100) NULL COMMENT '预计采购数量',
  MODIFY specification TEXT NULL COMMENT '客户规格要求',
  MODIFY message TEXT NOT NULL COMMENT '客户留言',
  MODIFY status ENUM('NEW','IN_PROGRESS','REPLIED','CLOSED') NOT NULL DEFAULT 'NEW' COMMENT '询盘状态：新询盘、处理中、已回复、已关闭',
  MODIFY product_id INT NULL COMMENT '关联产品 ID，可为空',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '提交时间',
  MODIFY updated_at DATETIME(3) NOT NULL COMMENT '最后更新时间';

ALTER TABLE product_images COMMENT = '产品图片表，支持 URL 和数据库 BLOB 图片';
ALTER TABLE product_images
  MODIFY id INT NOT NULL AUTO_INCREMENT COMMENT '图片主键',
  MODIFY product_id INT NOT NULL COMMENT '产品主表 ID',
  MODIFY sort_order INT NOT NULL DEFAULT 0 COMMENT '图片展示顺序',
  MODIFY is_primary TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为产品主图',
  MODIFY image_url VARCHAR(1000) NULL COMMENT '图片 URL 地址，BLOB 不存在时作为兜底',
  MODIFY mime_type VARCHAR(100) NULL COMMENT '图片 MIME 类型',
  MODIFY image_blob MEDIUMBLOB NULL COMMENT '图片二进制内容，优先于 image_url 使用',
  MODIFY alt_text VARCHAR(255) NULL COMMENT '图片替代文本',
  MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';

-- 产品图片表中文注释。
ALTER TABLE product_categories
  MODIFY name_cn VARCHAR(120) NOT NULL COMMENT '分类中文名称';

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

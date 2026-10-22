"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./new.module.css";

type Category = { id: number; name: string; nameCn?: string | null };

export type EditableProduct = {
  id: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  slug: string;
  sku: string | null;
  categoryId: number;
  moq: string | null;
  leadTime: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: Array<{
    language: string;
    name: string;
    shortDescription: string | null;
    description: string | null;
  }>;
  images: Array<{
    id: number;
    src: string;
    imageUrl: string | null;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  specifications: Array<{ label: string; value: string }>;
};

type Specification = { label: string; value: string };

function fileToBase64(file: File) {
  return new Promise<{ base64: string; mimeType: string; altText: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve({
        base64: value.split(",")[1] ?? "",
        mimeType: file.type || "application/octet-stream",
        altText: file.name,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function translation(product: EditableProduct | undefined, language: string) {
  return product?.translations.find((item) => item.language === language);
}

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: EditableProduct;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<number | null>(
    product?.images.find((image) => image.isPrimary)?.id ?? product?.images[0]?.id ?? null,
  );
  const [imageOrder, setImageOrder] = useState<number[]>(
    product?.images.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.id) ?? [],
  );
  const [specifications, setSpecifications] = useState<Specification[]>(
    product?.specifications.length ? product.specifications : [{ label: "", value: "" }],
  );

  const chinese = translation(product, "zh");
  const english = translation(product, "en");
  const isEditing = Boolean(product);

  function toggleImage(imageId: number) {
    setRemovedImages((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId],
    );
    if (primaryImageId === imageId) setPrimaryImageId(null);
  }

  function updateSpecification(index: number, key: keyof Specification, value: string) {
    setSpecifications((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    );
  }

  function moveImage(imageId: number, direction: -1 | 1) {
    setImageOrder((current) => {
      const index = current.indexOf(imageId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries()) as Record<string, string>;
      const imageUrls = String(formData.get("imageUrls") ?? "")
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((imageUrl) => ({ imageUrl }));
      const imageFiles = formData
        .getAll("imageFiles")
        .filter((value): value is File => value instanceof File && value.size > 0);
      const imageBlobs = await Promise.all(imageFiles.map(fileToBase64));
      const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      const desiredStatus = submitter?.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      const cleanSpecifications = specifications.filter(
        (item) => item.label.trim() && item.value.trim(),
      );

      if (isEditing) {
        const orderedImages = (product?.images ?? []).slice().sort((a, b) => imageOrder.indexOf(a.id) - imageOrder.indexOf(b.id));
        const existingImages = orderedImages
          .filter((image) => !removedImages.includes(image.id))
          .map((image, index) => ({
            id: image.id,
            imageUrl: image.imageUrl ?? undefined,
            altText: image.altText ?? undefined,
            sortOrder: index,
            isPrimary: primaryImageId === image.id,
          }));
        const response = await fetch(`/api/admin/products/${product?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            status: desiredStatus,
            existingImages: JSON.stringify(existingImages),
            newImages: JSON.stringify([...imageUrls, ...imageBlobs]),
            specifications: JSON.stringify(cleanSpecifications),
          }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Unable to update product.");
        }
      } else {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            publish: desiredStatus === "PUBLISHED" ? "true" : "false",
            images: JSON.stringify([...imageUrls, ...imageBlobs]),
            specifications: JSON.stringify(cleanSpecifications),
          }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Unable to save product.");
        }
      }
      router.push("/admin/products");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save product.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.languageTabs}>
        <span className={styles.selected}>中英文内容</span>
        <span>公开站默认中文，英文站会读取英文内容。</span>
      </div>

      <div className={styles.row}>
        <label>
          英文产品名称 *
          <input name="nameEn" required defaultValue={english?.name ?? ""} placeholder="Stainless Steel Cable Gland" />
        </label>
        <label>
          中文产品名称 *
          <input name="nameCn" required defaultValue={chinese?.name ?? ""} placeholder="不锈钢电缆接头" />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          URL 标识 *
          <input name="slug" required defaultValue={product?.slug ?? ""} placeholder="stainless-steel-cable-gland" />
        </label>
        <label>
          SKU
          <input name="sku" defaultValue={product?.sku ?? ""} placeholder="产品编号，可选" />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          产品分类 *
          <select name="categoryId" required defaultValue={product?.categoryId ? String(product.categoryId) : ""}>
            <option value="" disabled>请选择分类</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.nameCn ?? category.name} / {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          最小起订量
          <input name="moq" defaultValue={product?.moq ?? ""} placeholder="500 件" />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          英文简述 *
          <textarea name="shortDescriptionEn" required rows={3} defaultValue={english?.shortDescription ?? ""} placeholder="A concise summary for international buyers." />
        </label>
        <label>
          中文简述 *
          <textarea name="shortDescriptionCn" required rows={3} defaultValue={chinese?.shortDescription ?? ""} placeholder="用于中文产品目录和详情页的简短介绍。" />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          英文详细描述
          <textarea name="descriptionEn" rows={5} defaultValue={english?.description ?? ""} placeholder="Explain the product, use cases and purchasing notes." />
        </label>
        <label>
          中文详细描述
          <textarea name="descriptionCn" rows={5} defaultValue={chinese?.description ?? ""} placeholder="补充产品用途、采购注意事项和交付说明。" />
        </label>
      </div>
      <div className={styles.row}>
        <label>
          预计交期
          <input name="leadTime" defaultValue={product?.leadTime ?? ""} placeholder="15–25 天" />
        </label>
        <label>
          SEO 标题
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} placeholder="产品名称 | PE SOHO" />
        </label>
      </div>
      <label>
        SEO 描述
        <textarea name="seoDescription" rows={3} defaultValue={product?.seoDescription ?? ""} placeholder="用于搜索结果摘要的描述。" />
      </label>

      <section className={styles.specifications}>
        <div className={styles.sectionTitle}>
          <div>
            <strong>产品规格</strong>
            <small>可以添加材质、尺寸、防护等级等参数。</small>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => setSpecifications((current) => [...current, { label: "", value: "" }])}>
            + 添加规格
          </button>
        </div>
        <div className={styles.specRows}>
          {specifications.map((item, index) => (
            <div className={styles.specRow} key={`${index}-${item.label}`}>
              <input value={item.label} onChange={(event) => updateSpecification(index, "label", event.target.value)} placeholder="参数名称" aria-label="规格名称" />
              <input value={item.value} onChange={(event) => updateSpecification(index, "value", event.target.value)} placeholder="参数值" aria-label="规格值" />
              <button type="button" className={styles.iconButton} onClick={() => setSpecifications((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="删除规格">×</button>
            </div>
          ))}
        </div>
      </section>

      {isEditing && product?.images.length ? (
        <section className={styles.specifications}>
          <div className={styles.sectionTitle}>
            <div>
              <strong>现有产品图片</strong>
              <small>选中主图；删除会在保存时移除图片。</small>
            </div>
          </div>
          <div className={styles.imageGrid}>
            {product.images.slice().sort((a, b) => imageOrder.indexOf(a.id) - imageOrder.indexOf(b.id)).map((image, index, orderedImages) => {
              const removed = removedImages.includes(image.id);
              return (
                <div className={`${styles.imageCard} ${removed ? styles.imageCardRemoved : ""}`} key={image.id}>
                  <div className={styles.imagePreview} style={{ backgroundImage: `url("${image.src}")` }} />
                  <label className={styles.imageChoice}>
                    <input type="radio" name="primaryImage" checked={!removed && primaryImageId === image.id} onChange={() => setPrimaryImageId(image.id)} />
                    主图
                  </label>
                  <div className={styles.imageCardActions}>
                    <button type="button" className={styles.moveImage} disabled={removed || index === 0} onClick={() => moveImage(image.id, -1)} aria-label="图片上移">↑</button>
                    <button type="button" className={styles.moveImage} disabled={removed || index === orderedImages.length - 1} onClick={() => moveImage(image.id, 1)} aria-label="图片下移">↓</button>
                    <button type="button" className={styles.removeImage} onClick={() => toggleImage(image.id)}>{removed ? "恢复" : "删除"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <label>
        新增图片 URL（每行一个）
        <textarea name="imageUrls" rows={3} placeholder="https://example.com/product-main.jpg&#10;https://example.com/product-detail.jpg" />
      </label>
      <label>
        上传图片文件（可多选）
        <input name="imageFiles" type="file" accept="image/*" multiple />
        <small>本地图片将以 BLOB 保存；前台读取时优先使用 BLOB。</small>
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" value="DRAFT" disabled={pending}>{pending ? "保存中..." : "保存草稿"}</button>
        <button type="submit" value="PUBLISHED" disabled={pending}>保存并发布 ↗</button>
      </div>
    </form>
  );
}

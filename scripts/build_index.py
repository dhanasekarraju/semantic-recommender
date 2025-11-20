#!/usr/bin/env python3
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import numpy as np
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

from app.embeddings import embed_texts

DATA_PATH = os.getenv("DATA_PATH", "data/products.json")
INDEX_PATH = os.getenv("INDEX_PATH", "data/faiss.index")
META_PATH = os.getenv("META_PATH", "data/meta.json")

def doc_text_fast(product):
    """Optimized text generation"""
    parts = []
    # Pre-define keys for faster access
    keys = ["title", "features", "categories", "description", "product_description"]

    for k in keys:
        v = product.get(k)
        if not v: continue
        if isinstance(v, list):
            # Use list comprehension for speed
            parts.append(" . ".join(str(x) for x in v if x))
        else:
            parts.append(str(v))

    # Quick price/rating checks
    price = product.get("price")
    if price:
        parts.append(f"price: {price}")
    rating = product.get("average_rating")
    if rating:
        parts.append(f"rating: {rating}")

    return " . ".join(parts)

def load_products_ultra_fast(path):
    """ULTRA-FAST JSON loading for 1.3GB+ files"""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"dataset not found at {path.resolve()}")

    file_size_mb = path.stat().st_size / (1024 * 1024)
    print(f"🚀 Loading {file_size_mb:.1f}MB file...")

    # METHOD 1: Try orjson (FASTEST - 5-10x speed)
    try:
        import orjson
        with open(path, 'rb') as f:
            data = orjson.loads(f.read())
        print(f"✅ Loaded {len(data)} products with orjson (FASTEST)")
        return data
    except ImportError:
        print("⚠️ orjson not available, trying ujson...")
    except Exception as e:
        print(f"⚠️ orjson failed: {e}")

    # METHOD 2: Try ujson (VERY FAST - 3-5x speed)
    try:
        import ujson
        with open(path, 'r', encoding='utf-8') as f:
            data = ujson.load(f)
        print(f"✅ Loaded {len(data)} products with ujson (VERY FAST)")
        return data
    except ImportError:
        print("⚠️ ujson not available, using standard json...")
    except Exception as e:
        print(f"⚠️ ujson failed: {e}")

    # METHOD 3: Standard json with optimizations
    print("🐢 Using standard json (SLOWEST)")
    with open(path, 'r', encoding='utf-8') as f:
        raw = f.read().strip()
        if raw.startswith("["):
            return json.loads(raw)

        # Line-by-line as fallback
        products = []
        lines = raw.splitlines()
        for i, line in enumerate(lines):
            if line.strip():
                try:
                    products.append(json.loads(line))
                    if i % 50000 == 0:  # Less frequent updates for speed
                        print(f"📥 Loaded {i} lines...")
                except:
                    continue
        return products

def main():
    print("🚀 ULTRA-FAST FAISS Index Builder")
    print("=" * 50)

    # 1. FASTEST JSON loading
    products = load_products_ultra_fast(DATA_PATH)
    print(f"📊 Total products: {len(products):,}")

    # 2. OPTIMAL batch processing
    batch_size = 2000  # Larger batches for speed (if you have enough RAM)
    all_vectors = []

    print(f"🔨 Processing {len(products)} products in batches of {batch_size}...")

    for i in range(0, len(products), batch_size):
        batch = products[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(products) - 1) // batch_size + 1

        # Minimal progress for speed
        if batch_num % 5 == 0 or batch_num <= 3:
            print(f"   Batch {batch_num}/{total_batches}")

        texts = [doc_text_fast(p) for p in batch]
        vectors = embed_texts(texts)
        all_vectors.extend(vectors)

    # 3. FAST FAISS creation
    print("🏗️ Creating FAISS index...")
    arr = np.array(all_vectors).astype('float32')
    dim = arr.shape[1]
    print(f"   Embedding dimension: {dim}")

    import faiss
    faiss.normalize_L2(arr)
    index = faiss.IndexFlatIP(dim)
    index.add(arr)
    faiss.write_index(index, INDEX_PATH)

    # 4. FAST metadata saving
    print("💾 Saving metadata...")
    meta = [{"idx": i, "parent_asin": p.get("parent_asin"), "title": p.get("title"),
             "price": p.get("price"), "rating": p.get("average_rating"), "raw": p}
            for i, p in enumerate(products)]

    # Use fastest available JSON library
    try:
        import orjson
        with open(META_PATH, "wb") as f:
            f.write(orjson.dumps(meta))
        print("✅ Saved metadata with orjson (FASTEST)")
    except:
        try:
            import ujson
            with open(META_PATH, "w", encoding="utf-8") as f:
                ujson.dump(meta, f)
            print("✅ Saved metadata with ujson (VERY FAST)")
        except:
            with open(META_PATH, "w", encoding="utf-8") as f:
                json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))  # Compact
            print("✅ Saved metadata with standard json")

    print("=" * 50)
    print("🎉 COMPLETED! Final files:")
    print(f"   📄 {INDEX_PATH} (FAISS index)")
    print(f"   📄 {META_PATH} (Product metadata)")
    print(f"   📊 {len(products):,} products processed")

if __name__ == "__main__":
    main()
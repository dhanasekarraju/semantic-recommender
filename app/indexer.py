# import faiss
# import numpy as np
# import json
# from pathlib import Path
# from dotenv import load_dotenv
# load_dotenv()
#
# INDEX_PATH = Path("data/faiss.index")
# META_PATH = Path("data/meta.json")
#
# if not INDEX_PATH.exists() or not META_PATH.exists():
#     raise FileNotFoundError("FAISS index or metadata not found. Run build_index.py first.")
#
# index = faiss.read_index(str(INDEX_PATH))
# with open(META_PATH, "r", encoding="utf-8") as f:
#     meta = json.load(f)
#
# def search(query_text, top_k=6):
#     from app.embeddings import embed_texts
#     vec = embed_texts([query_text])[0]
#     vec = np.array(vec).astype('float32')
#     faiss.normalize_L2(vec.reshape(1, -1))
#     D, I = index.search(vec.reshape(1, -1), top_k)
#     results = []
#     for score, idx in zip(D[0], I[0]):
#         item = meta[idx].copy()
#         item["score"] = float(score)
#         results.append(item)
#     return results
import faiss
import numpy as np
import json
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

INDEX_PATH = Path("data/faiss.index")
META_PATH = Path("data/meta.json")

if not INDEX_PATH.exists() or not META_PATH.exists():
    raise FileNotFoundError("FAISS index or metadata not found. Run build_index.py first.")

index = faiss.read_index(str(INDEX_PATH))
with open(META_PATH, "r", encoding="utf-8") as f:
    meta = json.load(f)

def detect_gender_from_query(query):
    """Detect gender intent from query"""
    query_lower = query.lower()

    male_keywords = ['men', 'men\'s', 'mens', 'male', 'boy', 'boys', 'guy', 'guys', 'man']
    female_keywords = ['women', 'women\'s', 'womens', 'female', 'girl', 'girls', 'lady', 'ladies', 'woman']

    male_score = sum(1 for word in male_keywords if word in query_lower)
    female_score = sum(1 for word in female_keywords if word in query_lower)

    if male_score > female_score:
        return 'men'
    elif female_score > male_score:
        return 'women'
    else:
        return None

def filter_by_gender(results, target_gender):
    """Filter results by gender"""
    if not target_gender:
        return results

    filtered = []
    male_keywords = ['men', 'men\'s', 'mens', 'male', 'boy', 'boys', 'guy', 'guys', 'man']
    female_keywords = ['women', 'women\'s', 'womens', 'female', 'girl', 'girls', 'lady', 'ladies', 'woman']

    for result in results:
        title = result.get('title', '').lower()

        if target_gender == 'men':
            # Include if has male keywords AND no female keywords
            has_male = any(word in title for word in male_keywords)
            has_female = any(word in title for word in female_keywords)
            if has_male and not has_female:
                filtered.append(result)
        elif target_gender == 'women':
            # Include if has female keywords AND no male keywords
            has_female = any(word in title for word in female_keywords)
            has_male = any(word in title for word in male_keywords)
            if has_female and not has_male:
                filtered.append(result)

    return filtered

def search(query_text, top_k=6, gender_filter=None):
    from app.embeddings import embed_texts

    # Get more results initially for filtering
    search_k = top_k * 3

    # Semantic search
    vec = embed_texts([query_text])[0]
    vec = np.array(vec).astype('float32')
    faiss.normalize_L2(vec.reshape(1, -1))
    D, I = index.search(vec.reshape(1, -1), search_k)

    # Get initial results
    initial_results = []
    for score, idx in zip(D[0], I[0]):
        item = meta[idx].copy()
        item["score"] = float(score)
        initial_results.append(item)

    # Auto-detect gender from query if not specified
    if gender_filter is None:
        gender_filter = detect_gender_from_query(query_text)

    # Apply gender filtering
    if gender_filter:
        filtered_results = filter_by_gender(initial_results, gender_filter)
        # If filtering removed too many results, fall back to some unfiltered
        if len(filtered_results) < top_k:
            # Mix filtered and some high-score unfiltered results
            filtered_results.extend([r for r in initial_results if r not in filtered_results])
    else:
        filtered_results = initial_results

    return filtered_results[:top_k]

# Optional: Separate function with explicit gender control
def search_with_gender(query_text, top_k=6, gender=None):
    """
    Search with explicit gender control

    Args:
        query_text: Search query
        top_k: Number of results
        gender: 'men', 'women', or None for auto-detect
    """
    return search(query_text, top_k, gender_filter=gender)
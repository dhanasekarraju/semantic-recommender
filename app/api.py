import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
from app.indexer import search

app = FastAPI(title="Vector Vogue", version="0.1")

class Query(BaseModel):
    q: str | None = None
    image_base64: str | None = None
    top_k: int = 6
    rerank: bool = False
    gender_filter: str | None = None   # <--- ADD THIS

@app.post("/api/recommend")
def recommend(query: Query):
    try:
        # --- IMAGE QUERY ---
        if query.image_base64:
            from app.indexer import search_by_image
            candidates = search_by_image(query.image_base64, query.top_k, query.gender_filter)

        # --- TEXT QUERY ---
        else:
            candidates = search(query.q, query.top_k, gender_filter=query.gender_filter)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Reranking stays same
    if query.rerank:
        try:
            from app.reranker import rerank_and_explain
            reranked = rerank_and_explain(
                query.q if query.q else "",
                candidates,
                max_results=query.top_k,
            )
            return {"query": query.q, "results": reranked}
        except Exception:
            return {"query": query.q, "results": candidates}

    return {"query": query.q, "results": candidates}

@app.get("/health")
def health():
    return {"status": "ok"}

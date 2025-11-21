# app/reranker.py - PRECISION version
from sentence_transformers import CrossEncoder
import numpy as np
import re

# Load free reranking model (downloads once, then runs locally)
model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def extract_product_features(product):
    """Extract and clean product features for better matching"""
    raw = product.get("raw") or {}

    # Title (most important)
    title = product.get('title', '') or raw.get('title', '')

    # Features list
    features = raw.get('features', [])
    if features and isinstance(features, list):
        features_text = " ".join([str(f) for f in features[:5]])  # Limit to top 5 features
    else:
        features_text = ""

    # Description
    description = raw.get('description') or raw.get('product_description') or ""
    if isinstance(description, list):
        description = " ".join([str(d) for d in description[:2]])  # First 2 description lines

    # Categories
    categories = raw.get('categories', [])
    if categories and isinstance(categories, list):
        categories_text = " ".join([str(c) for c in categories[:3]])  # Top 3 categories
    else:
        categories_text = ""

    # Price and rating context
    price = product.get('price')
    price_context = f" priced at ${price}" if price else ""

    rating = product.get('rating') or raw.get('average_rating')
    rating_context = f" rated {rating} stars" if rating else ""

    # Combine all with weighted importance
    combined_text = f"{title}. {features_text}. {categories_text}. {description}{price_context}{rating_context}"

    # Clean extra spaces and special characters
    combined_text = re.sub(r'\s+', ' ', combined_text).strip()

    return combined_text

def analyze_query_intent(query):
    """Analyze query to understand user intent"""
    query_lower = query.lower()

    intent = {
        'is_gender_specific': False,
        'gender': None,
        'is_occasion_based': False,
        'occasion': None,
        'is_seasonal': False,
        'season': None,
        'is_price_sensitive': False,
        'is_rating_sensitive': False
    }

    # Gender detection
    male_terms = ['men', 'men\'s', 'mens', 'male', 'boy', 'boys', 'guy']
    female_terms = ['women', 'women\'s', 'womens', 'female', 'girl', 'girls', 'lady']

    if any(term in query_lower for term in male_terms):
        intent['is_gender_specific'] = True
        intent['gender'] = 'men'
    elif any(term in query_lower for term in female_terms):
        intent['is_gender_specific'] = True
        intent['gender'] = 'women'

    # Occasion detection
    occasions = {
        'beach': ['beach', 'swim', 'pool', 'vacation', 'resort'],
        'wedding': ['wedding', 'bridal', 'formal', 'ceremony'],
        'office': ['office', 'work', 'professional', 'business', 'job'],
        'sports': ['sports', 'gym', 'workout', 'running', 'exercise'],
        'casual': ['casual', 'everyday', 'comfort', 'relaxed']
    }

    for occasion, terms in occasions.items():
        if any(term in query_lower for term in terms):
            intent['is_occasion_based'] = True
            intent['occasion'] = occasion
            break

    # Seasonal detection
    seasons = {
        'summer': ['summer', 'hot', 'warm', 'sunny'],
        'winter': ['winter', 'cold', 'snow', 'freezing'],
        'rainy': ['rain', 'rainy', 'waterproof', 'umbrella']
    }

    for season, terms in seasons.items():
        if any(term in query_lower for term in terms):
            intent['is_seasonal'] = True
            intent['season'] = season
            break

    # Price sensitivity
    price_terms = ['cheap', 'expensive', 'budget', 'affordable', 'luxury', 'premium']
    intent['is_price_sensitive'] = any(term in query_lower for term in price_terms)

    # Rating sensitivity
    rating_terms = ['rated', 'rating', 'stars', 'review', 'popular']
    intent['is_rating_sensitive'] = any(term in query_lower for term in rating_terms)

    return intent

def generate_smart_explanation(query, product, score, intent):
    """Generate intelligent explanation for why product was ranked"""
    title = product.get('title', '')
    price = product.get('price')
    rating = product.get('rating')

    explanations = []

    # Base relevance explanation
    if score > 0.8:
        relevance = "highly relevant"
    elif score > 0.6:
        relevance = "relevant"
    else:
        relevance = "somewhat relevant"

    explanations.append(f"This product is {relevance} to your search")

    # Gender match explanation
    if intent['is_gender_specific']:
        title_lower = title.lower()
        if intent['gender'] == 'men' and any(word in title_lower for word in ['men', 'men\'s', 'male']):
            explanations.append("matches the men's clothing you're looking for")
        elif intent['gender'] == 'women' and any(word in title_lower for word in ['women', 'women\'s', 'female']):
            explanations.append("matches the women's clothing you're looking for")

    # Occasion match explanation
    if intent['is_occasion_based']:
        occasion_keywords = {
            'beach': ['beach', 'swim', 'summer', 'vacation'],
            'wedding': ['wedding', 'formal', 'elegant', 'dress'],
            'office': ['office', 'professional', 'business', 'work'],
            'sports': ['sports', 'athletic', 'gym', 'running']
        }

        title_lower = title.lower()
        for keyword in occasion_keywords.get(intent['occasion'], []):
            if keyword in title_lower:
                explanations.append(f"perfect for {intent['occasion']} occasions")
                break

    # Price context
    if price:
        if price < 25:
            explanations.append("budget-friendly price")
        elif price > 100:
            explanations.append("premium quality item")

    # Rating context
    if rating and rating >= 4.0:
        explanations.append("highly rated by customers")

    # Combine explanations
    if len(explanations) > 1:
        explanation = f"{explanations[0]} because it {', '.join(explanations[1:])}"
    else:
        explanation = explanations[0]

    return explanation + f" (score: {score:.3f})"

def rerank_and_explain(query: str, candidates: list, max_results: int = 6):
    """Enhanced reranking with intelligent explanations"""

    # Analyze query intent
    intent = analyze_query_intent(query)

    # Prepare enhanced text pairs for reranking
    pairs = []
    product_contexts = []

    for candidate in candidates:
        # Extract rich product context
        product_text = extract_product_features(candidate)
        pairs.append([query, product_text])
        product_contexts.append(candidate)

    # Get reranking scores
    scores = model.predict(pairs)

    # Combine with original candidates and generate explanations
    reranked = []
    for i, (score, candidate) in enumerate(zip(scores, product_contexts)):
        new_item = candidate.copy()
        new_item["llm_score"] = float(score)
        new_item["explanation"] = generate_smart_explanation(query, candidate, score, intent)
        new_item["rank"] = i + 1
        reranked.append(new_item)

    # Sort by rerank score
    reranked.sort(key=lambda x: x["llm_score"], reverse=True)

    # Apply additional business logic filters
    final_results = apply_business_rules(reranked, intent)

    return final_results[:max_results]

def apply_business_rules(results, intent):
    """Apply business rules to improve result quality"""
    filtered_results = []

    for result in results:
        # Skip if gender mismatch is severe
        if intent['is_gender_specific']:
            title_lower = result.get('title', '').lower()
            if intent['gender'] == 'men' and any(word in title_lower for word in ['women', 'women\'s', 'female']):
                continue  # Skip women's products when searching for men
            elif intent['gender'] == 'women' and any(word in title_lower for word in ['men', 'men\'s', 'male']):
                continue  # Skip men's products when searching for women

        # Boost highly rated products for rating-sensitive queries
        if intent['is_rating_sensitive']:
            rating = result.get('rating')
            if rating and rating >= 4.0:
                result["llm_score"] *= 1.1  # Small boost

        filtered_results.append(result)

    return filtered_results

# Additional utility function for gender-aware reranking
def rerank_with_gender_boost(query: str, candidates: list, gender: str = None, max_results: int = 6):
    """Rerank with explicit gender preference"""
    if gender:
        # Create gender-enhanced query
        enhanced_query = f"{query} {gender}'s clothing"
        return rerank_and_explain(enhanced_query, candidates, max_results)
    else:
        return rerank_and_explain(query, candidates, max_results)
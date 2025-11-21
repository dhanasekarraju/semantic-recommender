import React, { useState } from 'react'

export default function App() {
    const [q, setQ] = useState('outfit for tropical vacation')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [rerank, setRerank] = useState(false)
    const [searchTime, setSearchTime] = useState(0)

    // Example queries with emojis
    const exampleQueries = [
        { text: "men's beach shorts for vacation", emoji: "🏖️" },
        { text: "women's running shoes for gym", emoji: "👟" },
        { text: "professional office outfit", emoji: "💼" },
        { text: "winter coat for extreme cold", emoji: "❄️" },
        { text: "wedding guest dress summer", emoji: "👰" },
        { text: "comfortable walking shoes all day", emoji: "🚶" }
    ]

    async function submit() {
        if (!q.trim()) return

        setLoading(true)
        const startTime = performance.now()

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q, top_k: 12, rerank })
            })
            const data = await res.json()

            const endTime = performance.now()
            setSearchTime(Math.round(endTime - startTime))

            console.log('Backend returned:', data)
            setResults(data.results || [])
        } catch (e) {
            alert('Error: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            submit()
        }
    }

    const handleExampleClick = (example) => {
        setQ(example.text)
        setTimeout(() => submit(), 100)
    }

    return (
        <div style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '0',
            backgroundColor: '#0f172a',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            minHeight: '100vh',
            color: 'white'
        }}>
            {/* Enhanced Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '60px 20px 40px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px',
                        textShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                    }}>
                        ✨ StyleSense AI
                    </h1>
                    <p style={{
                        fontSize: '1.3rem',
                        color: '#cbd5e1',
                        marginBottom: '12px',
                        fontWeight: 300
                    }}>
                        Discover fashion with AI-powered semantic intelligence
                    </p>

                    {results.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '20px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            color: '#94a3b8'
                        }}>
                            <span style={{
                                background: 'rgba(102, 126, 234, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid rgba(102, 126, 234, 0.3)'
                            }}>
                                📊 {results.length} products found
                            </span>
                            {searchTime > 0 && (
                                <span style={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(34, 197, 94, 0.3)'
                                }}>
                                    ⚡ {searchTime}ms
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Search Section */}
            <div style={{
                maxWidth: '800px',
                margin: '-30px auto 50px',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    padding: '40px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '30px',
                        alignItems: 'stretch'
                    }}>
                        <div style={{
                            flex: 1,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: '20px',
                                zIndex: 2,
                                fontSize: '1.2rem',
                                color: '#64748b'
                            }}>
                                🔍
                            </div>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '20px 20px 20px 50px',
                                    fontSize: '16px',
                                    borderRadius: '16px',
                                    border: '2px solid rgba(102, 126, 234, 0.3)',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    color: 'white',
                                    backdropFilter: 'blur(10px)'
                                }}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe what you're looking for... ✨"
                                disabled={loading}
                            />
                        </div>

                        <button
                            onClick={submit}
                            disabled={loading || !q.trim()}
                            style={{
                                padding: '0 32px',
                                background: loading || !q.trim() ?
                                    'linear-gradient(135deg, #475569 0%, #64748b 100%)' :
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: loading || !q.trim() ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                minWidth: '140px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: loading || !q.trim() ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && q.trim()) {
                                    e.target.style.transform = 'translateY(-2px)'
                                    e.target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.6)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = loading || !q.trim() ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.4)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid transparent',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    <span>Searching</span>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.1rem' }}>🚀</span>
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Enhanced Rerank Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        justifyContent: 'center',
                        marginBottom: '30px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            color: '#cbd5e1',
                            fontSize: '15px',
                            fontWeight: 500,
                            padding: '10px 20px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '50px',
                                height: '28px',
                                background: rerank ?
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                    'rgba(71, 85, 105, 0.6)',
                                borderRadius: '14px',
                                transition: 'all 0.3s ease',
                                boxShadow: rerank ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: rerank ? '25px' : '3px',
                                    width: '22px',
                                    height: '22px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                                }}></div>
                            </div>
                            <input
                                type="checkbox"
                                checked={rerank}
                                onChange={(e) => setRerank(e.target.checked)}
                                style={{ display: 'none' }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}>🧠</span>
                                AI Smart Ranking
                            </span>
                        </label>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.2) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#86efac',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            +35% Better Results
                        </div>
                    </div>

                    {/* Example Queries */}
                    <div>
                        <p style={{
                            textAlign: 'center',
                            color: '#94a3b8',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            Try these examples:
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            justifyContent: 'center'
                        }}>
                            {exampleQueries.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExampleClick(example)}
                                    disabled={loading}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#cbd5e1',
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: loading ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.target.style.background = 'rgba(102, 126, 234, 0.2)'
                                            e.target.style.border = '1px solid rgba(102, 126, 234, 0.5)'
                                            e.target.style.transform = 'translateY(-1px)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                            e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                                            e.target.style.transform = 'translateY(0)'
                                        }
                                    }}
                                >
                                    <span>{example.emoji}</span>
                                    {example.text}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Results Grid */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 20px 60px'
            }}>
                {results.length === 0 && !loading && (
                    <div style={{
                        textAlign: 'center',
                        color: '#64748b',
                        padding: '80px 20px'
                    }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '20px',
                            opacity: 0.5
                        }}>
                            🎯
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            color: '#cbd5e1',
                            marginBottom: '12px'
                        }}>
                            Ready to Discover Amazing Fashion?
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            color: '#94a3b8'
                        }}>
                            Describe what you're looking for or try one of the examples above
                        </p>
                    </div>
                )}

                {results.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '28px'
                    }}>
                        {results.map((r, i) => (
                            <ProductCard key={i} product={r} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

// Enhanced Product Card Component
const ProductCard = ({ product, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const getImageUrl = () => {
        if (!product.raw?.images?.[0]) return null

        const images = product.raw.images[0]
        return images.hi_res || images.large || images.thumb
    }

    const imageUrl = getImageUrl()

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.6s ease-out',
            animationDelay: `${index * 0.1}s`,
            animationFillMode: 'both'
        }}
             onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                 e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'
                 e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(102, 126, 234, 0.3)'
             }}
             onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0) scale(1)'
                 e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'
                 e.currentTarget.style.boxShadow = 'none'
             }}
        >
            {/* Product Image */}
            {imageUrl && (
                <div style={{
                    width: '100%',
                    height: '220px',
                    marginBottom: '20px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    position: 'relative'
                }}>
                    <img
                        src={imageUrl}
                        alt={product.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            opacity: imageLoaded ? 1 : 0
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />

                    {!imageLoaded && !imageError && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #475569',
                                    borderTop: '2px solid #64748b',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Loading image...
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Product Info */}
            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    marginBottom: '12px',
                    color: '#f1f5f9',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '44px'
                }}>
                    {product.title || product.raw?.title || 'No title available'}
                </h3>

                {/* Price and Rating */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    {(product.price || product.raw?.price) && (
                        <div style={{
                            color: '#10b981',
                            fontWeight: 700,
                            fontSize: '20px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '8px'
                        }}>
                            ${product.price || product.raw?.price}
                        </div>
                    )}
                    {(product.rating || product.raw?.average_rating) && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#f59e0b',
                            fontWeight: 600,
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '8px'
                        }}>
                            <span>⭐</span>
                            <span>{product.rating || product.raw?.average_rating}</span>
                        </div>
                    )}
                </div>

                {/* Match Score */}
                {product.score !== undefined && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                        color: '#c7d2fe',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                        <span>🎯</span>
                        <span>{(product.score * 100).toFixed(1)}% Match</span>
                    </div>
                )}

                {/* Description */}
                {product.raw?.description && Array.isArray(product.raw.description) && product.raw.description.length > 0 && (
                    <p style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginTop: '8px'
                    }}>
                        {product.raw.description[0]}
                    </p>
                )}
            </div>
        </div>
    )
}
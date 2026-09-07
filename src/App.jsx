import { useState } from 'react'

// 초기 목업 데이터 (다양한 비율의 Unsplash 이미지)
const INITIAL_PINS = [
  { id: '1', title: '미니멀 데스크 셋업', src: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop' },
  { id: '2', title: '자연 풍경 & 안개 숲', src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop' },
  { id: '3', title: '아늑한 카페 무드', src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop' },
  { id: '4', title: '도시 건축물 야경', src: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=500&auto=format&fit=crop' },
  { id: '5', title: '빈티지 레트로 감성', src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop' },
  { id: '6', title: '따뜻한 라떼 한 잔', src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop' },
  { id: '7', title: '비 내리는 도심 거리', src: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop' },
  { id: '8', title: '차분한 실내 인테리어', src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop' },
]

export default function App() {
  // 저장된 핀 ID 배열 관리 (새로고침 전까지 유지)
  const [savedPinIds, setSavedPinIds] = useState([])
  // '전체 보기' or '저장된 핀만 보기' 필터 상태
  const [showOnlySaved, setShowOnlySaved] = useState(false)

  // 찜/저장 토글 핸들러
  const handleToggleSave = (id) => {
    setSavedPinIds((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    )
  }

  // 필터링된 핀 목록
  const displayedPins = showOnlySaved
    ? INITIAL_PINS.filter((pin) => savedPinIds.includes(pin.id))
    : INITIAL_PINS

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span>📌 Pinterest Clone</span>
        </div>
        <div>
          <button
            className={`filter-btn ${showOnlySaved ? 'active' : ''}`}
            onClick={() => setShowOnlySaved(!showOnlySaved)}
          >
            {showOnlySaved ? '모든 핀 보기' : `저장됨 (${savedPinIds.length})`}
          </button>
        </div>
      </header>

      {displayedPins.length === 0 ? (
        <div className="empty-state">
          저장한 핀이 아직 없습니다. 마음에 드는 핀의 '저장' 버튼을 눌러보세요!
        </div>
      ) : (
        <div className="masonry-grid">
          {displayedPins.map((pin) => {
            const isSaved = savedPinIds.includes(pin.id)
            return (
              <div key={pin.id} className="pin-card">
                <img src={pin.src} alt={pin.title} loading="lazy" />
                <div className="pin-info">
                  <span className="pin-title">{pin.title}</span>
                  <button
                    className={`save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={() => handleToggleSave(pin.id)}
                  >
                    {isSaved ? '저장됨 ✓' : '저장'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

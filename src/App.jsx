import { useState, useEffect } from 'react'
import { supabase } from './util/supabase'

// 초기 목업 데이터 (Supabase 로딩 전 또는 오류 발생 시 폴백용)
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
  const [pins, setPins] = useState(INITIAL_PINS)
  // 저장된 핀 ID 배열 관리
  const [savedPinIds, setSavedPinIds] = useState([])
  // '전체 보기' or '저장된 핀만 보기' 필터 상태
  const [showOnlySaved, setShowOnlySaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Supabase 데이터베이스에서 핀 및 저장 내역 불러오기
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // 1. pins 테이블에서 목록 조회
        const { data: pinsData, error: pinsError } = await supabase
          .from('pins')
          .select('*')
          .order('id', { ascending: true })

        if (!pinsError && pinsData && pinsData.length > 0) {
          setPins(
            pinsData.map((p) => ({
              id: String(p.id),
              title: p.title,
              src: p.image_url,
            }))
          )
        }

        // 2. saved_pins 테이블에서 저장된 핀 목록 조회
        const { data: savedData, error: savedError } = await supabase
          .from('saved_pins')
          .select('pin_id')
          .eq('user_identifier', 'guest_user')

        if (!savedError && savedData) {
          setSavedPinIds(savedData.map((s) => String(s.pin_id)))
        }
      } catch (error) {
        console.error('Supabase 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 찜/저장 토글 핸들러 (Supabase DB 연동)
  const handleToggleSave = async (id) => {
    const isSaved = savedPinIds.includes(id)
    const numericId = Number(id)

    // 낙관적 UI 업데이트
    setSavedPinIds((prev) =>
      isSaved ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    )

    try {
      if (isSaved) {
        // Supabase에서 삭제
        const { error } = await supabase
          .from('saved_pins')
          .delete()
          .eq('pin_id', numericId)
          .eq('user_identifier', 'guest_user')

        if (error) throw error
      } else {
        // Supabase에 추가
        const { error } = await supabase
          .from('saved_pins')
          .insert([{ pin_id: numericId, user_identifier: 'guest_user' }])

        if (error) throw error
      }
    } catch (error) {
      console.error('저장 상태 업데이트 실패:', error)
      // 실패 시 롤백
      setSavedPinIds((prev) =>
        isSaved ? [...prev, id] : prev.filter((savedId) => savedId !== id)
      )
    }
  }

  // 필터링된 핀 목록
  const displayedPins = showOnlySaved
    ? pins.filter((pin) => savedPinIds.includes(pin.id))
    : pins

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

      {loading && pins.length === 0 ? (
        <div className="empty-state">핀 목록을 불러오는 중...</div>
      ) : displayedPins.length === 0 ? (
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

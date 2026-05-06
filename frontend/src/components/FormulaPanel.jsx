import React, { useState, useEffect } from 'react'
import { getFormulas, updateFormula, toggleLikeFormula } from '../services/api'
import MathLiveEditor from './MathLiveEditor'

export default function FormulaPanel({ documentId }) {
  const [formulas, setFormulas] = useState([])
  const [loading, setLoading]   = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [error, setError]       = useState('')
  const [likedIds, setLikedIds] = useState(new Set())

  useEffect(() => {
    if (!documentId) return
    setLoading(true)
    setError('')
    setFormulas([])
    getFormulas(documentId)
      .then(({ data }) => {
        setFormulas(data)
        setActiveId(data[0]?.id ?? null)
      })
      .catch(() => setError('LỖI KHÔNG TẢI ĐƯỢC DANH SÁCH CÔNG THỨC.'))
      .finally(() => setLoading(false))
  }, [documentId])

  const handleSave = async (formulaId, latexEdited) => {
    const { data } = await updateFormula(formulaId, latexEdited)
    setFormulas((prev) => prev.map((f) => (f.id === formulaId ? data : f)))
  }

  const handleToggleLike = async (e, formulaId) => {
    e.stopPropagation()
    const isLiked = likedIds.has(formulaId)
    await toggleLikeFormula(formulaId, isLiked).catch(console.error)
    setLikedIds(prev => {
      const next = new Set(prev)
      if (isLiked) next.delete(formulaId)
      else next.add(formulaId)
      return next
    })
  }

  /* ── Empty states ──────────────────────────────────────────── */
  if (!documentId) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--lavender)' }}>
        <h3 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 16px' }}>CHƯA CHỌN TÀI LIỆU</h3>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--fs-body)', color: 'var(--text-light)' }}>
          HÃY CHỌN MỘT TÀI LIỆU ĐỂ XEM CÔNG THỨC
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--sky)' }}>
        <h3 style={{ fontSize: 'var(--fs-h2)', margin: 0 }}>ĐANG TẢI...</h3>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--coral)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', margin: 0 }}>{error}</h3>
      </div>
    )
  }

  if (formulas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-light)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', margin: '0 0 16px', color: 'var(--lavender)' }}>KHÔNG CÓ CÔNG THỨC</h3>
        <p style={{ margin: 0, fontWeight: 700 }}>BẠN CHƯA OCR TÀI LIỆU NÀY!</p>
      </div>
    )
  }

  const active = formulas.find((f) => f.id === activeId)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
      {/* ── Formula sidebar ─────────────────────────────────── */}
      <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '16px' }}>
        <h4 style={{ margin: 0, color: 'var(--coral)', fontSize: 'var(--fs-body)' }}>{formulas.length} CÔNG THỨC</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formulas.map((f) => {
            const isActive = f.id === activeId
            const isLiked = likedIds.has(f.id)
            return (
              <div
                key={f.id}
                onClick={() => setActiveId(f.id)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-bubbly)',
                  border: `var(--border-thick) solid ${isActive ? 'var(--coral)' : 'var(--text-light)'}`,
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? '4px 4px 0px rgba(78, 205, 196, 0.4)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  wordBreak: 'break-word',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-small)', fontWeight: 800, color: 'var(--sky)' }}>TRANG {f.page_number}</span>
                  <button 
                    onClick={(e) => handleToggleLike(e, f.id)}
                    style={{
                      background: isLiked ? 'var(--yellow)' : 'white',
                      border: '2px solid var(--yellow)',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: '2px 8px',
                      color: isLiked ? 'white' : 'var(--yellow)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isLiked ? 'ĐÃ THÍCH' : 'THÍCH'}
                  </button>
                </div>
                <div style={{ fontSize: 'var(--fs-small)', fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>
                  {(f.latex_edited || f.latex_raw || '').slice(0, 30)}…
                </div>
                {f.latex_edited && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{
                      background: 'var(--lavender)',
                      color: 'var(--text-dark)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--fs-xs)',
                      fontWeight: 800,
                    }}>
                      ĐÃ CHỈNH
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main editor area ────────────────────────────────── */}
      <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {active && (
          <>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--sky)', fontSize: 'var(--fs-h3)' }}>CÔNG THỨC #{active.id}</h3>
              <span style={{ fontWeight: 800, fontSize: 'var(--fs-small)', background: 'white', border: 'var(--border-thick) solid var(--lavender)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', color: 'var(--lavender)' }}>
                TRANG {active.page_number}
              </span>
              {active.latex_edited && (
                <span style={{ fontWeight: 800, fontSize: 'var(--fs-small)', background: 'var(--coral)', color: 'white', border: 'var(--border-thick) solid var(--coral)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>
                  ĐÃ CHỈNH SỬA
                </span>
              )}
            </div>

            <MathLiveEditor
              key={active.id}
              initialLatex={active.latex_edited || active.latex_raw}
              formulaId={active.id}
              onSave={handleSave}
            />

            {active.latex_edited && (
              <div style={{ padding: '24px', border: 'var(--border-thick) solid var(--text-light)', borderRadius: 'var(--radius-bubbly)', background: 'var(--bg)' }}>
                <h4 style={{ margin: '0 0 16px', color: 'var(--text-light)', fontSize: 'var(--fs-body)' }}>OCR GỐC:</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--text-dark)', fontWeight: 700, wordBreak: 'break-word' }}>
                  {active.latex_raw}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

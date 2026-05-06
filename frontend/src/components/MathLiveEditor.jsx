import React, { useRef, useEffect, useState, useCallback } from 'react'

export default function MathLiveEditor({ initialLatex = '', onSave, formulaId }) {
  const [latexContent, setLatexContent] = useState(initialLatex)
  const [saved, setSaved]               = useState(false)
  const [saving, setSaving]             = useState(false)
  const mathFieldRef   = useRef(null)
  const ignoreNextRef  = useRef(false)

  // MathLive → State
  useEffect(() => {
    const el = mathFieldRef.current
    if (!el) return
    const handler = () => {
      if (ignoreNextRef.current) { ignoreNextRef.current = false; return }
      setLatexContent(el.value)
      setSaved(false)
    }
    el.addEventListener('input', handler)
    return () => el.removeEventListener('input', handler)
  }, [])

  // State → MathLive
  useEffect(() => {
    const el = mathFieldRef.current
    if (!el || el.value === latexContent) return
    ignoreNextRef.current = true
    el.value = latexContent
  }, [latexContent])

  const handleTextChange = useCallback((e) => {
    setLatexContent(e.target.value)
    setSaved(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(formulaId, latexContent)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }, [onSave, formulaId, latexContent])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Visual Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--sky)', fontFamily: 'var(--font-heading)' }}>XEM TRỰC QUAN</h4>
        <math-field
          ref={mathFieldRef}
          virtual-keyboard-mode="manual"
          style={{ width: '100%' }}
        />
      </div>

      {/* Raw Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--lavender)', fontFamily: 'var(--font-heading)' }}>MÃ LATEX</h4>
        <textarea
          className="clay-input"
          value={latexContent}
          onChange={handleTextChange}
          placeholder="Nhập mã LaTeX..."
          spellCheck={false}
          style={{
            width: '100%',
            height: '150px',
            resize: 'vertical',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-dark)'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        {onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`clay-btn ${saved ? 'clay-btn-secondary' : 'clay-btn-primary'}`}
            style={{ 
              width: '100%', 
              maxWidth: '300px',
              backgroundColor: saved ? 'var(--yellow)' : '',
              transform: saved ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s'
            }}
          >
            {saved ? '✨ ĐÃ LƯU THÀNH CÔNG!' : saving ? 'ĐANG LƯU...' : 'LƯU CÔNG THỨC'}
          </button>
        )}
      </div>
    </div>
  )
}

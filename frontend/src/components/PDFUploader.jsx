import React, { useState, useRef } from 'react'
import { uploadDocument, processDocument } from '../services/api'
import confetti from 'canvas-confetti'

export default function PDFUploader({ onDocumentProcessed }) {
  const [state, setState]       = useState('idle') // idle | uploading | processing | done | error
  const [progress, setProgress] = useState(0)
  const [message, setMessage]   = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const reset = (e) => {
    if (e) e.stopPropagation()
    setState('idle')
    setProgress(0)
    setMessage('')
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#C8B8E8']
    })
  }

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setMessage('LỖI: CHỈ CHẤP NHẬN FILE PDF')
      setState('error')
      return
    }
    try {
      setState('uploading')
      setMessage('')
      setProgress(0)

      const { data: doc } = await uploadDocument(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })

      setState('processing')
      setMessage(`ĐÃ TẢI LÊN "${doc.title.toUpperCase()}". ĐANG OCR...`)

      const { data: result } = await processDocument(doc.id)

      setState('done')
      setMessage(`HOÀN TẤT! TÌM THẤY ${result.formulas_found} CÔNG THỨC.`)
      triggerConfetti()

      if (onDocumentProcessed) {
        setTimeout(() => {
          onDocumentProcessed(doc.id)
        }, 1500)
      }
    } catch (err) {
      setState('error')
      setMessage(`LỖI: ${err.response?.data?.detail || err.message}`)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const getCardStyle = () => {
    if (state === 'error') return { borderColor: 'var(--coral)', boxShadow: '8px 8px 0px rgba(255, 107, 107, 0.4)' }
    if (state === 'done') return { borderColor: 'var(--yellow)', boxShadow: '8px 8px 0px rgba(255, 230, 109, 0.4)' }
    if (state === 'uploading' || state === 'processing') return { borderColor: 'var(--sky)', boxShadow: '8px 8px 0px rgba(78, 205, 196, 0.4)' }
    if (dragOver) return { transform: 'scale(1.05)', borderColor: 'var(--sky)', boxShadow: '12px 12px 0px rgba(78, 205, 196, 0.4)' }
    return {}
  }

  return (
    <div 
      className="clay-card"
      style={{ 
        textAlign: 'center', 
        cursor: state === 'idle' ? 'pointer' : 'default', 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        ...getCardStyle()
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => state === 'idle' && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {state === 'idle' && (
        <>
          <h3 style={{ fontSize: 'var(--fs-h2)', color: 'var(--sky)', margin: 0 }}>KÉO THẢ FILE PDF VÀO ĐÂY</h3>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>HOẶC NHẤN ĐỂ CHỌN FILE</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <span style={{ background: 'var(--lavender)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>TỐI ĐA 50MB</span>
            <span style={{ background: 'var(--coral)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>OCR TỰ ĐỘNG</span>
          </div>
        </>
      )}

      {state === 'uploading' && (
        <>
          <h3 style={{ fontSize: 'var(--fs-h3)', color: 'var(--sky)', margin: 0 }}>ĐANG TẢI LÊN... {progress}%</h3>
          <div style={{ width: '100%', height: '24px', background: 'var(--bg)', border: 'var(--border-thick) solid var(--sky)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--sky)', transition: 'width 0.3s ease' }} />
          </div>
        </>
      )}

      {state === 'processing' && (
        <>
          <h3 style={{ fontSize: 'var(--fs-h3)', color: 'var(--yellow)', margin: 0 }}>ĐANG XỬ LÝ OCR...</h3>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-dark)', fontWeight: 700, margin: 0 }}>{message}</p>
        </>
      )}

      {state === 'done' && (
        <>
          <h3 style={{ fontSize: 'var(--fs-h2)', color: 'var(--yellow)', margin: 0 }}>THÀNH CÔNG</h3>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-dark)', fontWeight: 700, margin: 0 }}>{message}</p>
          <button className="clay-btn clay-btn-secondary" onClick={reset}>TẢI LÊN FILE KHÁC</button>
        </>
      )}

      {state === 'error' && (
        <>
          <h3 style={{ fontSize: 'var(--fs-h2)', color: 'var(--coral)', margin: 0 }}>CÓ LỖI XẢY RA</h3>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-dark)', margin: 0, fontWeight: 700 }}>{message}</p>
          <button className="clay-btn clay-btn-primary" onClick={reset}>THỬ LẠI</button>
        </>
      )}
    </div>
  )
}

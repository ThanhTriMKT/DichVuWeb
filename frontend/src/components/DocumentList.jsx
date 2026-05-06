import React from 'react'

const STATUS_MAP = {
  uploaded:   { label: 'ĐÃ TẢI LÊN',  color: 'var(--text-light)', border: 'var(--text-light)' },
  processing: { label: 'ĐANG XỬ LÝ',  color: 'var(--sky)', border: 'var(--sky)' },
  done:       { label: 'HOÀN TẤT',    color: 'var(--yellow)', border: 'var(--yellow)' },
  error:      { label: 'LỖI',         color: 'var(--coral)', border: 'var(--coral)' },
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentList({ documents, selectedId, onSelect, onDelete }) {
  if (!documents || documents.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '16px',
        color: 'var(--text-light)',
        padding: '32px 0'
      }}>
        <h4 style={{ fontSize: 'var(--fs-h3)', margin: 0, fontWeight: 700, color: 'var(--lavender)' }}>TRỐNG TRƠN</h4>
        <p style={{ margin: 0, fontWeight: 700 }}>Hãy tải lên một file nhé!</p>
      </div>
    )
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {documents.map((doc) => {
        const isSelected = selectedId === doc.id
        const cfg = STATUS_MAP[doc.status] || { label: doc.status, color: 'var(--text-light)', border: 'var(--text-light)' }
        return (
          <li
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
              borderRadius: 'var(--radius-bubbly)',
              border: `var(--border-thick) solid ${isSelected ? 'var(--sky)' : 'var(--text-light)'}`,
              background: 'var(--bg)',
              boxShadow: isSelected ? '4px 4px 0px rgba(78, 205, 196, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isSelected ? 'scale(1.02)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', wordBreak: 'break-word' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--fs-body)', fontWeight: 800, color: isSelected ? 'var(--sky)' : 'var(--text-dark)' }}>
                {doc.title}
              </h4>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
                style={{
                  background: 'white',
                  border: 'var(--border-thick) solid var(--coral)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--coral)',
                  fontWeight: 800,
                  fontSize: 'var(--fs-small)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  transition: 'all 0.2s',
                  boxShadow: '2px 2px 0px rgba(255, 107, 107, 0.4)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                XOÁ
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-small)', fontWeight: 800, color: 'var(--text-light)' }}>
                {doc.page_count} TRANG
              </span>
              <span style={{ fontSize: 'var(--fs-small)', fontWeight: 800, color: 'var(--text-light)' }}>
                {formatSize(doc.file_size)}
              </span>
              <span style={{
                fontSize: 'var(--fs-small)',
                fontWeight: 800,
                color: cfg.color,
                border: `2px solid ${cfg.border}`,
                padding: '2px 12px',
                borderRadius: 'var(--radius-pill)',
              }}>
                {cfg.label}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import PDFUploader from './components/PDFUploader'
import DocumentList from './components/DocumentList'
import FormulaPanel from './components/FormulaPanel'
import { getDocuments, deleteDocument } from './services/api'
import 'mathlive'

export default function App() {
  const [documents, setDocuments]     = useState([])
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [showUpload, setShowUpload]   = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [stats, setStats] = useState({ docs: 0, formulas: 0 })

  const fetchDocuments = useCallback(() => {
    setLoadingDocs(true)
    getDocuments()
      .then(({ data }) => {
        const items = data.items || []
        setDocuments(items)
        const totalFormulas = items.reduce((sum, d) => sum + (d.formula_count || 0), 0)
        setStats({ docs: items.length, formulas: totalFormulas })
      })
      .catch(console.error)
      .finally(() => setLoadingDocs(false))
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const handleDocumentProcessed = (docId) => {
    setShowUpload(false)
    fetchDocuments()
    setSelectedDocId(docId)
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Bạn có chắc muốn xoá tài liệu này không?')) return
    await deleteDocument(docId)
    if (selectedDocId === docId) setSelectedDocId(null)
    fetchDocuments()
  }

  const selectedDoc = documents.find(d => d.id === selectedDocId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ padding: '32px 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0, color: 'var(--coral)' }}>Ebook2LaTeX</h1>
            <p style={{ margin: '8px 0 0', fontSize: 'var(--fs-body)', color: 'var(--text-light)', fontWeight: 600 }}>Chuyển đổi PDF sang LaTeX</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className="clay-btn clay-btn-secondary" 
              onClick={() => { setSelectedDocId(null); setShowUpload(false); }}
              style={{ padding: '12px 24px' }}
            >
              TRANG CHỦ
            </button>
            <span style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--sky)' }}>
              {stats.docs} FILE
            </span>
            <button 
              className="clay-btn clay-btn-primary" 
              onClick={() => setShowUpload(v => !v)}
            >
              {showUpload ? 'QUAY LẠI' : 'TẢI LÊN PDF'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="page-container section-padding" style={{ flex: 1, width: '100%' }}>
        {showUpload ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: '32px', textAlign: 'center', color: 'var(--lavender)' }}>
              Thêm Tài Liệu Mới
            </h2>
            <PDFUploader onDocumentProcessed={handleDocumentProcessed} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {/* Left Panel */}
            <aside style={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="clay-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 'var(--fs-h3)', margin: 0, color: 'var(--coral)' }}>DUYỆT TÀI LIỆU</h3>
                  {loadingDocs && <span style={{ color: 'var(--sky)', fontWeight: 700 }}>ĐANG TẢI...</span>}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <DocumentList 
                    documents={documents}
                    selectedId={selectedDocId}
                    onSelect={setSelectedDocId}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            </aside>

            {/* Right Panel */}
            <section style={{ flex: '2 1 600px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="clay-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: 'var(--fs-h3)', margin: 0, color: 'var(--sky)' }}>
                    {selectedDoc ? selectedDoc.title : 'CHỈNH SỬA CÔNG THỨC'}
                  </h3>
                  {selectedDoc && (
                    <span style={{ 
                      background: 'var(--yellow)', 
                      padding: '8px 16px', 
                      borderRadius: 'var(--radius-pill)', 
                      fontWeight: 700, 
                      fontSize: 'var(--fs-small)' 
                    }}>
                      {selectedDoc.page_count} TRANG
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <FormulaPanel documentId={selectedDocId} />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ padding: '64px 0', borderTop: 'var(--border-thick) solid var(--lavender)', background: 'var(--bg)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--text-light)' }}>
            Phát triển bởi Phan Thanh Trí
          </p>
        </div>
      </footer>
    </div>
  )
}

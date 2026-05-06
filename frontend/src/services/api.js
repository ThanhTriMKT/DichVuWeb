import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// ─── Documents ───────────────────────────────────────────────────────────────

export const getDocuments = () => api.get('/documents')

export const getDocument = (id) => api.get(`/documents/${id}`)

export const uploadDocument = (file, onUploadProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

export const processDocument = (id) => api.post(`/documents/${id}/process`)

export const deleteDocument = (id) => api.delete(`/documents/${id}`)

// ─── Formulas ────────────────────────────────────────────────────────────────

export const getFormulas = (docId) => api.get(`/documents/${docId}/formulas`)

export const updateFormula = (formula_id, latex_edited) =>
  api.put(`/formulas/${formula_id}`, { latex_edited })

export const toggleLikeFormula = (formulaId, isLiked) => {
  if (isLiked) return api.delete(`/formulas/${formulaId}/like`)
  return api.post(`/formulas/${formulaId}/like`)
}


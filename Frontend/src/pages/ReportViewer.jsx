import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  Search,
  Clock,
  Calendar,
  X,
  Mic,
  ScanLine,
  Activity,
  User,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Stethoscope,
  Info
} from 'lucide-react'
import { reportsAPI, imageAPI } from '../api/api'

const ReportViewer = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Reports')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Fetch both transcription reports and image analyses
      const [reportsRes, imagesRes] = await Promise.all([
        reportsAPI.getAll(),
        imageAPI.getAnalyses()
      ])

      const transcriptionReports = reportsRes.data.reports || []
      const imageAnalyses = (imagesRes.data.analyses || []).map(analysis => ({
        ...analysis,
        _id: analysis.image_id, // Normalize ID
        present_complaints: `${analysis.image_type} Scan Analysis`, // Map fields
        clinical_details: analysis.clinical_notes || 'No clinical notes provided',
        conversation_type: 'imaging', // Explicitly mark as imaging
        created_at: analysis.created_at
      }))

      // Combine and sort by date descending
      const combined = [...transcriptionReports, ...imageAnalyses].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )

      setReports(combined)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (report) => {
    try {
      let response;
      if (report.conversation_type === 'imaging') {
        response = await imageAPI.downloadPDF(report._id)
      } else {
        response = await reportsAPI.downloadPDF(report._id)
      }

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medical_report_${report._id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const filters = ['All Reports', 'Transcriptions', 'Imaging', 'Combined']
  const transcriptionTypes = ['transcription', 'consultation', 'followup', 'emergency', 'surgery']

  const getReportIcon = (type) => {
    const t = type?.toLowerCase()
    if (transcriptionTypes.includes(t)) return <Mic className="w-5 h-5 text-blue-500" />
    if (t === 'imaging') return <ScanLine className="w-5 h-5 text-teal-500" />
    return <FileText className="w-5 h-5 text-green-500" />
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.patient_id?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (r.present_complaints?.toLowerCase() || '').includes(search.toLowerCase())

    if (filter === 'All Reports') return matchesSearch

    if (filter === 'Transcriptions') {
      return matchesSearch && transcriptionTypes.includes(r.conversation_type?.toLowerCase())
    }

    if (filter === 'Imaging') return matchesSearch && r.conversation_type === 'imaging'
    if (filter === 'Combined') return matchesSearch && r.conversation_type === 'combined'
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">View and manage all your generated medical reports</p>
        </div>
        <button className="btn-primary h-12 px-6 shadow-xl shadow-teal-500/20 group">
          <Download className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
          Export All
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 h-12 bg-white/50 backdrop-blur-sm border-gray-100 hover:border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report._id}
              className="group p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-teal-100 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Icon Wrapper */}
                <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors duration-500">
                  {getReportIcon(report.conversation_type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{report.present_complaints}</h3>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600">
                      Completed
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed line-clamp-1">{report.clinical_details}</p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                      <User className="w-4 h-4" />
                      <span>{report.patient_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-200 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-100 text-gray-400 hover:text-teal-500 hover:border-teal-100 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center space-y-4 animate-in">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No reports found</h3>
            <p className="text-gray-500 max-w-xs mx-auto font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                  {getReportIcon(selectedReport.conversation_type)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Clinical Report Analysis</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {selectedReport.patient_id}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(selectedReport.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedReport)}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

              {/* Complaints & Impression */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Present Complaints</span>
                  </div>
                  <div className="p-6 bg-orange-50/30 rounded-3xl border border-orange-100/50">
                    <p className="text-gray-900 font-bold leading-relaxed">{selectedReport.present_complaints}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      {selectedReport.conversation_type === 'imaging' ? 'AI Diagnosis' : 'Clinical Impression'}
                    </span>
                  </div>
                  <div className="p-6 bg-teal-50/30 rounded-3xl border border-teal-100/50">
                    <p className="text-teal-900 font-bold leading-relaxed">
                      {selectedReport.conversation_type === 'imaging' ? selectedReport.diagnosis : selectedReport.impression}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details & Examination / Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {selectedReport.conversation_type === 'imaging' ? 'Observation / Findings' : 'Clinical Details'}
                  </span>
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                    <p className="text-gray-600 font-medium leading-relaxed">
                      {selectedReport.conversation_type === 'imaging' ? selectedReport.findings : selectedReport.clinical_details}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {selectedReport.conversation_type === 'imaging' ? 'Clinical Context' : 'Physical Examination'}
                  </span>
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                    <p className="text-gray-600 font-medium leading-relaxed">
                      {selectedReport.conversation_type === 'imaging' ? (selectedReport.clinical_notes || 'No context provided') : selectedReport.physical_examination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Management Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Management / Recommendations</span>
                </div>
                <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/50">
                  <p className="text-blue-900 font-bold text-lg leading-relaxed">
                    {selectedReport.management_plan || selectedReport.recommendations}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedReport.additional_notes && (
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Notes</span>
                  <div className="p-6 bg-gray-50/30 rounded-3xl border border-gray-100/50 italic">
                    <p className="text-gray-500 font-medium leading-relaxed">{selectedReport.additional_notes}</p>
                  </div>
                </div>
              )}

              {/* Full Transcript Reveal */}
              {selectedReport.transcript && (
                <div className="pt-4 border-t border-gray-100">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-4">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Raw Consultation Transcript</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-4 p-8 bg-gray-900 rounded-[2rem] text-gray-300 font-mono text-sm leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                      {selectedReport.transcript}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportViewer


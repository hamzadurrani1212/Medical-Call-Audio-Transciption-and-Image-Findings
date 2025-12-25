import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  Search,
  Clock,
  Calendar,
  MoreVertical,
  ArrowRight,
  Filter,
  Mic,
  ScanLine,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { reportsAPI } from '../api/api'

const ReportViewer = () => {
  const [reports, setReports] = useState([
    {
      _id: '1',
      patient_id: 'P-1234-5678',
      present_complaints: 'Patient Consultation - Chest Pain Evaluation',
      clinical_details: 'Suspected ACS with recommendation for urgent cardiac workup.',
      conversation_type: 'transcription',
      created_at: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      _id: '2',
      patient_id: 'P-2024-0892',
      present_complaints: 'MRI Brain with Contrast Analysis',
      clinical_details: 'Small non-specific white matter lesion in right frontal lobe.',
      conversation_type: 'imaging',
      created_at: '2024-01-15T09:15:00Z',
      status: 'completed'
    },
    {
      _id: '3',
      patient_id: 'P-2024-0893',
      present_complaints: 'Follow-up Consultation - Diabetes Management',
      clinical_details: 'HbA1c improved to 7.2%. Continuing current medication regimen.',
      conversation_type: 'transcription',
      created_at: '2024-01-14T15:45:00Z',
      status: 'completed'
    },
    {
      _id: '4',
      patient_id: 'P-2024-0896',
      present_complaints: 'Emergency Room Visit - Abdominal Pain',
      clinical_details: 'Processing in progress...',
      conversation_type: 'transcription',
      created_at: '2024-01-13T08:00:00Z',
      status: 'processing'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Reports')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await reportsAPI.getAll()
      if (response.data.reports) {
        setReports(response.data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (reportId) => {
    try {
      const response = await reportsAPI.downloadPDF(reportId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medical_report_${reportId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const filters = ['All Reports', 'Transcriptions', 'Imaging', 'Combined']

  const getReportIcon = (type) => {
    switch (type) {
      case 'transcription': return <Mic className="w-5 h-5 text-blue-500" />
      case 'imaging': return <ScanLine className="w-5 h-5 text-teal-500" />
      default: return <FileText className="w-5 h-5 text-green-500" />
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.patient_id.toLowerCase().includes(search.toLowerCase()) ||
      r.present_complaints.toLowerCase().includes(search.toLowerCase())

    if (filter === 'All Reports') return matchesSearch
    if (filter === 'Transcriptions') return matchesSearch && r.conversation_type === 'transcription'
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${report.status === 'completed'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-orange-50 text-orange-600'
                      }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed">{report.clinical_details}</p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                      <FileText className="w-4 h-4" />
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
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report._id)}
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
    </div>
  )
}

export default ReportViewer

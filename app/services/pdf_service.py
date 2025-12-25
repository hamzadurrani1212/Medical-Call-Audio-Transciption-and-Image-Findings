"""
MedAI - PDF Generation Service
Professional Medical Report PDF Generation
"""
import os
import logging
from datetime import datetime
from typing import Dict
from bson import ObjectId

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.config import settings

logger = logging.getLogger("MedAI.PDFService")


def ensure_reports_directory():
    """Ensure reports directory exists"""
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)


def generate_report_pdf(report: Dict) -> str:
    """Generate professional medical PDF report"""
    ensure_reports_directory()
    
    try:
        report_id = report.get('_id', 'unknown')
        if isinstance(report_id, ObjectId):
            report_id = str(report_id)
        
        filename = f"medical_report_{report_id}.pdf"
        filepath = os.path.join(settings.REPORTS_DIR, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            topMargin=50,
            bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'MedicalTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1,
            textColor='#2E5A88',
            fontName='Helvetica-Bold'
        )
        
        section_title = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor='#2E5A88',
            fontName='Helvetica-Bold',
            leftIndent=20
        )
        
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            spaceAfter=12,
            leftIndent=20,
            rightIndent=20
        )
        
        # Header
        story.append(Paragraph(
            "<b>MEDICAL CONSULTATION REPORT</b><br/>"
            "<font size='9'>Confidential Medical Document</font>",
            title_style
        ))
        
        # Patient details
        story.append(Paragraph("PATIENT & CONSULTATION DETAILS", section_title))
        
        details = [
            f"<b>Patient ID:</b> {report.get('patient_id', 'Not specified')}",
            f"<b>Doctor:</b> {report.get('doctor_id', 'Not specified')}",
            f"<b>Type:</b> {report.get('conversation_type', 'consultation').title()}",
            f"<b>Date:</b> {report.get('created_at', datetime.utcnow()).strftime('%Y-%m-%d %H:%M')}",
            f"<b>Report ID:</b> {report_id}"
        ]
        
        for detail in details:
            story.append(Paragraph(detail, body_style))
        
        story.append(Spacer(1, 20))
        
        # Medical sections
        def add_section(title: str, content: str):
            if not content or content == "Not mentioned":
                content = "Not documented"
            story.append(Paragraph(title, section_title))
            story.append(Paragraph(content.replace("\n", "<br/>"), body_style))
            story.append(Spacer(1, 15))
        
        add_section("PRESENTING COMPLAINTS", report.get("present_complaints", ""))
        add_section("CLINICAL DETAILS", report.get("clinical_details", ""))
        add_section("PHYSICAL EXAMINATION", report.get("physical_examination", ""))
        add_section("CLINICAL IMPRESSION", report.get("impression", ""))
        add_section("MANAGEMENT PLAN", report.get("management_plan", ""))
        add_section("ADDITIONAL NOTES", report.get("additional_notes", ""))
        
        # Image analysis if present
        if report.get("image_analysis"):
            story.append(PageBreak())
            story.append(Paragraph("IMAGING FINDINGS", title_style))
            
            img = report["image_analysis"]
            add_section("IMAGE TYPE", img.get("image_type", ""))
            add_section("FINDINGS", img.get("findings", ""))
            add_section("DIAGNOSIS", img.get("diagnosis", ""))
            add_section("RECOMMENDATIONS", img.get("recommendations", ""))
        
        # Disclaimer
        story.append(PageBreak())
        story.append(Paragraph(
            "<b>MEDICAL DISCLAIMER</b><br/>"
            "<font size='8'>This report is generated based on clinical consultation. "
            "It should be interpreted by qualified healthcare professionals.</font>",
            body_style
        ))
        
        doc.build(story)
        logger.info(f"PDF generated: {filepath}")
        
        return filepath
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise

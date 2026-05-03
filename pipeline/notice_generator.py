import io
import pathlib
import uuid
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT_DIR = pathlib.Path("generated_notices")
OUTPUT_DIR.mkdir(exist_ok=True)

# Colours
BLACK = colors.HexColor("#111827")
DARK = colors.HexColor("#1f2937")
GRAY = colors.HexColor("#6b7280")
LIGHT_GRAY = colors.HexColor("#f3f4f6")
BORDER_GRAY = colors.HexColor("#d1d5db")
WHITE = colors.white


def _base_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="NoticeTitle",
            fontSize=15,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            textColor=BLACK,
            spaceAfter=3,
            leading=18,
            tracking=1,
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoticeSubtitle",
            fontSize=9,
            fontName="Helvetica",
            alignment=TA_CENTER,
            textColor=DARK,
            spaceAfter=2,
            leading=12,
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoticeBody",
            fontSize=10,
            fontName="Helvetica",
            textColor=BLACK,
            alignment=TA_JUSTIFY,
            spaceAfter=5,
            leading=14,
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoticeBold",
            fontSize=10,
            fontName="Helvetica-Bold",
            textColor=BLACK,
            alignment=TA_JUSTIFY,
            spaceAfter=5,
            leading=14,
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoticeSmall",
            fontSize=7.5,
            fontName="Helvetica",
            textColor=GRAY,
            alignment=TA_CENTER,
            spaceAfter=2,
            leading=11,
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoticeLabel",
            fontSize=9,
            fontName="Helvetica-Bold",
            textColor=BLACK,
            spaceAfter=2,
            leading=12,
        )
    )

    return styles


def _build_header(story, styles, title: str, subtitle: str, subtitle2: str = ""):
    # Title block with background
    title_data = [[Paragraph(title, styles["NoticeTitle"])]]
    title_t = Table(title_data, colWidths=[170 * mm])
    title_t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLACK),
                ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    # Override title color for dark background
    white_title = ParagraphStyle(
        "WhiteTitle",
        fontSize=15,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        textColor=WHITE,
        spaceAfter=0,
        leading=18,
    )
    white_sub = ParagraphStyle(
        "WhiteSub",
        fontSize=9,
        fontName="Helvetica",
        alignment=TA_CENTER,
        textColor=colors.HexColor("#e5e7eb"),
        spaceAfter=0,
        leading=12,
    )

    header_content = [Paragraph(title, white_title)]
    if subtitle:
        header_content.append(Paragraph(subtitle, white_sub))
    if subtitle2:
        header_content.append(Paragraph(subtitle2, white_sub))

    from reportlab.platypus import KeepTogether

    header_rows = [[item] for item in header_content]

    # Build header as single table with dark background
    all_header = [[Paragraph(title, white_title)]]
    if subtitle:
        all_header.append([Paragraph(subtitle, white_sub)])
    if subtitle2:
        all_header.append([Paragraph(subtitle2, white_sub)])

    h_table = Table(all_header, colWidths=[170 * mm])
    h_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLACK),
                ("TOPPADDING", (0, 0), (0, 0), 10),
                ("BOTTOMPADDING", (-1, -1), (-1, -1), 10),
                ("TOPPADDING", (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )

    story.append(h_table)
    story.append(Spacer(1, 5 * mm))


def _build_footer(story, styles, act_name: str, indiacode_url: str):
    story.append(Spacer(1, 5 * mm))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=BORDER_GRAY,
            spaceAfter=3 * mm,
        )
    )
    story.append(
        Paragraph(
            "Generated by Haqq — The law is public. A lawyer isn't free. Haqq is.",
            styles["NoticeSmall"],
        )
    )
    story.append(
        Paragraph(
            f"Based on {act_name} — {indiacode_url}",
            styles["NoticeSmall"],
        )
    )
    story.append(
        Paragraph(
            "This notice is based on publicly available Indian law. "
            "For court proceedings, consult a registered advocate.",
            styles["NoticeSmall"],
        )
    )


def _address_table(from_data: dict, to_data: dict, styles) -> Table:
    addr_style = ParagraphStyle(
        "AddrStyle",
        fontSize=9.5,
        fontName="Helvetica",
        leading=14,
        textColor=BLACK,
        spaceAfter=0,
    )
    addr_bold = ParagraphStyle(
        "AddrBold",
        fontSize=9.5,
        fontName="Helvetica-Bold",
        leading=14,
        textColor=BLACK,
        spaceAfter=3,
    )

    from_lines = [from_data.get("name", ""), from_data.get("address", "")]
    if from_data.get("phone"):
        from_lines.append(f"Phone: {from_data['phone']}")
    if from_data.get("email"):
        from_lines.append(f"Email: {from_data['email']}")

    to_lines = [to_data.get("name", ""), to_data.get("address", "")]

    from_content = [Paragraph("FROM", addr_bold)]
    from_content += [Paragraph(line, addr_style) for line in from_lines if line]

    to_content = [Paragraph("TO", addr_bold)]
    to_content += [Paragraph(line, addr_style) for line in to_lines if line]

    # Wrap each column in a nested table
    def col_table(content, bg):
        rows = [[item] for item in content]
        t = Table(rows, colWidths=[80 * mm])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), bg),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (0, 0), 8),
                    ("BOTTOMPADDING", (-1, -1), (-1, -1), 8),
                    ("TOPPADDING", (0, 1), (-1, -1), 2),
                    ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        return t

    data = [[col_table(from_content, LIGHT_GRAY), col_table(to_content, WHITE)]]
    outer = Table(data, colWidths=[85 * mm, 85 * mm])
    outer.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return outer


def _demand_box(story, text: str):
    box_style = ParagraphStyle(
        "DemandBox",
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=BLACK,
        alignment=TA_JUSTIFY,
        leading=15,
    )
    data = [[Paragraph(text, box_style)]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1.5, BLACK),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
            ]
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(t)
    story.append(Spacer(1, 3 * mm))


def _legal_basis_box(story, text: str):
    style = ParagraphStyle(
        "LegalBasis",
        fontSize=9,
        fontName="Helvetica",
        textColor=DARK,
        leading=13,
    )
    label_style = ParagraphStyle(
        "LegalLabel",
        fontSize=9,
        fontName="Helvetica-Bold",
        textColor=BLACK,
        leading=13,
        spaceAfter=3,
    )
    data = [
        [Paragraph("LEGAL BASIS", label_style)],
        [Paragraph(text, style)],
    ]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LINEBEFORE", (0, 0), (0, -1), 3, BLACK),
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
            ]
        )
    )
    story.append(Spacer(1, 2 * mm))
    story.append(t)
    story.append(Spacer(1, 2 * mm))


def _section_divider(story):
    story.append(Spacer(1, 2 * mm))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.3,
            color=BORDER_GRAY,
            spaceAfter=2 * mm,
        )
    )


def _meta_row(label: str, value: str) -> list:
    label_s = ParagraphStyle(
        "ML",
        fontSize=9,
        fontName="Helvetica-Bold",
        leading=13,
        textColor=BLACK,
    )
    val_s = ParagraphStyle(
        "MV",
        fontSize=9,
        fontName="Helvetica",
        leading=13,
        textColor=BLACK,
    )
    return [Paragraph(label, label_s), Paragraph(value, val_s)]


def generate_demand_notice(
    sender: dict,
    recipient: dict,
    amount_due: str,
    period_from: str,
    period_to: str,
    notice_id: str | None = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = _base_styles()
    story = []

    _build_header(
        story,
        styles,
        "LEGAL NOTICE",
        "Demand Notice for Non-Payment of Wages",
        "Sent via Registered Post with Acknowledgement Due",
    )

    today = date.today().strftime("%d %B %Y")
    ref = notice_id or str(uuid.uuid4())[:8].upper()

    meta_rows = [
        _meta_row("Date:", today),
        _meta_row("Notice Reference:", f"HAQQ/{date.today().year}/{ref}"),
    ]
    meta_t = Table(meta_rows, colWidths=[45 * mm, 125 * mm])
    meta_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    story.append(meta_t)
    story.append(Spacer(1, 4 * mm))

    story.append(_address_table(sender, recipient, styles))
    story.append(Spacer(1, 4 * mm))

    story.append(
        Paragraph(
            "<b>Subject: Legal Notice for Non-Payment of Wages under the "
            "Payment of Wages Act, 1936</b>",
            styles["NoticeBody"],
        )
    )
    _section_divider(story)

    story.append(
        Paragraph(
            f"I, <b>{sender['name']}</b>, am sending you this legal notice. "
            "I was employed with your organisation and am entitled to wages as per "
            "the terms of my employment, which you have failed to pay despite "
            "repeated requests and reminders.",
            styles["NoticeBody"],
        )
    )

    story.append(
        Paragraph(
            f"You have failed and neglected to pay my wages amounting to "
            f"<b>Rs. {amount_due}</b> for the period <b>{period_from}</b> to "
            f"<b>{period_to}</b>, which was due and payable under the terms of "
            "my employment and in accordance with the Payment of Wages Act, 1936.",
            styles["NoticeBody"],
        )
    )

    _legal_basis_box(
        story,
        "Under Section 3 of the Payment of Wages Act, 1936, every employer is "
        "responsible for the payment of wages to persons employed. Under Section 5, "
        "wages must be paid before the expiry of the seventh day after the last day "
        "of the wage period. Under Section 15, any person whose wages have been "
        "delayed may make a claim before the authority appointed under this Act.",
    )

    _demand_box(
        story,
        f"DEMAND: You are hereby called upon to pay the outstanding wages of "
        f"Rs. {amount_due} within 15 (fifteen) days of receipt of this notice, "
        "failing which I shall be constrained to initiate appropriate legal "
        "proceedings before the Authority under the Payment of Wages Act, 1936, "
        "and/or any other forum as may be advised, entirely at your risk, cost, "
        "and consequence.",
    )

    story.append(
        Paragraph(
            "This notice is being sent by Registered Post with Acknowledgement Due. "
            "Please preserve this notice and the postal receipt as evidence.",
            styles["NoticeBody"],
        )
    )

    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Yours faithfully,", styles["NoticeBody"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"<b>{sender['name']}</b>", styles["NoticeBody"]))
    story.append(Paragraph(sender["address"], styles["NoticeBody"]))
    if sender.get("phone"):
        story.append(Paragraph(f"Phone: {sender['phone']}", styles["NoticeBody"]))
    if sender.get("email"):
        story.append(Paragraph(f"Email: {sender['email']}", styles["NoticeBody"]))

    _build_footer(
        story,
        styles,
        "Payment of Wages Act, 1936",
        "indiacode.nic.in/handle/123456789/20359",
    )

    doc.build(story)
    return buffer.getvalue()


def generate_cheque_bounce_notice(
    sender: dict,
    recipient: dict,
    cheque_number: str,
    cheque_date: str,
    cheque_amount: str,
    bank_name: str,
    dishonour_date: str,
    dishonour_reason: str,
    memo_received_date: str,
    notice_deadline: str,
    notice_id: str | None = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = _base_styles()
    story = []

    _build_header(
        story,
        styles,
        "LEGAL NOTICE",
        "Demand Notice under Section 138 — Negotiable Instruments Act, 1881",
        "Sent via Registered Post with Acknowledgement Due",
    )

    # Warning box
    warn_style = ParagraphStyle(
        "WarnStyle",
        fontSize=9.5,
        fontName="Helvetica-Bold",
        textColor=BLACK,
        alignment=TA_CENTER,
        leading=15,
    )
    warn_label = ParagraphStyle(
        "WarnLabel",
        fontSize=9,
        fontName="Helvetica-Bold",
        textColor=BLACK,
        alignment=TA_CENTER,
        leading=13,
        spaceAfter=3,
    )
    warn_data = [
        [
            Paragraph(
                "⚠  TIME-CRITICAL — STRICT DEADLINES UNDER SECTION 138 NI ACT",
                warn_style,
            )
        ],
        [
            Paragraph(
                "Demand notice must be sent within <b>30 days</b> of dishonour memo  •  "
                "Criminal complaint must be filed within <b>30 days</b> of notice deadline expiring<br/>"
                "Missing either deadline means the case fails entirely and cannot be revived.",
                ParagraphStyle(
                    "WarnBody",
                    fontSize=9,
                    fontName="Helvetica",
                    textColor=BLACK,
                    alignment=TA_CENTER,
                    leading=13,
                ),
            )
        ],
    ]
    warn_t = Table(warn_data, colWidths=[170 * mm])
    warn_t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 2, BLACK),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, BORDER_GRAY),
                ("BACKGROUND", (0, 0), (-1, 0), BLACK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#fef9c3")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )

    # White title for warning header row
    warn_title_white = ParagraphStyle(
        "WTW",
        fontSize=9.5,
        fontName="Helvetica-Bold",
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=15,
    )
    warn_data[0][0] = Paragraph(
        "⚠  TIME-CRITICAL — STRICT DEADLINES UNDER SECTION 138 NI ACT",
        warn_title_white,
    )
    warn_t = Table(warn_data, colWidths=[170 * mm])
    warn_t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 2, BLACK),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, BORDER_GRAY),
                ("BACKGROUND", (0, 0), (-1, 0), BLACK),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#fef9c3")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(warn_t)
    story.append(Spacer(1, 4 * mm))

    today = date.today().strftime("%d %B %Y")
    meta_rows = [
        _meta_row("Date:", today),
        _meta_row("Date of Dishonour Memo:", dishonour_date),
        _meta_row("Notice Deadline:", notice_deadline),
    ]
    meta_t = Table(meta_rows, colWidths=[55 * mm, 115 * mm])
    meta_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    story.append(meta_t)
    story.append(Spacer(1, 4 * mm))

    story.append(_address_table(sender, recipient, styles))
    story.append(Spacer(1, 4 * mm))

    story.append(
        Paragraph(
            "<b>Subject: Demand Notice under Section 138 of the Negotiable "
            "Instruments Act, 1881</b>",
            styles["NoticeBody"],
        )
    )
    _section_divider(story)

    story.append(
        Paragraph(
            f"I, <b>{sender['name']}</b>, am the payee/holder of Cheque No. "
            f"<b>{cheque_number}</b> dated <b>{cheque_date}</b> for an amount of "
            f"<b>Rs. {cheque_amount}</b> drawn on <b>{bank_name}</b>, issued by you "
            "in discharge of a legally enforceable debt/liability.",
            styles["NoticeBody"],
        )
    )

    story.append(
        Paragraph(
            f"The said cheque was presented for payment and was returned unpaid by "
            f"the bank on <b>{dishonour_date}</b> with the remark "
            f'"<b>{dishonour_reason}</b>". I received the bank\'s dishonour memo '
            f"on <b>{memo_received_date}</b>.",
            styles["NoticeBody"],
        )
    )

    _legal_basis_box(
        story,
        "Under Section 138 of the Negotiable Instruments Act, 1881, dishonour "
        "of a cheque for insufficiency of funds is a criminal offence punishable "
        "with imprisonment up to two years or fine up to twice the cheque amount, or both.",
    )

    _demand_box(
        story,
        f"DEMAND: You are hereby called upon to pay Rs. {cheque_amount} together "
        "with interest and costs within 15 (fifteen) days of receipt of this notice. "
        "Failure to pay will leave me no option but to initiate criminal proceedings "
        "under Section 138 of the Negotiable Instruments Act, 1881, entirely at "
        "your risk and cost.",
    )

    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Yours faithfully,", styles["NoticeBody"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"<b>{sender['name']}</b>", styles["NoticeBody"]))
    story.append(Paragraph(sender["address"], styles["NoticeBody"]))
    if sender.get("phone"):
        story.append(Paragraph(f"Phone: {sender['phone']}", styles["NoticeBody"]))
    if sender.get("email"):
        story.append(Paragraph(f"Email: {sender['email']}", styles["NoticeBody"]))
    story.append(Paragraph(f"Date: {today}", styles["NoticeBody"]))

    _build_footer(
        story,
        styles,
        "Negotiable Instruments Act, 1881",
        "indiacode.nic.in/handle/123456789/15327",
    )

    doc.build(story)
    return buffer.getvalue()


def generate_rti_application(
    sender: dict,
    recipient: dict,
    information_sought: str,
    payment_mode: str = "Indian Postal Order",
    notice_id: str | None = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = _base_styles()
    story = []

    _build_header(
        story,
        styles,
        "APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005",
        "Section 6(1) — Request for Information",
    )

    today = date.today().strftime("%d %B %Y")
    story.append(Paragraph(f"<b>Date:</b> {today}", styles["NoticeBody"]))
    story.append(Spacer(1, 3 * mm))

    story.append(
        Paragraph(
            f"<b>To,</b><br/>"
            f"The Public Information Officer<br/>"
            f"{recipient['name']}<br/>"
            f"{recipient['address']}",
            styles["NoticeBody"],
        )
    )
    story.append(Spacer(1, 3 * mm))

    story.append(
        Paragraph(
            "<b>Subject: Request for information under Section 6(1) of the "
            "Right to Information Act, 2005</b>",
            styles["NoticeBody"],
        )
    )
    _section_divider(story)

    # Applicant info table
    info_style = ParagraphStyle(
        "InfoStyle",
        fontSize=9,
        fontName="Helvetica",
        leading=13,
        textColor=BLACK,
    )
    info_bold = ParagraphStyle(
        "InfoBold",
        fontSize=9,
        fontName="Helvetica-Bold",
        leading=13,
        textColor=BLACK,
    )
    info_rows = [
        [Paragraph("Applicant Name", info_bold), Paragraph(sender["name"], info_style)],
        [Paragraph("Address", info_bold), Paragraph(sender["address"], info_style)],
        [
            Paragraph("Phone", info_bold),
            Paragraph(sender.get("phone") or "Not provided", info_style),
        ],
        [
            Paragraph("Email", info_bold),
            Paragraph(sender.get("email") or "Not provided", info_style),
        ],
    ]
    info_t = Table(info_rows, colWidths=[45 * mm, 125 * mm])
    info_t.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(info_t)
    story.append(Spacer(1, 4 * mm))

    story.append(Paragraph("<b>Information Sought:</b>", styles["NoticeBody"]))
    story.append(Paragraph(information_sought, styles["NoticeBody"]))
    story.append(Spacer(1, 2 * mm))

    story.append(
        Paragraph(
            f"I am enclosing the prescribed application fee of Rs. 10 (ten rupees) "
            f"by {payment_mode}. I request that the above information be provided "
            "to me within 30 days as required under Section 7(1) of the RTI Act, 2005.",
            styles["NoticeBody"],
        )
    )

    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Yours faithfully,", styles["NoticeBody"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"<b>{sender['name']}</b>", styles["NoticeBody"]))
    story.append(Paragraph(sender["address"], styles["NoticeBody"]))
    story.append(Paragraph(f"Date: {today}", styles["NoticeBody"]))

    _build_footer(
        story,
        styles,
        "Right to Information Act, 2005",
        "indiacode.nic.in/handle/123456789/2065",
    )

    doc.build(story)
    return buffer.getvalue()


def generate_consumer_complaint(
    sender: dict,
    recipient: dict,
    product_description: str,
    purchase_date: str,
    defect_description: str,
    remedy_sought: str,
    notice_id: str | None = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = _base_styles()
    story = []

    _build_header(
        story,
        styles,
        "LEGAL NOTICE",
        "Consumer Complaint Notice under Consumer Protection Act, 2019",
    )

    today = date.today().strftime("%d %B %Y")

    meta_rows = [_meta_row("Date:", today)]
    meta_t = Table(meta_rows, colWidths=[45 * mm, 125 * mm])
    meta_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    story.append(meta_t)
    story.append(Spacer(1, 4 * mm))

    story.append(_address_table(sender, recipient, styles))
    story.append(Spacer(1, 4 * mm))

    story.append(
        Paragraph(
            "<b>Subject: Notice under Consumer Protection Act, 2019</b>",
            styles["NoticeBody"],
        )
    )
    _section_divider(story)

    story.append(
        Paragraph(
            f"I, <b>{sender['name']}</b>, purchased {product_description} "
            f"from you on {purchase_date}. The said product/service suffers "
            f"from the following defects/deficiencies: {defect_description}.",
            styles["NoticeBody"],
        )
    )

    story.append(
        Paragraph(
            "Despite repeated requests and complaints, you have failed to rectify "
            "the defect, replace the product, or refund the amount paid. This "
            "constitutes a deficiency in service and unfair trade practice under "
            "the Consumer Protection Act, 2019.",
            styles["NoticeBody"],
        )
    )

    _demand_box(
        story,
        f"DEMAND: You are hereby called upon to {remedy_sought} within "
        "15 (fifteen) days of receipt of this notice, failing which I shall "
        "file a complaint before the appropriate Consumer Disputes Redressal "
        "Commission under the Consumer Protection Act, 2019.",
    )

    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Yours faithfully,", styles["NoticeBody"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(f"<b>{sender['name']}</b>", styles["NoticeBody"]))
    story.append(Paragraph(sender["address"], styles["NoticeBody"]))
    story.append(Paragraph(f"Date: {today}", styles["NoticeBody"]))

    _build_footer(
        story,
        styles,
        "Consumer Protection Act, 2019",
        "indiacode.nic.in/handle/123456789/15256",
    )

    doc.build(story)
    return buffer.getvalue()


NOTICE_GENERATORS = {
    "demand_notice": generate_demand_notice,
    "rti_application": generate_rti_application,
    "consumer_complaint": generate_consumer_complaint,
    "cheque_bounce_notice": generate_cheque_bounce_notice,
}

import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ============ STYLE TOKENS ============
const COLOR_BLACK = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_YELLOW = rgb(0.99, 0.88, 0.28);
const COLOR_NEUTRAL_50 = rgb(0.98, 0.98, 0.98);
const COLOR_NEUTRAL_200 = rgb(0.9, 0.9, 0.9);
const COLOR_NEUTRAL_400 = rgb(0.64, 0.64, 0.64);
const COLOR_NEUTRAL_500 = rgb(0.45, 0.45, 0.45);
const COLOR_NEUTRAL_700 = rgb(0.25, 0.25, 0.25);
const COLOR_RED = rgb(0.86, 0.15, 0.15);

const PAGE_W = PageSizes.A4[0];   // 595.28
const PAGE_H = PageSizes.A4[1];   // 841.89
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function generateConsultationPdf(consultation: any, outputPath: string): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.join(__dirname, 'images', 'logo.png');
    const fontsPath = path.join(__dirname, 'fonts');

    // ============ FONTS ============
    let fontRegular: PDFFont;
    let fontBold: PDFFont;

    try {
        const regularBytes = fs.readFileSync(path.join(fontsPath, 'GoogleSans-Regular.ttf'));
        const boldBytes = fs.readFileSync(path.join(fontsPath, 'GoogleSans-Bold.ttf'));
        fontRegular = await pdfDoc.embedFont(regularBytes, { subset: false });
        fontBold = await pdfDoc.embedFont(boldBytes, { subset: false });
    } catch {
        console.warn('Font personalizzati non trovati, uso Helvetica');
        fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // ============ LOGO ============
    let logoImage: any = null;
    try {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
    } catch { /* ignore */ }

    // ============ PAGE STATE ============
    let page: PDFPage = pdfDoc.addPage(PageSizes.A4);
    let cursorY = PAGE_H - MARGIN;

    // ============ HELPERS ============

    const newPage = () => {
        page = pdfDoc.addPage(PageSizes.A4);
        cursorY = PAGE_H - MARGIN;
    };

    const ensureSpace = (needed: number) => {
        if (cursorY - needed < MARGIN + 20) {
            newPage();
            return true;
        }
        return false;
    };

    const ruleFull = () => {
        page.drawLine({
            start: { x: MARGIN, y: cursorY },
            end: { x: PAGE_W - MARGIN, y: cursorY },
            thickness: 2,
            color: COLOR_BLACK,
        });
    };

    const ruleDashed = () => {
        const dashLen = 4;
        const gapLen = 4;
        let x = MARGIN;
        while (x < PAGE_W - MARGIN) {
            const end = Math.min(x + dashLen, PAGE_W - MARGIN);
            page.drawLine({
                start: { x, y: cursorY },
                end: { x: end, y: cursorY },
                thickness: 0.5,
                color: COLOR_NEUTRAL_400,
            });
            x += dashLen + gapLen;
        }
    };

    const monoLabel = (text: string, x: number, y: number, color = COLOR_NEUTRAL_500) => {
        page.drawText(text.toUpperCase(), {
            x,
            y,
            size: 7,
            font: fontBold,
            color,
        });
    };

    const sectionTitle = (index: string, text: string) => {
        ensureSpace(40);
        cursorY -= 14;

        const bandH = 22;
        const bandY = cursorY - bandH + 8;

        page.drawRectangle({
            x: MARGIN,
            y: bandY,
            width: CONTENT_W,
            height: bandH,
            color: COLOR_BLACK,
        });

        page.drawText(index, {
            x: MARGIN + 10,
            y: bandY + 7,
            size: 14,
            font: fontBold,
            color: COLOR_YELLOW,
        });

        page.drawLine({
            start: { x: MARGIN + 34, y: bandY + 4 },
            end: { x: MARGIN + 34, y: bandY + bandH - 4 },
            thickness: 1,
            color: COLOR_YELLOW,
        });

        page.drawText(text.toUpperCase(), {
            x: MARGIN + 44,
            y: bandY + 7,
            size: 10,
            font: fontBold,
            color: COLOR_WHITE,
        });

        page.drawLine({
            start: { x: MARGIN, y: bandY - 2 },
            end: { x: PAGE_W - MARGIN, y: bandY - 2 },
            thickness: 3,
            color: COLOR_YELLOW,
        });

        cursorY = bandY - 16;
    };

    const badge = (
        text: string,
        x: number,
        y: number,
        bg: any,
        fg: any,
        fontSize = 6
    ): number => {
        const label = text.toUpperCase();
        const textW = fontBold.widthOfTextAtSize(label, fontSize);
        const paddingX = 7;
        const w = textW + paddingX * 2;
        const h = fontSize + 8;

        page.drawRectangle({
            x,
            y: y - h + fontSize + 2,
            width: w,
            height: h,
            color: bg,
            borderColor: COLOR_BLACK,
            borderWidth: 1,
        });

        page.drawText(label, {
            x: x + paddingX,
            y: y - 1,
            size: fontSize,
            font: fontBold,
            color: fg,
        });

        return w;
    };

    const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
        const words = (text || '').split(' ');
        const lines: string[] = [];
        let current = '';

        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            const w = font.widthOfTextAtSize(test, size);
            if (w > maxWidth && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
        return lines;
    };

    const drawParagraph = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        font: PDFFont,
        size: number,
        color: any,
        lineHeight: number
    ): number => {
        const lines = wrapText(text, font, size, maxWidth);
        let currentY = y;
        for (const line of lines) {
            page.drawText(line, {
                x,
                y: currentY,
                size,
                font,
                color,
            });
            currentY -= lineHeight;
        }
        return lines.length * lineHeight;
    };

    // ============ HEADER ============
    page.drawRectangle({
        x: 0,
        y: PAGE_H - 8,
        width: PAGE_W,
        height: 8,
        color: COLOR_YELLOW,
    });

    // Logo
    if (logoImage) {
        const targetHeight = 28;
        const scale = targetHeight / logoImage.height;

        page.drawImage(logoImage, {
            x: MARGIN + 5,
            y: PAGE_H - 58,
            width: logoImage.width * scale,
            height: logoImage.height * scale,
        });
    }

    page.drawText('TAXPRI', {
        x: MARGIN + 57,
        y: PAGE_H - 48,
        size: 18,
        font: fontBold,
        color: COLOR_BLACK,
    });

    page.drawText('CROSS-BORDER TAX CONSULTATION', {
        x: MARGIN + 57,
        y: PAGE_H - 64,
        size: 7,
        font: fontBold,
        color: COLOR_NEUTRAL_500,
    });

    const status = consultation.status?.toLowerCase() || 'pending';
    const statusBg = status === 'completed' ? COLOR_BLACK :
        status === 'pending' ? COLOR_YELLOW : COLOR_RED;
    const statusFg = status === 'completed' ? COLOR_YELLOW :
        status === 'pending' ? COLOR_BLACK : COLOR_WHITE;

    const statusText = status.toUpperCase();
    const statusW = fontBold.widthOfTextAtSize(statusText, 6) + 14;
    badge(statusText, PAGE_W - MARGIN - statusW, PAGE_H - 30, statusBg, statusFg);

    monoLabel(
        `ID: ${consultation.id?.substring(0, 8) || 'N/A'}`,
        PAGE_W - MARGIN - 100,
        PAGE_H - 48
    );
    monoLabel(
        `Tax Year ${consultation.taxYear || 'N/A'}`,
        PAGE_W - MARGIN - 100,
        PAGE_H - 60
    );

    cursorY = PAGE_H - 90;

    // ============ 01 - YOUR SITUATION ============
    sectionTitle('01', 'Your Situation');

    const ctx = consultation.caseContext || {};
    const colWidth = CONTENT_W / 3;

    const row1Y = cursorY;

    monoLabel('RESIDENCE:', MARGIN, row1Y);
    page.drawText(ctx.residenceCountry || 'N/A', {
        x: MARGIN, y: row1Y - 12, size: 9, font: fontBold, color: COLOR_BLACK,
    });

    monoLabel('EMPLOYER:', MARGIN + colWidth, row1Y);
    page.drawText(ctx.employerCountry || 'N/A', {
        x: MARGIN + colWidth, y: row1Y - 12, size: 9, font: fontBold, color: COLOR_BLACK,
    });

    monoLabel('TAX RESIDENCE:', MARGIN + colWidth * 2, row1Y);
    page.drawText(ctx.taxResidenceCountry || 'N/A', {
        x: MARGIN + colWidth * 2, y: row1Y - 12, size: 9, font: fontBold, color: COLOR_BLACK,
    });

    const row2Y = row1Y - 32;

    monoLabel('EMPLOYMENT:', MARGIN, row2Y);
    page.drawText(ctx.employmentType?.toLowerCase() || 'N/A', {
        x: MARGIN, y: row2Y - 12, size: 9, font: fontBold, color: COLOR_BLACK,
    });

    monoLabel('REMOTE WORK:', MARGIN + colWidth, row2Y);
    page.drawText(ctx.remoteWork ? 'Yes' : 'No', {
        x: MARGIN + colWidth, y: row2Y - 12, size: 9, font: fontBold,
        color: ctx.remoteWork ? COLOR_BLACK : COLOR_NEUTRAL_400,
    });

    if (ctx.workLocations?.length > 0) {
        monoLabel('WORK LOCATIONS:', MARGIN + colWidth * 2, row2Y);
        page.drawText(ctx.workLocations.join(', '), {
            x: MARGIN + colWidth * 2, y: row2Y - 12, size: 9, font: fontBold, color: COLOR_BLACK,
        });
    }

    cursorY = row2Y - 30;
    cursorY -= 16;

    // ============ 02 - SUMMARY ============
    const report = consultation.report || {};

    if (report.summary?.length > 0) {
        sectionTitle('02', 'Summary');

        report.summary.forEach((item: string, index: number) => {
            const lineHeight = 12;
            const lines = wrapText(item, fontRegular, 9, CONTENT_W - 40);
            const blockHeight = lines.length * lineHeight;

            ensureSpace(blockHeight + 12);

            page.drawText(`/${String(index + 1).padStart(2, '0')}`, {
                x: MARGIN, y: cursorY, size: 7, font: fontBold, color: COLOR_NEUTRAL_500,
            });

            page.drawRectangle({
                x: MARGIN + 20,
                y: cursorY - blockHeight + 8,
                width: 3,
                height: blockHeight,
                color: COLOR_YELLOW,
                borderColor: COLOR_BLACK,
                borderWidth: 0.5,
            });

            let ty = cursorY;
            for (const line of lines) {
                page.drawText(line, {
                    x: MARGIN + 30, y: ty, size: 9, font: fontRegular, color: COLOR_NEUTRAL_700,
                });
                ty -= lineHeight;
            }

            cursorY -= blockHeight + 10;
        });

        cursorY -= 6;
    }

    // ============ 03 - REQUIREMENTS ============
    const requirements = consultation.requirements || [];

    if (requirements.length > 0) {
        sectionTitle('03', `Requirements (${requirements.length})`);

        const categories: Record<string, any[]> = {};
        requirements.forEach((req: any) => {
            const cat = req.category || 'other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(req);
        });

        const categoryLabels: Record<string, string> = {
            'tax_reporting': 'Tax Reporting',
            'double_taxation': 'Double Taxation',
            'documents': 'Documentation',
            'residence': 'Tax Residence',
            'other': 'Other Requirements',
        };

        for (const [category, reqs] of Object.entries(categories)) {
            ensureSpace(40);

            monoLabel(`[ ${categoryLabels[category] || category} ]`, MARGIN, cursorY);
            cursorY -= 12;
            ruleDashed();
            cursorY -= 14;

            for (const req of reqs) {
                ensureSpace(80);

                const titleText = (req.title || 'Untitled').toUpperCase();
                const titleWidth = CONTENT_W - 140;
                const titleLines = wrapText(titleText, fontBold, 11, titleWidth);
                const titleHeight = titleLines.length * 14;

                const priorityText = req.priority?.toUpperCase() || 'MEDIUM';
                const priorityBg: Record<string, any> = {
                    'high': COLOR_RED, 'medium': COLOR_YELLOW, 'low': COLOR_BLACK,
                };
                const priorityFg: Record<string, any> = {
                    'high': COLOR_WHITE, 'medium': COLOR_BLACK, 'low': COLOR_YELLOW,
                };

                const priorityW = fontBold.widthOfTextAtSize(priorityText, 6) + 14;
                const badgeX = PAGE_W - MARGIN - priorityW;

                badge(
                    priorityText,
                    badgeX,
                    cursorY,
                    priorityBg[req.priority] || COLOR_NEUTRAL_200,
                    priorityFg[req.priority] || COLOR_BLACK
                );

                let ty = cursorY;
                for (const line of titleLines) {
                    page.drawText(line, {
                        x: MARGIN + 10, y: ty, size: 11, font: fontBold, color: COLOR_BLACK,
                    });
                    ty -= 14;
                }
                cursorY = ty - 4;

                if (req.description) {
                    const descH = drawParagraph(
                        req.description,
                        MARGIN + 10,
                        cursorY,
                        CONTENT_W - 20,
                        fontRegular,
                        8,
                        COLOR_NEUTRAL_700,
                        10
                    );
                    cursorY -= descH + 6;
                }

                if (req.action) {
                    const actionLines = wrapText(req.action, fontRegular, 8, CONTENT_W - 50);
                    const actionHeight = actionLines.length * 10;

                    page.drawRectangle({
                        x: MARGIN + 10,
                        y: cursorY - actionHeight + 8,
                        width: 3,
                        height: actionHeight + 2,
                        color: COLOR_YELLOW,
                    });

                    page.drawText('ACTION:', {
                        x: MARGIN + 18, y: cursorY, size: 8, font: fontBold, color: COLOR_BLACK,
                    });
                    const actionLabelW = fontBold.widthOfTextAtSize('ACTION:', 8) + 3;

                    let ay = cursorY;
                    for (const line of actionLines) {
                        page.drawText(line, {
                            x: MARGIN + 18 + actionLabelW, y: ay, size: 8, font: fontRegular, color: COLOR_NEUTRAL_700,
                        });
                        ay -= 10;
                    }
                    cursorY -= actionHeight + 8;
                }

                if (req.documents?.length > 0) {
                    ensureSpace(30);
                    monoLabel('[ REQUIRED DOCUMENTS ]', MARGIN + 10, cursorY);
                    cursorY -= 12;

                    for (const docItem of req.documents) {
                        ensureSpace(24);
                        const itemText = `• ${docItem.name}${docItem.required ? ' *' : ''}`;
                        const boxH = 18;

                        page.drawRectangle({
                            x: MARGIN + 10,
                            y: cursorY - boxH + 10,
                            width: CONTENT_W - 20,
                            height: boxH,
                            borderColor: COLOR_BLACK,
                            borderWidth: 1,
                        });

                        page.drawText(itemText, {
                            x: MARGIN + 18, y: cursorY - 3, size: 8, font: fontBold, color: COLOR_BLACK,
                        });

                        cursorY -= boxH + 4;
                    }
                    cursorY -= 4;
                }

                cursorY -= 12;
            }

            cursorY -= 8;
        }

        cursorY -= 6;
    }

    // ============ 04 - DOCUMENTS ============
    const allDocuments = requirements.flatMap((req: any) => req.documents || []);
    const uniqueDocs = Array.from(
        new Map(allDocuments.map((d: any) => [d.id, d])).values()
    );

    if (uniqueDocs.length > 0) {
        sectionTitle('04', 'Documents');

        for (const docItem of uniqueDocs as any[]) {
            const boxH = 30;
            ensureSpace(boxH + 8);

            page.drawRectangle({
                x: MARGIN,
                y: cursorY - boxH + 10,
                width: CONTENT_W,
                height: boxH,
                color: COLOR_NEUTRAL_50,
                borderColor: COLOR_NEUTRAL_200,
                borderWidth: 1,
            });

            page.drawText(`- ${docItem.name}`, {
                x: MARGIN + 10, y: cursorY - 3, size: 9, font: fontBold, color: COLOR_BLACK,
            });

            if (docItem.purpose) {
                page.drawText(docItem.purpose, {
                    x: MARGIN + 10, y: cursorY - 15, size: 7, font: fontRegular, color: COLOR_NEUTRAL_500,
                });
            }

            const statusText = docItem.required ? 'REQUIRED' : 'OPTIONAL';
            const statusBg = docItem.required ? COLOR_BLACK : COLOR_NEUTRAL_200;
            const statusFg = docItem.required ? COLOR_YELLOW : COLOR_NEUTRAL_700;
            const statusW = fontBold.widthOfTextAtSize(statusText, 6) + 14;

            badge(
                statusText,
                PAGE_W - MARGIN - statusW - 10,
                cursorY - 3,
                statusBg,
                statusFg
            );

            cursorY -= boxH + 8;
        }

        cursorY -= 6;
    }

    // ============ 05 - REPORTS ============
    if (report.summary?.length || report.requirements?.length || report.documents?.length) {
        ensureSpace(60);
        sectionTitle('05', 'Reports');

        if (report.requirements?.length > 0) {
            ensureSpace(20);
            monoLabel('[ REQUIREMENTS ]', MARGIN, cursorY);
            cursorY -= 12;

            for (const item of report.requirements) {
                const lines = wrapText(`• ${item}`, fontRegular, 9, CONTENT_W - 30);
                ensureSpace(lines.length * 12 + 6);
                let ty = cursorY;
                for (const line of lines) {
                    page.drawText(line, {
                        x: MARGIN + 10, y: ty, size: 9, font: fontRegular, color: COLOR_NEUTRAL_700,
                    });
                    ty -= 12;
                }
                cursorY = ty - 4;
            }
        }

        if (report.attentionPoints?.length > 0) {
            const paddingY = 10;
            const innerX = MARGIN + 10;
            const innerW = CONTENT_W - 20;

            let blockHeight = 20; // header
            const itemsWithLines = report.attentionPoints.map((item: string) => {
                const lines = wrapText(`⚠ ${item}`, fontRegular, 9, innerW - 10);
                blockHeight += lines.length * 12 + 4;
                return { item, lines };
            });
            blockHeight += paddingY * 2;

            ensureSpace(blockHeight + 10);

            const blockTop = cursorY + 5;
            const blockBottom = blockTop - blockHeight;

            page.drawRectangle({
                x: MARGIN - 2,
                y: blockBottom,
                width: CONTENT_W + 4,
                height: blockHeight,
                color: COLOR_YELLOW,
            });
            page.drawRectangle({
                x: MARGIN - 2,
                y: blockBottom,
                width: CONTENT_W + 4,
                height: blockHeight,
                borderColor: COLOR_BLACK,
                borderWidth: 2,
            });

            let iy = blockTop - paddingY - 4;
            page.drawText('ATTENTION POINTS', {
                x: innerX, y: iy, size: 9, font: fontBold, color: COLOR_BLACK,
            });
            iy -= 16;

            for (const { lines } of itemsWithLines) {
                for (const line of lines) {
                    page.drawText(line, {
                        x: innerX, y: iy, size: 9, font: fontRegular, color: COLOR_BLACK,
                    });
                    iy -= 12;
                }
                iy -= 4;
            }

            cursorY = blockBottom - 10;
        }

        cursorY -= 6;
    }

    // ============ 06 - SOURCES ============
    const sources = consultation.report?.sources || [];
    const uniqueSources = Array.from(
        new Map(sources.map((s: any) => [s.id, s])).values()
    );

    if (uniqueSources.length > 0) {
        sectionTitle('06', 'Sources');

        for (let i = 0; i < uniqueSources.length; i++) {
            const source: any = uniqueSources[i];
            ensureSpace(60);

            if (i > 0) {
                ruleDashed();
                cursorY -= 10;
            }

            page.drawText(`/${String(i + 1).padStart(2, '0')}`, {
                x: MARGIN, y: cursorY, size: 7, font: fontBold, color: COLOR_NEUTRAL_500,
            });

            // Titolo
            const titleText = (source.title || 'Untitled').toUpperCase();
            const titleLines = wrapText(titleText, fontBold, 10, CONTENT_W - 30);
            let ty = cursorY;
            for (const line of titleLines) {
                page.drawText(line, {
                    x: MARGIN + 20, y: ty, size: 10, font: fontBold, color: COLOR_BLACK,
                });
                ty -= 13;
            }
            cursorY = ty - 2;

            if (source.authority) {
                page.drawText(source.authority.toUpperCase(), {
                    x: MARGIN + 20, y: cursorY, size: 8, font: fontBold, color: COLOR_NEUTRAL_500,
                });
                cursorY -= 12;
            }

            if (source.description) {
                const descLines = wrapText(source.description, fontRegular, 8, CONTENT_W - 30);
                for (const line of descLines) {
                    ensureSpace(12);
                    page.drawText(line, {
                        x: MARGIN + 20, y: cursorY, size: 8, font: fontRegular, color: COLOR_NEUTRAL_700,
                    });
                    cursorY -= 11;
                }
                cursorY -= 3;
            }

            ensureSpace(20);
            let tagX = MARGIN + 20;
            const tagY = cursorY;

            if (source.type) {
                const t = source.type.replace(/_/g, ' ').toUpperCase();
                const w = badge(t, tagX, tagY, COLOR_BLACK, COLOR_YELLOW);
                tagX += w + 6;
            }
            if (source.country) {
                const w = badge(source.country, tagX, tagY, COLOR_NEUTRAL_200, COLOR_BLACK);
                tagX += w + 6;
            }
            if (source.effectiveFrom) {
                badge(`EFFECTIVE: ${source.effectiveFrom}`, tagX, tagY, COLOR_NEUTRAL_200, COLOR_BLACK);
            }
            cursorY = tagY - 20;

            if (source.url) {
                ensureSpace(14);
                page.drawText(`→ ${source.url}`, {
                    x: MARGIN + 20,
                    y: cursorY,
                    size: 7,
                    font: fontBold,
                    color: COLOR_BLACK,
                });
                cursorY -= 12;
            }

            cursorY -= 10;
        }

        cursorY -= 6;
    }

    // ============ PROFESSIONAL REVIEW NOTICE ============
    if (report.professionalReview?.recommended) {
        ensureSpace(60);

        const noticeH = 50;
        const noticeY = cursorY - noticeH + 10;

        page.drawRectangle({
            x: MARGIN,
            y: noticeY,
            width: CONTENT_W,
            height: noticeH,
            color: COLOR_YELLOW,
            borderColor: COLOR_BLACK,
            borderWidth: 2,
        });

        page.drawText('⚠ PROFESSIONAL REVIEW RECOMMENDED', {
            x: MARGIN + 10, y: cursorY - 8, size: 9, font: fontBold, color: COLOR_BLACK,
        });

        const noticeLines = wrapText(
            'Due to the complexity of your situation, we recommend consulting with a tax professional.',
            fontRegular,
            8,
            CONTENT_W - 20
        );
        let ny = cursorY - 24;
        for (const line of noticeLines) {
            page.drawText(line, {
                x: MARGIN + 10, y: ny, size: 8, font: fontRegular, color: COLOR_BLACK,
            });
            ny -= 10;
        }

        cursorY = noticeY - 14;
    }

    // ============ FOOTER ============
    ensureSpace(50);
    ruleFull();
    cursorY -= 14;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const generatedText = `GENERATED ON ${dateStr.toUpperCase()}`;
    const idText = `CONSULTATION ID: ${consultation.id || 'N/A'}`;

    const generatedW = fontBold.widthOfTextAtSize(generatedText, 7);
    const idW = fontBold.widthOfTextAtSize(idText, 7);

    const rightX = PAGE_W - MARGIN;

    page.drawText(generatedText, {
        x: rightX - generatedW,
        y: cursorY,
        size: 7,
        font: fontBold,
        color: COLOR_NEUTRAL_500,
    });

    page.drawText(idText, {
        x: rightX - idW,
        y: cursorY - 10,
        size: 7,
        font: fontBold,
        color: COLOR_NEUTRAL_500,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
}
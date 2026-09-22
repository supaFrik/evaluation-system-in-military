'use client';

import React, { useState } from 'react';
import { PlatoonAggregate, CommendationItem } from '@/lib/types';
import { Printer, FileDown, FileText, Calendar } from 'lucide-react';
import { notify } from '@/lib/notify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface PlatoonAnalysisProps {
  aggregates: PlatoonAggregate[];
  commendations: CommendationItem[];
  selectedDate: string;
}

// Mock weekly trend data (7 days) — replace with real data when backend is connected
function buildWeeklyTrend(baseDate: string) {
  const base = new Date(baseDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - (6 - i));
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    // Simulate realistic score fluctuation around anchor values
    const rand = (center: number, spread: number) =>
      Math.round((center + (Math.random() - 0.5) * spread) * 10) / 10;
    return {
      date: label,
      'Trung đội 1': rand(375, 15),
      'Trung đội 2': rand(370, 14),
      'Trung đội 3': rand(366, 16),
    };
  });
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  value?: number;
  index?: number;
  payload?: { date: string };
}

// Custom dot: highlight min/max per series
function HighlightDot({ cx = 0, cy = 0, value = 0, payload, seriesData }: CustomDotProps & { seriesData: number[] }) {
  const max = Math.max(...seriesData);
  const min = Math.min(...seriesData);
  if (value === max) return <circle cx={cx} cy={cy} r={5} fill="#16a34a" stroke="#fff" strokeWidth={1.5} />;
  if (value === min) return <circle cx={cx} cy={cy} r={5} fill="#b91c1c" stroke="#fff" strokeWidth={1.5} />;
  return <circle cx={cx} cy={cy} r={3.5} fill="currentColor" stroke="#fff" strokeWidth={1} />;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: <strong>{p.value}</strong> đ
        </p>
      ))}
    </div>
  );
}

export function PlatoonAnalysis({
  aggregates,
  commendations,
  selectedDate,
}: PlatoonAnalysisProps) {
  const weeklyData = React.useMemo(() => buildWeeklyTrend(selectedDate), [selectedDate]);

  const td1Series = weeklyData.map((d) => d['Trung đội 1']);
  const td2Series = weeklyData.map((d) => d['Trung đội 2']);
  const td3Series = weeklyData.map((d) => d['Trung đội 3']);

  const allValues = [...td1Series, ...td2Series, ...td3Series];
  const yMin = Math.floor(Math.min(...allValues) / 10) * 10 - 10;
  const yMax = Math.ceil(Math.max(...allValues) / 10) * 10 + 10;

  const avgAll = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

  const handleExportWordReport = () => {
    const sorted = [...aggregates].sort((a, b) => b.avgTotal - a.avgTotal);
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Báo cáo giao ban thi đua - Đại đội 1</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; }
          .header-table { width: 100%; border: none; margin-bottom: 20px; }
          .title { text-align: center; font-size: 15pt; font-weight: bold; margin: 15px 0; text-transform: uppercase; }
          .subtitle { text-align: center; font-size: 12pt; font-style: italic; margin-bottom: 20px; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
          table.data td, table.data th { border: 1px solid #333; padding: 6px 8px; font-size: 11pt; }
          table.data th { background-color: #f0f0f0; text-align: center; }
          .section-title { font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; color: #b91c1c; }
          .sign-table { width: 100%; border: none; margin-top: 40px; text-align: center; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>QUÂN ĐỘI NHÂN DÂN VIỆT NAM</strong><br>
              <strong>ĐẠI ĐỘI 1</strong>
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong><u>Độc lập – Tự do – Hạnh phúc</u></strong><br>
              <i>Ngày ${selectedDate}</i>
            </td>
          </tr>
        </table>

        <div class="title">BÁO CÁO TỔNG HỢP VÀ ĐÁNH GIÁ KẾT QUẢ THI ĐUA TRUNG ĐỘI</div>
        <div class="subtitle">(Phục vụ giao ban và đánh giá thi đua quyết thắng)</div>

        <div class="section-title">I. BẢNG XẾP HẠNG VÀ KẾT QUẢ ĐIỂM TRUNG BÌNH CÁC TRUNG ĐỘI</div>
        <table class="data">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Đơn vị</th>
              <th>Quân số</th>
              <th>Chính trị (100)</th>
              <th>Nhiệm vụ (100)</th>
              <th>Nội vụ (100)</th>
              <th>Tác phong (100)</th>
              <th>Tổng điểm (400)</th>
              <th>Nhận xét chung</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map((a) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">Hạng ${a.rank}</td>
                <td><strong>${a.platoonName}</strong></td>
                <td style="text-align: center;">${a.totalSoldiers} đ/c</td>
                <td style="text-align: center;">${a.avgPolitical.toFixed(1)}</td>
                <td style="text-align: center;">${a.avgTask.toFixed(1)}</td>
                <td style="text-align: center;">${a.avgHygiene.toFixed(1)}</td>
                <td style="text-align: center;">${a.avgBearing.toFixed(1)}</td>
                <td style="text-align: center; font-weight: bold; color: #b91c1c;">${a.avgTotal.toFixed(1)}</td>
                <td>${a.generalRemark || 'Duy trì nền nếp tốt'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">II. ĐÁNH GIÁ ĐIỂM MẠNH VÀ MẶT CÒN TỒN TẠI TỪNG ĐƠN VỊ</div>
        ${sorted.map((a) => {
          const strength = a.platoonId === 'td1'
            ? 'Nội vụ vệ sinh xuất sắc, chăn màn gấp vuông thành sắc cạnh, lễ tiết tác phong chuẩn mực'
            : a.platoonId === 'td2'
            ? 'Chất lượng chính trị cao nhất đơn vị, 100% quân nhân an tâm tư tưởng công tác'
            : 'Thực hiện nhiệm vụ huấn luyện và gác đêm xuất sắc, xử lý nhanh tình huống giả định';
          const weakness = a.platoonId === 'td1'
            ? 'Tiểu đội 2 còn trường hợp đi muộn giờ tập trung 3 phút'
            : a.platoonId === 'td2'
            ? 'Hành lang tầng 2 sắp xếp giày dép còn lộn xộn, cần chấn chỉnh ngay'
            : 'Nội vụ vệ sinh đạt điểm thấp nhất (85đ), gấp chăn chưa vuông góc';
          return `
            <p><strong>• ${a.platoonName} (Hạng ${a.rank}):</strong></p>
            <p style="margin-left: 20px;">- <i>Điểm mạnh:</i> ${strength}.</p>
            <p style="margin-left: 20px;">- <i>Hạn chế cần khắc phục:</i> ${weakness}.</p>
          `;
        }).join('')}

        <div class="section-title">III. GHI NHẬN BIỂU DƯƠNG VÀ NHẮC NHỞ TRONG KỲ</div>
        <p><strong>1. Biểu dương khen ngợi:</strong></p>
        <ul>
          ${commendations.filter(c => c.type === 'COMMENDATION').map(c => `<li><strong>${c.targetName}:</strong> ${c.content} (${c.createdBy})</li>`).join('') || '<li>Không có ghi nhận đặc biệt.</li>'}
        </ul>
        <p><strong>2. Nhắc nhở chấn chỉnh:</strong></p>
        <ul>
          ${commendations.filter(c => c.type === 'REMINDER').map(c => `<li><strong>${c.targetName}:</strong> ${c.content} (${c.createdBy})</li>`).join('') || '<li>Đơn vị duy trì tốt kỷ luật.</li>'}
        </ul>

        <div class="section-title">IV. PHƯƠNG HƯỚNG THI ĐUA GIAO BAN KỲ TIẾP THEO</div>
        <p>1. Duy trì nghiêm nền nếp chế độ trong ngày, tuần, đặc biệt là chế độ trực ban, canh gác và báo động luyện tập phương án.</p>
        <p>2. Chấn chỉnh dứt điểm các vi phạm về nội vụ vệ sinh và xưng hô lễ tiết tác phong quân nhân trong giờ nghỉ, ngày nghỉ.</p>
        <p>3. Các trung đội phát động đợt thi đua cao điểm chào mừng các ngày lễ lớn của Quân đội và đơn vị.</p>

        <table class="sign-table">
          <tr>
            <td style="width: 50%;">
              <strong>CHÍNH TRỊ VIÊN ĐẠI ĐỘI</strong><br>
              <i>(Ký, ghi rõ họ tên)</i><br><br><br><br>
              Thượng úy Lê Hoàng Hải
            </td>
            <td style="width: 50%;">
              <strong>ĐẠI ĐỘI TRƯỞNG</strong><br>
              <i>(Ký, ghi rõ họ tên)</i><br><br><br><br>
              Đại úy Nguyễn Thế Anh
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCaoGiaoBanThiDua_DaiDoi1_${selectedDate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify.success('Xuất file thành công', `Đã xuất báo cáo giao ban thi đua Word ngày ${selectedDate}`);
  };

  return (
    <div className="w-full max-w-5xl py-2 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Báo cáo Đánh giá Mạnh / Yếu & Giao ban Thi đua
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Tổng hợp phân tích phục vụ chỉ huy hội ý, giao ban đơn vị
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportWordReport}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Xuất báo cáo giao ban thi đua định dạng Word (.doc)"
          >
            <FileDown className="h-3.5 w-3.5 text-blue-600" />
            <span>Xuất Báo cáo (Word)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="In trực tiếp hoặc xuất PDF khổ A4"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-600" />
            <span>In Báo cáo (A4)</span>
          </button>
        </div>
      </div>

      {/* Report Body */}
      <div className="border border-zinc-200 p-6 space-y-8 bg-white">

        {/* Report Header */}
        <div className="grid grid-cols-2 text-xs border-b border-zinc-200 pb-4">
          <div>
            <p className="font-bold uppercase tracking-wider text-zinc-800">ĐẠI ĐỘI 1</p>
            <p className="text-zinc-600 font-medium">Trung đội 1 — Trung đội 2 — Trung đội 3</p>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase tracking-wider text-zinc-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="text-zinc-600 italic">Độc lập – Tự do – Hạnh phúc</p>
            <p className="text-zinc-500 mt-1">Ngày {selectedDate}</p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold uppercase tracking-wide text-zinc-900">
            BÁO CÁO TỔNG HỢP VÀ ĐÁNH GIÁ KẾT QUẢ THI ĐUA TRUNG ĐỘI
          </h3>
          <p className="text-xs text-zinc-500 italic">
            Chính trị — Nhiệm vụ — Nội vụ vệ sinh — Lễ tiết tác phong
          </p>
        </div>

        {/* Line Chart — Score Trend */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3">
            Biểu đồ Diễn biến Tổng điểm Thi đua 7 Ngày
          </h4>
          <div className="border border-zinc-100 bg-zinc-50/30 p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#52525b' }}
                    axisLine={{ stroke: '#d4d4d8' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    formatter={(value) => (
                      <span style={{ color: '#3f3f46' }}>{value}</span>
                    )}
                  />

                  {/* Reference average lines */}
                  <ReferenceLine
                    y={parseFloat(avgAll(td1Series))}
                    stroke="#b91c1c"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    y={parseFloat(avgAll(td2Series))}
                    stroke="#2563eb"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    y={parseFloat(avgAll(td3Series))}
                    stroke="#16a34a"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                  />

                  <Line
                    type="monotone"
                    dataKey="Trung đội 1"
                    stroke="#b91c1c"
                    strokeWidth={2}
                    dot={(props) => (
                      <HighlightDot
                        {...props}
                        seriesData={td1Series}
                      />
                    )}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Trung đội 2"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props) => (
                      <HighlightDot
                        {...props}
                        seriesData={td2Series}
                      />
                    )}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Trung đội 3"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={(props) => (
                      <HighlightDot
                        {...props}
                        seriesData={td3Series}
                      />
                    )}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Average summary below chart */}
            <div className="mt-3 flex flex-wrap gap-6 justify-center text-xs text-zinc-600">
              <span>
                <span className="inline-block h-2 w-4 rounded-sm bg-[#b91c1c] mr-1 align-middle" />
                Trung đội 1 — Trung bình: <strong className="text-zinc-900">{avgAll(td1Series)} đ</strong>
              </span>
              <span>
                <span className="inline-block h-2 w-4 rounded-sm bg-[#2563eb] mr-1 align-middle" />
                Trung đội 2 — Trung bình: <strong className="text-zinc-900">{avgAll(td2Series)} đ</strong>
              </span>
              <span>
                <span className="inline-block h-2 w-4 rounded-sm bg-[#16a34a] mr-1 align-middle" />
                Trung đội 3 — Trung bình: <strong className="text-zinc-900">{avgAll(td3Series)} đ</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-4 text-xs text-zinc-800">
          <h4 className="font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1">
            I. KẾT QUẢ XẾP HẠNG VÀ PHÂN TÍCH MẠNH / YẾU
          </h4>
          {aggregates.map((p) => (
            <div key={p.platoonId} className="space-y-1.5 pl-3 border-l-2 border-zinc-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-sm text-zinc-900">
                  {p.platoonName}: Hạng {p.rank} — {p.avgTotal}/400 điểm
                </span>
                <span className="font-mono text-zinc-500 text-[11px]">
                  CT: {p.avgPolitical} | NV: {p.avgTask} | NVVS: {p.avgHygiene} | TTP: {p.avgBearing}
                </span>
              </div>
              <p className="leading-relaxed text-zinc-700">
                <strong>Điểm mạnh:</strong>{' '}
                {p.platoonId === 'td1'
                  ? 'Nội vụ vệ sinh xuất sắc, chăn màn gấp vuông thành sắc cạnh, lễ tiết tác phong chuẩn mực.'
                  : p.platoonId === 'td2'
                  ? 'Chất lượng chính trị cao nhất đơn vị, 100% quân nhân an tâm tư tưởng.'
                  : 'Thực hiện nhiệm vụ huấn luyện và gác đêm xuất sắc, xử lý nhanh tình huống.'}
              </p>
              <p className="leading-relaxed text-zinc-600">
                <strong>Tồn tại:</strong>{' '}
                {p.platoonId === 'td1'
                  ? 'Tiểu đội 2 còn trường hợp đi muộn giờ tập trung 3 phút.'
                  : p.platoonId === 'td2'
                  ? 'Hành lang tầng 2 sắp xếp giày dép còn lộn xộn, cần chấn chỉnh ngay.'
                  : 'Nội vụ vệ sinh đạt điểm thấp nhất (85đ), gấp chăn chưa vuông góc.'}
              </p>
            </div>
          ))}
        </div>

        {/* Commendations */}
        <div className="space-y-2 text-xs text-zinc-800">
          <h4 className="font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1">
            II. TẬP THỂ VÀ CÁ NHÂN ĐƯỢC BIỂU DƯƠNG TRONG KỲ
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-700">
            {commendations
              .filter((c) => c.type === 'COMMENDATION')
              .map((c) => (
                <li key={c.id}>
                  <strong>{c.targetName}:</strong> {c.content}
                </li>
              ))}
          </ul>
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 pt-6 text-center text-xs">
          <div className="space-y-10">
            <p className="font-bold uppercase">NGƯỜI LẬP BÁO CÁO</p>
            <p className="font-medium">Trung sĩ Trần Văn Bình</p>
          </div>
          <div className="space-y-10">
            <p className="font-bold uppercase">ĐẠI ĐỘI TRƯỞNG</p>
            <p className="font-medium">Đại úy Nguyễn Thế Anh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { PlatoonAggregate, CommendationItem } from '@/lib/types';
import { Printer, FileDown, FileText, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  if (value === max) return <circle cx={cx} cy={cy} r={4.5} fill="#15803d" stroke="#fff" strokeWidth={1.5} />;
  if (value === min) return <circle cx={cx} cy={cy} r={4.5} fill="#991b1b" stroke="#fff" strokeWidth={1.5} />;
  return <circle cx={cx} cy={cy} r={3} fill="currentColor" stroke="#fff" strokeWidth={1} />;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[3px] border border-zinc-300 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: <strong>{p.value}</strong> đ
        </p>
      ))}
    </div>
  );
}

export function getUnitEvaluation(p: PlatoonAggregate) {
  const criteriaList = [
    { name: 'Chất lượng chính trị, tư tưởng', score: p.avgPolitical, key: 'CT' },
    { name: 'Huấn luyện & Thực hiện nhiệm vụ', score: p.avgTask, key: 'NV' },
    { name: 'Nội vụ vệ sinh & Thể lực', score: p.avgHygiene, key: 'NVVS' },
    { name: 'Lễ tiết tác phong & Kỷ luật', score: p.avgBearing, key: 'LTP' },
  ];

  const sortedByScore = [...criteriaList].sort((a, b) => b.score - a.score);
  const highest = sortedByScore[0];
  const lowest = sortedByScore[sortedByScore.length - 1];

  let strength = '';
  let weakness = '';

  if (highest && highest.score > 0) {
    if (highest.key === 'CT') strength = `Chất lượng chính trị xuất sắc (${highest.score}đ), 100% quân nhân an tâm tư tưởng công tác, xác định tốt nhiệm vụ`;
    else if (highest.key === 'NV') strength = `Thực hiện nhiệm vụ huấn luyện và SSCĐ đạt kết quả cao (${highest.score}đ), duy trì nghiêm chế độ canh gác an toàn`;
    else if (highest.key === 'NVVS') strength = `Nội vụ vệ sinh chuẩn mực (${highest.score}đ), chăn màn vuông thành sắc cạnh, doanh trại chính quy sáng đẹp`;
    else strength = `Lễ tiết tác phong gương mẫu (${highest.score}đ), xưng hô chào hỏi đúng điều lệnh, tinh thần đoàn kết nội bộ tốt`;
  } else {
    strength = 'Đang cập nhật số liệu chấm điểm thi đua';
  }

  if (lowest && lowest.score > 0 && lowest.score < 96) {
    if (lowest.key === 'CT') weakness = `Nhận thức chính trị cần củng cố thêm (${lowest.score}đ), một số đồng chí cần tập trung hơn trong giờ học tập chính trị`;
    else if (lowest.key === 'NV') weakness = `Huấn luyện và thực hiện nhiệm vụ còn điểm trừ (${lowest.score}đ), cần chấn chỉnh việc duy trì quân số đúng giờ`;
    else if (lowest.key === 'NVVS') weakness = `Nội vụ vệ sinh đạt điểm thấp nhất (${lowest.score}đ), còn hiện tượng gấp chăn chưa vuông góc, sắp xếp giày dép chưa đều`;
    else weakness = `Lễ tiết tác phong cần chấn chỉnh (${lowest.score}đ), nhắc nhở việc xưng hô đúng điều lệnh quân đội trong giờ nghỉ`;
  } else {
    weakness = 'Tiếp tục duy trì nền nếp chính quy mẫu mực, không có vi phạm lớn phát sinh';
  }

  return { strength, weakness };
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
          const evalResult = getUnitEvaluation(a);
          return `
            <p><strong>• ${a.platoonName} (Hạng ${a.rank}):</strong></p>
            <p style="margin-left: 20px;">- <i>Điểm mạnh:</i> ${evalResult.strength}.</p>
            <p style="margin-left: 20px;">- <i>Hạn chế cần khắc phục:</i> ${evalResult.weakness}.</p>
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
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 border-b border-zinc-200 pb-3 print:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-white text-xs font-semibold text-zinc-700 border-zinc-300 shadow-2xs hover:bg-zinc-50 btn-tactile cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-blue-600" />
                <span>Xuất & In báo cáo</span>
                <ChevronDown className="h-3 w-3 text-zinc-500 opacity-70" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 bg-white border border-zinc-200 shadow-md rounded-[3px] p-1 text-xs">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-bold text-zinc-500">Định dạng văn bản</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleExportWordReport}
                className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Xuất tệp Word (.doc)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.print()}
                className="cursor-pointer gap-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100"
              >
                <Printer className="h-3.5 w-3.5 text-zinc-600" />
                <span>In văn bản A4 / Lưu PDF</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Report Body */}
      <div className="border border-zinc-200 p-4 sm:p-6 space-y-6 sm:space-y-8 bg-white shadow-2xs rounded-[3px]">

        {/* Report Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-zinc-200 pb-4">
          <div className="text-left">
            <p className="font-bold uppercase tracking-wider text-zinc-800">ĐẠI ĐỘI 1</p>
            <p className="text-zinc-600 font-medium">Trung đội 1 — Trung đội 2 — Trung đội 3</p>
          </div>
          <div className="text-left sm:text-right">
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

                  <Line
                    type="monotone"
                    dataKey="Trung đội 1"
                    stroke="#991b1b"
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
                    stroke="#15803d"
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
                    stroke="#475569"
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

            {/* Average summary below chart — Military Data Strip */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between px-3 py-2 rounded-[3px] border border-zinc-200 bg-white shadow-2xs">
                <span className="flex items-center gap-2 font-medium text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#991b1b]" />
                  Trung đội 1
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-900">{avgAll(td1Series)} đ</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-[3px] border border-zinc-200 bg-white shadow-2xs">
                <span className="flex items-center gap-2 font-medium text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#15803d]" />
                  Trung đội 2
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-900">{avgAll(td2Series)} đ</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-[3px] border border-zinc-200 bg-white shadow-2xs">
                <span className="flex items-center gap-2 font-medium text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#475569]" />
                  Trung đội 3
                </span>
                <span className="font-mono font-bold tabular-nums text-zinc-900">{avgAll(td3Series)} đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis — Plain Clean Administrative Table */}
        <div className="space-y-3 text-xs text-zinc-800">
          <h4 className="font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1">
            I. KẾT QUẢ XẾP HẠNG VÀ MA TRẬN PHÂN TÍCH MẠNH / YẾU
          </h4>
          <div className="overflow-x-auto border border-zinc-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-800 font-semibold border-b border-zinc-200">
                  <th className="py-2.5 px-3 w-36">Đơn vị & Thứ hạng</th>
                  <th className="py-2.5 px-3 w-44 text-center">Điểm TB & Chi tiết</th>
                  <th className="py-2.5 px-3">Mặt mạnh nổi bật</th>
                  <th className="py-2.5 px-3">Hạn chế & Biện pháp chấn chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {aggregates.map((p) => (
                  <tr key={p.platoonId} className="align-top table-row-hover">
                    <td className="py-2.5 px-3 text-zinc-900">
                      <div className="font-semibold">{p.platoonName}</div>
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">
                        Hạng {p.rank} ({p.totalSoldiers} quân nhân)
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="font-mono text-sm font-bold tabular-nums text-zinc-900">
                        {p.avgTotal.toFixed(1)} đ
                      </div>
                      <div className="font-mono text-xs text-zinc-500 mt-1">
                        CT: {p.avgPolitical} | NV: {p.avgTask} | NVVS: {p.avgHygiene} | TTP: {p.avgBearing}
                      </div>
                    </td>
                    {(() => {
                      const evalResult = getUnitEvaluation(p);
                      return (
                        <>
                          <td className="py-2.5 px-3 text-zinc-700 leading-relaxed">
                            {evalResult.strength}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-700 leading-relaxed">
                            {evalResult.weakness}
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commendations & Reminders */}
        <div className="space-y-2 text-xs text-zinc-800">
          <h4 className="font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1">
            II. TẬP THỂ VÀ CÁ NHÂN ĐƯỢC BIỂU DƯƠNG TRONG KỲ
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="font-semibold text-zinc-900 text-xs">
                1. Ghi nhận biểu dương:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-700">
                {commendations
                  .filter((c) => c.type === 'COMMENDATION')
                  .map((c) => (
                    <li key={c.id}>
                      <strong>{c.targetName}:</strong> {c.content}
                    </li>
                  ))}
                {commendations.filter((c) => c.type === 'COMMENDATION').length === 0 && (
                  <li className="text-zinc-400 italic">Chưa có ghi nhận biểu dương trong kỳ.</li>
                )}
              </ul>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-zinc-900 text-xs">
                2. Điểm cần rút kinh nghiệm:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-700">
                {commendations
                  .filter((c) => c.type === 'REMINDER')
                  .map((c) => (
                    <li key={c.id}>
                      <strong>{c.targetName}:</strong> {c.content}
                    </li>
                  ))}
                {commendations.filter((c) => c.type === 'REMINDER').length === 0 && (
                  <li className="text-zinc-400 italic">Đơn vị duy trì tốt kỷ luật.</li>
                )}
              </ul>
            </div>
          </div>
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

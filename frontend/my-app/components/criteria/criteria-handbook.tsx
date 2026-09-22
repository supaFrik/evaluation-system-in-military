'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

export function CriteriaHandbook() {
  return (
    <div className="w-full max-w-5xl py-2 space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
          Quy chế Chấm điểm & Cẩm nang Thi đua
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Quy định tiêu chuẩn đánh giá thi đua hằng ngày giữa các trung đội, tiểu đội và chiến sĩ
        </p>
      </div>

      {/* 4 Standards Sections (Clean Information-First Spacing) */}
      <div className="space-y-8 text-sm text-zinc-800">
        {/* Standard 1 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#b91c1c] uppercase tracking-wider border-b border-red-100 pb-1.5">
            1. Chất lượng chính trị của Hạ sĩ quan, Chiến sĩ (Thang điểm: 100)
          </h3>
          <p className="text-xs text-zinc-600 italic">
            Đánh giá nền tảng tư tưởng, bản lĩnh và thái độ chấp hành của quân nhân trong mọi hoạt động.
          </p>
          <ul className="space-y-2 text-xs text-zinc-700 pl-4 list-disc">
            <li>
              <strong>Nhận thức tư tưởng:</strong> 100% quân nhân an tâm tư tưởng công tác, xác định tốt nhiệm vụ. Không có biểu hiện thoái thác, ngại khó, ngại khổ.
            </li>
            <li>
              <strong>Học tập chính trị:</strong> Quân số tham gia học tập đầy đủ, ghi chép bài cẩn thận, tích cực phát biểu xây dựng bài. Kiểm tra nhận thức đạt yêu cầu trở lên.
            </li>
            <li>
              <strong>Chấp hành pháp luật, kỷ luật:</strong> Tuyệt đối không vi phạm kỷ luật quân đội, pháp luật nhà nước. Chấp hành nghiêm điều lệnh quản lý bộ đội và mệnh lệnh chỉ huy.
            </li>
            <li>
              <strong>Đoàn kết nội bộ:</strong> Mối quan hệ đồng chí, đồng đội gắn bó; thương yêu giúp đỡ lẫn nhau; không có hiện tượng mất đoàn kết trong tiểu đội, trung đội.
            </li>
          </ul>
        </section>

        {/* Standard 2 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#b91c1c] uppercase tracking-wider border-b border-red-100 pb-1.5">
            2. Chất lượng thực hiện nhiệm vụ trong ngày (Thang điểm: 100)
          </h3>
          <p className="text-xs text-zinc-600 italic">
            Đánh giá mức độ hoàn thành các công việc được giao theo thời gian biểu của chế độ trong ngày.
          </p>
          <ul className="space-y-2 text-xs text-zinc-700 pl-4 list-disc">
            <li>
              <strong>Huấn luyện quân sự:</strong> Tham gia huấn luyện đúng, đủ quân số. Nắm chắc yếu lĩnh động tác, sử dụng thành thạo vũ khí trang bị.
            </li>
            <li>
              <strong>Lao động, tăng gia sản xuất:</strong> Hoàn thành khối lượng và chất lượng công việc được giao (nhổ cỏ, chăm sóc vườn rau, vệ sinh khu vực dã ngoại...).
            </li>
            <li>
              <strong>Trực ban, gác, tuần tra:</strong> Thực hiện đúng chức trách, bàn giao ca gác rõ ràng, không ngủ gật hoặc rời vị trí khi làm nhiệm vụ canh gác.
            </li>
            <li>
              <strong>Tính chủ động:</strong> Tinh thần trách nhiệm cao, tự giác khắc phục khó khăn hoàn thành nhiệm vụ mà không cần đốc thúc nhắc nhở.
            </li>
          </ul>
        </section>

        {/* Standard 3 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#b91c1c] uppercase tracking-wider border-b border-red-100 pb-1.5">
            3. Chất lượng gấp xếp, sắp đặt nội vụ vệ sinh (Thang điểm: 100)
          </h3>
          <p className="text-xs text-zinc-600 italic">
            Đánh giá tính tỷ mỷ, trật tự và không gian sinh hoạt chính quy của đơn vị.
          </p>
          <ul className="space-y-2 text-xs text-zinc-700 pl-4 list-disc">
            <li>
              <strong>Gấp xếp chăn màn:</strong> Chăn gấp vuông góc, phẳng phiu, đúng kích thước quy định (&ldquo;vuông thành sắc cạnh&rdquo;). Màn được gấp gọn đặt đúng vị trí.
            </li>
            <li>
              <strong>Sắp đặt vật dụng cá nhân:</strong> Ba lô, giày dép, mũ cối, mũ kê-pi, giá để ca cốc, khăn mặt sắp xếp thành hàng lối thẳng tắp, thống nhất toàn trung đội.
            </li>
            <li>
              <strong>Vệ sinh doanh trại:</strong> Nền nhà, hành lang, nhà vệ sinh, nhà tắm được quét dọn sạch sẽ, không có rác đọng, không có mùi hôi.
            </li>
            <li>
              <strong>Bảo quản vũ khí, trang bị:</strong> Súng đạn, công cụ hỗ trợ lau chùi đúng quy trình, đặt trên giá súng đúng số súng, khóa an toàn nghiêm ngặt.
            </li>
          </ul>
        </section>

        {/* Standard 4 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#b91c1c] uppercase tracking-wider border-b border-red-100 pb-1.5">
            4. Lễ tiết tác phong quân nhân (Thang điểm: 100)
          </h3>
          <p className="text-xs text-zinc-600 italic">
            Đánh giá hình ảnh, tác phong chuẩn mực của người quân nhân cách mạng.
          </p>
          <ul className="space-y-2 text-xs text-zinc-700 pl-4 list-disc">
            <li>
              <strong>Mang mặc quân phục:</strong> Đúng điều lệnh, đúng mùa, quần áo chỉnh tề, sạch sẽ, không xắn tay áo sai quy định; đeo đầy đủ cấp hiệu, phù hiệu, biển tên.
            </li>
            <li>
              <strong>Xưng hô, chào hỏi:</strong> Thực hiện nghiêm quy tắc xưng hô &ldquo;Đồng chí - Tôi&rdquo; hoặc theo cấp bậc chức vụ. Chào cấp trên đúng tư thế điều lệnh.
            </li>
            <li>
              <strong>Tác phong sinh hoạt:</strong> Đầu tóc cắt ngắn đúng quy định (3 phân), không để râu ria, móng tay dài.
            </li>
            <li>
              <strong>Di chuyển, đội hình:</strong> Đi lại trong doanh trại có trật tự; di chuyển từ 3 người trở lên phải đi thành hàng ngũ, có người chỉ huy hô hát bài hát quy định.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

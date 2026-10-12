package com.trungdoi.danhgia.modules.unit.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.exception.BadRequestException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import com.trungdoi.danhgia.modules.unit.dto.*;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.modules.unit.entity.UnitRemark;
import com.trungdoi.danhgia.modules.unit.repository.MilitaryUnitRepository;
import com.trungdoi.danhgia.modules.unit.repository.UnitRemarkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final MilitaryUnitRepository militaryUnitRepository;
    private final UnitRemarkRepository unitRemarkRepository;
    private final SoldierRepository soldierRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits(UnitTier tier, String parentId) {
        List<MilitaryUnit> units;
        if (tier != null && parentId != null) {
            units = militaryUnitRepository.findByParentId(parentId).stream()
                    .filter(u -> u.getTier() == tier)
                    .collect(Collectors.toList());
        } else if (tier != null) {
            units = militaryUnitRepository.findByTier(tier);
        } else if (parentId != null) {
            units = militaryUnitRepository.findByParentId(parentId);
        } else {
            units = militaryUnitRepository.findAll();
        }

        return units.stream()
                .map(UnitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getUnitTree() {
        List<MilitaryUnit> allUnits = militaryUnitRepository.findAll();
        Map<String, List<MilitaryUnit>> childrenMap = new HashMap<>();

        for (MilitaryUnit unit : allUnits) {
            if (unit.getParentId() != null && !unit.getParentId().isBlank()) {
                childrenMap.computeIfAbsent(unit.getParentId(), k -> new ArrayList<>()).add(unit);
            }
        }

        // Roots are units without parentId or DIVISION / REGIMENT roots
        List<MilitaryUnit> rootUnits = allUnits.stream()
                .filter(u -> u.getParentId() == null || u.getParentId().isBlank() || u.getTier() == UnitTier.DIVISION || (u.getTier() == UnitTier.REGIMENT && (u.getParentId() == null || !allUnits.stream().anyMatch(p -> p.getId().equals(u.getParentId())))))
                .collect(Collectors.toList());

        if (rootUnits.isEmpty() && !allUnits.isEmpty()) {
            rootUnits = allUnits.stream().filter(u -> u.getParentId() == null).collect(Collectors.toList());
        }

        return rootUnits.stream()
                .map(root -> buildNode(root, childrenMap))
                .collect(Collectors.toList());
    }

    private UnitResponse buildNode(MilitaryUnit unit, Map<String, List<MilitaryUnit>> childrenMap) {
        List<MilitaryUnit> childEntities = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
        List<UnitResponse> childResponses = childEntities.stream()
                .map(child -> buildNode(child, childrenMap))
                .collect(Collectors.toList());
        return UnitResponse.fromEntityWithChildren(unit, childResponses);
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitById(String id) {
        MilitaryUnit unit = militaryUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));
        return UnitResponse.fromEntity(unit);
    }

    @Override
    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        validateHierarchy(request.getTier(), request.getParentId());

        String unitId = request.getId();
        if (unitId == null || unitId.isBlank()) {
            unitId = request.getCode().trim();
            if (militaryUnitRepository.existsById(unitId)) {
                unitId = request.getCode().trim() + "-" + UUID.randomUUID().toString().substring(0, 6);
            }
        } else {
            if (militaryUnitRepository.existsById(unitId)) {
                throw new BadRequestException("Mã đơn vị hoặc ID '" + unitId + "' đã tồn tại trong hệ thống.");
            }
        }

        MilitaryUnit unit = MilitaryUnit.builder()
                .id(unitId)
                .name(request.getName().trim())
                .code(request.getCode().trim())
                .tier(request.getTier())
                .parentId(request.getParentId() != null && !request.getParentId().isBlank() ? request.getParentId().trim() : null)
                .leaderTitle(request.getLeaderTitle() != null ? request.getLeaderTitle().trim() : null)
                .leaderName(request.getLeaderName() != null ? request.getLeaderName().trim() : null)
                .totalSoldiers(request.getTotalSoldiers() != null ? request.getTotalSoldiers() : 0)
                .build();

        MilitaryUnit saved = militaryUnitRepository.save(unit);
        recalculateSoldierHeadcounts();
        return UnitResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(String id, UnitUpdateRequest request) {
        MilitaryUnit unit = militaryUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));

        UnitTier targetTier = request.getTier() != null ? request.getTier() : unit.getTier();
        String targetParentId = request.getParentId() != null ? request.getParentId() : unit.getParentId();

        if (id.equals(targetParentId)) {
            throw new BadRequestException("Đơn vị không thể chọn chính mình làm đơn vị cha.");
        }

        validateHierarchy(targetTier, targetParentId);

        if (request.getName() != null && !request.getName().isBlank()) unit.setName(request.getName().trim());
        if (request.getCode() != null && !request.getCode().isBlank()) unit.setCode(request.getCode().trim());
        if (request.getTier() != null) unit.setTier(request.getTier());
        if (request.getParentId() != null) {
            unit.setParentId(request.getParentId().isBlank() ? null : request.getParentId().trim());
        }
        if (request.getLeaderTitle() != null) unit.setLeaderTitle(request.getLeaderTitle().trim());
        if (request.getLeaderName() != null) unit.setLeaderName(request.getLeaderName().trim());
        if (request.getTotalSoldiers() != null) unit.setTotalSoldiers(request.getTotalSoldiers());

        MilitaryUnit saved = militaryUnitRepository.save(unit);
        recalculateSoldierHeadcounts();
        return UnitResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteUnit(String id) {
        MilitaryUnit unit = militaryUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));

        // 1. Kiểm tra đơn vị con
        long childCount = militaryUnitRepository.countByParentId(id);
        if (childCount > 0) {
            throw new BadRequestException("Không thể xóa đơn vị '" + unit.getName() + "' vì vẫn còn " + childCount + " đơn vị trực thuộc cấp dưới.");
        }

        // 2. Kiểm tra quân nhân trực thuộc
        List<Soldier> assignedSoldiers = soldierRepository.findAllByAnyUnitId(id);
        if (!assignedSoldiers.isEmpty()) {
            throw new BadRequestException("Không thể xóa đơn vị '" + unit.getName() + "' vì vẫn còn " + assignedSoldiers.size() + " quân nhân đang trực thuộc đơn vị.");
        }

        militaryUnitRepository.delete(unit);
        recalculateSoldierHeadcounts();
    }

    @Override
    @Transactional
    public UnitResponse assignLeader(String unitId, AssignLeaderRequest request) {
        MilitaryUnit unit = militaryUnitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + unitId));

        String leaderName = request.getLeaderName();
        String leaderTitle = request.getLeaderTitle();

        if (request.getSoldierId() != null && !request.getSoldierId().isBlank()) {
            Soldier soldier = soldierRepository.findById(request.getSoldierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quân nhân với ID: " + request.getSoldierId()));

            leaderName = soldier.getName();
            if (leaderTitle == null || leaderTitle.isBlank()) {
                leaderTitle = getDefaultLeaderTitle(unit.getTier());
            }

            // Đồng bộ ngược lại cho hồ sơ quân nhân
            soldier.setRoleTitle(leaderTitle);
            soldierRepository.save(soldier);
        }

        if (leaderName != null) unit.setLeaderName(leaderName.trim());
        if (leaderTitle != null) unit.setLeaderTitle(leaderTitle.trim());

        MilitaryUnit saved = militaryUnitRepository.save(unit);
        return UnitResponse.fromEntity(saved);
    }

    private String getDefaultLeaderTitle(UnitTier tier) {
        if (tier == null) return "Chỉ huy";
        return switch (tier) {
            case DIVISION -> "Sư đoàn trưởng";
            case REGIMENT -> "Trung đoàn trưởng";
            case BATTALION -> "Tiểu đoàn trưởng";
            case COMPANY -> "Đại đội trưởng";
            case PLATOON -> "Trung đội trưởng";
            case SQUAD -> "Tiểu đội trưởng";
        };
    }

    private void validateHierarchy(UnitTier tier, String parentId) {
        if (tier == null) return;

        if (tier == UnitTier.DIVISION) {
            if (parentId != null && !parentId.isBlank()) {
                throw new BadRequestException("Cấp Sư đoàn là cấp cao nhất trong hệ thống, không thể có đơn vị cha.");
            }
            return;
        }

        if (tier == UnitTier.REGIMENT) {
            if (parentId != null && !parentId.isBlank()) {
                MilitaryUnit parent = militaryUnitRepository.findById(parentId)
                        .orElseThrow(() -> new BadRequestException("Đơn vị cha với ID '" + parentId + "' không tồn tại."));
                if (parent.getTier() != UnitTier.DIVISION) {
                    throw new BadRequestException("Đơn vị cha của Trung đoàn phải là cấp Sư đoàn (DIVISION).");
                }
            }
            return;
        }

        if (parentId == null || parentId.isBlank()) {
            throw new BadRequestException("Đơn vị cấp " + tier.name() + " bắt buộc phải thuộc một đơn vị cấp trên.");
        }

        MilitaryUnit parent = militaryUnitRepository.findById(parentId)
                .orElseThrow(() -> new BadRequestException("Đơn vị cha với ID '" + parentId + "' không tồn tại trong hệ thống."));

        switch (tier) {
            case BATTALION -> {
                if (parent.getTier() != UnitTier.REGIMENT && parent.getTier() != UnitTier.DIVISION) {
                    throw new BadRequestException("Đơn vị cha của Tiểu đoàn phải là Trung đoàn (REGIMENT) hoặc Sư đoàn (DIVISION).");
                }
            }
            case COMPANY -> {
                if (parent.getTier() != UnitTier.BATTALION && parent.getTier() != UnitTier.REGIMENT) {
                    throw new BadRequestException("Đơn vị cha của Đại đội phải là Tiểu đoàn (BATTALION) hoặc Trung đoàn (REGIMENT).");
                }
            }
            case PLATOON -> {
                if (parent.getTier() != UnitTier.COMPANY) {
                    throw new BadRequestException("Đơn vị cha của Trung đội phải là Đại đội (COMPANY).");
                }
            }
            case SQUAD -> {
                if (parent.getTier() != UnitTier.PLATOON) {
                    throw new BadRequestException("Đơn vị cha của Tiểu đội phải là Trung đội (PLATOON).");
                }
            }
            default -> {}
        }
    }

    @Override
    @Transactional
    public void recalculateSoldierHeadcounts() {
        List<MilitaryUnit> allUnits = militaryUnitRepository.findAll();
        Map<String, List<MilitaryUnit>> childrenMap = new HashMap<>();

        for (MilitaryUnit unit : allUnits) {
            if (unit.getParentId() != null && !unit.getParentId().isBlank()) {
                childrenMap.computeIfAbsent(unit.getParentId(), k -> new ArrayList<>()).add(unit);
            }
        }

        // Tự động tính quân số theo từng cấp từ dưới lên
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.SQUAD) {
                long count = soldierRepository.countBySquadId(unit.getId());
                unit.setTotalSoldiers((int) count);
            }
        }

        // Platoons
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.PLATOON) {
                List<MilitaryUnit> squads = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
                int squadSum = squads.stream().mapToInt(MilitaryUnit::getTotalSoldiers).sum();
                long directCount = soldierRepository.countByPlatoonId(unit.getId());
                unit.setTotalSoldiers(Math.max(squadSum, (int) directCount));
            }
        }

        // Companies
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.COMPANY) {
                List<MilitaryUnit> platoons = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
                int platoonSum = platoons.stream().mapToInt(MilitaryUnit::getTotalSoldiers).sum();
                long directCount = soldierRepository.countByCompanyId(unit.getId());
                unit.setTotalSoldiers(Math.max(platoonSum, (int) directCount));
            }
        }

        // Battalions
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.BATTALION) {
                List<MilitaryUnit> companies = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
                int companySum = companies.stream().mapToInt(MilitaryUnit::getTotalSoldiers).sum();
                long directCount = soldierRepository.countByBattalionId(unit.getId());
                unit.setTotalSoldiers(Math.max(companySum, (int) directCount));
            }
        }

        // Regiments
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.REGIMENT) {
                List<MilitaryUnit> battalions = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
                int battalionSum = battalions.stream().mapToInt(MilitaryUnit::getTotalSoldiers).sum();
                unit.setTotalSoldiers(battalionSum > 0 ? battalionSum : unit.getTotalSoldiers());
            }
        }

        // Divisions
        for (MilitaryUnit unit : allUnits) {
            if (unit.getTier() == UnitTier.DIVISION) {
                List<MilitaryUnit> regiments = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
                int regimentSum = regiments.stream().mapToInt(MilitaryUnit::getTotalSoldiers).sum();
                unit.setTotalSoldiers(regimentSum > 0 ? regimentSum : unit.getTotalSoldiers());
            }
        }

        militaryUnitRepository.saveAll(allUnits);
    }

    @Override
    public byte[] generateExcelTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Cây Đơn vị Mẫu");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            String[] headers = {
                    "Mã đơn vị (*)", "Tên đơn vị (*)", "Cấp đơn vị (*)", "Mã đơn vị cha",
                    "Chức danh chỉ huy", "Họ tên chỉ huy", "Quân số"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample data
            String[][] sampleData = {
                    {"e335", "Trung đoàn Bộ Binh 335", "REGIMENT", "", "Trung đoàn trưởng", "Thượng tá NGUYỄN QUANG HUY", "270"},
                    {"dBB4", "Tiểu đoàn Bộ Binh 4", "BATTALION", "e335", "Tiểu đoàn trưởng", "Thiếu tá TRẦN ĐẠI NGHĨA", "90"},
                    {"C1", "Đại đội 1", "COMPANY", "dBB4", "Đại đội trưởng", "Đại úy NGUYỄN THẾ ANH", "30"},
                    {"B1", "Trung đội 1", "PLATOON", "C1", "Trung đội trưởng", "Trung úy NGUYỄN VĂN AN", "10"},
                    {"A1", "Tiểu đội 1", "SQUAD", "B1", "Tiểu đội trưởng", "Trung sĩ TRẦN VĂN BÌNH", "10"},
                    {"A2", "Tiểu đội 2", "SQUAD", "B1", "Tiểu đội trưởng", "Trung sĩ LÊ HOÀNG NAM", "10"},
                    {"A3", "Tiểu đội 3", "SQUAD", "B1", "Tiểu đội trưởng", "Trung sĩ PHAN VĂN HÙNG", "10"}
            };

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            for (int r = 0; r < sampleData.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < sampleData[r].length; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(sampleData[r][c]);
                    cell.setCellStyle(dataStyle);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 4500));
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi sinh file mẫu Excel: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể sinh file mẫu Excel: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportUnitsToExcel() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Đơn vị");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            String[] headers = {
                    "STT", "Mã đơn vị", "Tên đơn vị", "Cấp đơn vị", "Mã đơn vị cha",
                    "Chức danh chỉ huy", "Họ tên chỉ huy", "Quân số"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<MilitaryUnit> allUnits = militaryUnitRepository.findAll();
            // Sort by tier order
            List<UnitTier> tierOrder = List.of(UnitTier.DIVISION, UnitTier.REGIMENT, UnitTier.BATTALION, UnitTier.COMPANY, UnitTier.PLATOON, UnitTier.SQUAD);
            allUnits.sort(Comparator.comparingInt(u -> tierOrder.indexOf(u.getTier())));

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            int rowIndex = 1;
            for (MilitaryUnit unit : allUnits) {
                Row row = sheet.createRow(rowIndex);

                Cell c0 = row.createCell(0);
                c0.setCellValue(rowIndex);
                c0.setCellStyle(dataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(unit.getCode() != null ? unit.getCode() : unit.getId());
                c1.setCellStyle(dataStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(unit.getName());
                c2.setCellStyle(dataStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(unit.getTier().name());
                c3.setCellStyle(dataStyle);

                Cell c4 = row.createCell(4);
                c4.setCellValue(unit.getParentId() != null ? unit.getParentId() : "");
                c4.setCellStyle(dataStyle);

                Cell c5 = row.createCell(5);
                c5.setCellValue(unit.getLeaderTitle() != null ? unit.getLeaderTitle() : "");
                c5.setCellStyle(dataStyle);

                Cell c6 = row.createCell(6);
                c6.setCellValue(unit.getLeaderName() != null ? unit.getLeaderName() : "");
                c6.setCellStyle(dataStyle);

                Cell c7 = row.createCell(7);
                c7.setCellValue(unit.getTotalSoldiers());
                c7.setCellStyle(dataStyle);

                rowIndex++;
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1000, 3800));
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi xuất danh sách đơn vị ra Excel: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể xuất danh sách đơn vị: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public UnitImportSummaryResponse importUnitsFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng tải lên file Excel hoặc CSV hợp lệ.");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        List<RawUnitRow> rawRows = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try {
            if (fileName.endsWith(".csv")) {
                parseCsv(file.getInputStream(), rawRows, errors);
            } else {
                parseExcel(file.getInputStream(), rawRows, errors);
            }
        } catch (Exception e) {
            log.error("Lỗi khi đọc file nạp đơn vị: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi định dạng file: " + e.getMessage());
        }

        if (rawRows.isEmpty()) {
            return UnitImportSummaryResponse.builder()
                    .totalProcessed(0)
                    .totalCreated(0)
                    .totalUpdated(0)
                    .errors(errors)
                    .message("Không tìm thấy dòng dữ liệu hợp lệ trong file.")
                    .build();
        }

        // Sắp xếp thứ tự nạp theo cấp bậc từ cao xuống thấp để đơn vị cha luôn tồn tại trước đơn vị con
        List<UnitTier> tierHierarchy = List.of(UnitTier.DIVISION, UnitTier.REGIMENT, UnitTier.BATTALION, UnitTier.COMPANY, UnitTier.PLATOON, UnitTier.SQUAD);
        rawRows.sort(Comparator.comparingInt(r -> {
            int idx = tierHierarchy.indexOf(r.tier);
            return idx >= 0 ? idx : 99;
        }));

        int createdCount = 0;
        int updatedCount = 0;

        for (RawUnitRow row : rawRows) {
            try {
                if (row.code == null || row.code.isBlank()) {
                    errors.add("Bỏ qua hàng '" + row.name + "': Thiếu mã đơn vị.");
                    continue;
                }
                if (row.name == null || row.name.isBlank()) {
                    errors.add("Bỏ qua hàng '" + row.code + "': Thiếu tên đơn vị.");
                    continue;
                }
                if (row.tier == null) {
                    errors.add("Bỏ qua đơn vị '" + row.code + "': Cấp đơn vị không hợp lệ.");
                    continue;
                }

                // Resolve parentId: if parentCode is given, find by code or id
                String resolvedParentId = null;
                if (row.parentCode != null && !row.parentCode.isBlank()) {
                    String cleanParentCode = row.parentCode.trim();
                    Optional<MilitaryUnit> parentOpt = militaryUnitRepository.findByCodeIgnoreCase(cleanParentCode)
                            .or(() -> militaryUnitRepository.findById(cleanParentCode));
                    if (parentOpt.isPresent()) {
                        resolvedParentId = parentOpt.get().getId();
                    } else {
                        // Thử tìm trong ID trực tiếp
                        resolvedParentId = cleanParentCode;
                    }
                }

                Optional<MilitaryUnit> existingOpt = militaryUnitRepository.findByCodeIgnoreCase(row.code.trim())
                        .or(() -> militaryUnitRepository.findById(row.code.trim()));

                if (existingOpt.isPresent()) {
                    MilitaryUnit existing = existingOpt.get();
                    existing.setName(row.name.trim());
                    existing.setCode(row.code.trim());
                    existing.setTier(row.tier);
                    if (resolvedParentId != null) {
                        existing.setParentId(resolvedParentId);
                    }
                    if (row.leaderTitle != null && !row.leaderTitle.isBlank()) existing.setLeaderTitle(row.leaderTitle.trim());
                    if (row.leaderName != null && !row.leaderName.isBlank()) existing.setLeaderName(row.leaderName.trim());
                    if (row.totalSoldiers != null) existing.setTotalSoldiers(row.totalSoldiers);

                    militaryUnitRepository.save(existing);
                    updatedCount++;
                } else {
                    MilitaryUnit newUnit = MilitaryUnit.builder()
                            .id(row.code.trim())
                            .name(row.name.trim())
                            .code(row.code.trim())
                            .tier(row.tier)
                            .parentId(resolvedParentId)
                            .leaderTitle(row.leaderTitle != null ? row.leaderTitle.trim() : getDefaultLeaderTitle(row.tier))
                            .leaderName(row.leaderName != null ? row.leaderName.trim() : null)
                            .totalSoldiers(row.totalSoldiers != null ? row.totalSoldiers : 0)
                            .build();

                    militaryUnitRepository.save(newUnit);
                    createdCount++;
                }
            } catch (Exception ex) {
                errors.add("Lỗi xử lý đơn vị '" + row.code + "': " + ex.getMessage());
            }
        }

        recalculateSoldierHeadcounts();

        return UnitImportSummaryResponse.builder()
                .totalProcessed(rawRows.size())
                .totalCreated(createdCount)
                .totalUpdated(updatedCount)
                .errors(errors)
                .message("Đã nạp thành công " + (createdCount + updatedCount) + " đơn vị (" + createdCount + " thêm mới, " + updatedCount + " cập nhật).")
                .build();
    }

    private void parseExcel(InputStream is, List<RawUnitRow> result, List<String> errors) throws Exception {
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return;

            int rowNum = 0;
            for (Row row : sheet) {
                rowNum++;
                if (rowNum == 1) continue; // Skip header

                String code = getCellValue(row.getCell(0));
                String name = getCellValue(row.getCell(1));
                String tierStr = getCellValue(row.getCell(2));
                String parentCode = getCellValue(row.getCell(3));
                String leaderTitle = getCellValue(row.getCell(4));
                String leaderName = getCellValue(row.getCell(5));
                String soldiersStr = getCellValue(row.getCell(6));

                if ((code == null || code.isBlank()) && (name == null || name.isBlank())) {
                    continue;
                }

                UnitTier tier = parseTier(tierStr);
                Integer totalSoldiers = null;
                if (soldiersStr != null && !soldiersStr.isBlank()) {
                    try {
                        totalSoldiers = (int) Double.parseDouble(soldiersStr);
                    } catch (Exception ignored) {}
                }

                result.add(new RawUnitRow(code, name, tier, parentCode, leaderTitle, leaderName, totalSoldiers));
            }
        }
    }

    private void parseCsv(InputStream is, List<RawUnitRow> result, List<String> errors) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            int lineNum = 0;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (lineNum == 1) continue; // Skip header
                if (line.trim().isEmpty()) continue;

                String[] parts = line.split(",", -1);
                if (parts.length >= 3) {
                    String code = parts[0].trim();
                    String name = parts[1].trim();
                    UnitTier tier = parseTier(parts[2].trim());
                    String parentCode = parts.length > 3 ? parts[3].trim() : null;
                    String leaderTitle = parts.length > 4 ? parts[4].trim() : null;
                    String leaderName = parts.length > 5 ? parts[5].trim() : null;
                    Integer soldiers = null;
                    if (parts.length > 6 && !parts[6].trim().isBlank()) {
                        try {
                            soldiers = Integer.parseInt(parts[6].trim());
                        } catch (Exception ignored) {}
                    }

                    result.add(new RawUnitRow(code, name, tier, parentCode, leaderTitle, leaderName, soldiers));
                }
            }
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue().trim();
                } catch (Exception e) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> null;
        };
    }

    private UnitTier parseTier(String tierStr) {
        if (tierStr == null || tierStr.isBlank()) return null;
        String clean = tierStr.trim().toUpperCase();
        try {
            return UnitTier.valueOf(clean);
        } catch (Exception e) {
            // Map Vietnamese names to UnitTier
            return switch (clean) {
                case "SƯ ĐOÀN", "SU DOAN" -> UnitTier.DIVISION;
                case "TRUNG ĐOÀN", "TRUNG DOAN" -> UnitTier.REGIMENT;
                case "TIỂU ĐOÀN", "TIEU DOAN" -> UnitTier.BATTALION;
                case "ĐẠI ĐỘI", "DAI DOI" -> UnitTier.COMPANY;
                case "TRUNG ĐỘI", "TRUNG DOI" -> UnitTier.PLATOON;
                case "TIỂU ĐỘI", "TIEU DOI" -> UnitTier.SQUAD;
                default -> null;
            };
        }
    }

    private record RawUnitRow(
            String code,
            String name,
            UnitTier tier,
            String parentCode,
            String leaderTitle,
            String leaderName,
            Integer totalSoldiers
    ) {}

    @Override
    @Transactional
    public UnitRemarkResponse saveRemark(String unitId, UnitRemarkRequest request, String createdBy) {
        if (!militaryUnitRepository.existsById(unitId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + unitId);
        }

        String date = request.getRemarkDate();
        String remarkContent = request.getGeneralRemark();

        UnitRemark remark = unitRemarkRepository.findByUnitIdAndRemarkDate(unitId, date)
                .orElseGet(() -> UnitRemark.builder()
                        .id("rem-" + UUID.randomUUID().toString().substring(0, 8))
                        .unitId(unitId)
                        .remarkDate(date)
                        .build());

        remark.setGeneralRemark(remarkContent);
        if (createdBy != null && !createdBy.isBlank()) {
            remark.setCreatedBy(createdBy);
        }
        remark.setUpdatedAt(LocalDateTime.now());

        UnitRemark saved = unitRemarkRepository.save(remark);
        return UnitRemarkResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getRemark(String unitId, String date) {
        return unitRemarkRepository.findByUnitIdAndRemarkDate(unitId, date)
                .map(UnitRemark::getGeneralRemark)
                .orElse(null);
    }
}

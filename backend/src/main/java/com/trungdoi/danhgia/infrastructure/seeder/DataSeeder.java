package com.trungdoi.danhgia.infrastructure.seeder;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.enums.UserRole;
import com.trungdoi.danhgia.modules.auth.entity.UserAccount;
import com.trungdoi.danhgia.modules.auth.repository.UserAccountRepository;
import com.trungdoi.danhgia.modules.emulation.entity.EmulationCriterion;
import com.trungdoi.danhgia.modules.emulation.enums.CriterionCategory;
import com.trungdoi.danhgia.modules.emulation.repository.EmulationCriterionRepository;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.modules.unit.repository.MilitaryUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MilitaryUnitRepository militaryUnitRepository;
    private final UserAccountRepository userAccountRepository;
    private final SoldierRepository soldierRepository;
    private final EmulationCriterionRepository criterionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting DataSeeder initialization...");
        seedMilitaryUnits();
        seedCriteria();
        seedSoldiers();
        seedUserAccounts();
        log.info("DataSeeder completed successfully.");
    }

    private void seedMilitaryUnits() {
        if (militaryUnitRepository.count() > 0) {
            log.info("Military units already seeded.");
            return;
        }

        log.info("Seeding military units...");

        List<MilitaryUnit> units = Arrays.asList(
                // 1. Regiment
                MilitaryUnit.builder()
                        .id("e335").name("Trung đoàn Bộ Binh 335").code("e335")
                        .tier(UnitTier.REGIMENT).parentId(null)
                        .leaderTitle("Trung đoàn trưởng").leaderName("Thượng tá NGUYỄN QUANG HUY")
                        .totalSoldiers(270).build(),

                // 2. Battalions
                MilitaryUnit.builder()
                        .id("dBB4").name("Tiểu đoàn Bộ Binh 4").code("dBB4")
                        .tier(UnitTier.BATTALION).parentId("e335")
                        .leaderTitle("Tiểu đoàn trưởng").leaderName("Thiếu tá TRẦN ĐẠI NGHĨA")
                        .totalSoldiers(90).build(),
                MilitaryUnit.builder()
                        .id("dbb4").name("Tiểu đoàn Bộ Binh 4").code("dBB4")
                        .tier(UnitTier.BATTALION).parentId("e335")
                        .leaderTitle("Tiểu đoàn trưởng").leaderName("Thiếu tá TRẦN ĐẠI NGHĨA")
                        .totalSoldiers(90).build(),
                MilitaryUnit.builder()
                        .id("dBB5").name("Tiểu đoàn Bộ Binh 5").code("dBB5")
                        .tier(UnitTier.BATTALION).parentId("e335")
                        .leaderTitle("Tiểu đoàn trưởng").leaderName("Thiếu tá LÊ MINH QUÂN")
                        .totalSoldiers(90).build(),
                MilitaryUnit.builder()
                        .id("dBB6").name("Tiểu đoàn Bộ Binh 6").code("dBB6")
                        .tier(UnitTier.BATTALION).parentId("e335")
                        .leaderTitle("Tiểu đoàn trưởng").leaderName("Thiếu tá PHẠM HỒNG SƠN")
                        .totalSoldiers(90).build(),
                MilitaryUnit.builder()
                        .id("cTT").name("Khối Đại đội Trực thuộc").code("cTT")
                        .tier(UnitTier.BATTALION).parentId("e335")
                        .leaderTitle("Phó Trung đoàn trưởng phụ trách").leaderName("Trung tá VŨ ĐÌNH TRỌNG")
                        .totalSoldiers(90).build(),

                // 3. Companies (under dBB4 / dbb4)
                MilitaryUnit.builder()
                        .id("C1").name("Đại đội 1").code("C1")
                        .tier(UnitTier.COMPANY).parentId("dBB4")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy NGUYỄN THẾ ANH")
                        .totalSoldiers(30).build(),
                MilitaryUnit.builder()
                        .id("c1").name("Đại đội 1").code("c1")
                        .tier(UnitTier.COMPANY).parentId("dbb4")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy NGUYỄN THẾ ANH")
                        .totalSoldiers(30).build(),
                MilitaryUnit.builder()
                        .id("C2").name("Đại đội 2").code("C2")
                        .tier(UnitTier.COMPANY).parentId("dBB4")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy HOÀNG VĂN LONG")
                        .totalSoldiers(30).build(),
                MilitaryUnit.builder()
                        .id("C3").name("Đại đội 3").code("C3")
                        .tier(UnitTier.COMPANY).parentId("dBB4")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy PHẠM TUẤN KIỆT")
                        .totalSoldiers(30).build(),
                MilitaryUnit.builder()
                        .id("C4").name("Đại đội Hỏa lực 4").code("C4")
                        .tier(UnitTier.COMPANY).parentId("dBB4")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy VŨ MẠNH CƯỜNG")
                        .totalSoldiers(30).build(),

                // Companies (under cTT)
                MilitaryUnit.builder()
                        .id("C18").name("Đại đội Thông tin (C18)").code("C18")
                        .tier(UnitTier.COMPANY).parentId("cTT")
                        .leaderTitle("Đại đội trưởng").leaderName("Đại úy VŨ ĐỨC MẠNH")
                        .totalSoldiers(30).build(),

                // 4. Platoons (under C1 / c1)
                MilitaryUnit.builder()
                        .id("C1-B1").name("Trung đội 1").code("B1")
                        .tier(UnitTier.PLATOON).parentId("C1")
                        .leaderTitle("Trung đội trưởng").leaderName("Thượng úy LÊ HOÀNG HẢI")
                        .totalSoldiers(10).build(),
                MilitaryUnit.builder()
                        .id("b1").name("Trung đội 1 (b1)").code("b1")
                        .tier(UnitTier.PLATOON).parentId("c1")
                        .leaderTitle("Trung đội trưởng").leaderName("Đại úy NGUYỄN VĂN THẮNG")
                        .totalSoldiers(10).build(),
                MilitaryUnit.builder()
                        .id("C1-B2").name("Trung đội 2").code("B2")
                        .tier(UnitTier.PLATOON).parentId("C1")
                        .leaderTitle("Trung đội trưởng").leaderName("Trung úy VŨ ĐÌNH TRỌNG")
                        .totalSoldiers(10).build(),
                MilitaryUnit.builder()
                        .id("C1-B3").name("Trung đội 3").code("B3")
                        .tier(UnitTier.PLATOON).parentId("C1")
                        .leaderTitle("Trung đội trưởng").leaderName("Thiếu úy PHẠM MINH TUẤN")
                        .totalSoldiers(10).build(),

                // Platoons (under C18)
                MilitaryUnit.builder()
                        .id("C18-B1").name("Trung đội 1").code("B1")
                        .tier(UnitTier.PLATOON).parentId("C18")
                        .leaderTitle("Trung đội trưởng").leaderName("Thượng úy TRẦN QUANG MINH")
                        .totalSoldiers(10).build(),

                // 5. Squads (under C1-B1 / b1)
                MilitaryUnit.builder()
                        .id("C1-B1-A1").name("Tiểu đội 1").code("A1")
                        .tier(UnitTier.SQUAD).parentId("C1-B1")
                        .leaderTitle("Tiểu đội trưởng").leaderName("Trung sĩ TRẦN VĂN BÌNH")
                        .totalSoldiers(3).build(),
                MilitaryUnit.builder()
                        .id("a1").name("Tiểu đội 1 (a1)").code("a1")
                        .tier(UnitTier.SQUAD).parentId("b1")
                        .leaderTitle("Tiểu đội trưởng").leaderName("Trung sĩ TRẦN VĂN BÌNH")
                        .totalSoldiers(3).build(),
                MilitaryUnit.builder()
                        .id("C1-B1-A2").name("Tiểu đội 2").code("A2")
                        .tier(UnitTier.SQUAD).parentId("C1-B1")
                        .leaderTitle("Tiểu đội trưởng").leaderName("Trung sĩ NGUYỄN VĂN HÒA")
                        .totalSoldiers(3).build(),
                MilitaryUnit.builder()
                        .id("C1-B1-A3").name("Tiểu đội 3").code("A3")
                        .tier(UnitTier.SQUAD).parentId("C1-B1")
                        .leaderTitle("Tiểu đội trưởng").leaderName("Hạ sĩ PHẠM QUỐC HƯNG")
                        .totalSoldiers(3).build()
        );

        militaryUnitRepository.saveAll(units);
    }

    private void seedCriteria() {
        if (criterionRepository.count() > 0) {
            log.info("Emulation criteria already seeded.");
            return;
        }

        log.info("Seeding emulation criteria...");

        List<EmulationCriterion> criteria = Arrays.asList(
                EmulationCriterion.builder()
                        .id("c_political")
                        .name("Chất lượng chính trị, tư tưởng")
                        .code("CT")
                        .maxScore(100)
                        .description("Chấp hành nghiêm đường lối của Đảng, pháp luật Nhà nước, kỷ luật Quân đội; gương mẫu trong học tập chính trị.")
                        .deductionRules(Arrays.asList(
                                "Không tập trung trong giờ học tập chính trị (-5đ)",
                                "Không thuộc 10 lời thề, 12 điều kỷ luật (-10đ)",
                                "Có biểu hiện tư tưởng dao động, thiếu an tâm công tác (-20đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.CHINH_TRI)
                        .build(),
                EmulationCriterion.builder()
                        .id("crit_ct")
                        .name("1. Chất lượng chính trị")
                        .code("CT")
                        .maxScore(100)
                        .description("Nhận thức tư tưởng, học tập chính trị, chấp hành kỷ luật, đoàn kết nội bộ.")
                        .deductionRules(Arrays.asList(
                                "Vắng học chính trị không lý do (-20đ)",
                                "Không ghi chép bài đầy đủ (-5đ)",
                                "Vi phạm phát ngôn, thiếu lễ phép (-10đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.CHINH_TRI)
                        .build(),

                EmulationCriterion.builder()
                        .id("c_task")
                        .name("Huấn luyện & Thực hiện nhiệm vụ")
                        .code("NV")
                        .maxScore(100)
                        .description("Tham gia đầy đủ, nghiêm túc các khoa mục huấn luyện quân sự; hoàn thành tốt nhiệm vụ trực sẵn sàng chiến đấu, tăng gia sản xuất.")
                        .deductionRules(Arrays.asList(
                                "Chậm giờ tập trung huấn luyện, báo động (-5đ)",
                                "Huấn luyện kiểm tra không đạt yêu cầu (-10đ)",
                                "Bỏ vị trí gác, trực ban không báo cáo (-30đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.QUAN_SU)
                        .build(),
                EmulationCriterion.builder()
                        .id("crit_nv")
                        .name("2. Thực hiện nhiệm vụ")
                        .code("NV")
                        .maxScore(100)
                        .description("Huấn luyện quân sự, thao trường, tăng gia sản xuất, trực gác tuần tra.")
                        .deductionRules(Arrays.asList(
                                "Đi muộn giờ huấn luyện (-5đ)",
                                "Không hoàn thành chỉ tiêu tăng gia (-10đ)",
                                "Ngủ gật trong ca trực gác (-50đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.QUAN_SU)
                        .build(),

                EmulationCriterion.builder()
                        .id("c_hygiene")
                        .name("Nội vụ, vệ sinh & Thể lực")
                        .code("NVVS")
                        .maxScore(100)
                        .description("Duy trì nền nếp nội vụ vệ sinh gọn gàng, xếp chăn màn vuông vức, rèn luyện thể lực 4 bài thể dục sáng.")
                        .deductionRules(Arrays.asList(
                                "Chăn màn gấp chưa vuông, đặt sai quy định (-5đ)",
                                "Giày dép, quân trang để lộn xộn (-5đ)",
                                "Không tham gia thể dục sáng, rèn luyện thể lực (-10đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.HAU_CAN)
                        .build(),
                EmulationCriterion.builder()
                        .id("crit_nvvs")
                        .name("3. Nội vụ, vệ sinh")
                        .code("NVVS")
                        .maxScore(100)
                        .description("Gấp chăn màn vuông thành sắc cạnh, sắp đặt giày dép, ba lô đúng quy định.")
                        .deductionRules(Arrays.asList(
                                "Chăn màn gấp không vuông góc (-10đ)",
                                "Giày dép để lộn xộn (-5đ)",
                                "Vệ sinh doanh trại chưa sạch (-10đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.HAU_CAN)
                        .build(),

                EmulationCriterion.builder()
                        .id("c_bearing")
                        .name("Lễ tiết tác phong & Chấp hành kỷ luật")
                        .code("LTP")
                        .maxScore(100)
                        .description("Xưng hô chào hỏi đúng điều lệnh quản lý bộ đội; quân dung tươi tỉnh, đầu tóc cắt ngắn gọn gàng đúng quy cách.")
                        .deductionRules(Arrays.asList(
                                "Xưng hô, chào hỏi chưa đúng điều lệnh (-5đ)",
                                "Đầu tóc dài, mang mặc sai lễ tiết (-5đ)",
                                "Vi phạm quy định sử dụng điện thoại thông minh (-20đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.KY_LUAT)
                        .build(),
                EmulationCriterion.builder()
                        .id("crit_ltp")
                        .name("4. Lễ tiết tác phong")
                        .code("LTP")
                        .maxScore(100)
                        .description("Đầu tóc, quân dung tươi tỉnh, xưng hô chào hỏi đúng điều lệnh quân đội.")
                        .deductionRules(Arrays.asList(
                                "Tóc dài quá quy định (-10đ)",
                                "Mặc sai trang phục quy định (-10đ)",
                                "Không chào cấp trên khi gặp (-10đ)"
                        ))
                        .isActive(true)
                        .category(CriterionCategory.KY_LUAT)
                        .build()
        );

        criterionRepository.saveAll(criteria);
    }

    private void seedSoldiers() {
        if (soldierRepository.count() > 0) {
            log.info("Soldiers already seeded.");
            return;
        }

        log.info("Seeding soldiers...");

        List<Soldier> soldiers = Arrays.asList(
                Soldier.builder()
                        .id("s-001").name("Nguyễn Văn An").dob("17/04/2005").gender("Nam").rank("Binh nhất").roleTitle("Chiến sĩ")
                        .battalionId("dbb4").battalionName("Tiểu đoàn BB4").companyId("c1").companyName("Đại đội 1")
                        .platoonId("b1").platoonName("Trung đội 1").squadId("a1").squadName("Tiểu đội 1")
                        .joinDate("02/2024").militaryCode("QN-335-001").idCardNumber("038205001234").phone("0912345678")
                        .hometown("Đô Lương, Nghệ An").partyStatus("Đoàn viên").avatarUrl("/default-avatar.png")
                        .build(),
                Soldier.builder()
                        .id("s1").name("TRỊNH QUỐC VIỆT").dob("17/04/2005").gender("Nam").rank("Binh nhất").roleTitle("Chiến sĩ")
                        .battalionId("dBB4").battalionName("Tiểu đoàn BB4").companyId("C1").companyName("Đại đội 1")
                        .platoonId("C1-B1").platoonName("Trung đội 1").squadId("C1-B1-A1").squadName("Tiểu đội 1")
                        .joinDate("15/02/2023").officialDate("18/06/2024").militaryCode("QN-040205009").idCardNumber("040205009***").phone("0394497***")
                        .hometown("Ý Yên, Nam Định").partyStatus("Đảng viên chính thức").partyJoinDate("18/06/2023").avatarUrl("/default-avatar.png")
                        .build(),
                Soldier.builder()
                        .id("s2").name("NGUYỄN VĂN ĐỨC").dob("15/02/2004").gender("Nam").rank("Binh nhất").roleTitle("Chiến sĩ")
                        .battalionId("dBB4").battalionName("Tiểu đoàn BB4").companyId("C1").companyName("Đại đội 1")
                        .platoonId("C1-B1").platoonName("Trung đội 1").squadId("C1-B1-A1").squadName("Tiểu đội 1")
                        .joinDate("15/02/2023").militaryCode("QN-038204011").idCardNumber("038204011***").phone("0912345***")
                        .hometown("Đông Hưng, Thái Bình").partyStatus("Đoàn viên").avatarUrl("/default-avatar.png")
                        .build(),
                Soldier.builder()
                        .id("s4").name("TRẦN VĂN BÌNH").dob("05/11/2003").gender("Nam").rank("Trung sĩ").roleTitle("Tiểu đội trưởng")
                        .battalionId("dBB4").battalionName("Tiểu đoàn BB4").companyId("C1").companyName("Đại đội 1")
                        .platoonId("C1-B1").platoonName("Trung đội 1").squadId("C1-B1-A1").squadName("Tiểu đội 1")
                        .joinDate("15/02/2022").officialDate("02/09/2023").militaryCode("QN-001203005").idCardNumber("001203005***").phone("0977654***")
                        .hometown("Gia Lâm, Hà Nội").partyStatus("Đảng viên chính thức").partyJoinDate("02/09/2022").avatarUrl("/default-avatar.png")
                        .build(),
                Soldier.builder()
                        .id("s3").name("LÊ VĂN THẮNG").dob("22/09/2005").gender("Nam").rank("Binh nhì").roleTitle("Chiến sĩ")
                        .battalionId("dBB4").battalionName("Tiểu đoàn BB4").companyId("C1").companyName("Đại đội 1")
                        .platoonId("C1-B1").platoonName("Trung đội 1").squadId("C1-B1-A2").squadName("Tiểu đội 2")
                        .joinDate("20/02/2024").militaryCode("QN-035205022").idCardNumber("035205022***").phone("0987654***")
                        .hometown("Kim Bảng, Hà Nam").partyStatus("Đoàn viên").avatarUrl("/default-avatar.png")
                        .build(),
                Soldier.builder()
                        .id("s11").name("NGUYỄN VĂN HÒA").dob("12/01/2004").gender("Nam").rank("Trung sĩ").roleTitle("Tiểu đội trưởng")
                        .battalionId("dBB4").battalionName("Tiểu đoàn BB4").companyId("C1").companyName("Đại đội 1")
                        .platoonId("C1-B1").platoonName("Trung đội 1").squadId("C1-B1-A2").squadName("Tiểu đội 2")
                        .joinDate("15/02/2022").militaryCode("QN-036204015").idCardNumber("036204015***").phone("0923456***")
                        .hometown("Thanh Liêm, Hà Nam").partyStatus("Đoàn viên ưu tú").avatarUrl("/default-avatar.png")
                        .build()
        );

        soldierRepository.saveAll(soldiers);
    }

    private void seedUserAccounts() {
        if (userAccountRepository.count() > 0) {
            log.info("User accounts already seeded.");
            return;
        }

        log.info("Seeding user accounts...");
        String encodedPassword = passwordEncoder.encode("Password@123");

        List<UserAccount> accounts = Arrays.asList(
                // 1. Thang_b1 (from Acceptance Criteria 1 & Spec)
                UserAccount.builder()
                        .id("u-004")
                        .username("thang_b1")
                        .password(encodedPassword)
                        .name("Nguyễn Văn Thắng")
                        .rank("Đại úy")
                        .role(UserRole.COMMANDER)
                        .roleTitle("Trung đội trưởng B1")
                        .soldierId(null)
                        .platoonId("b1")
                        .unitScopeTier(UnitTier.PLATOON)
                        .assignedUnitId("b1")
                        .phone("0988111222")
                        .avatarUrl("/default-avatar.png")
                        .build(),

                // 2. Trung doan truong (e335)
                UserAccount.builder()
                        .id("u-trungdoan")
                        .username("trungdoan")
                        .password(encodedPassword)
                        .name("Thượng tá NGUYỄN QUANG HUY")
                        .rank("Thượng tá")
                        .role(UserRole.COMMANDER)
                        .roleTitle("Trung đoàn trưởng")
                        .soldierId(null)
                        .platoonId(null)
                        .unitScopeTier(UnitTier.REGIMENT)
                        .assignedUnitId("e335")
                        .phone("0981000001")
                        .avatarUrl("/default-avatar.png")
                        .build(),

                // 3. Tieu doan truong (dBB4)
                UserAccount.builder()
                        .id("u-tieudoan")
                        .username("tieudoan")
                        .password(encodedPassword)
                        .name("Thiếu tá TRẦN ĐẠI NGHĨA")
                        .rank("Thiếu tá")
                        .role(UserRole.COMMANDER)
                        .roleTitle("Tiểu đoàn trưởng")
                        .soldierId(null)
                        .platoonId(null)
                        .unitScopeTier(UnitTier.BATTALION)
                        .assignedUnitId("dBB4")
                        .phone("0981000002")
                        .avatarUrl("/default-avatar.png")
                        .build(),

                // 4. Dai doi truong (C1)
                UserAccount.builder()
                        .id("u-chihuy")
                        .username("chihuy")
                        .password(encodedPassword)
                        .name("Đại úy NGUYỄN THẾ ANH")
                        .rank("Đại úy")
                        .role(UserRole.COMMANDER)
                        .roleTitle("Đại đội trưởng")
                        .soldierId(null)
                        .platoonId(null)
                        .unitScopeTier(UnitTier.COMPANY)
                        .assignedUnitId("C1")
                        .phone("0988123456")
                        .avatarUrl("/default-avatar.png")
                        .build(),

                // 5. Can bo cham diem (C1-B1)
                UserAccount.builder()
                        .id("u-chamdiem")
                        .username("chamdiem")
                        .password(encodedPassword)
                        .name("Trung sĩ TRẦN VĂN BÌNH")
                        .rank("Trung sĩ")
                        .role(UserRole.SCORER)
                        .roleTitle("Trực ban Nội vụ / Tiểu đội trưởng")
                        .soldierId("s4")
                        .platoonId("C1-B1")
                        .unitScopeTier(UnitTier.PLATOON)
                        .assignedUnitId("C1-B1")
                        .phone("0977654321")
                        .avatarUrl("/default-avatar.png")
                        .build(),

                // 6. Chien si (s1)
                UserAccount.builder()
                        .id("u-quannhan")
                        .username("quannhan")
                        .password(encodedPassword)
                        .name("Binh nhất TRỊNH QUỐC VIỆT")
                        .rank("Binh nhất")
                        .role(UserRole.SOLDIER)
                        .roleTitle("Chiến sĩ")
                        .soldierId("s1")
                        .platoonId("C1-B1")
                        .unitScopeTier(UnitTier.SQUAD)
                        .assignedUnitId("C1-B1-A1")
                        .phone("0394497000")
                        .avatarUrl("/default-avatar.png")
                        .build()
        );

        userAccountRepository.saveAll(accounts);
    }
}

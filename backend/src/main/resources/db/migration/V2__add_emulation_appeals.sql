-- Migration V2: Bổ sung bảng Khiếu nại Thi đua (Emulation Appeals) cho các CSDL đã chạy V1 trước đó
CREATE TABLE IF NOT EXISTS emulation_appeals (
    id VARCHAR(50) NOT NULL,
    soldier_id VARCHAR(50) NOT NULL,
    soldier_name VARCHAR(100) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    unit_name VARCHAR(150) NOT NULL,
    appeal_date VARCHAR(20) NOT NULL,
    criterion_id VARCHAR(50) NULL,
    criterion_name VARCHAR(200) NULL,
    deduction_points INT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at VARCHAR(50) NOT NULL,
    resolved_at VARCHAR(50) NULL,
    resolved_by VARCHAR(100) NULL,
    reply TEXT NULL,
    PRIMARY KEY (id),
    INDEX idx_appeals_soldier_id (soldier_id),
    INDEX idx_appeals_unit_id (unit_id),
    INDEX idx_appeals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

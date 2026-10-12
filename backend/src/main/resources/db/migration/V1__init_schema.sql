-- 1. Bảng Đơn vị Quân đội (Military Units)
CREATE TABLE IF NOT EXISTS military_units (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    parent_id VARCHAR(50) NULL,
    leader_title VARCHAR(100) NULL,
    leader_name VARCHAR(100) NULL,
    total_soldiers INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_units_parent_id (parent_id),
    INDEX idx_units_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Hồ sơ Quân nhân (Soldiers)
CREATE TABLE IF NOT EXISTS soldiers (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    dob VARCHAR(20) NULL,
    gender VARCHAR(10) NULL,
    military_rank VARCHAR(50) NULL,
    role_title VARCHAR(100) NULL,
    battalion_id VARCHAR(50) NULL,
    battalion_name VARCHAR(100) NULL,
    company_id VARCHAR(50) NULL,
    company_name VARCHAR(100) NULL,
    platoon_id VARCHAR(50) NOT NULL,
    platoon_name VARCHAR(100) NULL,
    squad_id VARCHAR(50) NULL,
    squad_name VARCHAR(100) NULL,
    join_date VARCHAR(20) NULL,
    official_date VARCHAR(20) NULL,
    military_code VARCHAR(50) NULL,
    id_card_number VARCHAR(50) NULL,
    phone VARCHAR(20) NULL,
    hometown VARCHAR(255) NULL,
    party_status VARCHAR(50) NULL,
    party_join_date VARCHAR(20) NULL,
    avatar_url VARCHAR(255) DEFAULT '/default-avatar.png',
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_soldiers_military_code (military_code),
    INDEX idx_soldiers_platoon_id (platoon_id),
    INDEX idx_soldiers_unit (platoon_id, squad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Tài khoản Người dùng (User Accounts)
CREATE TABLE IF NOT EXISTS user_accounts (
    id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    military_rank VARCHAR(50) NULL,
    role VARCHAR(20) NOT NULL,
    role_title VARCHAR(100) NULL,
    soldier_id VARCHAR(50) NULL,
    platoon_id VARCHAR(50) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    avatar_url VARCHAR(255) DEFAULT '/default-avatar.png',
    unit_scope_tier VARCHAR(20) NULL,
    assigned_unit_id VARCHAR(50) NULL,
    assigned_unit_ids_json TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_user_accounts_username (username),
    UNIQUE INDEX idx_user_accounts_email (email),
    UNIQUE INDEX idx_user_accounts_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Quản lý OTP Xác thực (OTP Tokens)
CREATE TABLE IF NOT EXISTS otp_tokens (
    id VARCHAR(50) NOT NULL,
    identifier VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry_time DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NULL,
    PRIMARY KEY (id),
    INDEX idx_otp_identifier (identifier, is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Tiêu chí Thi đua (Emulation Criteria)
CREATE TABLE IF NOT EXISTS emulation_criteria (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(50) NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_emulation_criteria_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Quy tắc Trừ điểm Tiêu chí (Criterion Deduction Rules)
CREATE TABLE IF NOT EXISTS criterion_deduction_rules (
    criterion_id VARCHAR(50) NOT NULL,
    rule TEXT NOT NULL,
    INDEX idx_rule_criterion_id (criterion_id),
    CONSTRAINT fk_rules_criterion FOREIGN KEY (criterion_id) 
        REFERENCES emulation_criteria(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Điểm Thi đua Ngày (Daily Scores)
CREATE TABLE IF NOT EXISTS daily_scores (
    id VARCHAR(50) NOT NULL,
    soldier_id VARCHAR(50) NOT NULL,
    soldier_name VARCHAR(100) NULL,
    platoon_id VARCHAR(50) NOT NULL,
    score_date VARCHAR(20) NOT NULL,
    political_score INT NOT NULL DEFAULT 100,
    task_score INT NOT NULL DEFAULT 100,
    hygiene_score INT NOT NULL DEFAULT 100,
    bearing_score INT NOT NULL DEFAULT 100,
    total_score INT NOT NULL DEFAULT 400,
    criteria_scores_json TEXT NULL,
    notes TEXT NULL,
    evaluated_by VARCHAR(100) NULL,
    decision_document_json TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_daily_scores_soldier_date (soldier_id, score_date),
    INDEX idx_daily_scores_platoon_date (platoon_id, score_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Hồ sơ Vi phạm (Violation Records)
CREATE TABLE IF NOT EXISTS violation_records (
    id VARCHAR(50) NOT NULL,
    daily_score_id VARCHAR(50) NULL,
    category VARCHAR(50) NULL,
    content VARCHAR(500) NOT NULL,
    points INT NOT NULL,
    criterion_id VARCHAR(50) NULL,
    PRIMARY KEY (id),
    INDEX idx_violation_records_daily_score_id (daily_score_id),
    CONSTRAINT fk_violation_daily_score FOREIGN KEY (daily_score_id) 
        REFERENCES daily_scores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng Khóa Sổ Ngày 21:00 (Daily Locks)
CREATE TABLE IF NOT EXISTS daily_locks (
    id VARCHAR(50) NOT NULL,
    lock_date VARCHAR(20) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_at VARCHAR(50) NULL,
    locked_by VARCHAR(100) NULL,
    lock_note TEXT NULL,
    unlock_history_json TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_daily_locks_date (lock_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng Biểu dương, Nhắc nhở & Kỷ luật (Commendation Items)
CREATE TABLE IF NOT EXISTS commendation_items (
    id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_name VARCHAR(100) NOT NULL,
    platoon_id VARCHAR(50) NULL,
    content TEXT NOT NULL,
    item_date VARCHAR(20) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    discipline_document_json TEXT NULL,
    created_at DATETIME NULL,
    PRIMARY KEY (id),
    INDEX idx_commendation_items_date (item_date),
    INDEX idx_commendation_items_platoon (platoon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Bảng Nhận xét Đơn vị theo Ngày (Unit Remarks)
CREATE TABLE IF NOT EXISTS unit_remarks (
    id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50) NOT NULL,
    remark_date VARCHAR(20) NOT NULL,
    general_remark TEXT NULL,
    created_by VARCHAR(100) NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_unit_remarks_unit_date (unit_id, remark_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Bảng Khiếu nại Thi đua (Emulation Appeals)
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

package com.trungdoi.danhgia.modules.emulation.service;

import com.trungdoi.danhgia.modules.emulation.dto.*;

public interface DailyScoreService {
    DailyScoreSheetResponse getDailyScores(String date, String unitId);
    DailyScoreResponse saveDailyScore(SaveDailyScoreRequest request);
    DailyLockStatusDto lockDate(LockDateRequest request);
    DailyLockStatusDto unlockDate(UnlockDateRequest request);
    DailyLockStatusDto getDailyLockStatus(String date);
    void autoLockToday();
}

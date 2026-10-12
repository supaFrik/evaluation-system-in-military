'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, UserRole, UnitTier, Soldier, MilitaryUnit } from '@/lib/types';
import {
  Users,
  Shield,
  Search,
  UserCheck,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { notify } from '@/lib/notify';

interface UserManagementProps {
  users: UserAccount[];
  soldiers: Soldier[];
  units: MilitaryUnit[];
  onFetchUsers: () => Promise<any>;
  onAssignSoldier: (userId: string, soldierId: string) => Promise<any>;
  onUpdateRoleScope: (userId: string, data: any) => Promise<any>;
  onDeleteUser: (userId: string) => Promise<any>;
}

export function UserManagement({
  users,
  soldiers,
  units,
  onFetchUsers,
  onAssignSoldier,
  onUpdateRoleScope,
  onDeleteUser,
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Forms
  const [selectedSoldierId, setSelectedSoldierId] = useState('');
  const [scopeForm, setScopeForm] = useState({
    role: 'USER' as UserRole,
    roleTitle: '',
    unitScopeTier: 'PLATOON' as UnitTier,
    assignedUnitId: '',
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    onFetchUsers();
  }, [onFetchUsers]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onFetchUsers();
      notify.success('Đã làm mới', 'Đã tải danh sách tài khoản mới nhất');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && u.phone.includes(searchTerm));
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Open Link Soldier Modal
  const handleOpenAssignModal = (user: UserAccount) => {
    setActiveUser(user);
    setSelectedSoldierId(user.soldierId || '');
    setIsAssignModalOpen(true);
  };

  // Open Role & Scope Modal
  const handleOpenScopeModal = (user: UserAccount) => {
    setActiveUser(user);
    setScopeForm({
      role: user.role,
      roleTitle: user.roleTitle || '',
      unitScopeTier: (user.unitScopeTier as UnitTier) || 'PLATOON',
      assignedUnitId: user.assignedUnitId || '',
      status: user.status || 'ACTIVE',
    });
    setIsScopeModalOpen(true);
  };

  // Submit Link Soldier
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !selectedSoldierId) {
      notify.error('Lỗi', 'Vui lòng chọn hồ sơ quân nhân để liên kết');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAssignSoldier(activeUser.id, selectedSoldierId);
      setIsAssignModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Update Role & Scope
  const handleScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setIsSubmitting(true);
    try {
      await onUpdateRoleScope(activeUser.id, scopeForm);
      setIsScopeModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteSubmit = async () => {
    if (!activeUser) return;
    setIsSubmitting(true);
    try {
      await onDeleteUser(activeUser.id);
      setIsDeleteModalOpen(false);
      setActiveUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header & Thanh công cụ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div>
          <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Quản lý Tài khoản & Phân quyền
          </h1>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-[3px] transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo username, họ tên, email hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white focus:border-[#b91c1c] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-[3px] border border-zinc-300 bg-white focus:border-[#b91c1c] focus:outline-none"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN (Cán bộ / Quản trị)</option>
            <option value="USER">USER (Quân nhân thường)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-[3px] border border-zinc-300 bg-white focus:border-[#b91c1c] focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE (Đã kích hoạt)</option>
            <option value="PENDING">PENDING (Chờ OTP)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách Tài khoản */}
      <div className="bg-white rounded-[3px] border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Tài khoản & Người dùng</th>
                <th className="px-4 py-3">Liên hệ (Email/SĐT)</th>
                <th className="px-4 py-3">Vai trò (Role)</th>
                <th className="px-4 py-3">Hồ sơ Quân nhân</th>
                <th className="px-4 py-3">Phạm vi Quản lý (Scope)</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Không tìm thấy tài khoản người dùng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const linkedSoldier = soldiers.find((s) => s.id === user.soldierId);
                  const assignedUnit = units.find((u) => u.id === user.assignedUnitId);

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">{user.name || user.username}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">@{user.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          {user.email && (
                            <div className="flex items-center gap-1 text-zinc-600">
                              <Mail className="h-3 w-3 text-zinc-400" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-zinc-600">
                              <Phone className="h-3 w-3 text-zinc-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {!user.email && !user.phone && <span className="text-zinc-400">Chưa cập nhật</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-200">
                            <Shield className="h-3 w-3" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200">
                            USER
                          </span>
                        )}
                        {user.roleTitle && (
                          <div className="text-[10px] text-zinc-500 mt-0.5">{user.roleTitle}</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {linkedSoldier ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <div>
                              <div className="font-medium text-zinc-800">{linkedSoldier.name}</div>
                              <div className="text-[10px] text-zinc-500">
                                {linkedSoldier.rank || 'Chiến sĩ'} ({linkedSoldier.militaryCode || linkedSoldier.id})
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            Chưa liên kết
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {user.assignedUnitId ? (
                          <div className="text-zinc-800">
                            <div className="font-medium">
                              {assignedUnit ? assignedUnit.name : user.assignedUnitId}
                            </div>
                            <div className="text-[10px] text-zinc-500">Cấp: {user.unitScopeTier || 'PLATOON'}</div>
                          </div>
                        ) : (
                          <span className="text-zinc-400">Toàn quyền / Không giới hạn</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            Đã kích hoạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Chờ OTP
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(user)}
                            title="Liên kết hồ sơ quân nhân"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded transition"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenScopeModal(user)}
                            title="Phân quyền & Phạm vi quản lý"
                            className="p-1.5 text-blue-700 hover:bg-blue-100 rounded transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Xóa tài khoản"
                            className="p-1.5 text-red-700 hover:bg-red-100 rounded transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: LIÊN KẾT HỒ SƠ QUÂN NHÂN ────────────────────────── */}
      {isAssignModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[3px] shadow-md max-w-md w-full overflow-hidden border border-zinc-300">
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                Liên kết Quân nhân: @{activeUser.username}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 space-y-3.5">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Khi liên kết, tài khoản này sẽ được tự động đồng bộ họ tên, cấp bậc, chức vụ và phân đội trực thuộc từ hồ sơ quân nhân trong CSDL.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Chọn Quân nhân trong danh sách <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={selectedSoldierId}
                  onChange={(e) => setSelectedSoldierId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white focus:border-[#b91c1c] focus:outline-none"
                >
                  <option value="">-- Chọn quân nhân cần liên kết --</option>
                  {soldiers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rank || 'Chiến sĩ'}) - {s.militaryCode || s.id} [{s.companyName || ''} - {s.platoonName || ''}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-[3px] border border-zinc-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSoldierId}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang liên kết...' : 'Xác nhận liên kết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PHÂN QUYỀN & PHẠM VI ĐƠN VỊ ─────────────────────── */}
      {isScopeModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[3px] shadow-md max-w-md w-full overflow-hidden border border-zinc-300">
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                Phân quyền: @{activeUser.username}
              </h3>
              <button
                onClick={() => setIsScopeModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScopeSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Vai trò hệ thống (Role) <span className="text-red-600">*</span>
                </label>
                <select
                  value={scopeForm.role}
                  onChange={(e) => setScopeForm({ ...scopeForm, role: e.target.value as UserRole })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white font-semibold focus:border-[#b91c1c] focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Có quyền quản trị, duyệt thi đua toàn diện)</option>
                  <option value="SCORER">SCORER (Cán bộ phụ trách phân đội, nhập điểm hằng ngày)</option>
                  <option value="SOLDIER">SOLDIER (Quân nhân xem điểm cá nhân, gửi khiếu nại)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Chức danh / Vị trí cán bộ</label>
                <input
                  type="text"
                  placeholder="VD: Trung đội trưởng B1, Tiểu đội trưởng A1..."
                  value={scopeForm.roleTitle}
                  onChange={(e) => setScopeForm({ ...scopeForm, roleTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 focus:border-[#b91c1c] focus:outline-none"
                />
              </div>

              {scopeForm.role === 'ADMIN' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Cấp bậc đơn vị quản lý</label>
                    <select
                      value={scopeForm.unitScopeTier}
                      onChange={(e) => setScopeForm({ ...scopeForm, unitScopeTier: e.target.value as UnitTier })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white"
                    >
                      <option value="REGIMENT">Cấp Trung đoàn / Sư đoàn (Quản trị toàn quyền)</option>
                      <option value="BATTALION">Cấp Tiểu đoàn</option>
                      <option value="COMPANY">Cấp Đại đội</option>
                      <option value="PLATOON">Cấp Trung đội (Chấm điểm phân đội)</option>
                      <option value="SQUAD">Cấp Tiểu đội</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Đơn vị phụ trách trực tiếp</label>
                    <select
                      value={scopeForm.assignedUnitId}
                      onChange={(e) => setScopeForm({ ...scopeForm, assignedUnitId: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white"
                    >
                      <option value="">(Toàn quyền Trung đoàn / Không giới hạn)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          [{u.tier}] {u.name} ({u.code || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Trạng thái tài khoản</label>
                <select
                  value={scopeForm.status}
                  onChange={(e) => setScopeForm({ ...scopeForm, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                  <option value="PENDING">PENDING (Chờ xác thực)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsScopeModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-[3px] border border-zinc-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-red-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu phân quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: XÁC NHẬN XÓA TÀI KHOẢN ───────────────────────────── */}
      {isDeleteModalOpen && activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[3px] shadow-md max-w-sm w-full overflow-hidden border border-zinc-300 p-4 space-y-3.5">
            <div className="flex items-center gap-2.5 text-red-600">
              <div className="p-2 bg-red-50 rounded-[3px]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Xóa Tài khoản</h3>
                <p className="text-[11px] text-zinc-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong>@{activeUser.username}</strong> ({activeUser.name})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-[3px] border border-zinc-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

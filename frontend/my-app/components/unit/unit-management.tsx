'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MilitaryUnit, UnitTier, Soldier, UserAccount } from '@/lib/types';
import { unitService } from '@/lib/api';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Upload,
  Download,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Shield,
  ShieldAlert,
  Users,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  List,
  Filter,
  Key,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notify } from '@/lib/notify';

interface UnitManagementProps {
  units: MilitaryUnit[];
  soldiers: Soldier[];
  users?: UserAccount[];
  onAddUnit: (unit: Partial<MilitaryUnit>) => Promise<any>;
  onUpdateUnit: (unit: MilitaryUnit) => Promise<any>;
  onDeleteUnit: (unitId: string) => Promise<any>;
  onAssignLeader: (unitId: string, payload: { soldierId?: string; leaderName?: string; leaderTitle?: string }) => Promise<any>;
  onAssignScorers?: (unitId: string, scorerUserIds: string[]) => Promise<any>;
  onImportExcel: (file: File) => Promise<any>;
  onRecalculateHeadcounts: () => Promise<any>;
}

const TIER_CONFIG: Record<
  UnitTier,
  { label: string; badge: string; textAccent: string }
> = {
  REGIMENT: {
    label: 'Trung đoàn / Sư đoàn',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    textAccent: 'text-red-700 dark:text-red-400',
  },
  BATTALION: {
    label: 'Tiểu đoàn',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    textAccent: 'text-zinc-700 dark:text-zinc-300',
  },
  COMPANY: {
    label: 'Đại đội',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    textAccent: 'text-zinc-700 dark:text-zinc-300',
  },
  PLATOON: {
    label: 'Trung đội',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    textAccent: 'text-zinc-700 dark:text-zinc-300',
  },
  SQUAD: {
    label: 'Tiểu đội',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    textAccent: 'text-zinc-700 dark:text-zinc-300',
  },
};

export function UnitManagement({
  units,
  soldiers,
  users = [],
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  onAssignLeader,
  onAssignScorers,
  onImportExcel,
  onRecalculateHeadcounts,
}: UnitManagementProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [leaderStatusFilter, setLeaderStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'VACANT'>('ALL');

  // Expanded nodes state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Initialize expanded state on first load
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    units.forEach((u) => {
      initialExpanded[u.id] = true;
    });
    setExpandedNodes(initialExpanded);
  }, [units]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Assign Scorer modal states
  const [isAssignScorerModalOpen, setIsAssignScorerModalOpen] = useState(false);
  const [activeUnitForScorer, setActiveUnitForScorer] = useState<MilitaryUnit | null>(null);
  const [selectedScorerUserIds, setSelectedScorerUserIds] = useState<string[]>([]);
  const [scorerSearchTerm, setScorerSearchTerm] = useState('');
  const [isSubmittingScorer, setIsSubmittingScorer] = useState(false);

  const [activeUnit, setActiveUnit] = useState<MilitaryUnit | null>(null);
  const [parentUnitForNew, setParentUnitForNew] = useState<MilitaryUnit | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    tier: 'COMPANY' as UnitTier,
    parentId: '',
    leaderTitle: '',
    leaderName: '',
  });

  const [leaderForm, setLeaderForm] = useState({
    soldierId: '',
    leaderName: '',
    leaderTitle: '',
  });
  const [soldierSearchInModal, setSoldierSearchInModal] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle single node
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Expand all nodes
  const handleExpandAll = () => {
    const allExp: Record<string, boolean> = {};
    units.forEach((u) => (allExp[u.id] = true));
    setExpandedNodes(allExp);
  };

  // Collapse all nodes
  const handleCollapseAll = () => {
    const allCol: Record<string, boolean> = {};
    units.forEach((u) => (allCol[u.id] = false));
    setExpandedNodes(allCol);
  };

  // Unit lookup map by ID
  const unitMap = useMemo(() => {
    const map = new Map<string, MilitaryUnit>();
    units.forEach((u) => map.set(u.id, u));
    return map;
  }, [units]);

  // Filtered unit list for Table View
  const filteredUnitsList = useMemo(() => {
    return units.filter((u) => {
      const matchSearch =
        searchTerm === '' ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.code && u.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.leaderName && u.leaderName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTier = selectedTierFilter === 'ALL' || u.tier === selectedTierFilter;

      const hasLeader = !!(u.leaderName && u.leaderName.trim());
      const matchLeader =
        leaderStatusFilter === 'ALL' ||
        (leaderStatusFilter === 'ASSIGNED' && hasLeader) ||
        (leaderStatusFilter === 'VACANT' && !hasLeader);

      return matchSearch && matchTier && matchLeader;
    });
  }, [units, searchTerm, selectedTierFilter, leaderStatusFilter]);

  // Build filtered hierarchy tree for Tree View
  const unitTree = useMemo(() => {
    type TreeNode = MilitaryUnit & { children: TreeNode[]; matchesFilter?: boolean; hasMatchingDescendant?: boolean };

    const map = new Map<string, TreeNode>();
    units.forEach((u) => {
      map.set(u.id, { ...u, children: [] });
    });

    const roots: TreeNode[] = [];
    units.forEach((u) => {
      const node = map.get(u.id)!;
      if (u.parentId && map.has(u.parentId)) {
        map.get(u.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    if (!searchTerm.trim() && selectedTierFilter === 'ALL' && leaderStatusFilter === 'ALL') {
      return roots;
    }

    const term = searchTerm.toLowerCase().trim();

    const isNodeMatch = (node: TreeNode): boolean => {
      const matchSearch =
        !term ||
        node.name.toLowerCase().includes(term) ||
        Boolean(node.code && node.code.toLowerCase().includes(term)) ||
        Boolean(node.leaderName && node.leaderName.toLowerCase().includes(term));

      const matchTier = selectedTierFilter === 'ALL' || node.tier === selectedTierFilter;

      const hasLeader = !!(node.leaderName && node.leaderName.trim());
      const matchLeader =
        leaderStatusFilter === 'ALL' ||
        (leaderStatusFilter === 'ASSIGNED' && hasLeader) ||
        (leaderStatusFilter === 'VACANT' && !hasLeader);

      return Boolean(matchSearch && matchTier && matchLeader);
    };

    const filterBranch = (node: TreeNode): TreeNode | null => {
      const matches = isNodeMatch(node);
      const filteredChildren: TreeNode[] = [];

      for (const child of node.children) {
        const filteredChild = filterBranch(child);
        if (filteredChild) {
          filteredChildren.push(filteredChild);
        }
      }

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          matchesFilter: matches,
          hasMatchingDescendant: filteredChildren.length > 0,
        };
      }
      return null;
    };

    const filteredRoots: TreeNode[] = [];
    for (const root of roots) {
      const filtered = filterBranch(root);
      if (filtered) {
        filteredRoots.push(filtered);
      }
    }

    return filteredRoots;
  }, [units, searchTerm, selectedTierFilter, leaderStatusFilter]);

  // Modal open helpers
  const handleOpenAdd = (parent?: MilitaryUnit) => {
    setParentUnitForNew(parent || null);
    let defaultTier: UnitTier = 'BATTALION';
    if (parent) {
      if (parent.tier === 'REGIMENT') defaultTier = 'BATTALION';
      else if (parent.tier === 'BATTALION') defaultTier = 'COMPANY';
      else if (parent.tier === 'COMPANY') defaultTier = 'PLATOON';
      else if (parent.tier === 'PLATOON') defaultTier = 'SQUAD';
      else defaultTier = 'SQUAD';
    }

    let defaultTitle = 'Chỉ huy';
    if (defaultTier === 'BATTALION') defaultTitle = 'Tiểu đoàn trưởng';
    else if (defaultTier === 'COMPANY') defaultTitle = 'Đại đội trưởng';
    else if (defaultTier === 'PLATOON') defaultTitle = 'Trung đội trưởng';
    else if (defaultTier === 'SQUAD') defaultTitle = 'Tiểu đội trưởng';

    setFormData({
      id: '',
      name: '',
      code: '',
      tier: defaultTier,
      parentId: parent ? parent.id : '',
      leaderTitle: defaultTitle,
      leaderName: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (unit: MilitaryUnit) => {
    setActiveUnit(unit);
    setFormData({
      id: unit.id,
      name: unit.name,
      code: unit.code || '',
      tier: unit.tier,
      parentId: unit.parentId || '',
      leaderTitle: unit.leaderTitle || '',
      leaderName: unit.leaderName || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAssignLeader = (unit: MilitaryUnit) => {
    setActiveUnit(unit);
    let defaultTitle = 'Chỉ huy trưởng';
    if (unit.tier === 'REGIMENT') defaultTitle = 'Trung đoàn trưởng';
    else if (unit.tier === 'BATTALION') defaultTitle = 'Tiểu đoàn trưởng';
    else if (unit.tier === 'COMPANY') defaultTitle = 'Đại đội trưởng';
    else if (unit.tier === 'PLATOON') defaultTitle = 'Trung đội trưởng';
    else if (unit.tier === 'SQUAD') defaultTitle = 'Tiểu đội trưởng';

    setLeaderForm({
      soldierId: '',
      leaderName: unit.leaderName || '',
      leaderTitle: unit.leaderTitle || defaultTitle,
    });
    setSoldierSearchInModal('');
    setIsLeaderModalOpen(true);
  };

  const handleOpenAssignScorers = (unit: MilitaryUnit) => {
    setActiveUnitForScorer(unit);
    const currentlyAssigned = (users || [])
      .filter((u) => {
        const unitIds = u.assignedUnitIds || (u.assignedUnitId ? [u.assignedUnitId] : []);
        return unitIds.includes(unit.id);
      })
      .map((u) => u.id);
    setSelectedScorerUserIds(currentlyAssigned);
    setScorerSearchTerm('');
    setIsAssignScorerModalOpen(true);
  };

  const handleSubmitAssignScorers = async () => {
    if (!activeUnitForScorer) return;
    setIsSubmittingScorer(true);
    try {
      if (onAssignScorers) {
        await onAssignScorers(activeUnitForScorer.id, selectedScorerUserIds);
        notify.success(
          'Phân quyền thành công',
          `Đã cập nhật cán bộ chấm điểm cho đơn vị ${activeUnitForScorer.name}`
        );
      }
      setIsAssignScorerModalOpen(false);
      setActiveUnitForScorer(null);
    } catch (error: any) {
      notify.error('Lỗi phân quyền', error?.message || 'Không thể lưu phân quyền');
    } finally {
      setIsSubmittingScorer(false);
    }
  };

  const candidateScorers = useMemo(() => {
    const term = scorerSearchTerm.trim().toLowerCase();
    return (users || []).filter((u) => {
      if (u.status && u.status.toUpperCase() === 'INACTIVE') return false;
      if (!term) return true;
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.rank && u.rank.toLowerCase().includes(term)) ||
        (u.roleTitle && u.roleTitle.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term))
      );
    });
  }, [users, scorerSearchTerm]);

  // Form submits
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error('Lỗi', 'Tên đơn vị không được để trống');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddUnit({
        ...formData,
        id: formData.id.trim() || undefined,
      });
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit || !formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateUnit({
        ...activeUnit,
        ...formData,
      });
      setIsEditModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit) return;
    setIsSubmitting(true);
    try {
      await onAssignLeader(activeUnit.id, leaderForm);
      setIsLeaderModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!activeUnit) return;
    setIsSubmitting(true);
    try {
      await onDeleteUnit(activeUnit.id);
      setIsDeleteConfirmOpen(false);
      setActiveUnit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await unitService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bieu_mau_Cay_Don_Vi.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notify.success('Thành công', 'Đã tải xuống biểu mẫu Excel');
    } catch (err: any) {
      notify.error('Lỗi', err?.message || 'Không thể tải file mẫu');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await unitService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Danh_sach_Cay_Don_Vi.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notify.success('Thành công', 'Đã xuất dữ liệu cây đơn vị');
    } catch (err: any) {
      notify.error('Lỗi', err?.message || 'Không thể xuất file');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      notify.error('Lỗi', 'Vui lòng chọn file Excel để tải lên');
      return;
    }
    setIsSubmitting(true);
    try {
      await onImportExcel(importFile);
      setIsImportModalOpen(false);
      setImportFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSoldiersInModal = useMemo(() => {
    if (!soldierSearchInModal.trim()) return soldiers;
    const term = soldierSearchInModal.toLowerCase();
    return soldiers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.militaryCode && s.militaryCode.toLowerCase().includes(term)) ||
        (s.rank && s.rank.toLowerCase().includes(term))
    );
  }, [soldiers, soldierSearchInModal]);

  const renderHighlightedText = (text: string) => {
    if (!searchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const renderTreeNode = (node: MilitaryUnit & { children: any[]; matchesFilter?: boolean }, level = 0, isLastChild = false) => {
    const isExpanded = expandedNodes[node.id] ?? true;
    const hasChildren = node.children && node.children.length > 0;
    const tierInfo = TIER_CONFIG[node.tier] || {
      label: node.tier,
      badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      textAccent: 'text-zinc-700',
    };
    const hasLeader = !!(node.leaderName && node.leaderName.trim());
    const unitScorers = (users || []).filter((u) =>
      (u.assignedUnitIds || (u.assignedUnitId ? [u.assignedUnitId] : [])).includes(node.id)
    );

    return (
      <div key={node.id} className="relative select-none">
        {/* Tree horizontal branch line */}
        {level > 0 && (
          <div
            className="absolute -left-3 sm:-left-4 top-4.5 w-3 sm:w-4 h-px border-t border-dashed border-zinc-300 dark:border-zinc-700 pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div
          className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors border ${
            node.matchesFilter
              ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
              : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          {/* Cột trái: Nút mở rộng + Tên + Mã + Cấp bậc */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded transition cursor-pointer shrink-0"
                title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                aria-label={isExpanded ? 'Thu gọn nhánh' : 'Mở rộng nhánh'}
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <div className="w-5 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`font-semibold text-xs sm:text-sm tracking-tight ${
                  level === 0 ? 'text-red-700 dark:text-red-400 font-bold' : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {renderHighlightedText(node.name)}
              </span>

              {node.code && (
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                  [{renderHighlightedText(node.code)}]
                </span>
              )}

              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${tierInfo.badge}`}>
                {tierInfo.label}
              </span>
            </div>
          </div>

          {/* Cột giữa & phải: Chỉ huy + Cán bộ chấm điểm + Quân số + Menu 3 chấm */}
          <div className="flex items-center gap-3 text-xs shrink-0">
            {/* Chỉ huy */}
            {hasLeader ? (
              <span className="text-zinc-600 dark:text-zinc-400 text-xs hidden sm:inline">
                {node.leaderTitle ? `${node.leaderTitle}: ` : ''}
                <strong className="text-zinc-800 dark:text-zinc-200">{renderHighlightedText(node.leaderName || '')}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAssignLeader(node)}
                className="text-amber-700 dark:text-amber-400 hover:underline text-xs italic cursor-pointer hidden sm:inline"
              >
                + Khuyết chỉ huy
              </button>
            )}

            {/* Cán bộ chấm điểm */}
            {unitScorers.length > 0 ? (
              <button
                type="button"
                onClick={() => handleOpenAssignScorers(node)}
                className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-700 dark:hover:text-red-400 transition cursor-pointer text-xs"
                title={`Cán bộ chấm: ${unitScorers.map((s) => s.name || s.username).join(', ')}. Bấm để phân quyền.`}
              >
                <Key className="h-3 w-3 text-zinc-400" />
                <span className="hidden md:inline">
                  {unitScorers.length === 1
                    ? unitScorers[0].name || unitScorers[0].username
                    : `${unitScorers[0].name || unitScorers[0].username} (+${unitScorers.length - 1})`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAssignScorers(node)}
                className="text-zinc-400 hover:text-red-700 dark:hover:text-red-400 text-[11px] italic transition cursor-pointer hidden lg:inline"
              >
                + Phân quyền
              </button>
            )}

            {/* Quân số */}
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {node.totalSoldiers || 0} đ/c
            </span>

            {/* Overflow Menu 3 chấm */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    aria-label="Thao tác đơn vị"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
                <DropdownMenuItem onClick={() => handleOpenAssignScorers(node)} className="cursor-pointer text-xs py-1.5">
                  <Key className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                  <span>Phân quyền chấm điểm</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenAdd(node)} className="cursor-pointer text-xs py-1.5">
                  <Plus className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                  <span>Thêm đơn vị con</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenAssignLeader(node)} className="cursor-pointer text-xs py-1.5">
                  <UserCheck className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                  <span>Bổ nhiệm chỉ huy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(node)} className="cursor-pointer text-xs py-1.5">
                  <Edit2 className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                  <span>Sửa thông tin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setActiveUnit(node);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="cursor-pointer text-xs py-1.5 text-red-600 focus:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Xóa đơn vị này</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cây con thụt lề có đường nối */}
        {hasChildren && isExpanded && (
          <div className="pl-3 ml-2 sm:pl-4 sm:ml-2.5 border-l border-dashed border-zinc-200 dark:border-zinc-800 space-y-0.5 mt-0.5">
            {node.children.map((child, idx) =>
              renderTreeNode(child, level + 1, idx === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER TỐI GIẢN (MINIMALIST TOOLBAR): NÚT THAO TÁC & BỘ LỌC ─ */}
      <div className="space-y-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        {/* Nhóm nút hành động */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 order-2 sm:order-1">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              <Download className="h-3.5 w-3.5 text-zinc-500" />
              <span>Tải file mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" />
              <span>Import Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              <Upload className="h-3.5 w-3.5 text-zinc-500" />
              <span>Xuất dữ liệu</span>
            </button>

            <button
              type="button"
              onClick={onRecalculateHeadcounts}
              className="inline-flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer border border-zinc-200 dark:border-zinc-700"
              title="Tính toán lại quân số dồn từ tiểu đội lên các cấp trên"
            >
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
              <span>Đồng bộ quân số</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-2xs transition cursor-pointer order-1 sm:order-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Thêm đơn vị</span>
          </button>
        </div>

        {/* Thanh tìm kiếm, Bộ lọc & Switcher chế độ xem */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn vị, mã định danh, họ tên chỉ huy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="grid grid-cols-2 sm:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-zinc-500">
                <span className="text-[11px] shrink-0">Cấp:</span>
                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="ALL">Tất cả cấp</option>
                  <option value="REGIMENT">Trung đoàn / Sư đoàn</option>
                  <option value="BATTALION">Tiểu đoàn</option>
                  <option value="COMPANY">Đại đội</option>
                  <option value="PLATOON">Trung đội</option>
                  <option value="SQUAD">Tiểu đội</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-zinc-500">
                <span className="text-[11px] shrink-0">Chỉ huy:</span>
                <select
                  value={leaderStatusFilter}
                  onChange={(e) => setLeaderStatusFilter(e.target.value as any)}
                  className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ASSIGNED">Đã có chỉ huy</option>
                  <option value="VACANT">Khuyết chỉ huy</option>
                </select>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-zinc-900 text-red-700 dark:text-red-400 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <FolderTree className="h-3 w-3" />
                <span>Cây</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-900 text-red-700 dark:text-red-400 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <List className="h-3 w-3" />
                <span>Bảng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH: CÂY PHÂN CẤP HOẶC BẢNG DANH SÁCH ────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[3px] border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              {viewMode === 'tree' ? 'Cấu trúc phân cấp đơn vị' : 'Danh sách chi tiết'}
            </h2>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-[3px]">
              {viewMode === 'tree' ? `${units.length} đơn vị` : `${filteredUnitsList.length} / ${units.length} đơn vị`}
            </span>
          </div>

          {viewMode === 'tree' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] transition cursor-pointer"
              >
                Mở rộng tất cả
              </button>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] transition cursor-pointer"
              >
                Thu gọn tất cả
              </button>
            </div>
          )}
        </div>

        {units.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3px]">
            <Building2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Chưa có dữ liệu đơn vị trong hệ thống</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Bạn có thể tải file mẫu Excel và Import toàn bộ cấu trúc đơn vị hoặc tạo thủ công.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
              >
                Tải file mẫu Excel
              </button>
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition cursor-pointer"
              >
                Thêm đơn vị đầu tiên
              </button>
            </div>
          </div>
        ) : viewMode === 'tree' ? (
          unitTree.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              <Search className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              Không tìm thấy đơn vị nào khớp với điều kiện tìm kiếm.
            </div>
          ) : (
            <div className="space-y-1">
              {unitTree.map((rootNode) => renderTreeNode(rootNode, 0))}
            </div>
          )
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 min-w-[760px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-zinc-50 dark:bg-zinc-850 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">Tên đơn vị</th>
                  <th className="px-3 py-3">Mã Code</th>
                  <th className="px-3 py-3">Cấp bậc</th>
                  <th className="px-3 py-3">Đơn vị trực thuộc</th>
                  <th className="px-3 py-3">Cán bộ chỉ huy</th>
                  <th className="px-3 py-3">Cán bộ chấm điểm</th>
                  <th className="px-3 py-3 text-center">Quân số</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredUnitsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-400">
                      Không có đơn vị nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredUnitsList.map((unit) => {
                    const tierInfo = TIER_CONFIG[unit.tier] || {
                      label: unit.tier,
                      badge: 'bg-zinc-100 text-zinc-800',
                    };
                    const parentUnit = unit.parentId ? unitMap.get(unit.parentId) : null;
                    const hasLeader = !!(unit.leaderName && unit.leaderName.trim());
                    const unitScorers = (users || []).filter((u) =>
                      (u.assignedUnitIds || (u.assignedUnitId ? [u.assignedUnitId] : [])).includes(unit.id)
                    );

                    return (
                      <tr
                        key={unit.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap sticky left-0 bg-white dark:bg-zinc-900 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span>{renderHighlightedText(unit.name)}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {unit.code ? (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                              {renderHighlightedText(unit.code)}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">-</span>
                          )}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${tierInfo.badge}`}>
                            {tierInfo.label}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {parentUnit ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">{parentUnit.name}</span>
                              <span className="text-[10px] text-zinc-400">({parentUnit.code || parentUnit.id})</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">Cấp cao nhất</span>
                          )}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {hasLeader ? (
                            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                              <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-medium">
                                {unit.leaderTitle ? `${unit.leaderTitle}: ` : ''}
                                <strong>{renderHighlightedText(unit.leaderName || '')}</strong>
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignLeader(unit)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 cursor-pointer"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              Bổ nhiệm ngay
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap">
                          {unitScorers.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignScorers(unit)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer text-[11px]"
                              title={`Cán bộ chấm điểm: ${unitScorers.map((s) => (s.rank ? s.rank + ' ' : '') + (s.name || s.username)).join(', ')}. Bấm để phân quyền.`}
                            >
                              <Key className="h-3 w-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="font-medium">
                                {unitScorers.length === 1
                                  ? `${unitScorers[0].rank ? unitScorers[0].rank + ' ' : ''}${unitScorers[0].name || unitScorers[0].username}`
                                  : `${unitScorers[0].name || unitScorers[0].username} (+${unitScorers.length - 1})`}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignScorers(unit)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-indigo-700 bg-zinc-50 hover:bg-indigo-50 dark:bg-zinc-800/60 dark:hover:bg-indigo-950/40 px-2 py-0.5 rounded border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-300 transition cursor-pointer"
                              title="Chưa có cán bộ phụ trách chấm điểm. Bấm để phân quyền."
                            >
                              <Key className="h-3 w-3 text-zinc-400" />
                              + Chưa phân quyền
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className="font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1"
                            title={`Quân số biên chế hiện tại: ${unit.totalSoldiers || 0} đồng chí`}
                          >
                            <Users className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span>{unit.totalSoldiers || 0} đồng chí</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenAssignScorers(unit)}
                              title="Phân quyền cán bộ chấm điểm"
                              aria-label={`Phân quyền cán bộ chấm điểm cho ${unit.name}`}
                              className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 rounded transition cursor-pointer"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAdd(unit)}
                              title="Thêm đơn vị trực thuộc"
                              className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAssignLeader(unit)}
                              title="Bổ nhiệm cán bộ"
                              className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-amber-700 hover:bg-amber-50 rounded transition cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(unit)}
                              title="Sửa"
                              className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveUnit(unit);
                                setIsDeleteConfirmOpen(true);
                              }}
                              title="Xóa"
                              className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
        )}
      </div>

      {/* ── MODAL: THÊM ĐƠN VỊ ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-lg w-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <div className="px-4 py-3 bg-[#b91c1c] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  {parentUnitForNew ? `Thêm đơn vị con cho: ${parentUnitForNew.name}` : 'Thêm mới Đơn vị Quân đội'}
                </h3>
                {parentUnitForNew && (
                  <p className="text-[10px] text-white/80 mt-0.5 font-mono">
                    Đơn vị cấp trên: {parentUnitForNew.name} ({parentUnitForNew.code || parentUnitForNew.id})
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-4 space-y-3.5 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tên đơn vị <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đại đội 1, Trung đội 2, Tiểu đội 3..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Mã đơn vị</label>
                  <input
                    type="text"
                    placeholder="VD: C1, B2, A1..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Mã định danh (ID tuỳ chọn)</label>
                  <input
                    type="text"
                    placeholder="Tự sinh nếu để trống"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-[#b91c1c] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cấp bậc đơn vị <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as UnitTier })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="REGIMENT">Trung đoàn / Sư đoàn</option>
                    <option value="BATTALION">Tiểu đoàn / Khối</option>
                    <option value="COMPANY">Đại đội</option>
                    <option value="PLATOON">Trung đội</option>
                    <option value="SQUAD">Tiểu đội</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Đơn vị cấp trên</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">(Không có - Cấp cao nhất)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code || u.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Chức danh chỉ huy</label>
                  <input
                    type="text"
                    placeholder="VD: Trung đội trưởng..."
                    value={formData.leaderTitle}
                    onChange={(e) => setFormData({ ...formData, leaderTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Họ tên cán bộ chỉ huy</label>
                  <input
                    type="text"
                    placeholder="VD: Đại úy NGUYỄN VĂN A"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] border border-zinc-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#b91c1c] hover:bg-red-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo đơn vị'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SỬA ĐƠN VỊ ────────────────────────────────────────── */}
      {isEditModalOpen && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-lg w-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="h-3.5 w-3.5 text-zinc-300" />
                Chỉnh sửa: {activeUnit.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-4 space-y-3.5 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tên đơn vị <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Mã đơn vị</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-[#b91c1c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Cấp bậc</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as UnitTier })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="REGIMENT">Trung đoàn / Sư đoàn</option>
                    <option value="BATTALION">Tiểu đoàn / Khối</option>
                    <option value="COMPANY">Đại đội</option>
                    <option value="PLATOON">Trung đội</option>
                    <option value="SQUAD">Tiểu đội</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Đơn vị cấp trên</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">(Không có - Cấp cao nhất)</option>
                    {units
                      .filter((u) => u.id !== activeUnit.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Chức danh chỉ huy</label>
                  <input
                    type="text"
                    value={formData.leaderTitle}
                    onChange={(e) => setFormData({ ...formData, leaderTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Họ tên chỉ huy</label>
                  <input
                    type="text"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] border border-zinc-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-900 rounded-[3px] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BỔ NHIỆM CÁN BỘ CHỈ HUY / TIỂU ĐỘI TRƯỞNG ────────── */}
      {isLeaderModalOpen && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-md w-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                  Bổ nhiệm Cán bộ: {activeUnit.name}
                </h3>
              </div>
              <button
                onClick={() => setIsLeaderModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLeader} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Chọn Quân nhân trong danh sách
                </label>

                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Gõ tên hoặc mã quân nhân để tìm nhanh..."
                    value={soldierSearchInModal}
                    onChange={(e) => setSoldierSearchInModal(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <select
                  value={leaderForm.soldierId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const soldier = soldiers.find((s) => s.id === sId);
                    if (soldier) {
                      setLeaderForm({
                        ...leaderForm,
                        soldierId: sId,
                        leaderName: `${soldier.rank ? soldier.rank + ' ' : ''}${soldier.name}`,
                      });
                    } else {
                      setLeaderForm({ ...leaderForm, soldierId: sId });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 max-h-36"
                >
                  <option value="">-- Hoặc tự điền họ tên phía dưới --</option>
                  {filteredSoldiersInModal.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rank || 'Chiến sĩ'} {s.name} ({s.militaryCode || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Chức danh chỉ huy <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tiểu đội trưởng, Trung đội trưởng, Đại đội trưởng..."
                  value={leaderForm.leaderTitle}
                  onChange={(e) => setLeaderForm({ ...leaderForm, leaderTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Họ và tên cán bộ chỉ huy <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trung sĩ TRẦN VĂN BÌNH"
                  value={leaderForm.leaderName}
                  onChange={(e) => setLeaderForm({ ...leaderForm, leaderName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-[3px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] border border-zinc-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#b91c1c] hover:bg-red-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang bổ nhiệm...' : 'Xác nhận bổ nhiệm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: IMPORT EXCEL CÂY ĐƠN VỊ ──────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-md w-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                Import Cây Đơn vị từ Excel
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-4 space-y-3.5">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Hệ thống hỗ trợ nạp cấu trúc phân cấp từ file Excel (.xlsx / .csv). Các đơn vị đã có sẽ được cập nhật, đơn vị mới sẽ tự động nạp vào cây.
              </p>

              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-[3px] p-5 text-center hover:border-zinc-500 transition bg-zinc-50 dark:bg-zinc-800/40">
                <Upload className="h-6 w-6 text-zinc-400 mx-auto mb-1.5" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImportFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 rounded-[3px] transition cursor-pointer shadow-2xs"
                >
                  Chọn file từ máy tính
                </button>
                {importFile ? (
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-2 font-mono">
                    ✓ Đã chọn: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-400 mt-2">Định dạng hỗ trợ: .xlsx, .xls, .csv</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Tải file mẫu
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] border border-zinc-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!importFile || isSubmitting}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Đang nạp...' : 'Bắt đầu Import'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: XÁC NHẬN XÓA ĐƠN VỊ ─────────────────────────────── */}
      {isDeleteConfirmOpen && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-sm w-full overflow-hidden border border-zinc-300 dark:border-zinc-700 p-4 space-y-3.5">
            <div className="flex items-center gap-2.5 text-red-600">
              <div className="p-2 bg-red-50 dark:bg-red-950/60 rounded-[3px]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Xác nhận xóa Đơn vị</h3>
                <p className="text-[11px] text-zinc-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa đơn vị <strong>{activeUnit.name}</strong> (Cấp: {TIER_CONFIG[activeUnit.tier]?.label || activeUnit.tier}, Mã: {activeUnit.code || activeUnit.id})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[3px] border border-zinc-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUnit}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-[3px] shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PHÂN QUYỀN CÁN BỘ CHẤM ĐIỂM (ASSIGN SCORER) ────────── */}
      {isAssignScorerModalOpen && activeUnitForScorer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-[3px] shadow-md max-w-lg w-full overflow-hidden border border-zinc-300 dark:border-zinc-700 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-4 py-3 bg-zinc-800 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  Phân quyền Chấm điểm: {activeUnitForScorer.name}
                </h3>
                <p className="text-[10px] text-white/80 mt-0.5 font-mono">
                  Cấp: {TIER_CONFIG[activeUnitForScorer.tier]?.label || activeUnitForScorer.tier} | Mã: {activeUnitForScorer.code || activeUnitForScorer.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignScorerModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
                aria-label="Đóng modal"
              >
                ✕
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Banner hướng dẫn chính sách */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                Cán bộ được cấp quyền sẽ có thẩm quyền <strong>nhập điểm thi đua hằng ngày</strong>, xem bảng tổng hợp phân đội và <strong>xử lý khiếu nại</strong> từ quân nhân thuộc đơn vị này.
              </div>

              {/* Ô tìm kiếm cán bộ */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cán bộ theo tên, cấp bậc, username, SĐT..."
                  value={scorerSearchTerm}
                  onChange={(e) => setScorerSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Danh sách cán bộ ứng viên */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <span>Danh sách cán bộ có thể phân quyền:</span>
                  <span>Đã chọn: <strong className="text-indigo-600 dark:text-indigo-400">{selectedScorerUserIds.length}</strong></span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {candidateScorers.length === 0 ? (
                    <div className="text-center py-6 text-xs text-zinc-400">
                      Không tìm thấy cán bộ phù hợp với từ khóa tìm kiếm.
                    </div>
                  ) : (
                    candidateScorers.map((user) => {
                      const isChecked = selectedScorerUserIds.includes(user.id);
                      const assignedIds = user.assignedUnitIds || (user.assignedUnitId ? [user.assignedUnitId] : []);
                      const otherAssignedUnits = units.filter(
                        (u) => assignedIds.includes(u.id) && u.id !== activeUnitForScorer.id
                      );

                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedScorerUserIds((prev) =>
                              isChecked ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition ${
                            isChecked
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                            />
                            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs shrink-0 text-zinc-700 dark:text-zinc-200">
                              {user.name ? user.name.charAt(0) : user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                  {user.rank ? `${user.rank} ` : ''}{user.name || user.username}
                                </span>
                                <span
                                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                                    user.role === 'ADMIN'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                      : user.role === 'SCORER'
                                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                                  }`}
                                >
                                  {user.roleTitle || user.role}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-zinc-400">
                                @{user.username} {user.phone ? `• ${user.phone}` : ''}
                              </div>
                            </div>
                          </div>

                          {otherAssignedUnits.length > 0 && (
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 text-right ml-2">
                              <span
                                className="inline-block max-w-[140px] truncate bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
                                title={otherAssignedUnits.map((u) => u.name).join(', ')}
                              >
                                Đang chấm: {otherAssignedUnits.map((u) => u.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedScorerUserIds([])}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignScorerModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSubmittingScorer}
                  onClick={handleSubmitAssignScorers}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingScorer ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu phân quyền</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

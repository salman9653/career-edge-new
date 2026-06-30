"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { DataTableToolbar } from "./data-table-toolbar";
import { ExportDialog } from "./export-dialog";
import { FilterSheet, FilterConfig } from "./filter-sheet";
import { DataTableContent } from "./data-table-content";
import { DataTableCards } from "./data-table-cards";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUIStore } from "@/store/useUIStore";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface TabItem {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  entityName?: string;
  filterConfigs?: FilterConfig[];
  primaryAction?: { label: string; onClick: () => void };
  onRowClick?: (row: T) => void;
  renderCard?: (
    row: T,
    isSelected: boolean,
    toggleSelect: (e: React.MouseEvent) => void,
    selectMode: boolean
  ) => React.ReactNode;
  onDeleteSelected?: (ids: string[]) => void | boolean | Promise<void | boolean>;
  // Server-side search & Lazy loading props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  tabs?: TabItem[];
}

const DEFAULT_OPTIONS: Record<string, string[]> = {
  status: ["Active", "Inactive", "Banned"],
  subscription: ["Free", "Pro", "Pro+", "Enterprise"],
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey = "name",
  entityName = "Record",
  filterConfigs,
  primaryAction,
  onRowClick,
  renderCard,
  onDeleteSelected,
  searchQuery: externalSearchQuery,
  onSearchChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  tabs,
}: DataTableProps<T>) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { viewMode } = useUIStore();
  const activeViewMode = isMobile ? "card" : viewMode;

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const isServerSearch = onSearchChange !== undefined;
  const searchQuery = isServerSearch ? (externalSearchQuery ?? "") : localSearchQuery;
  const setSearchQuery = isServerSearch ? onSearchChange : setLocalSearchQuery;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Record<string, string[]>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Setup IntersectionObserver for Lazy Loading
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  const handleDeleteSelected = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteSelected = async () => {
    setIsDeletingSelected(true);
    try {
      if (onDeleteSelected) {
        const result = await onDeleteSelected(Array.from(selectedIds));
        if (result === false) {
          // If result is explicitly false, delete failed - do not clear selection
          return;
        }
      }
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected items");
    } finally {
      setIsDeletingSelected(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const computedFilterConfigs = useMemo(() => {
    if (filterConfigs && filterConfigs.length > 0) return filterConfigs;
    const configs: FilterConfig[] = [];
    const excludedKeys = ["sNo", "id", "_id", "userId", "email", "websiteUrl", "image", "logo", "date", "since", "memberSince"];
    columns.forEach((col) => {
      const key = col.key;
      if (excludedKeys.includes(key)) return;
      if (key.toLowerCase().includes("name") || key.toLowerCase().includes("email") || key.toLowerCase().includes("url") || key.toLowerCase().includes("desc")) return;
      if (data.some((row) => typeof row[key] === "number")) return;

      let options = DEFAULT_OPTIONS[key];
      if (!options) {
        const uniqueValues = new Set<string>();
        data.forEach((row) => {
          const val = row[key];
          if (val !== undefined && val !== null && val !== "") uniqueValues.add(String(val));
        });
        options = Array.from(uniqueValues).sort();
      }

      if (options.length >= 2 && options.length <= 15) {
        configs.push({
          key,
          label: col.label === "Subscription" ? "Subscription Plan" : col.label,
          options,
        });
      }
    });
    return configs;
  }, [data, columns, filterConfigs]);

  const processedData = useMemo(() => {
    let result = [...data];
    if (searchQuery.trim() && !isServerSearch) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r[searchKey] ? String(r[searchKey]).toLowerCase().includes(q) : false);
    }
    Object.entries(appliedFilters).forEach(([key, vals]) => {
      if (vals.length > 0) {
        const lowerVals = vals.map((v) => v.toLowerCase());
        result = result.filter((r) => {
          const val = r[key];
          if (val === undefined || val === null) return false;
          if (Array.isArray(val)) {
            return val.some((v) => lowerVals.includes(String(v).toLowerCase()));
          }
          return lowerVals.includes(String(val).toLowerCase());
        });
      }
    });
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey]; const valB = b[sortKey];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: "base" });
        return sortOrder === "asc" ? comp : -comp;
      });
    }
    return result;
  }, [data, searchQuery, searchKey, appliedFilters, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.size === processedData.length && processedData.length > 0) setSelectedIds(new Set());
    else {
      const allIds = processedData.map((row, index) => String(row.id || row._id || row.userId || index));
      setSelectedIds(new Set(allIds));
    }
  };

  const handleConfirmExport = () => {
    setIsExportDialogOpen(false);
    const exportList = selectMode && selectedIds.size > 0
      ? processedData.filter((r) => selectedIds.has(r.id || r._id || r.userId || ""))
      : processedData;
    const headers = columns.map((col) => col.label).join(",");
    const rows = exportList.map((row) => columns.map((col) => `"${String(row[col.key] ?? "").replace(/"/g, '""')}"`).join(","));
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")));
    link.setAttribute("download", `${entityName.toLowerCase()}-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const sortableColumns = useMemo(() => {
    return columns.filter((col) => col.sortable).map((col) => ({ key: col.key, label: col.label }));
  }, [columns]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-4">
      <DataTableToolbar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder={searchPlaceholder}
        selectMode={selectMode} setSelectMode={setSelectMode} selectedCount={selectedIds.size}
        onClearSelection={() => { setSelectedIds(new Set()); setSelectMode(false); }}
        onExportCSV={() => setIsExportDialogOpen(true)}
        onFilterClick={() => { setTempFilters(appliedFilters); setIsFilterSheetOpen(true); }}
        primaryAction={primaryAction}
        appliedFiltersCount={Object.values(appliedFilters).reduce((acc, curr) => acc + curr.length, 0)}
        onClearFilters={() => { setTempFilters({}); setAppliedFilters({}); }}
        viewMode={activeViewMode}
        sortableColumns={sortableColumns}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        onDeleteSelected={onDeleteSelected ? handleDeleteSelected : undefined}
        tabs={tabs}
      />
      {activeViewMode === "list" ? (
        <DataTableContent
          columns={columns} processedData={processedData} selectMode={selectMode}
          selectedIds={selectedIds} toggleSelectAll={toggleSelectAll} toggleSelectRow={toggleSelectRow}
          handleSort={handleSort} onRowClick={onRowClick}
          loaderRef={hasMore ? loaderRef : undefined}
        />
      ) : (
        <DataTableCards
          columns={columns} processedData={processedData} selectMode={selectMode}
          selectedIds={selectedIds} toggleSelectRow={toggleSelectRow}
          onRowClick={onRowClick} renderCard={renderCard}
          loaderRef={hasMore ? loaderRef : undefined}
        />
      )}
      <ExportDialog
        isOpen={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}
        entityName={entityName} selectMode={selectMode} selectedCount={selectedIds.size}
        onConfirm={handleConfirmExport}
      />
      <FilterSheet
        isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)}
        filterConfigs={computedFilterConfigs} tempFilters={tempFilters}
        onToggleOption={(key, opt) => {
          const cur = tempFilters[key] || [];
          setTempFilters({ ...tempFilters, [key]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] });
        }}
        onClearFilters={() => { setTempFilters({}); setAppliedFilters({}); setIsFilterSheetOpen(false); }}
        onApplyFilters={() => { setAppliedFilters(tempFilters); setIsFilterSheetOpen(false); }}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteSelected}
        title={`Delete Selected ${entityName}s`}
        description={`Are you sure you want to delete ${selectedIds.size} selected ${entityName.toLowerCase()}${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingSelected}
      />
    </div>
  );
}

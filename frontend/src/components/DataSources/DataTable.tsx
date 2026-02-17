// frontend/src/components/DataSources/DataTable.tsx
import React, { useState, useMemo } from 'react';

export interface DataTableProps {
  data: any[];
  columns?: string[];
  pageSize?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  onRowClick?: (row: any, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  pageSize = 25,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Get columns from data if not provided
  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        tableColumns.some(column =>
          String(row[column]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Handle numbers
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortDirection === 'asc'
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        // Handle strings
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, columnFilters, tableColumns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = processedData.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle column filter
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
    setSortColumn(null);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-table-empty">
        <div className="empty-icon">📭</div>
        <h3>{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className="data-table">
      {/* Header Controls */}
      <div className="data-table-header">
        <div className="header-left">
          <h3 className="table-title">Data Table</h3>
          <span className="table-count">
            {processedData.length.toLocaleString()} of {data.length.toLocaleString()} rows
          </span>
        </div>

        <div className="header-right">
          {showSearch && (
            <div className="search-box">
              <input
                type="search"
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          )}

          {(searchTerm || Object.keys(columnFilters).length > 0) && (
            <button className="btn-reset-filters" onClick={resetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th className="row-number">#</th>
              {tableColumns.map((column) => (
                <th key={column}>
                  <div className="column-header">
                    <button
                      className="sort-button"
                      onClick={() => handleSort(column)}
                    >
                      <span className="column-name">{column}</span>
                      {sortColumn === column && (
                        <span className="sort-icon">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </div>
                  {showFilters && (
                    <div className="column-filter">
                      <input
                        type="text"
                        placeholder={`Filter ${column}...`}
                        value={columnFilters[column] || ''}
                        onChange={(e) => handleColumnFilter(column, e.target.value)}
                        className="filter-input"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                onClick={() => onRowClick?.(row, startIndex + rowIndex)}
                className={onRowClick ? 'clickable' : ''}
              >
                <td className="row-number">{startIndex + rowIndex + 1}</td>
                {tableColumns.map((column) => (
                  <td key={column}>
                    {row[column] !== null && row[column] !== undefined
                      ? String(row[column])
                      : <span className="null-value">—</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="data-table-footer">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, processedData.length)} of{' '}
            {processedData.length.toLocaleString()}
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>

          <div className="page-size-selector">
            <label>
              Rows per page:
              <select
                value={pageSize}
                onChange={(e) => {
                  setCurrentPage(1);
                  // Note: pageSize is a prop, so parent should handle this
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

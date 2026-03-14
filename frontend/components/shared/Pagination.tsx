interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-6 py-3 bg-white rounded-2xl font-bold premium-shadow disabled:opacity-50 transition-all hover:bg-gray-50"
      >
        Previous
      </button>
      <span className="font-bold text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-6 py-3 bg-white rounded-2xl font-bold premium-shadow disabled:opacity-50 transition-all hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}

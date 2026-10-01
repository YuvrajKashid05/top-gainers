import Button from "@/components/ui/Button.jsx";
export default function Pagination({ page, totalPages, update }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button disabled={page <= 1} onClick={() => update("page", page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-slate-500">
        Page {page} / {totalPages}
      </span>
      <Button
        disabled={page >= totalPages}
        onClick={() => update("page", page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

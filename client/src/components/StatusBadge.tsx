export const LOT_STATUS_LABELS: Record<string, string> = {
  COMING_SOON: 'Coming soon',
  SAMPLE_AVAILABLE: 'Sample available',
  AVAILABLE: 'Available',
  LIMITED_QUANTITY: 'Limited quantity',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
};

const STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: 'bg-fc-sage text-fc-paper',
  LIMITED_QUANTITY: 'bg-fc-warning-soft text-[#8c5e10]',
  SAMPLE_AVAILABLE: 'bg-fc-caramel text-fc-paper',
  COMING_SOON: 'bg-transparent text-fc-ink-2 border border-fc-border-strong',
  RESERVED: 'bg-fc-peach text-fc-brick',
  SOLD: 'bg-fc-paper-2 text-fc-ink-3 border border-fc-line',
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = STATUS_CLASSES[status] ?? STATUS_CLASSES.COMING_SOON;
  return (
    <span
      className={`inline-flex items-center rounded-fc-pill px-2.5 py-1 text-[11px] font-medium font-sans ${classes}`}
    >
      {LOT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

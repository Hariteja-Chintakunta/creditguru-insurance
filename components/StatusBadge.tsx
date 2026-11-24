const GREEN = ["Purchased", "Active", "Approved", "Successful"];
const AMBER = ["Pending", "Under Review", "Renewal Due", "Documents Pending"];
const RED = ["Lost", "Expired", "Lapsed"];
const TEAL = ["Quote Sent", "Documents Received", "Contacted", "Interested", "Buy Policy"];

export default function StatusBadge({ status }: { status: string }) {
  let classes = "bg-blue-100 text-blue-800"; // default
  if (GREEN.includes(status)) classes = "bg-green-100 text-green-800";
  else if (AMBER.includes(status)) classes = "bg-amber-100 text-amber-800";
  else if (RED.includes(status)) classes = "bg-red-100 text-red-800";
  else if (TEAL.includes(status)) classes = "bg-teal-100 text-teal-800";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

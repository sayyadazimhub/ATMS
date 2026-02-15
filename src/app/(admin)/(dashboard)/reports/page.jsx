export default function AdminReports() {
  return (
    <>
      <h1 className="text-xl font-bold mb-4">
        System Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Report title="Trader Performance" />
        <Report title="Sales Summary" />
        <Report title="Profit Analysis" />
        <Report title="System Usage" />

      </div>
    </>
  );
}

function Report({ title }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      {title}
    </div>
  );
}

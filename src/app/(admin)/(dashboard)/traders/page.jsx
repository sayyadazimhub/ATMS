export default function Traders() {
  return (
    <>
      <Header title="Traders" />

      <Table
        columns={["Name", "Email", "Phone", "Status"]}
      />
    </>
  );
}

function Header({ title }) {
  return (
    <div className="flex justify-between mb-4">

      <h1 className="text-xl font-bold">{title}</h1>

      <button className="bg-blue-700 text-white px-3 py-1 rounded">
        Add Trader
      </button>

    </div>
  );
}

function Table({ columns }) {
  return (
    <div className="bg-white rounded shadow">

      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th key={c} className="p-2 text-left">
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="border-t text-center">
            <td colSpan={columns.length} className="p-4">
              No Traders Found
            </td>
          </tr>
        </tbody>

      </table>

    </div>
  );
}

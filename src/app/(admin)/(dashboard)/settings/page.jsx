export default function Settings() {
  return (
    <>
      <h1 className="text-xl font-bold mb-4">
        System Settings
      </h1>

      <div className="bg-white p-4 rounded shadow space-y-3">

        <div>
          <label className="font-semibold block">
            Backup Frequency
          </label>

          <select className="border p-2 w-full">
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </div>

        <div>
          <label className="font-semibold block">
            System Mode
          </label>

          <select className="border p-2 w-full">
            <option>Live</option>
            <option>Maintenance</option>
          </select>
        </div>

        <button className="bg-blue-700 text-white px-4 py-2 rounded">
          Save Settings
        </button>

      </div>
    </>
  );
}

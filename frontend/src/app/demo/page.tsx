export default function Page() {
  return (
    <div className="grid grid-cols-3 gap-4 h-screen">
      <div className="col-span-2 bg-gray-200"></div>
      <div className="grid grid-rows-2 gap-4">
        <div className="bg-gray-400"></div>
        <div className="bg-gray-600"></div>
      </div>
    </div>
  );
}

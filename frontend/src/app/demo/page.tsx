import Chat from "@/components/DemoChat";
import StreamingTerminal from "@/components/StreamingTerminal";


export default function Page() {
  return (
    <div className="grid grid-cols-3 gap-0 h-screen">
      <div className="col-span-2 bg-gray-200 border-r-4 border-black">
		<Chat />
	</div>
      <div className="grid grid-rows-2 gap-0">
        <div className="bg-gray-400 border-b-4 border-black"></div>
        <div className="bg-gray-600">
			<StreamingTerminal />
		</div>
      </div>
    </div>
  );
}

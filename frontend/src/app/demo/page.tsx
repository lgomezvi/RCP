import Chat from "@/components/DemoChat";
import StreamingTerminal from "@/components/StreamingTerminal";


export default function Page() {

// NOTE: responsiveness is optional for prototyping, do not worry about responsiveness for the demo for the time being.
	

  return (
    <div className="grid grid-cols-3 gap-0 h-screen">
      <div className="col-span-2 bg-gray-200 border-r-4 border-black">
		<Chat />
	</div>
      <div className="grid grid-rows-2 gap-0">
        <div className="bg-gray-400 border-b-4 border-black"></div>
        <div className="flex justify-center items-center bg-gray-600 flex-cols">
			<StreamingTerminal />
			<div className="absolute bottom-0 bg-blue-700">FOOTER</div>
		</div>
      </div>
    </div>
  );
}

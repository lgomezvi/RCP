//import Chat from "@/components/DemoChat";
import Conversation from "@/components/Convo";
import StreamingTerminal from "@/components/StreamingTerminal";
import ArmView from "@/components/arm/ArmView";


export default function Page() {

// NOTE: responsiveness is optional for prototyping, do not worry about responsiveness for the demo for the time being.
	

  return (
    <div className="grid grid-cols-3 gap-0 h-screen">
      <div className="col-span-2 bg-gray-200 border-r-4 border-black">
{/*		<Chat /> */}
				<Conversation />
	</div>
      <div className="grid grid-rows-2 gap-0">
        <div className="bg-gray-400 border-b-4 border-black">
		<ArmView />
	</div>
        <div className="flex justify-center items-center bg-gray-600 flex-cols">
			<StreamingTerminal />
		</div>
      </div>
    </div>
  );
}

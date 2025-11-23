//import Chat from "@/components/DemoChat";
import Conversation from "@/components/Convo";
import StreamingTerminal from "@/components/StreamingTerminal";
import ArmView from "@/components/arm/ArmView";


export default function Page() {
  return (
    <div className="grid grid-cols-3 gap-0 h-screen bg-background">
      <div className="col-span-2 border-r-4 border-input">
{/*		<Chat /> */}
				<Conversation />
	</div>
      <div className="grid grid-rows-2 gap-0">
        <div className="border-b-4 bg-card border-input">
		<ArmView />
	</div>
        <div className="flex justify-center items-center bg-card flex-cols">
			<StreamingTerminal />
		</div>
      </div>
    </div>
  );
}

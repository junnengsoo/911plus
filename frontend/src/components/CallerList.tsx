import Header from "@/components/Header"; // Adjust the import path as needed
import { ScrollArea } from "@/components/ui/scroll-area"; // Adjust the import path as needed
import { Separator } from "@/components/ui/separator"; // Adjust the import path as needed
import CallerListCard from "@/components/CallerListCard"; // Adjust the import path as needed
import { Caller } from "@/components/CallerTypes"; // Import the API function

interface CallerListProps {
  onCallerClick: (caller: Caller) => void;
  selectedCallers: (Caller | null)[];
  callers: Caller[];
}

export default function CallerList({ onCallerClick, selectedCallers, callers}: CallerListProps) {

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="p-4">
          {callers.map((caller) => (
            <div key={caller.id} onClick={() => onCallerClick(caller)}>
              <CallerListCard
                caller={caller}
                isSelected={selectedCallers.some(selected => selected?.id === caller.id)}
              />
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

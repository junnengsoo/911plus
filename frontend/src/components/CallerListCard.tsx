import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Adjust the import path as needed
import { Caller } from "@/components/CallerTypes";

interface CallerListCardProps {
  caller: Caller;
  isSelected: boolean;
}

export default function CallerListCard({
  caller,
  isSelected,
}: CallerListCardProps) {
  // Determine the border color based on caller status
  const borderColor = caller.isOperatorOnline
    ? "border-green-500"
    : isSelected
    ? "border-black"
    : "border-transparent";

  return (
    <Card className={`h-full flex flex-row border-2 ${borderColor}`}>
      <CardHeader className="bg-white p-2 flex flex-col w-full">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-left text-xl card-field">
            {caller.name}
          </CardTitle>
          <p className="text-red-600 card-field">{caller.condition}</p>
        </div>
        <CardDescription className="flex justify-between items-center text-lg w-full mt-2">
          <div className="flex items-center space-x-2">
            {caller.isLiveCall && <span className="red-dot"></span>}
            <span className="text-sm text-gray-500">{caller.callTime}</span>
          </div>
          <div className="flex items-center card-field">
            <span>{caller.address}</span>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

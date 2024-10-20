import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Adjust the import path as needed
import { ScrollArea } from "@/components/ui/scroll-area"; // Adjust the import path as needed
import { PhoneForwarded, Home, PhoneMissed, Pause, Play } from "lucide-react";
import { Caller } from '@/components/CallerTypes';
import { useRef, useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import "../App.css";


interface CallerCardProps {
  caller: Caller
  onNameChange: (newName: string) => void;
  onConditionChange: (newCondition: string) => void;
  onAddressChange: (newAddress: string) => void;
}

export default function CallerCard({
  caller,
  onNameChange,
  onAddressChange,
  onConditionChange,
}: CallerCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOnHold, setOnHold] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const conditions = [
    "Convulsion/Seizure", "Breathing Problem", "Traumatic Injury", "Cardiac Arrest/Death", 
    "Unconscious/Fainting", "Unknown"
  ];

  useEffect(() => {
    // Check if caller.messages includes the specific string
    if (caller.messages.length > 0) {
      const lastMessage = JSON.stringify(caller.messages[caller.messages.length - 1].text).toLowerCase();
      console.log(typeof lastMessage);
      
      // Ensure the text property is a string
      if (typeof lastMessage === "string") {
        if (lastMessage.includes("yes") && lastMessage.includes("hurry up")) {
          console.log("glow");
          setIsGlowing(true); // Start glowing
        } 
      } 
    }
  }, [caller.messages]); // Run effect whenever caller.messages changes

  const scrollToBottom = () => {
    const scroll = scrollContainerRef.current;
    if (scroll) {
      // +1 accounts for possible rounding issues with clientHeight
      const isScrolledToBottom = scroll.scrollHeight - scroll.clientHeight <= scroll.scrollTop + 1;
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [caller.messages]);

  const handlePause = () => {
    console.log('Put call on hold');
    setOnHold(true);
    caller.isOperatorOnline = false;
  };

  const resetPing = () => {
    if (isGlowing) {
      setIsGlowing(false);
    }
  }

  const handlePlay = () => {
    console.log('Reconnect to call');
    setOnHold(false);
    caller.isOperatorOnline = true;
    resetPing();
  };

  const handleDropCallClick = () => {
    console.log('Call dropped');
    caller.isOperatorOnline = false;
    caller.isLiveCall = false;
  };

  const handle1777Click = () => {
    console.log('Recommend to 1777');
    caller.isOperatorOnline = false;
    caller.isLiveCall = false;
  };

  const handleFeedback = () => {
    console.log('Revert to Feedback');
  };

  const handleGeneralEnquiries = () => {
    console.log('Revert to General Enquiries');
  };

  const handleFireHazard = () => {
    console.log('Revert to Fire Hazard Reporting');
  };

  // Apply conditional styling for border color
  const borderColor = caller.isOperatorOnline ? 'border-green-500' : 'border-grey-200';

  return (
    <Card className={`h-full flex flex-col border-2 ${borderColor}`}>
      <CardHeader className="bg-white p-2 flex flex-row">
        <div className="grow">
          <CardTitle className="text-left text-2xl">
            <input
              className="border-none input-field"
              type="text"
              value={caller.name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </CardTitle>
          <CardDescription className="flex items-center text-lg space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="text-red-600 input-field">{caller.condition}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {conditions.map(condition => (
                  <DropdownMenuItem key={condition} onSelect={() => onConditionChange(condition)}>
                    {condition}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Home className="h-5 w-5 text-blue-500 ml-2" />
            <input
              className="border-none px-2 input-field"
              type="text"
              value={caller.address}
              onChange={(e) => onAddressChange(e.target.value)}
            />
          </CardDescription>
        </div>
        <div className="text-right flex-none">
          <div className="flex items-center space-x-2">
            {caller.isLiveCall && <span className="red-dot"></span>}
            <span className="text-sm text-gray-500">{caller.callTime}</span>
            {caller.isLiveCall 
            ? isOnHold 
                ? <Play className={`cursor-pointer ${isGlowing ? 'vibrate' : ''}`} onClick={handlePlay} /> 
                : <Pause className="cursor-pointer" onClick={handlePause}/>
            : null}
            <PhoneMissed className="text-red-500 cursor-pointer" onClick={handleDropCallClick} />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <PhoneForwarded className="text-orange-600 cursor-pointer"/>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handle1777Click}>1777</DropdownMenuItem>
                <DropdownMenuItem onClick={handleFeedback}>Feedback</DropdownMenuItem>
                <DropdownMenuItem onClick={handleGeneralEnquiries}>General</DropdownMenuItem>
                <DropdownMenuItem onClick={handleFireHazard}>Fire</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 h-1/2 flex flex-col">
        <ScrollArea className="w-full rounded-md border" ref={scrollContainerRef}>
          <div className="my-2">
            {caller.messages.map((message, index) => (
              <div key={index} className="flex py-1">
                <div className={`text-sm p-2 mx-2 rounded-lg w-full ${message.sender === "Operator" ? 'message-operator' : 'message-caller'}`}>
                  <strong>{message.sender}:</strong> {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="bg-white h-1/4 grow flex flex-col p-2">
        <ScrollArea className="w-full rounded-md border">
          <p className="text-gray-500 font-sans" style={{ whiteSpace: 'pre-line', lineHeight: '0.9' }}> 
            {caller.extractedMessages}
          </p>
        </ScrollArea>
      </CardFooter>
    </Card>
  );
}

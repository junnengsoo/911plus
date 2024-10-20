// Define the structure of a message
export interface Message {
    sender: string;
    text: string;
  }
  
  // Define the structure of a caller
  export interface Caller {
    id: number; // Unique identifier for each caller
    name: string;
    condition: string;
    address: string;
    callTime: string;
    isLiveCall: boolean;
    messages: Message[];
    extractedMessages: string;
    isOperatorOnline: boolean;
    url: string;
    lang: string;
  }
  
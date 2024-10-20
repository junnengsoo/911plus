import { Caller } from '@/components/CallerTypes';

// Function to get the list of callers
export const getCallers = async (): Promise<Caller[]> => {
  // const response = await fetch("/api/callers"); // Replace with API endpoint
  // if (!response.ok) {
  //   throw new Error("Failed to fetch callers");
  // }
  // const data = await response.json();
  // return data;

    const dummyCallers = [
    {
      id: 1,
      name: 'Caller 1',
      condition: 'Unknown', // to change
      address: 'Address 1',
      callTime: '00:00',
      isLiveCall: true,
      messages: [ // initialised as empty
      ],
      extractedMessages: 'Extracted messages for caller 1',
      isOperatorOnline: true,
      url: 'https://niclee1219.github.io/SCDFxDELL-995calls/Audio/ambulanceai.mp3',
      lang: "eng",
    },
    // {
    //   id: 2,
    //   name: 'Caller 2',
    //   condition: 'Unknown',
    //   address: 'Address 2',
    //   callTime: '00:00',
    //   isLiveCall: true,
    //   messages: [
    //   ],
    //   extractedMessages: 'Extracted messages for caller 2',
    //   isOperatorOnline: false,
    //   url: 'https://niclee1219.github.io/SCDFxDELL-995calls/Audio/case%201-AI-chinese.mp3',
    //   lang: "chi",
    // },
    // {
    //   id: 3,
    //   name: 'Caller 3',
    //   condition: 'Unknown',
    //   address: 'Address 3',
    //   callTime: '00:00',
    //   isLiveCall: true,
    //   messages: [
    //   ],
    //   extractedMessages: 'Extracted messages for caller 3',
    //   isOperatorOnline: false,
    //   url: 'https://niclee1219.github.io/SCDFxDELL-995calls/Audio/case%205-english.mp3',
    //   lang: "eng"
    // }
  ];

  // const transcript = ["911, what's your emergency?","Hi, I need help! There's been a car accident on 324 Maple Street.",
  // "Okay, I understand. Are you or anyone else injured?", 
  // "Yes, there's a woman who looks seriously hurt. She's not responding.",
  // "I'm dispatching emergency services to your location. Can you tell me if she's breathing?",
  // "I'm not sure. I don't think she is.",
  // "Alright, can you check her pulse or see if her chest is moving?",
  // "Hold on... No, I don't see any movement. What should I do?",
  // "Stay calm. Help is on the way. Do you know CPR?",
  // "Yes, but it's been a while since I learned.",
  // "That's okay. I can guide you through it. First, tilt her head back slightly to open her airway."]
  
  // const dummyCallers = Array.from({ length: 5 }).map((_, i) => ({
  //   id: i + 1,
  //   name: `Caller ${i + 1}`,
  //   condition: 'Initial', // Change this to "Cardiac Arrest" or "Stroke" for testing
  //   address: `Address ${i + 1}`,
  //   callTime: `00:${String(i).padStart(2, '0')}`,
  //   isLiveCall: i % 2 === 0,
  //   messages: Array.from({ length: 10 }).map((_, j) => ({
  //     sender: j % 2 === 0 ? 'Operator' : 'Caller',
  //     text: transcript[j],
  //   })),
  //   extractedMessages: `Extracted messages for caller ${i + 1}`,
  //   isOperatorOnline: i === 0,
  // }));

  return dummyCallers;
};
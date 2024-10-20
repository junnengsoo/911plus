import { useEffect, useState, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import CallerList from "./components/CallerList";
import CallerCard from "./components/CallerCard";
import { getCallers } from "./api/api";
import { Caller, Message } from "@/components/CallerTypes";

const socket = io("http://localhost:5001/transcribe"); // Adjust the URL for your backend

export function App() {
  const [callers, setCallers] = useState<Caller[]>([]);
  const [selectedCallerIds, setselectedCallerIds] = useState<number[]>([]);
  const [transcriptionStarted, setTranscriptionStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const callTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const resetState = () => {
    stopAudioStream(); // Stop audio streaming when resetting state
    fetchCallers();
    setselectedCallerIds([]);
    setTranscriptionStarted(false);
  };

  useEffect(() => {
    console.log("Transcription started: ", transcriptionStarted);
    // Automatically start playing audio when transcription starts
    if (transcriptionStarted && audioRef.current) {
      console.log("Playing audio");
      audioRef.current.play();
    }
  }, [transcriptionStarted]);

  const handleCallerClick = (callerToEdit: Caller) => {
    if (!selectedCallerIds.some((callerId) => callerId === callerToEdit.id)) {
      // add caller to selected caller list
      setselectedCallerIds((prevSelectedCallers) => [
        ...prevSelectedCallers,
        callerToEdit.id,
      ]);
    } else {
      setselectedCallerIds((prevSelectedCallers) =>
        prevSelectedCallers.filter((callerId) => callerId !== callerToEdit.id)
      );
    }
  };

  const handleNameChange = (id: number, newName: string) => {
    setCallers((prevCallers) => {
      const newCallers = prevCallers.map((caller) =>
        caller.id === id ? { ...caller, name: newName } : caller
      );
      return newCallers;
    });
  };

  const handleConditionChange = (id: number, newCondition: string) => {
    // to fix
    setCallers((prevCallers) => {
      const newCallers = prevCallers.map((caller) =>
        caller.id === id ? { ...caller, condition: newCondition } : caller
      );
      return newCallers;
    });
  };

  const handleAddressChange = (id: number, newAddress: string) => {
    setCallers((prevCallers) => {
      const newCallers = prevCallers.map((caller) =>
        caller.id === id ? { ...caller, address: newAddress } : caller
      );
      return newCallers;
    });
  };

  const startTranscription = async (caller: Caller) => {
    console.log("Starting transcription for " + caller.id.toString());
    
    // Start audio stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        console.log("Audio data available:", event.data.size); // Log audio data size
        // Send audio data to the transcription API
        const formData = new FormData();
        formData.append('audio', event.data, 'audio.webm'); // Append audio data

        try {
          const response = await fetch('http://localhost:5001/transcribe', {
            method: 'POST',
            body: formData,
          });
          console.log("Audio data sent to the server."); // Log successful send
          
          // Handle transcription response
          const transcriptionResult = await response.json();
          console.log("Transcription result:", transcriptionResult);
          // You can add logic here to handle the transcription result if needed
          
        } catch (error) {
          console.error("Error sending audio data:", error);
        }
      }
    };

    mediaRecorderRef.current.start(100); // Send data every 100ms
    console.log("Audio stream started."); // Log when audio stream starts

    // Start transcription request to the backend
    fetch('https://transcription-service-community-defender-ai.apps.innovate.sg-cna.com/transcribe', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: caller.url, caller_id: caller.id, lang: caller.lang })
    }).then(() => {
      setTranscriptionStarted(true);
      // Check if the caller is the one currently operated on and if the operator is online
      if (audioRef.current && caller.isOperatorOnline) {
        audioRef.current.src = "https://niclee1219.github.io/SCDFxDELL-995calls/Audio/ambulanceaispeedup.mp3"; // Set the audio source to the current caller's URL
        audioRef.current.play(); // Play the audio when transcription starts
      }
    })
    .catch(console.error);
  };

  useEffect(() => {
    socket.on("transcription_update", ({ caller_id, line }: {caller_id: number, line : Message}) => {
      setCallers((prevCallers) =>
        prevCallers.map((caller) =>
          caller.id === caller_id
            ? { ...caller, messages: [...caller.messages, line] }
            : caller
        )
      );
    });

    return () => {
      socket.off("transcription_update");
    };
  }, []);

  async function fetchCallers() {
    try {
      const data = await getCallers(); // Assuming getCallers is a function that fetches the caller data
      setCallers(data);
    } catch (error) {
      console.error("Failed to fetch callers", error);
    }
  }

  // Initialisation with dummy data
  useEffect(() => {
    fetchCallers();
  }, []);

  // Start transcription for all callers on user action
  const handleStartTranscriptionClick = () => {
    console.log("start transcription clicked");
    startAudioStream(); // Start audio streaming when transcription starts

    // Ensure transcription is started only once per session
    if (!transcriptionStarted && callers.length > 0) {
        selectedCallerIds.forEach((callerId) => {
            const caller = callers.find(c => c.id === callerId);
            if (caller) {
                startTranscription(caller); // Start transcription for each selected caller
            }
        });
        setTranscriptionStarted(true); // Ensure we don't start it more than once
        console.log("starting transcription");
    }
  };

  useEffect(() => {
    setCallers((prevCallers) =>
      prevCallers.map((caller) => ({
        ...caller,
        isSelected: selectedCallerIds.some(
          (selected) => selected === caller.id
        ),
      }))
    );
  }, [selectedCallerIds]);

  const addSecondToCallTime = (callTime: string) => {
    const [minutes, seconds] = callTime.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds + 1;
    const newMinutes = Math.floor(totalSeconds / 60) % 60;
    const newSeconds = totalSeconds % 60;
    const newTime = `${String(newMinutes).padStart(2, "0")}:${String(
      newSeconds
    ).padStart(2, "0")}`;
    return newTime;
  };

  const updateCallTimes = (callers: Caller[]) => {
    return callers.map((caller) => {
      if (caller.isLiveCall) {
        return {
          ...caller,
          callTime: addSecondToCallTime(caller.callTime),
        }
      } else {
        return caller;
      }
    });
  };

  const updateNameAndAddress = async (caller: Caller): Promise<Caller> => {
    const currentTranscript = caller.messages
      .map((m) => m.sender + ": " + m.text)
      .join(" ");
    console.log(currentTranscript);
    let fetchedName = caller.name;
    let fetchedAddress = caller.address;

    if (caller.address.includes("Address")) { // to change caller.name === "Caller 1" || 
      try {
        const response = await fetch("https://identification-service-community-defender-ai.apps.innovate.sg-cna.com/identify-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: currentTranscript }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const details = await response.json();
        console.log(details);
        console.log(details.name);
        if (details.name != "Unknown") {
          fetchedName = details.name 
        }
        fetchedAddress = details?.address ?? "Unknown";

        return {
          ...caller,
          name: fetchedName,
          address: fetchedAddress,
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        // caller.name = "haha"; // to remove
        console.log(caller);
        console.log(caller.callTime);
        return caller;
      }
    }
    return caller;
  };

  const updateCondition = async (caller: Caller): Promise<Caller> => {
    const currentTranscript = caller.messages
      .map((m) => m.sender + ": " + m.text)
      .join(" ");
    let fetchedCondition = caller.condition;
    if (caller.condition === "Unknown") { // consider removing
      try {
        const response = await fetch(
          "https://identification-service-community-defender-ai.apps.innovate.sg-cna.com/identify-condition",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: currentTranscript }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const details = await response.json();
        console.log(details);
        fetchedCondition = details?.condition ?? "Unknown";
        if (fetchedCondition != "Unknown") {
          fetchedCondition = fetchedCondition.toLowerCase();
        }

        return {
          ...caller,
          condition: fetchedCondition,
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        return caller;
      }
    }
    return caller;
  };

  const extractSummary = async (caller: Caller): Promise<Caller> => {
    const currentTranscript = caller.messages
      .map((m) => m.sender + ": " + m.text)
      .join(" ");
    let extractedMessages = caller.extractedMessages;
  
    if (caller.extractedMessages.includes("messages")) { // consider removing
      try {
        console.log("summary api for " + caller.id)
        const response = await fetch("https://summarization-service-community-defender-ai.apps.innovate.sg-cna.com/summarize", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "text": currentTranscript, "is_first": true, "caller_id": caller.id}),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const details = await response.json();
        console.log(details);
        extractedMessages = details?.summary ?? extractedMessages;
  
        return {
          ...caller,
          extractedMessages: extractedMessages,
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        return caller;
      }
    }
  
    return caller;
  };
  

  useEffect(() => {
    if (transcriptionStarted) {
      // Update call times every 1 second
      callTimeIntervalRef.current = setInterval(() => {
        setCallers((prevCallers) => updateCallTimes(prevCallers));
      }, 1000);

      // Note: If the following updates are run concurrently, the properties of the callers might override
      // one another, the temporary fix is to have the updates run sequentially.

      // Update name and address every 18 seconds
      const nameAddressInterval = setInterval(() => {
        setCallers((prevCallers) => {
          const fetchAndUpdateCallers = async () => {
            try {
              console.log("Fetching and updating callers");
              const updatedCallers = await Promise.all(
                prevCallers.map(updateNameAndAddress)
              );
              console.log("Updated callers:", updatedCallers);
              return updatedCallers;
            } catch (error) {
              console.error("Error updating callers:", error);
              return prevCallers; // Return previous state in case of error
            }
          };

          fetchAndUpdateCallers().then((updatedCallers) => {
            if (updatedCallers) setCallers(updatedCallers);
          });
          return prevCallers; // Return the previous state immediately
        });
      }, 18000);

      const conditionInterval = setInterval(() => {
        setCallers((prevCallers) => {
          const fetchAndUpdateCallers = async () => {
            try {
              console.log("Identifying condition");
              const updatedCallers = await Promise.all(
                prevCallers.map(updateCondition)
              );
              console.log("Identified condition:", updatedCallers);
              return updatedCallers;
            } catch (error) {
              console.error("Error updating callers:", error);
              return prevCallers; // Return previous state in case of error
            }
          };

          fetchAndUpdateCallers().then((updatedCallers) => {
            if (updatedCallers) setCallers(updatedCallers);
          });
          return prevCallers; // Return the previous state immediately
        });
      }, 15000);

      const summaryInterval = setInterval(() => {
        setCallers((prevCallers) => {
          const fetchAndUpdateCallers = async () => {
            try {
              console.log("Extracting keywords");
              const updatedCallers = await Promise.all(prevCallers.map(extractSummary));
              console.log(updatedCallers);
              return updatedCallers;
            } catch (error) {
              console.error("Error updating callers:", error);
              return prevCallers; // Return previous state in case of error
            }
          };

          fetchAndUpdateCallers().then((updatedCallers) => {
            if (updatedCallers) setCallers(updatedCallers);
          });
          return prevCallers; // Return the previous state immediately
        });
      }, 30000);

      // Clear interval on component unmount
      return () => {
        if (callTimeIntervalRef.current) {
          clearInterval(callTimeIntervalRef.current);
        }
        clearInterval(nameAddressInterval);
        clearInterval(conditionInterval);
        clearInterval(summaryInterval);
      };
    }
  }, [transcriptionStarted]); // Empty dependency array means this effect runs once on mount

  const startAudioStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        console.log("Audio data available:", event.data.size); // Log audio data size
        // Send audio data to the transcription API
        const formData = new FormData();
        formData.append('audio', event.data, 'audio.webm'); // Append audio data

        try {
          await fetch('http://localhost:5001/transcribe', {
            method: 'POST',
            body: formData,
          });
          console.log("Audio data sent to the server."); // Log successful send
        } catch (error) {
          console.error("Error sending audio data:", error);
        }
      }
    };

    mediaRecorderRef.current.start(100); // Send data every 100ms
    console.log("Audio stream started."); // Log when audio stream starts
  };

  const stopAudioStream = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="grid h-screen w-screen grid-flow-row grid-cols-5 grid-rows-2">
      <div className="h-screen col-span-1 row-span-3 flex flex-col justify-between">
        <div className="flex-1 overflow-auto">
        <CallerList
          onCallerClick={handleCallerClick}
          selectedCallers={callers.filter((caller) =>
            selectedCallerIds.includes(caller.id)
          )}
          callers={callers}
        />
        </div>
        <button
          onClick={handleStartTranscriptionClick}
          className="start-button"
        >
          S 
        </button>
        <button onClick={resetState}>   R</button>
      </div>
      <audio ref={audioRef} preload="auto" hidden>
        Your browser does not support the audio element.
      </audio>
      {callers
        .filter((caller) => selectedCallerIds.includes(caller.id))
        .map((caller, index) => (
          <div key={index} className="col-span-2 overflow-hidden">
            {caller && (
              <CallerCard
                caller={caller}
                onNameChange={(newName) => handleNameChange(caller.id, newName)}
                onAddressChange={(newAddress) =>
                  handleAddressChange(caller.id, newAddress)
                }
                onConditionChange={(newCondition) =>
                  handleConditionChange(caller.id, newCondition)
                }
              />
            )}
          </div>
        ))}
    </div>
  );
}

export default App;

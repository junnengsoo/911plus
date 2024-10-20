# Copyright 2023-2024 Deepgram SDK contributors. All Rights Reserved.
# Use of this source code is governed by a MIT license that can be found in the LICENSE file.
# SPDX-License-Identifier: MIT

from dotenv import load_dotenv
from time import sleep
import logging

from deepgram.utils import verboselogs

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)

from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import threading
import httpx
from deepgram import DeepgramClient, DeepgramClientOptions, LiveTranscriptionEvents, LiveOptions
from dotenv import load_dotenv
import os
import time
from flask_cors import CORS

app = Flask(__name__)
# CORS(app)  # This will enable CORS for all routes
socketio = SocketIO(app)

load_dotenv()

full_transcript = []
TAG = 'SPEAKER '

def main(send_transcription):
    try:
        # example of setting up a client config. logging values: WARNING, VERBOSE, DEBUG, SPAM
        # config = DeepgramClientOptions(
        #     verbose=verboselogs.DEBUG, options={"keepalive": "true"}
        # )
        # deepgram: DeepgramClient = DeepgramClient("", config)
        # otherwise, use default config
        deepgram: DeepgramClient = DeepgramClient()

        dg_connection = deepgram.listen.live.v("1")

        def on_open(self, open, **kwargs):
            print("Connection Open")

        def on_message(self, result, **kwargs):
            if result.is_final:
                lines = []
                words = result.channel.alternatives[0].words
                print(words)
                curr_speaker = 0
                curr_line = ''
                for word_struct in words:
                    print(words)
                    word_speaker = word_struct["speaker"]
                    word = word_struct["punctuated_word"]
                    if word_speaker == curr_speaker:
                        curr_line += ' ' + word
                    else: ## if change speaker
                        lines = []
                        tag = TAG + str(curr_speaker) + ':'
                        full_line = curr_line # tag + 
                        if curr_line != "":
                            lines.append(full_line)
                            full_transcript.append(full_line)
                        curr_speaker = word_speaker
                        curr_line = ' ' + word
                if curr_line != "":
                    full_line = curr_line # TAG + str(curr_speaker) + ':' + 
                    lines.append(full_line)
                    full_transcript.append(full_line)
                print(full_transcript)
                # if curr_speaker == 1: # caller
                #     send_transcription({"sender": "Caller", "text": lines})
                # else:
                #     send_transcription({"sender": "Operator", "text": lines})

        def on_metadata(self, metadata, **kwargs):
            print(f"Metadata: {metadata}")

        def on_speech_started(self, speech_started, **kwargs):
            print("Speech Started")

        def on_utterance_end(self, utterance_end, **kwargs):
            print("Utterance End")
        #     global is_finals
        #     if len(is_finals) > 0:
        #         utterance = " ".join(is_finals)
        #         print(f"Utterance End: {utterance}")
        #         is_finals = []

        def on_close(self, close, **kwargs):
            print("Connection Closed")

        def on_error(self, error, **kwargs):
            print(f"Handled Error: {error}")

        def on_unhandled(self, unhandled, **kwargs):
            print(f"Unhandled Websocket Message: {unhandled}")

        dg_connection.on(LiveTranscriptionEvents.Open, on_open)
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Metadata, on_metadata)
        dg_connection.on(LiveTranscriptionEvents.SpeechStarted, on_speech_started)
        dg_connection.on(LiveTranscriptionEvents.UtteranceEnd, on_utterance_end)
        dg_connection.on(LiveTranscriptionEvents.Close, on_close)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)
        dg_connection.on(LiveTranscriptionEvents.Unhandled, on_unhandled)

        options: LiveOptions = LiveOptions(
            model="nova-2",
            language="en-US",
            # Apply smart formatting to the output
            smart_format=True,
            # Raw audio format details
            encoding="linear16",
            channels=1,
            sample_rate=16000,
            # To get UtteranceEnd, the following must be set:
            interim_results=True,
            utterance_end_ms="1000",
            vad_events=True,
            # Time in milliseconds of silence to wait for before finalizing speech
            endpointing=300,
            diarize=True,
        )

        addons = {
            # Prevent waiting for additional numbers
            "no_delay": "true"
        }

        print("\n\nPress Enter to stop recording...\n\n")
        if dg_connection.start(options, addons=addons) is False:
            print("Failed to connect to Deepgram")
            return

        # Open a microphone stream on the default input device
        microphone = Microphone(dg_connection.send)

        # start microphone
        microphone.start()

        # wait until finished
        input("")

        # Wait for the microphone to close
        microphone.finish()

        # Indicate that we've finished
        dg_connection.finish()

        print("Finished")
        # sleep(30)  # wait 30 seconds to see if there is any additional socket activity
        # print("Really done!")

    except Exception as e:
        print(f"Could not open socket: {e}")
        return

@app.route('/transcribe', methods=['GET'])
def transcribe_route():

    def send_transcription(line):
        socketio.emit('transcription_update', {'caller_id': 0, 'line': line})

    threading.Thread(target=main, args=(send_transcription,)).start()
    return jsonify({'status': 'Transcription started'})

if __name__ == "__main__":
    socketio.run(app, host='127.0.0.1', port=5001)
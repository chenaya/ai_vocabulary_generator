import moment from 'moment';
import { useState, useRef } from 'react';
import axios from 'axios';
import { faCommentDots, faCopy, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function VocabGenResultCard({ result, onCopyToInput }) {
    const { wordList, zhWordList } = result.payload;
    const [sentences, setSentences] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [playingStates, setPlayingStates] = useState({});
    const audioRef = useRef(null);

    const generateSentence = async (word, idx) => {
        setLoadingStates(prev => ({ ...prev, [idx]: true }));
        try {
            const response = await axios.post('/api/sentence-ai', {
                word,
                language: result.language,
                chineseMeaning: zhWordList[idx]
            });
            setSentences(prev => ({
                ...prev,
                [idx]: response.data
            }));
        } catch (error) {
            console.error("產生例句時發生錯誤:", error);
        }
        setLoadingStates(prev => ({ ...prev, [idx]: false }));
    };

    const playSpeech = async (text, idx) => {
        try {
            setPlayingStates(prev => ({ ...prev, [idx]: true }));

            const response = await axios.post('/api/tts-ai', {
                text,
                language: result.language
            });

            const audioData = atob(response.data.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
                uint8Array[i] = audioData.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.onended = () => {
                    setPlayingStates(prev => ({ ...prev, [idx]: false }));
                };
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("播放語音時發生錯誤:", error);
            setPlayingStates(prev => ({ ...prev, [idx]: false }));
        }
    };

    const wordItems = wordList.map((word, idx) => {
        return (
            // 這是一個單字卡
            <div className="p-3 border-2 border-fuchsia-200 rounded-md bg-fuchsia-50 hover:border-fuchsia-300 transition-colors" key={idx}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-purple-800">{word}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => generateSentence(word, idx)}
                            disabled={loadingStates[idx]}
                            className="w-8 h-8 flex items-center justify-center text-fuchsia-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-500 rounded-md transition-all shadow-sm border border-fuchsia-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="產生例句">
                            <FontAwesomeIcon icon={faCommentDots} className={loadingStates[idx] ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={() => onCopyToInput(zhWordList[idx])}
                            className="w-8 h-8 flex items-center justify-center text-fuchsia-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-500 rounded-md transition-all shadow-sm border border-fuchsia-200"
                            title="複製至輸入框">
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                    </div>
                </div>
                <p className="text-purple-500 mt-3">{zhWordList[idx]}</p>
                {sentences[idx] && (
                    <div className="mt-3 space-y-2">
                        <div className="p-2 bg-white rounded-md border border-fuchsia-100">
                            <div className="flex items-center justify-between">
                                <p className="text-purple-600 text-sm italic flex-1 mr-3">&quot;{sentences[idx].sentence}&quot;</p>
                                <button
                                    onClick={() => playSpeech(sentences[idx].sentence, idx)}
                                    disabled={playingStates[idx]}
                                    className={`min-w-[2rem] min-h-[2rem] w-8 h-8 p-0 flex items-center justify-center text-fuchsia-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-purple-500 rounded-md transition-all shadow-sm border border-fuchsia-200 disabled:cursor-not-allowed shrink-0
                                        ${playingStates[idx] ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white border-transparent animate-bounce' : ''}`}
                                    title="播放發音">
                                    <FontAwesomeIcon
                                        icon={faVolumeHigh}
                                        className={`text-base ${playingStates[idx] ? 'animate-pulse' : ''}`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="p-2 bg-fuchsia-50 rounded-md border border-fuchsia-100">
                            <p className="text-purple-500 text-sm">&quot;{sentences[idx].translation}&quot;</p>
                        </div>
                    </div>
                )}
            </div>
        )
    });

    return (
        <div className="bg-white shadow-md p-4 rounded-xl my-3 border border-fuchsia-100">
            <h3 className="text-lg">
                {result.title} <span className="py-2 px-4 bg-gradient-to-r from-fuchsia-100 to-purple-100 text-purple-700 font-semibold rounded-lg inline-block ml-2">{result.language}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {wordItems}
            </div>

            <p className="mt-3 text-right text-fuchsia-400">
                Created At: {moment(result.createdAt).format("YYYY年MM月DD日 HH:mm:ss")}
            </p>
            <audio ref={audioRef} className="hidden" />
        </div>
    )
}
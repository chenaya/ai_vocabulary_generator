"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import { faEye, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VocabGenResultCard from "@/components/VocabGenResultCard";


export default function Vision() {
    // 是否在等待回應
    const [isWaiting, setIsWaiting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [historyResults, setHistoryResults] = useState([]);

    // 在頁面載入時取得歷史記錄
    useEffect(() => {
        axios.get('/api/vision-ai')
            .then(response => {
                console.log("成功取得歷史記錄", response.data);
                setHistoryResults(response.data);
            })
            .catch(error => {
                console.error("取得歷史記錄時發生錯誤", error);
            });
    }, []); // 空陣列代表只在組件掛載時執行一次

    const changeHandler = (e) => {
        e.preventDefault();
        const file = e.target.files[0];

        if (file) {
            // 創建圖片預覽URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // 將圖片轉換成base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;

                try {
                    setIsWaiting(true);
                    const response = await axios.post('/api/vision-ai', {
                        base64: base64String
                    });
                    setAnalysisResult(response.data);
                    // 將新結果加入歷史記錄的開頭
                    setHistoryResults(prev => [response.data, ...prev]);
                } catch (error) {
                    console.error('發送請求時發生錯誤:', error);
                    setAnalysisResult(null);
                } finally {
                    setIsWaiting(false);
                }
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <>
            <CurrentFileIndicator filePath="/app/vision/page.js" />
            <PageHeader title="AI Vision" icon={faEye} />
            <section>
                <div className="container mx-auto">
                    <label
                        htmlFor="imageUploader"
                        className="inline-block bg-indigo-500 hover:bg-indigo-600 p-3 rounded-lg text-white cursor-pointer"
                    >
                        Upload Image
                    </label>
                    <input
                        className="hidden"
                        id="imageUploader"
                        type="file"
                        onChange={changeHandler}
                        accept=".jpg, .jpeg, .png"
                    />
                </div>
            </section>
            <section>
                <div className="container mx-auto mt-6">
                    {/* 圖片預覽區域 */}
                    {imagePreview && (
                        <div className="mb-6">
                            <img
                                src={imagePreview}
                                alt="Uploaded preview"
                                className="max-w-md mx-auto rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    {/* 載入中動畫 */}
                    {isWaiting ? (
                        <div className="text-center text-gray-600">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="text-4xl text-indigo-500 mb-2"
                            />
                            <div>AI 正在分析圖片中...</div>
                        </div>
                    ) : (
                        // 顯示所有結果（包括新的分析結果和歷史記錄）
                        <div>
                            {historyResults.map((result, index) => (
                                <VocabGenResultCard
                                    key={result.id || result.createdAt + index}
                                    result={result}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
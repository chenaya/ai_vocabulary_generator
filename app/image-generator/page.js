"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { faImage } from "@fortawesome/free-solid-svg-icons"
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
import ImageGenCard from "@/components/ImageGenCard"; //呈現圖像生成結果的卡片
import ImageGenPlaceholder from "@/components/ImageGenPlaceholder"; //呈現等待的卡片動畫

export default function ImgGen() {
    const [userInput, setUserInput] = useState("")
    // 是否在等待回應
    const [isWaiting, setIsWaiting] = useState(false)
    // 儲存生成圖片的卡片
    const [cardList, setCardList] = useState([])

    // 在頁面載入時取得現有的單字卡資料
    useEffect(() => {
        axios.get('/api/image-ai')
            .then(response => {
                console.log("成功取得現有圖片", response.data);
                setCardList(response.data);
            })
            .catch(error => {
                console.error("取得圖片時發生錯誤", error);
            });
    }, []); // 空陣列代表只在組件掛載時執行一次

    //表單送出後會執行的流程
    const submitHandler = (e) => {
        e.preventDefault();
        //console.log("User Input: ", userInput);
        const body = { userInput };
        console.log("body:", body);
        setIsWaiting(true);
        setUserInput("");

        // TODO: 將body POST到 /api/image-ai { userInput: "" }
        axios.post("/api/image-ai", body)
            //成功發送請求並收到來自後端的回應 //箭頭函式=>
            .then(res => {
                console.log("後端回傳的資料", res)
                setIsWaiting(false)

                //將res.data放到cardlist的最前面
                setCardList(prevList => [res.data, ...prevList])
            })
            //發生錯誤（語法、網路、第三方服務...等）
            .catch(err => {
                console.log(err)
                alert("發生錯誤")
                setIsWaiting(false)
            })
    }

    return (
        <>
            <CurrentFileIndicator filePath="/app/image-generator/page.js" />
            <PageHeader title="AI Image Generator" icon={faImage} />
            <section>
                <div className="container mx-auto">
                    <form onSubmit={submitHandler}>
                        <div className="flex">
                            <div className="w-4/5 px-2">
                                <input
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    type="text"
                                    className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                                    placeholder="Enter a word or phrase"
                                    required
                                />
                            </div>
                            <div className="w-1/5 px-2">
                                <GeneratorButton />
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            <section>
                <div className="container mx-auto grid grid-cols-4 gap-x-4 gap-y-6 mt-6"> {/* tailwind css */}
                    {/* 當isWaiting是true 才顯示 ImageGenPlaceholder */}
                    {isWaiting && <ImageGenPlaceholder />}

                    {/* 透過ImageGenCard元件渲染每個在cardlist的資料 */}
                    {cardList.map((card, index) => (
                        <ImageGenCard
                            key={card.createdAt + index}
                            imageURL={card.imageURL}
                            prompt={card.prompt}
                            createdAt={card.createdAt}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}
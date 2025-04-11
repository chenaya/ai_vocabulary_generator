import openai from "@/services/openai"
import { NextResponse } from "next/server";

// 設計一個POST API可接受前端傳來的 word(單字), language(語言)
// 回傳一個AI產生的指定語言例句給前端 讓前端可顯示在畫面上

export async function POST(request) {
    try {
        const { word, language, chineseMeaning } = await request.json();

        const prompt = `Create an example sentence in ${language} using the word "${word}" (which means "${chineseMeaning}" in Chinese) and provide its Traditional Chinese translation.
The response should be in the following JSON format:
{
    "sentence": "The example sentence in ${language}",
    "translation": "繁體中文翻譯"
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful language teacher. Create natural example sentences that are easy to understand. The word meaning provided in Chinese should be used to ensure the sentence uses the correct meaning of the word. Always respond in the specified JSON format with Traditional Chinese translation."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 150
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return NextResponse.json(response);
    } catch (error) {
        console.error("產生例句時發生錯誤:", error);
        return NextResponse.json(
            { error: "產生例句時發生錯誤" },
            { status: 500 }
        );
    }
}
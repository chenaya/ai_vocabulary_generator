import openai from "@/services/openai"
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { text, language } = await request.json();

        // 根據不同語言選擇不同的語音和指示
        let voice = "ash";
        let instructions = "";

        switch (language.toLowerCase()) {
            case "japanese":
                instructions = "Speak in a natural Japanese pronunciation.";
                break;
            case "chinese":
                instructions = "Speak in a natural Chinese pronunciation.";
                break;
            case "korean":
                instructions = "Speak in a natural Korean pronunciation.";
                break;
            case "french":
                instructions = "Speak in a natural French pronunciation.";
                break;
            case "german":
                instructions = "Speak in a natural German pronunciation.";
                break;
            default:
                instructions = "Speak in a natural tone.";
        }

        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: voice,
            input: text,
            instructions: instructions,
        });

        // 將音頻轉換為 base64
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const base64Audio = buffer.toString('base64');

        return NextResponse.json({
            audio: base64Audio,
            message: "Audio generated successfully"
        });

    } catch (error) {
        console.error("生成語音時發生錯誤:", error);
        return NextResponse.json(
            { error: "生成語音時發生錯誤" },
            { status: 500 }
        );
    }
} 
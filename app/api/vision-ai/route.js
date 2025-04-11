import openai from "@/services/openai";

export async function POST(req) {
    const body = await req.json();
    const { base64 } = body;
    console.log("body:", body);
    // TODO: 透過base64讓AI辨識圖片
    // 文件連結：https://platform.openai.com/docs/guides/vision?lang=node
    // const systemPrompt = ``;
    // const propmpt = ``;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `請用一句簡短的繁體中文描述這張圖片（20字以內），並提供5個相關英文單字與中文意思。
輸出JSON格式範例:
{
    aiText: 圖片的描述,
    wordList: ["Apple", "Banana", ...],
    zhWordList: ["蘋果", "香蕉", ...]
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64
                            }
                        }
                    ],
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const aiResponse = JSON.parse(response.choices[0].message.content);

        // 構建與 VocabGenResultCard 相容的資料結構
        const result = {
            title: aiResponse.aiText,
            payload: {
                wordList: aiResponse.wordList,
                zhWordList: aiResponse.zhWordList
            },
            language: "English",
            createdAt: Date.now()
        };

        // 儲存結果到 Firestore
        await db.collection('vision-ai').add(result);

        return Response.json(result);

    } catch (error) {
        console.error('OpenAI API 錯誤:', error);
        return Response.json({ error: '影像辨識過程發生錯誤' }, { status: 500 });
    }

}

// GET API 用於獲取歷史記錄
export async function GET() {
    try {
        const snapshot = await db.collection('vision-ai')
            .orderBy('createdAt', 'desc')
            .get();

        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return Response.json(results);
    } catch (error) {
        console.error('Firestore 讀取錯誤:', error);
        return Response.json({ error: '讀取歷史記錄時發生錯誤' }, { status: 500 });
    }
}
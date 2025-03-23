import openai from "@/services/openai";
import axios from "axios";
import db from "@/services/db";

//從資料庫拿資料
export async function GET() {
    const cardList = [];

    const querySnapshot = await db.collection('image-ai')
        .orderBy('createdAt', 'desc')
        .get();

    // 遍歷每個文件並加入cardList
    querySnapshot.forEach((doc) => {
        cardList.push({
            id: doc.id,
            ...doc.data()
        });
    });

    // 將 cardList 送到前端
    return Response.json(cardList);
}

export async function POST(req) {
    const body = await req.json();
    console.log("body:", body);
    const { userInput } = body
    console.log("userInput:", userInput);
    // TODO: 透過dall-e-3模型讓AI產生圖片
    // 文件連結: https://platform.openai.com/docs/guides/images/usage

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: userInput,
        n: 1,
        size: "1024x1024"
    })

    //openai產生暫時的圖片網址
    const openAIImageUrl = response.data[0].url;
    console.log("openAIImageUrl:", openAIImageUrl)

    //將openai產生的透過axios上傳到imgur
    const imgurResponse = await axios.post("https://api.imgur.com/3/image", {
        image: openAIImageUrl,
        type: "url",
    }, {
        headers: {
            'Authorization': `client-ID ${process.env.IMGUR_CLIENT_ID}`
        }
    })

    const imgurURL = imgurResponse.data.data.link
    console.log("imgurURL:", imgurURL)

    const data = {
        imageURL: imgurURL,
        prompt: userInput,
        createdAt: new Date().getTime(),
    }

    await db.collection("image-ai").add(data) //將資料存在firestore的image-ai集合
    //await會提醒錯誤訊息

    return Response.json(data);
}
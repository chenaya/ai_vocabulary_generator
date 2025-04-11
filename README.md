# react-web-app-with-openai

# [https://bit.ly/ntu-ai-web-4](https://bit.ly/ntu-ai-web-4)

安裝所需套件(node_modules)
```
npm i
```

啟動開發伺服器
```
npm run dev
```

## 環境變數範例

.env
```
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
```

## 安裝Git

1. 至 [Git官方網站](https://www.git-scm.com/) 下載並且安裝 Git
2. 設定使用者名稱與Email

```
git config --global user.name "你的使用者名稱"
git config --global user.email 你的EMAIL
```

## 更新至Github
```
git add .
git commit -m "這次所執行的變更"
git push origin main
```

## 第一次推送到github
```
git init <<建立一個隱藏資料夾>>
git add . <<.=所有檔案>>
git commit -m "first commit" 
git branch -M main 
git remote add origin https://github.com/chenaya/ai_vocabulary_generator.git
git push -u origin main
```

# git 指令

## 檢視目前你所在的分支相關資訊
git status 

## 切換分支
git checkout 分支名稱

## 切換到main分支
git checkout main

## 切換到feature/add-firebase分支
git checkout feature/add-firebase

## 切換到feature/add-tts-and-widget-ui
git checkout feature/add-tts-and-widget-ui

## 新增分支
git checkout -b 想要新增的分支名稱
git checkout -b feature/add-tts-and-widget-ui

## 列出所有分支
git branch -a

## 當工作成果完成後把分支推到github
git push origin HEAD
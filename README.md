# CitizenCardProj3Frontend  |  前端專案架構：

```
citizencardproj3frontend/
├── public/                     # 靜態資源
│   ├── index.html             # 主HTML文件
│   └── favicon.ico            # 網站圖標
├── src/                       # 源代碼
│   ├── assets/               # 靜態資源
│   │   ├── images/          # 圖片資源
│   │   │   └── logo.png
│   │   └── css/            # CSS樣式
│   │       ├── main.css     # 主要樣式
│   │       ├── variables.css # CSS變量
│   │       └── utilities.css # 工具類樣式
│   ├── components/          # 共用元件
│   │   ├── layout/         # 布局元件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── Sidebar.vue
│   │   ├── auth/           # 認證相關元件
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── movie/          # 電影相關元件
│   │   │   ├── MovieCard.vue
│   │   │   └── MovieList.vue
│   │   └── common/         # 通用元件
│   │       ├── LoadingSpinner.vue
│   │       └── AlertMessage.vue
│   ├── views/              # 頁面視圖
│   │   ├── Home.vue       # 首頁
│   │   ├── auth/          # 認證頁面
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── movie/         # 電影頁面
│   │   │   ├── MovieList.vue
│   │   │   └── MovieDetail.vue
│   │   └── user/          # 用戶頁面
│   │       ├── Profile.vue
│   │       └── Wallet.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── store/             # Vuex狀態管理
│   │   ├── index.js
│   │   └── modules/
│   │       ├── auth.js
│   │       └── movie.js
│   ├── services/          # API服務
│   │   ├── api.config.js  # API配置
│   │   ├── auth.service.js
│   │   └── movie.service.js
│   ├── utils/            # 工具函數
│   │   └── helpers.js
│   ├── App.vue          # 根組件
│   └── main.js          # 入口文件
├── .env                 # 環境變數
├── .gitignore          # Git忽略文件
├── babel.config.js     # Babel配置
├── jsconfig.json       # JS配置
├── package.json        # 項目配置
└── vue.config.js       # Vue配置
```

主要特點：
1. 扁平化的目錄結構，易於維護
2. 按功能模組劃分組件
3. 集中管理的樣式文件
4. 清晰的服務層架構
5. 模組化的狀態管理
6. 統一的API調用配置

目錄說明：
- `components/`: 可重用的Vue組件
- `views/`: 頁面級組件
- `services/`: API服務層，處理後端通信
- `store/`: Vuex狀態管理
- `assets/css/`: 集中管理的CSS文件
- `router/`: Vue Router路由配置

## 前端頁面架構：

1. **會員認證頁面**
    - 登入頁面
    - 註冊頁面
    - 忘記密碼/重設密碼頁面
    - 基本功能：表單驗證、錯誤提示、JWT token處理

2. **會員中心頁面**
    - 個人資料管理
    - 密碼修改
    - 頭像上傳
    - 會員狀態顯示

3. **電影列表頁面**
    - 電影卡片列表
    - 分類篩選
    - 搜尋功能
    - 上映狀態顯示

4. **電影詳情頁面**
    - 電影基本信息
    - 場次選擇
    - 評分評論
    - 相關推薦

5. **訂票流程頁面**
    - 場次選擇
    - 座位選擇
    - 票價計算
    - 優惠券選擇

6. **電子錢包頁面**
    - 餘額顯示
    - 交易紀錄
    - 儲值功能
    - 支付記錄

7. **訂單管理頁面**
    - 訂單列表
    - 訂單詳情
    - 取消訂單
    - 訂單狀態追蹤

8. **優惠券頁面**
    - 可用優惠券列表
    - 優惠券詳情
    - 使用記錄
    - 優惠券領取

9. **通知中心頁面**
    - 系統通知
    - 優惠通知
    - 訂單通知
    - 通知設定

10. **支付頁面**
    - 支付方式選擇
    - 金額確認
    - 支付狀態
    - 交易結果顯示

- 響應式設計
- 使用Vue.js組件化開發
- Axios處理API請求
- Vuex管理狀態
- Vue Router處理路由
- Bootstrap 5處理樣式
- 錯誤處理和加載狀態
- JWT token認證

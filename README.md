# CitizenCardProj3Frontend  |  前端專案架構：

```
citizencardproj3frontend/
├── public/                     # 靜態資源
│   ├── index.html
│   └── favicon.ico
├── src/                       # 源代碼
│   ├── assets/               # 靜態資源
│   │   ├── images/          # 圖片資源
│   │   └── styles/          # 全局樣式
│   ├── components/          # 共用元件
│   │   ├── common/         # 通用元件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Loading.vue
│   │   ├── auth/           # 認證相關元件
│   │   ├── movie/          # 電影相關元件
│   │   ├── booking/        # 訂票相關元件
│   │   └── wallet/         # 電子錢包相關元件
│   ├── views/              # 頁面視圖
│   │   ├── auth/          # 認證相關頁面
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── ForgotPassword.vue
│   │   ├── movie/         # 電影相關頁面
│   │   │   ├── MovieList.vue
│   │   │   └── MovieDetail.vue
│   │   ├── booking/       # 訂票相關頁面
│   │   │   ├── BookingFlow.vue
│   │   │   └── BookingHistory.vue
│   │   ├── wallet/        # 電子錢包相關頁面
│   │   │   ├── WalletDashboard.vue
│   │   │   └── TransactionHistory.vue
│   │   └── user/          # 用戶相關頁面
│   │       ├── Profile.vue
│   │       └── Settings.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── store/             # Vuex狀態管理
│   │   ├── index.js
│   │   ├── modules/
│   │   │   ├── auth.js
│   │   │   ├── movie.js
│   │   │   ├── booking.js
│   │   │   └── wallet.js
│   ├── services/          # API服務
│   │   ├── api.js        # API配置
│   │   ├── auth.service.js
│   │   ├── movie.service.js
│   │   ├── booking.service.js
│   │   └── wallet.service.js
│   ├── utils/            # 工具函數
│   │   ├── axios.js     # Axios配置
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── constants/        # 常量定義
│   │   └── index.js
│   ├── App.vue          # 根組件
│   └── main.js          # 入口文件
├── .env                 # 環境變數
├── .env.development    # 開發環境變數
├── .env.production     # 生產環境變數
├── package.json        # 項目配置
└── vue.config.js       # Vue配置
```

主要特點：
1. 清晰的模組化結構
2. 按功能分類的組件和頁面
3. 集中管理的API服務
4. 統一的狀態管理
5. 可重用的工具函數
6. 環境變數配置
7. 統一的樣式管理

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


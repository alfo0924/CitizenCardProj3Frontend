# CitizenCardProj3Frontend  |  前端專案架構：




```
citizencardproj3frontend/
├── public/                      # 靜態資源
│   ├── favicon.ico
│   └── index.html
│
├── src/                        # 源代碼
│   ├── assets/                 # 資源文件
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── utilities.css
│   │   │   └── variables.css
│   │   └── images/
│   │       ├── default-avatar.jpg
│   │       ├── default-poster.jpg
│   │       └── logo.png
│   │
│   ├── components/            # 組件
│   │   ├── auth/             # 認證相關組件
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── common/           # 通用組件
│   │   │   ├── AlertMessage.vue
│   │   │   └── LoadingSpinner.vue
│   │   ├── layout/           # 布局組件
│   │   │   ├── Footer.vue
│   │   │   ├── Header.vue
│   │   │   └── Sidebar.vue
│   │   └── movie/            # 電影相關組件
│   │       ├── MovieCard.vue
│   │       └── MovieList.vue
│   │
│   ├── router/               # 路由配置
│   │   └── index.js
│   │
│   ├── services/             # API服務
│   │   ├── api.config.js
│   │   ├── auth.service.js
│   │   └── movie.service.js
│   │
│   ├── store/                # Vuex狀態管理
│   │   ├── modules/
│   │   │   ├── auth.js
│   │   │   ├── discount.js
│   │   │   ├── movie.js
│   │   │   └── wallet.js
│   │   └── index.js
│   │
│   ├── utils/                # 工具函數
│   │   └── helpers.js
│   │
│   ├── views/                # 頁面視圖
│   │   ├── admin/           # 管理員頁面
│   │   │   ├── AdminDashboard.vue
│   │   │   ├── DiscountManagement.vue
│   │   │   ├── MovieManagement.vue
│   │   │   └── UserManagement.vue
│   │   ├── auth/            # 認證頁面
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── discount/        # 優惠券頁面
│   │   │   └── Discounts.vue
│   │   ├── movie/          # 電影相關頁面
│   │   │   ├── Booking.vue
│   │   │   ├── MovieDetail.vue
│   │   │   └── MovieList.vue
│   │   ├── user/           # 用戶相關頁面
│   │   │   ├── Profile.vue
│   │   │   └── Wallet.vue
│   │   ├── Home.vue        # 首頁
│   │   └── NotFound.vue    # 404頁面
│   │
│   ├── App.vue              # 根組件
│   └── main.js              # 入口文件
│
├── .env                      # 環境變量
├── .eslintrc.js             # ESLint配置
├── .gitignore               # Git忽略文件
├── .npmrc                   # NPM配置
├── babel.config.js          # Babel配置
├── jsconfig.json            # JavaScript配置
├── package.json             # 項目依賴
├── README.md                # 項目說明
└── vue.config.js            # Vue配置
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

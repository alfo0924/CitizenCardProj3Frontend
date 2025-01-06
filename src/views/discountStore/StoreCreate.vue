<template>
    <div class="create-store-container">
        <div class="create-store-header">
            <h2>新增店家</h2>
        </div>

        <div class="form-container">
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="name">商店名稱</label>
                    <input id="name" v-model="formData.name" type="text" class="form-control" required />
                </div>
                <div class="form-group">
                    <label for="area">區域</label>
                    <select id="area" v-model="formData.area" class="form-select" required>
                        <option value="">請選擇區域</option>
                        <option value="西屯區">西屯區</option>
                        <option value="南屯區">南屯區</option>
                        <option value="北屯區">北屯區</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="category">類別</label>
                        <select id="category" v-model="formData.category" class="form-select" required>
                            <option value="">請選擇類別</option>
                            <option value="川式料理">川式料理</option>
                            <option value="中式麵食">中式麵食</option>
                            <option value="中式小吃">中式小吃</option>
                            <option value="台式甜點">台式甜點</option>
                            <option value="韓式料理">韓式料理</option>
                            <option value="日式料理">日式料理</option>
                            <option value="中式點心">中式點心</option>
                            <option value="台式早午餐">台式早午餐</option>
                            <option value="飲品茶點">飲品茶點</option>
                            <option value="中式料理">中式料理</option>
                        </select>
                    </div>

                    <div class="form-group half">
                        <label for="tag">標籤</label>
                        <input id="tag" v-model="formData.tag" type="text" class="form-control" placeholder="請自行輸入酷酷的標籤"
                            required />
                    </div>
                </div>

                <div class="form-group">
                    <label for="content">詳細內容</label>
                    <textarea id="content" v-model="formData.content" class="form-control" rows="4" required />
                </div>

                <div class="form-group">
                    <label for="shortContent">簡短內容</label>
                    <textarea id="shortContent" v-model="formData.shortContent" class="form-control" rows="2"
                        required />
                </div>

                <div class="form-group">
                    <label for="time">活動時間</label>
                    <input id="time" v-model="formData.time" type="text" class="form-control"
                        placeholder="例：2024/06/01 - 2025/05/31" required />
                </div>

                <div class="form-group">
                    <label for="address">地址</label>
                    <input id="address" v-model="formData.address" type="text" class="form-control" required />
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="phone">電話</label>
                        <input id="phone" v-model="formData.phone" type="tel" class="form-control"
                            placeholder="xx-xxxx-xxxx" required />
                    </div>

                    <div class="form-group half">
                        <label for="priority">優先度</label>
                        <input id="priority" v-model="formData.priority" type="number" class="form-control" required />
                    </div>
                </div>

                <div class="form-group">
                    <label for="website">網站</label>
                    <input id="website" v-model="formData.website" type="url" class="form-control" />
                </div>

                <div class="form-group">
                    <label for="imgUrl">圖片網址</label>
                    <input id="imgUrl" v-model="formData.imgUrl" type="text" class="form-control" />
                </div>

                <div class="form-group">
                    <label for="iframeSrc">Google Maps 嵌入連結</label>
                    <input id="iframeSrc" v-model="formData.iframeSrc" type="text" class="form-control"
                        placeholder="請輸入 Google Maps 的嵌入程式碼 (從分享->嵌入地圖擷取src屬性值即可)" required />
                </div>

                <div class="form-group">
                    <label for="isDonation">是否為贊助商家</label>
                    <div class="checkbox-wrapper">
                        <input id="isDonation" v-model="formData.isDonation" type="checkbox" />
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                        {{ isSubmitting ? '提交中...' : '新增店家' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CreateStore',
    data() {
        return {
            formData: {
                name: '',
                area: '',
                category: '',
                tag: '',
                content: '',
                shortContent: '',
                time: '',
                address: '',
                phone: '',
                priority: 0,
                popularity: 0,
                website: '',
                iframeSrc: '',
                isDonation: false,
                imgUrl: '',
            },
            isSubmitting: false
        }
    },
    methods: {
        async submitForm() {
            this.isSubmitting = true;
            try {
                // 驗證必填欄位
                const requiredFields = {
                    name: '商店名稱',
                    area: '區域',
                    category: '類別',
                    tag: '標籤',
                    content: '詳細內容',
                    shortContent: '簡短內容',
                    time: '活動時間',
                    address: '地址',
                    phone: '電話',
                    iframeSrc: 'Google Maps 連結'
                }; // 移除 imgUrl，因為不一定每個店家都需要圖片

                // 檢查必填欄位並同時清理數據
                const formDataToSubmit = {};
                for (const [field, label] of Object.entries(requiredFields)) {
                    const value = this.formData[field]?.trim();
                    if (!value && value !== 0) {
                        throw new Error(`請填寫${label}`);
                    }
                    formDataToSubmit[field] = value;
                }

                // 電話格式驗證
                const phonePattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
                if (!phonePattern.test(formDataToSubmit.phone)) {
                    throw new Error('請輸入正確的電話格式 (xx-xxxx-xxxx)');
                }

                // 添加其他非必填欄位
                formDataToSubmit.priority = parseInt(this.formData.priority) || 0;
                formDataToSubmit.popularity = 0;
                formDataToSubmit.website = this.formData.website?.trim() || '';
                formDataToSubmit.imgUrl = this.formData.imgUrl?.trim() || '';
                formDataToSubmit.isDonation = Boolean(this.formData.isDonation);

                // 發送請求
                const result = await this.$store.dispatch('store/createStore', formDataToSubmit);

                if (result?.success) {
                    alert('店家新增成功！');
                    this.resetForm();
                } else {
                    throw new Error(result?.error || '提交失敗，請稍後再試');
                }
            } catch (error) {
                alert(error.message || '系統錯誤，請稍後再試');
                console.error('提交失敗:', error);
            } finally {
                this.isSubmitting = false;
            }
        },
        resetForm() {
            this.formData = {
                name: '',
                area: '',
                category: '',
                tag: '',
                content: '',
                shortContent: '',
                time: '',
                address: '',
                phone: '',
                priority: 0,
                popularity: 0,
                website: '',
                iframeSrc: '',
                isDonation: false,
                imgUrl: ''
            };
        }
    }
}
</script>

<style scoped>
.create-store-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.create-store-header {
    margin-bottom: 30px;
}

.create-store-header h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
}

.form-container {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group.half {
    flex: 1;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-control:focus {
    border-color: #4a90e2;
    outline: none;
}

.form-select {
    display: block;
    width: 100%;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-select:focus {
    border-color: #4a90e2;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(74, 144, 226, 0.25);
}

textarea.form-control {
    resize: vertical;
    min-height: 100px;
}

.checkbox-wrapper {
    padding: 8px 0;
}

.form-actions {
    margin-top: 30px;
    text-align: center;
}

.btn {
    padding: 10px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: #4a90e2;
    color: white;
}

.btn-primary:hover {
    background-color: #357abd;
}

.btn-primary:disabled {
    background-color: #9cc3eb;
    cursor: not-allowed;
}
</style>
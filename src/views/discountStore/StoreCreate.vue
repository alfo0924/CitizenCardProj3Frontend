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
                    <label for="category">類別</label>
                    <input id="category" v-model="formData.category" type="text" class="form-control" required />
                </div>

                <div class="form-group">
                    <label for="description">描述</label>
                    <textarea id="description" v-model="formData.description" class="form-control" rows="3" />
                </div>

                <div class="form-group">
                    <label for="address">地址</label>
                    <input id="address" v-model="formData.address" type="text" class="form-control" required />
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="phone">電話</label>
                        <input id="phone" v-model="formData.phone" type="tel" class="form-control" />
                    </div>

                    <div class="form-group half">
                        <label for="email">電子郵件</label>
                        <input id="email" v-model="formData.email" type="email" class="form-control" />
                    </div>
                </div>

                <div class="form-group">
                    <label for="website">網站</label>
                    <input id="website" v-model="formData.website" type="url" class="form-control" />
                </div>

                <div class="form-group">
                    <label for="openingHours">營業時間</label>
                    <input id="openingHours" v-model="formData.openingHours" type="text" class="form-control" />
                </div>

                <div class="form-group">
                    <label for="imageUrl">圖片網址</label>
                    <input id="imageUrl" v-model="formData.imageUrl" type="url" class="form-control" />
                </div>

                <div class="form-group">
                    <label for="discountInfo">優惠信息</label>
                    <textarea id="discountInfo" v-model="formData.discountInfo" class="form-control" rows="3" />
                </div>

                <div class="form-row">
                    <div class="form-group half">
                        <label for="latitude">緯度</label>
                        <input id="latitude" v-model="formData.latitude" type="number" step="any"
                            class="form-control" />
                    </div>

                    <div class="form-group half">
                        <label for="longitude">經度</label>
                        <input id="longitude" v-model="formData.longitude" type="number" step="any"
                            class="form-control" />
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
                category: '',
                description: '',
                address: '',
                phone: '',
                email: '',
                website: '',
                openingHours: '',
                imageUrl: '',
                discountInfo: '',
                latitude: null,
                longitude: null
            },
            isSubmitting: false
        }
    },
    methods: {
        submitForm() {
            console.log('表單數據：', this.formData)
            // 這裡之後會加入 API 調用
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

textarea.form-control {
    resize: vertical;
    min-height: 100px;
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
<template>
  <div class="modal fade" id="promotionFormModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editingPromotion ? '編輯活動' : '新增活動' }}
          </h5>
          <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="promotion-form">
            <!-- 基本資訊區塊 -->
            <div class="form-section mb-4">
              <h6 class="section-title">基本資訊</h6>
              <div class="row g-3">
                <!-- 活動名稱 -->
                <div class="col-12">
                  <label class="form-label required">活動名稱</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="form.title"
                      required
                      maxlength="100"
                      placeholder="請輸入活動名稱"
                  >
                </div>

                <!-- 活動類型 -->
                <div class="col-md-6">
                  <label class="form-label required">活動類型</label>
                  <select
                      class="form-select"
                      v-model="form.type"
                      required
                  >
                    <option value="">請選擇類型</option>
                    <option value="discount">折扣優惠</option>
                    <option value="event">特別活動</option>
                    <option value="seasonal">季節活動</option>
                    <option value="member">會員專屬</option>
                  </select>
                </div>

                <!-- 活動狀態 -->
                <div class="col-md-6">
                  <label class="form-label required">活動狀態</label>
                  <select
                      class="form-select"
                      v-model="form.status"
                      required
                  >
                    <option value="draft">草稿</option>
                    <option value="upcoming">即將開始</option>
                    <option value="ongoing">進行中</option>
                    <option value="ended">已結束</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 時間設定區塊 -->
            <div class="form-section mb-4">
              <h6 class="section-title">時間設定</h6>
              <div class="row g-3">
                <!-- 開始日期 -->
                <div class="col-md-6">
                  <label class="form-label required">開始日期</label>
                  <input
                      type="datetime-local"
                      class="form-control"
                      v-model="form.startDate"
                      required
                  >
                </div>

                <!-- 結束日期 -->
                <div class="col-md-6">
                  <label class="form-label required">結束日期</label>
                  <input
                      type="datetime-local"
                      class="form-control"
                      v-model="form.endDate"
                      required
                      :min="form.startDate"
                  >
                </div>
              </div>
            </div>

            <!-- 活動內容區塊 -->
            <div class="form-section mb-4">
              <h6 class="section-title">活動內容</h6>
              <div class="row g-3">
                <!-- 活動描述 -->
                <div class="col-12">
                  <label class="form-label required">活動描述</label>
                  <textarea
                      class="form-control"
                      v-model="form.description"
                      rows="4"
                      required
                      maxlength="500"
                      placeholder="請詳細描述活動內容"
                  ></textarea>
                  <small class="text-muted">
                    剩餘字數：{{ 500 - form.description.length }}
                  </small>
                </div>

                <!-- 活動規則 -->
                <div class="col-12">
                  <label class="form-label">活動規則</label>
                  <textarea
                      class="form-control"
                      v-model="form.rules"
                      rows="3"
                      maxlength="300"
                      placeholder="請輸入活動規則（選填）"
                  ></textarea>
                </div>

                <!-- 注意事項 -->
                <div class="col-12">
                  <label class="form-label">注意事項</label>
                  <textarea
                      class="form-control"
                      v-model="form.notes"
                      rows="3"
                      maxlength="300"
                      placeholder="請輸入注意事項（選填）"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 媒體資源區塊 -->
            <div class="form-section mb-4">
              <h6 class="section-title">媒體資源</h6>
              <div class="row g-3">
                <!-- 活動圖片 -->
                <div class="col-12">
                  <label class="form-label">活動圖片</label>
                  <div class="image-upload-container">
                    <div
                        class="image-preview"
                        v-if="imagePreview || form.imageUrl"
                    >
                      <img
                          :src="imagePreview || form.imageUrl"
                          alt="活動圖片預覽"
                      >
                      <button
                          type="button"
                          class="btn-remove"
                          @click="removeImage"
                      >
                        <i class="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                    <div
                        class="upload-placeholder"
                        v-else
                        @click="triggerImageUpload"
                    >
                      <i class="bi bi-cloud-upload"></i>
                      <span>點擊或拖曳上傳圖片</span>
                      <small class="text-muted">
                        建議尺寸：1200x630px，檔案大小不超過2MB
                      </small>
                    </div>
                    <input
                        type="file"
                        ref="imageInput"
                        class="d-none"
                        @change="handleImageUpload"
                        accept="image/*"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 進階設定區塊 -->
            <div class="form-section">
              <h6 class="section-title">進階設定</h6>
              <div class="row g-3">
                <!-- 參與限制 -->
                <div class="col-md-6">
                  <label class="form-label">參與人數上限</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model="form.maxParticipants"
                      min="0"
                      placeholder="不限制請留空"
                  >
                </div>

                <!-- 每人限制 -->
                <div class="col-md-6">
                  <label class="form-label">每人參與次數</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model="form.maxPerPerson"
                      min="0"
                      placeholder="不限制請留空"
                  >
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
          >
            取消
          </button>
          <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
              @click="handleSubmit"
          >
            <span
                class="spinner-border spinner-border-sm me-1"
                v-if="saving"
            ></span>
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Modal } from 'bootstrap'

export default {
  name: 'PromotionFormModal',

  props: {
    editingPromotion: {
      type: Object,
      default: null
    }
  },

  emits: ['save'],

  setup(props, { emit }) {
    // Modal 實例
    let modalInstance = null
    const imageInput = ref(null)

    // 表單狀態
    const saving = ref(false)
    const imagePreview = ref(null)
    const form = ref({
      title: '',
      type: '',
      status: 'draft',
      startDate: '',
      endDate: '',
      description: '',
      rules: '',
      notes: '',
      imageUrl: '',
      imageFile: null,
      maxParticipants: '',
      maxPerPerson: ''
    })

    // 監聽編輯對象變化
    watch(() => props.editingPromotion, (newVal) => {
      if (newVal) {
        // 編輯模式：填充表單
        form.value = {
          ...newVal,
          startDate: formatDateForInput(newVal.startDate),
          endDate: formatDateForInput(newVal.endDate)
        }
        imagePreview.value = newVal.imageUrl
      } else {
        // 新增模式：重置表單
        resetForm()
      }
    })

    // 方法
    const resetForm = () => {
      form.value = {
        title: '',
        type: '',
        status: 'draft',
        startDate: '',
        endDate: '',
        description: '',
        rules: '',
        notes: '',
        imageUrl: '',
        imageFile: null,
        maxParticipants: '',
        maxPerPerson: ''
      }
      imagePreview.value = null
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().slice(0, 16)
    }

    const triggerImageUpload = () => {
      imageInput.value.click()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案')
        return
      }

      // 檢查檔案大小 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('圖片大小不能超過2MB')
        return
      }

      // 預覽圖片
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)

      form.value.imageFile = file
    }

    const removeImage = () => {
      form.value.imageFile = null
      form.value.imageUrl = ''
      imagePreview.value = null
      if (imageInput.value) {
        imageInput.value.value = ''
      }
    }

    const validateForm = () => {
      // 檢查日期
      const startDate = new Date(form.value.startDate)
      const endDate = new Date(form.value.endDate)

      if (endDate < startDate) {
        alert('結束時間不能早於開始時間')
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      saving.value = true
      try {
        // 建立 FormData
        const formData = new FormData()
        Object.keys(form.value).forEach(key => {
          if (key === 'imageFile' && form.value[key]) {
            formData.append('image', form.value[key])
          } else if (form.value[key] !== '') {
            formData.append(key, form.value[key])
          }
        })

        await emit('save', formData)
        modalInstance.hide()
        resetForm()
      } catch (error) {
        console.error('Error saving promotion:', error)
        alert('儲存失敗，請稍後再試')
      } finally {
        saving.value = false
      }
    }

    // Modal 控制方法
    const show = () => {
      modalInstance.show()
    }

    const hide = () => {
      modalInstance.hide()
    }

    // 生命週期鉤子
    onMounted(() => {
      modalInstance = new Modal(document.getElementById('promotionFormModal'))
    })

    onBeforeUnmount(() => {
      if (modalInstance) {
        modalInstance.dispose()
      }
    })

    return {
      form,
      saving,
      imageInput,
      imagePreview,
      show,
      hide,
      handleSubmit,
      triggerImageUpload,
      handleImageUpload,
      removeImage
    }
  }
}
</script>

<style scoped>
.form-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.form-label.required::after {
  content: '*';
  color: #dc3545;
  margin-left: 4px;
}

.image-upload-container {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-upload-container:hover {
  border-color: var(--bs-primary);
}

.upload-placeholder {
  padding: 2rem;
}

.upload-placeholder i {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.upload-placeholder span {
  display: block;
  margin-bottom: 0.5rem;
}

.image-preview {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.btn-remove {
  position: absolute;
  top: -10px;
  right: -10px;
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.btn-remove:hover {
  color: #bb2d3b;
}

@media (max-width: 768px) {
  .form-section {
    padding: 1rem;
  }

  .image-preview img {
    max-height: 200px;
  }
}
</style>

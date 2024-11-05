<template>
    <div class="faq-container">
      <div class="faq-question">
        <h3>市民卡有哪些種類，申請資格為何？</h3>
      </div>
      <div class="faq-answer">
        <p>共分為四種卡，簡略如下（本網站市民卡介紹說明）：</p>
        <ul>
          <li>
            <strong>一、一般卡：</strong>
            <ul>
              <li>（一）設籍本市。</li>
              <li>（二）年滿7歲以上至65歲以下。</li>
              <li>（三）不具備敬老卡、愛心卡及學生卡申請資格之市民。</li>
              <li>（四）設籍本市市民之外籍或大陸港澳配偶（領有中華民國居留證且其配偶設籍本市者）。</li>
            </ul>
            <p>※外籍配偶不分年齡皆為一般卡別。</p>
          </li>
          <li>
            <strong>二、敬老卡：</strong> 
            <ul>
              <li>設籍本市且年滿65以上之市民。</li>
            </ul>
          </li>
          <li>
            <strong>三、愛心卡：</strong> 
            <ul>
              <li>設籍本市且領有身心障礙證明之市民。</li>
            </ul>
          </li>
          <li>
            <strong>四、學生卡，符合下列條件之一：</strong>
            <ul>
              <li>（一）本市市立高中、國中、國小全面發放，由學校統一向教育局申請。</li>
              <li>（二）本市國、私立五專、高中、高職、國中及國小，以校為單位向教育局申請。</li>
              <li>（三）設籍本市，但就讀於外縣市學校之學生，可自由申請不具學生證功能之學生卡。</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "FAQ"
  };
  </script>
  
  <style scoped>
  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .faq-question {
    background-color: #f8d7da;
    border: 2px dashed #ba0043;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .faq-question h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #ba0043;
  }
  
  .faq-answer {
    font-size: 1rem;
    color: #333;
    line-height: 2.0;
  }
  
  .faq-answer ul {
    list-style-type: none;
  }
  
  .faq-answer ul li {
    margin-bottom: 10px;
  }
  
  .faq-answer strong {
    color: #ba0043;
  }
  </style>
  
// LeanCloud 配置
const APP_ID = "FYr9DoTYGGf1jB1zyj2eiaf5-gzGzoHsz";
const APP_KEY = "cwskAtC4QndeILToat9a2Qti";
const SERVER_URL = "https://fyr9doty.lc-cn-n1-shared.com/1.1/classes/tem_and_hum";  // LeanCloud 端点
const LED_CLASS = "LED_Control";
const LED_OBJECT_ID = "67dc10b294d4a9142b28c4ff"; // 请在LeanCloud控制台中获取

// 创建图表
function createChart(ctx, label, borderColor, bgColor, yMax) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: borderColor,
                backgroundColor: bgColor,
                pointRadius: 5,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: '时间' } },
                y: { title: { display: true, text: label }, min: 0, max: yMax }
            }
        }
    });
}

// 创建温度和湿度图表
const tempChart = createChart(document.getElementById('tempChart').getContext('2d'), "温度 (°C)", "red", "rgba(255, 0, 0, 0.2)", 50);
const humChart = createChart(document.getElementById('humChart').getContext('2d'), "湿度 (%)", "blue", "rgba(0, 0, 255, 0.2)", 100);

// 获取数据
async function fetchData() {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'GET',
            headers: {
                'X-LC-Id': APP_ID,
                'X-LC-Key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            let records = data.results.reverse(); // 反转数据，使时间按升序排列
            let labels = records.map(item => new Date(item.createdAt).toLocaleTimeString());
            let temperatures = records.map(item => item.temperature);
            let humidities = records.map(item => item.humidity);

            // 更新温湿度显示
            let latest = records[records.length - 1];
            document.querySelector('.temp').innerText = latest.temperature + " °C";
            document.querySelector('.hum').innerText = latest.humidity + " %";

            // 更新图表数据
            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = temperatures;
            tempChart.update();

            humChart.data.labels = labels;
            humChart.data.datasets[0].data = humidities;
            humChart.update();
        } else {
            console.warn("未找到数据");
        }
    } catch (error) {
        console.error("数据获取失败:", error);
    }
}

// 切换LED状态
function toggleLED() {
    const button = document.getElementById('ledButton');
    const currentState = button.innerText.includes('关闭') ? 'ON' : 'OFF';
    const newState = currentState === 'ON' ? 'OFF' : 'ON';

    fetch(`${SERVER_URL}/${LED_CLASS}/${LED_OBJECT_ID}`, {
        method: "PUT",
        headers: {
            "X-LC-Id": APP_ID,
            "X-LC-Key": APP_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ledStatus: newState })
    })
    .then(response => response.json())
    .then(data => {
        if (data.updatedAt) {
            button.innerText = newState === 'ON' ? '关闭 LED' : '打开 LED';
            console.log(`LED 状态已更新为 ${newState}`);
        } else {
            console.error("更新 LED 状态失败");
        }
    })
    .catch(error => console.error("更新 LED 状态时出错:", error));
}

// 页面加载时获取数据
fetchData();
// 每 10 秒刷新一次数据
setInterval(fetchData, 10000);

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker 注册成功:', registration);
            })
            .catch((error) => {
                console.log('Service Worker 注册失败:', error);
            });
    });
}

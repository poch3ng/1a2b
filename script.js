// 全域變數，儲存猜測和結果
let guesses = [];
let results = [];

function checkGuess(guess, answer) {
    let a = 0, b = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === answer[i]) {
            a++;
        } else if (answer.includes(guess[i])) {
            b++;
        }
    }
    return [a, b];
}

function getPossibleAnswers(guesses, results) {
    // 生成所有可能的四位不重複數字組合
    let allCombinations = [];
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (j === i) continue;
            for (let k = 0; k < 10; k++) {
                if (k === i || k === j) continue;
                for (let l = 0; l < 10; l++) {
                    if (l === i || l === j || l === k) continue;
                    allCombinations.push(`${i}${j}${k}${l}`);
                }
            }
        }
    }
    // 篩選符合所有猜測和結果的答案
    return allCombinations.filter(candidate => {
        return guesses.every((guess, idx) => {
            let [a, b] = checkGuess(guess, candidate);
            return a === results[idx][0] && b === results[idx][1];
        });
    });
}

function evaluateGuess(guess, possibleAnswers) {
    let resultCounts = {};
    for (let answer of possibleAnswers) {
        let [a, b] = checkGuess(guess, answer);
        let result = `${a},${b}`;
        resultCounts[result] = (resultCounts[result] || 0) + 1;
    }
    return Math.max(...Object.values(resultCounts)) || possibleAnswers.length;
}

function suggestBestGuess(guesses, results) {
    let possibleAnswers = getPossibleAnswers(guesses, results);
    if (!possibleAnswers.length) {
        return [null, "無合理建議，可能輸入有誤！"];
    }
    if (possibleAnswers.length === 1) {
        return [possibleAnswers[0], `答案只剩一個：${possibleAnswers[0]}`];
    }
    // 測試所有可能答案作為猜測，選擇最優
    let bestGuess = null;
    let bestScore = Infinity;
    // 為了加速，只測試可能答案和少量其他猜測
    let testGuesses = [...possibleAnswers];
    for (let i = 0; i < 10 && testGuesses.length < 100; i++) {
        let randomGuess;
        do {
            randomGuess = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        } while (new Set(randomGuess).size !== 4 || testGuesses.includes(randomGuess));
        testGuesses.push(randomGuess);
    }
    for (let guess of testGuesses) {
        let score = evaluateGuess(guess, possibleAnswers);
        if (score < bestScore) {
            bestScore = score;
            bestGuess = guess;
        }
    }
    return [bestGuess, `建議猜測：${bestGuess}（剩餘可能答案數：${possibleAnswers.length}）`];
}

function suggest() {
    let input = document.getElementById("input").value.trim();
    let output = document.getElementById("output");
    let history = document.getElementById("history");
    try {
        let [guess, result] = input.split(" ");
        if (!/^\d{4}$/.test(guess) || new Set(guess).size !== 4) {
            output.textContent = "猜測無效！請輸入四位不重複數字。";
            return;
        }
        let a = parseInt(result[0]), b = parseInt(result[2]);
        if (isNaN(a) || isNaN(b) || a + b > 4 || a < 0 || b < 0) {
            output.textContent = "結果無效！A 和 B 的總和不能超過 4，且不能為負。";
            return;
        }
        guesses.push(guess);
        results.push([a, b]);
        let [bestGuess, message] = suggestBestGuess(guesses, results);
        output.textContent = message;
        // 更新歷史紀錄
        history.innerHTML = "<h3>猜測紀錄：</h3>" + guesses.map((g, i) => `${g} ${results[i][0]}A${results[i][1]}B`).join("<br>");
        if (result === "4A0B") {
            output.textContent = "恭喜！你已經猜對答案！";
            history.innerHTML += "<br><strong>遊戲結束！</strong>";
            guesses = [];
            results = [];
        }
        document.getElementById("input").value = "";
    } catch (e) {
        output.textContent = "輸入格式錯誤！請輸入類似 '1234 1A2B' 的格式。";
    }
}

function reset() {
    guesses = [];
    results = [];
    document.getElementById("input").value = "";
    document.getElementById("output").textContent = "";
    document.getElementById("history").innerHTML = "";
}

// 註冊 Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(err => console.log("Service Worker 註冊失敗:", err));
}

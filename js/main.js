window.onload = function () {
    // 获取文章的数据
    ajaxGetJson("/banked-cloze/data/passage.json");
    lockOptions();
    getOptionContent();
};

// AJAX 获取JSON数据
function ajaxGetJson(url) {
    var ajaxObj;
    if (window.XMLHttpRequest) {
        ajaxObj = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        ajaxObj = new ActiveXObject();
    } else {
        alert("浏览器太旧。");
    }
    if (ajaxObj != null) {
        ajaxObj.open("GET", url, "true");
        ajaxObj.send(null);
        ajaxObj.onreadystatechange = function () {
            if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
                var jsonData = JSON.parse(ajaxObj.responseText);
                var passageNum = jsonData.contents.length;
                var n = Math.floor(Math.random() * passageNum);
                getPassageJsonData(jsonData.contents[n]);
            }

        };
    }
}

// 根据JSON 数据在页面中填入内容
function getPassageJsonData(data) {
    var fullTextDiv = document.getElementById("full-text");
    var questionsOption = document.getElementsByClassName("questions-option")[0];
    var submitButton = document.getElementsByClassName("submit-result")[0];
    var fullTextContent = document.createTextNode("");
    fullTextDiv.insertBefore(fullTextContent, fullTextDiv[0]);

    // 匹配到文章中的所有答题位置
    var blankStr = "<span class='blank'> </span>";
    fullTextDiv.innerHTML = data.passageContent.replace(/_____/g, blankStr);

    // 在option中传入数据
    for (var i = 0; i < data.options.length; i++) {
        var optionSpan = document.createElement("span");
        var optionContent = document.createTextNode(data.options[i]);
        optionSpan.className = "option";
        questionsOption.insertBefore(optionSpan, questionsOption[i]);
        optionSpan.insertBefore(optionContent, optionSpan[0]);
    }

    connectBlankToNum();

    // 交卷
    submitButton.onclick = function () {
        submitResult(data.trueAnswer, data.reason);
    };
}

// 锁定option
function lockOptions() {
    var questionsOption = document.getElementsByClassName("questions-option")[0];
    questionsOption.className = "questions-option disabled-option";
}

// 解锁option
function unlockOptions() {
    var questionsOption = document.getElementsByClassName("disabled-option")[0];
    questionsOption.className = "questions-option";
}

// blank与num点击相关联
function connectBlankToNum() {
    var allBlank = document.getElementsByClassName("blank");
    var allNum = document.getElementsByClassName("num");
    getQuestionByBlank(allBlank, allNum);
    getQuestionByNum(allNum, allBlank);
}

// 根据Blank选择题目
function getQuestionByBlank(allBlank, allNum) {
    for (var i = 0; i < allBlank.length; i++) {
        allBlank[i].onclick = function () {

            if (document.getElementsByClassName("disabled-option"[0])) {
                lockOptions();
            }
            unlockOptions();

            for (var j = 0; j < allBlank.length; j++) {
                if (allBlank[j].className == "blank answered") {
                    allBlank[j].className = "blank answered";
                    allNum[j].className = "num answered";
                } else {
                    allBlank[j].className = "blank";
                    allNum[j].className = "num";
                    allBlank[j].childNodes[0].nodeValue = "";
                }
            }

            for (var n = 0; n < allBlank.length; n++) {
                if (allBlank[n] == this || allNum[n] == this) {
                    allBlank[n].className = "blank selected";
                    allNum[n].className = "num selected";
                    getQuestionByNum(allNum, allBlank);
                }
                if (allBlank[n].className == "blank selected") {
                    getOptionContent(allBlank[n], allNum[n]);
                    if (allBlank[n].className != "blank answered") {
                        allBlank[n].childNodes[0].nodeValue = "";
                    }
                }
            }
        }

    }
}

// 根据Num选择题目
function getQuestionByNum(allNum, allBlank) {
    for (var i = 0; i < allNum.length; i++) {
        allNum[i].onclick = function () {

            if (document.getElementsByClassName("disabled-option"[0])) {
                lockOptions();
            }
            unlockOptions();

            for (var j = 0; j < allBlank.length; j++) {
                if (allBlank[j].className == "blank answered") {
                    allBlank[j].className = "blank answered";
                    allNum[j].className = "num answered";
                } else {
                    allBlank[j].className = "blank";
                    allNum[j].className = "num";
                    allBlank[j].childNodes[0].nodeValue = "";
                }
            }

            for (var n = 0; n < allBlank.length; n++) {
                if (allBlank[n] == this || allNum[n] == this) {
                    allBlank[n].className = "blank selected";
                    allNum[n].className = "num selected";
                    getQuestionByBlank(allBlank, allNum);
                }
                if (allBlank[n].className == "blank selected") {
                    getOptionContent(allBlank[n], allNum[n]);
                    if (allBlank[n].className != "blank answered") {
                        allBlank[n].childNodes[0].nodeValue = "";
                    }
                }
            }
        }
    }


}

// 获取option内容
function getOptionContent(blank, num) {
    var allOption = document.getElementsByClassName("option");
    for (var i = 0; i < allOption.length; i++) {
        allOption[i].onmousemove = function () {
            blank.childNodes[0].nodeValue = this.childNodes[0].nodeValue;
            this.onclick = function () {
                blank.childNodes[0].nodeValue = this.childNodes[0].nodeValue;
                lockOptions();
                blank.className = "blank answered";
                num.className = "num answered";
                this.className = "option selected";
            };
        };
    }
}

// 交卷
function submitResult(trueAnswer, reason) {
    buildShade();
    buildReportCard(trueAnswer, reason);
}

// 遮罩蒙版
function buildShade() {
    if (document.getElementsByClassName("shade")[0]) {
        return;
    }
    var shadeDiv = document.createElement("div");
    var containerDiv = document.getElementsByClassName("container")[0];
    shadeDiv.className = "shade";
    containerDiv.insertBefore(shadeDiv, containerDiv[0]);
    containerDiv.style.overflow = "hidden";
}

// 建立弹出框
function buildReportCard(trueAnswer, reason) {
    if (document.getElementsByClassName("report-card")[0]) {
        return;
    }

    // 获取正确率，错误率，正确题目的数组，错误题目的数组
    var judgeResult = judgeTrueOrFalse(trueAnswer);

    var shadeDiv = document.getElementsByClassName("shade")[0];
    var grade = (judgeResult.userTruePercent * 100 ) + "%";

    var reportCard = document.createElement("div");
    var reportHeader = document.createElement("h1");
    var reportMain = document.createElement("div");
    var reportFooter = document.createElement("div");
    var reportHeaderContent = document.createTextNode("成绩报告");
    var reportGradeSpan = document.createElement("span");
    var reportGrade = document.createTextNode(grade);
    var reportTrueSpan = document.createElement("span");
    var reportTrue = document.createTextNode("正确率");
    var reportNumUl = document.createElement("ul");
    var checkParseButton = document.createElement("button");
    var returnListButton = document.createElement("button");
    var checkParseContent = document.createTextNode("查解析");
    var returnListContent = document.createTextNode("回列表");

    reportCard.className = "report-card";
    reportHeader.className = "report-title";
    reportMain.className = "report-main";
    reportGradeSpan.className = "report-grade";
    reportTrueSpan.className = "grade-desc";
    reportNumUl.className = "grade-num";
    reportFooter.className = "report-footer";
    checkParseButton.className = "footer-button check-parse";
    returnListButton.className = "footer-button return-list";

    // 报告整体 + 头部
    shadeDiv.insertBefore(reportCard, shadeDiv[0]);
    reportCard.insertBefore(reportHeader, reportCard[0]);

    // 报告主体
    reportHeader.insertBefore(reportHeaderContent, reportHeader[0]);
    reportCard.insertBefore(reportMain, reportCard[1]);
    reportMain.insertBefore(reportGradeSpan, reportMain[0]);
    reportGradeSpan.insertBefore(reportGrade, reportGradeSpan[0]);
    reportMain.insertBefore(reportTrueSpan, reportMain[1]);
    reportTrueSpan.insertBefore(reportTrue, reportTrueSpan[0]);
    reportMain.insertBefore(reportNumUl, reportMain[2]);

    for (var i = 0; i < judgeResult.userAnswer.length; i++) {
        var reportNumLi = document.createElement("li");
        var reportNumLiContent = document.createTextNode(i + 1);
        if (judgeResult.userAnswer[i].judge == true) {
            reportNumLi.className = "report-question-num true-answer";
        } else {
            reportNumLi.className = "report-question-num false-answer";
        }
        reportNumUl.insertBefore(reportNumLi, reportNumUl[i]);
        reportNumLi.insertBefore(reportNumLiContent, reportNumLi[0]);
    }

    // 报告底部
    reportCard.insertBefore(reportFooter, reportCard[2]);
    reportFooter.insertBefore(checkParseButton, reportFooter[0]);
    reportFooter.insertBefore(returnListButton, reportFooter[1]);
    checkParseButton.insertBefore(checkParseContent, checkParseButton[0]);
    returnListButton.insertBefore(returnListContent, returnListButton[0]);


    checkParseButton.onclick = function () {
        shadeDiv.style.display = "none";
        afterSubmit(judgeResult, reason, trueAnswer);
    }
}

// 判断对错
function judgeTrueOrFalse(trueAnswer) {
    var trueNum = 0;
    var falseNum = 0;
    var userTruePercent, userFalsePercent;
    var userAnswer = getUserAnswer();
    var userAnswerByJudge = [];

    for (var i = 0; i < userAnswer.length; i++) {
        if (userAnswer[i] == trueAnswer[i]) {
            trueNum++;
            userAnswerByJudge.push({
                index: i,
                answer: userAnswer[i],
                judge: true
            });
        } else if (userAnswer[i] != trueAnswer[i]) {
            falseNum++;
            userAnswerByJudge.push({
                index: i,
                answer: userAnswer[i],
                judge: false
            });
        }
    }
    userTruePercent = trueNum / trueAnswer.length;
    userFalsePercent = falseNum / trueAnswer.length;
    return {
        userAnswer: userAnswerByJudge,
        userTruePercent: userTruePercent,
        userFalsePercent: userFalsePercent
    }
}

// 获取用户的答案
function getUserAnswer() {
    var userAnswer = [];
    var allBlank = document.getElementsByClassName("blank");
    for (var i = 0; i < allBlank.length; i++) {
        if (allBlank[i].childNodes[0] == undefined) {
            userAnswer.push("");
        } else if (allBlank[i].childNodes[0].nodeValue == '') {
            userAnswer.push("");
        } else {
            userAnswer.push(allBlank[i].childNodes[0].nodeValue);
        }
    }
    return userAnswer;
}

// 提交之后
function afterSubmit(afterJudge, reason, trueAnswer) {

    var questionOptionDiv = document.getElementsByClassName("questions-option")[0];
    var questionParseDiv = document.getElementsByClassName("questions-parse")[0];
    questionOptionDiv.style.display = "none";
    questionParseDiv.style.display = "block";

    var fullTextDiv = document.getElementById("full-text");
    var allBlank = fullTextDiv.getElementsByTagName("span");
    var length = allBlank.length;

    var questionNumDiv = document.getElementsByClassName("questions-num")[0];
    var allNum = questionNumDiv.getElementsByTagName("i");


    var parseAnswerDiv = document.getElementsByClassName("parse-answer")[0];
    var parseReasonDiv = document.getElementsByClassName("parse-reason")[0];


    for (var i = 0; i < length; i++) {
        allBlank[i].setAttribute('data-answer', trueAnswer[i]);

        // 默认解析显示第一题内容
        allNum[0].onclick();

        if (afterJudge.userAnswer[i].judge == true) {
            allBlank[i].className = "true-blank";
            allNum[i].className = "true-num";
            allNum[i].onclick = function () {
                for (var j = 0; j < allNum.length; j++) {
                    for (var n = 0; n < allNum.length; n++) {
                        allNum[n].setAttribute("id", "");
                    }
                    if (allNum[j] == this) {
                        parseAnswerDiv.childNodes[2].nodeValue = trueAnswer[j];
                        parseReasonDiv.childNodes[2].nodeValue = reason[j];
                    }
                }
                this.setAttribute("id", "check-parse");
            };
        } else {
            if (allBlank[i].childNodes[0].nodeValue == " " || allBlank[i].childNodes[0].nodeValue == "") {
                allBlank[i].className = "gab-blank";
                allNum[i].className = "false-num";
                var gabContentI = document.createElement("i");
                var gabContent = document.createTextNode("-");
                allBlank[i].appendChild(gabContentI);
                gabContentI.appendChild(gabContent);
                allNum[i].onclick = function () {
                    for (var j = 0; j < allNum.length; j++) {
                        for (var n = 0; n < allNum.length; n++) {
                            allNum[n].setAttribute("id", "");
                        }
                        if (allNum[j] == this) {
                            parseAnswerDiv.childNodes[2].nodeValue = trueAnswer[j];
                            parseReasonDiv.childNodes[2].nodeValue = reason[j];
                        }
                    }
                    this.setAttribute("id", "check-parse");
                };
            } else {
                allBlank[i].className = "false-blank";
                allNum[i].className = "false-num";
                var falseContentI = document.createElement("del");
                var falseContent = document.createTextNode(allBlank[i].childNodes[0].nodeValue);
                allBlank[i].childNodes[0].nodeValue = "";
                allBlank[i].appendChild(falseContentI);
                falseContentI.appendChild(falseContent);
                allNum[i].onclick = function () {
                    for (var j = 0; j < allNum.length; j++) {
                        for (var n = 0; n < allNum.length; n++) {
                            allNum[n].setAttribute("id", "");
                        }
                        if (allNum[j] == this) {
                            parseAnswerDiv.childNodes[2].nodeValue = trueAnswer[j];
                            parseReasonDiv.childNodes[2].nodeValue = reason[j];
                        }
                    }
                    this.setAttribute("id", "check-parse");
                };
            }
        }


    }
}

var discs = []
var turn = 1
var ai = 0
var scoreBlackLabel = document.getElementById("scoreBlack")
var scoreWhiteLabel = document.getElementById("scoreWhite")
var turnLabel = document.getElementById("turn")
var gameOver = false
let timer

window.onload=function() {
    getStarted()
}

function checkAI() {
    var aiLabel = document.getElementById("ai-type").value
    if (aiLabel == "none") {
        stopTimer()
        getStarted()
    }
    else if (aiLabel == "black") getStartedAIBlack()
    else if (aiLabel == "white") getStartedAIWhite()
}

function getStarted() {
    ai = 0
    turn = 1
    gameOver = false
    setDiscs()
    setBlockedRegion()
    if (canMove(1) == false && canMove(2)) {
        alert("Black cannot move. Turn goes to White!")
        turn = 2
    }
    drawDiscs()
    drawCanMoveLayer()
    redrawScore()
    redrawTurn()

    if (canMove(1) == false && canMove(2) == false) {
        alert("Game over!")
        gameOver = true
    }

    if (gameOver) {
        drawDiscs()
        redrawScore()
        
        var ones = 0
        var twos = 0
        for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 8; column++) {
                var value = discs[row][column]
                if (value == 1) ones += 1
                else if (value == 2) twos += 1
            }
        }
        
        if (ones > twos) {
            turnLabel.innerHTML = "Black win!"
        }
        else if (ones < twos) {
            turnLabel.innerHTML = "White win!"
        }
        else if (ones == twos) {
            turnLabel.innerHTML = "Draw!"
        }
    }
}

function getStartedAIBlack() {
    stopTimer()
    getStarted()
    ai = 1
    setTimeout(function () {
        playAIBlack()
    }, 1000)
}

function getStartedAIWhite() {
    stopTimer()
    getStarted()
    ai = 2
}

function stopTimer() {
    clearInterval(timer);
}

function playAIBlack() {
    var id = 1
    var idx_list = []
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            if (canClickSpot(id,row,column)) {
                idx_list.push([row,column])
            }
        }
    }
    var idx = Math.floor(Math.random() * idx_list.length)
    var number = idx_list.splice(idx, 1)
    var row = number[0][0]
    var column = number[0][1]
    clickedSquare(row,column)
}

function playAIWhite() {
    var id = 2
    var idx_list = []
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            if (canClickSpot(id,row,column)) {
                idx_list.push([row,column])
            }
        }
    }
    var idx = Math.floor(Math.random() * idx_list.length)
    var number = idx_list.splice(idx, 1)
    var row = number[0][0]
    var column = number[0][1]
    clickedSquare(row,column)
}

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function setDiscs() {
    discs = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,1,0,0,0],
        [0,0,0,1,2,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ]
}

function setBlockedRegion() {
    var num_list = range(1, 64)
    num_list.splice(27,2)
    num_list.splice(33,2)
    var block_list = []

    for (let i = 0; i < 5; i++) {
        var index = Math.floor(Math.random() * num_list.length)
        var number = num_list.splice(index, 1)
        block_list.push(number[0])
    }

    for (let idx in block_list) {
        if (block_list[idx] % 8 == 0) {
            var row = parseInt(block_list[idx] / 8) - 1
            var column = 7
        }
        else {
            var row = parseInt(block_list[idx] / 8)
            var column = block_list[idx] % 8 - 1
        }
        discs[row][column] = 3
    }
}

function drawDiscs() {
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            if (discs[row][column] == 0) {
                var idx = String(row) + "_" + String(column)
                document.getElementById(idx).setAttribute("class", "cell")
            }
            else if (discs[row][column] == 1) {
                var idx = String(row) + "_" + String(column)
                document.getElementById(idx).setAttribute("class", "cell black")
            }
            else if (discs[row][column] == 2) {
                var idx = String(row) + "_" + String(column)
                document.getElementById(idx).setAttribute("class", "cell white")
            }
            else if (discs[row][column] == 3) {
                var idx = String(row) + "_" + String(column)
                document.getElementById(idx).setAttribute("class", "cell blocked")
            }
        }
    }
}

function clickedSquare(row,column,AI=true) {
    if (gameOver) return

    if (discs[row][column] != 0) {
        return
    }

    if (AI==false) {
        if (ai==1 && turn==1) {
            return
        }
        else if (ai==2 && turn==2) {
            return
        }
    }

    if (canClickSpot(turn,row,column) == true) {
        var affectedDiscs = getAffectedDiscs(turn,row,column)
        flipDiscs(affectedDiscs)
        discs[row][column] = turn
        if (turn == 1 && canMove(2)) turn = 2
        else if (turn == 1 && canMove(2) == false && canMove(1)) {
            alert("White cannot move. Turn goes to Black!")
        }
        else if (turn == 2 && canMove(1)) turn = 1
        else if (turn == 2 && canMove(1) == false && canMove(2)) {
            alert("Black cannot move. Turn goes to White!")
        }
        
        if (canMove(1) == false && canMove(2) == false) {
            alert("Game over!")
            gameOver = true
        }

        if (gameOver) {
            drawDiscs()
            redrawScore()
            
            var ones = 0
            var twos = 0
            for (var row = 0; row < 8; row++) {
                for (var column = 0; column < 8; column++) {
                    var value = discs[row][column]
                    if (value == 1) ones += 1
                    else if (value == 2) twos += 1
                }
            }
            
            if (ones > twos) {
                turnLabel.innerHTML = "Black win!"
            }
            else if (ones < twos) {
                turnLabel.innerHTML = "White win!"
            }
            else if (ones == twos) {
                turnLabel.innerHTML = "Draw!"
            }
        }
        else {
            drawDiscs()
            drawCanMoveLayer()
            redrawScore()
            redrawTurn()
            moveAI()
        }
    }
}

function moveAI() {
    if (ai == 1 && turn == 1) {
        setTimeout(function () {
            playAIBlack()
        }, 1000)
    }
    
    if (ai == 2 && turn == 2) {
        setTimeout(function () {
            playAIWhite()
        }, 1000)
    }
}

function drawCanMoveLayer() {
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            var value = discs[row][column]
            if (value == 0 && canClickSpot(turn,row,column)) {
                if (turn == 1) {
                    var idx = String(row) + "_" + String(column)
                    document.getElementById(idx).setAttribute("class", "cell attackableBlack")
                }
                else if (turn == 2) {
                    var idx = String(row) + "_" + String(column)
                    document.getElementById(idx).setAttribute("class", "cell attackableWhite")
                }
            }
        }
    }
}

function canMove(id) {
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            if (canClickSpot(id,row,column)) {
                return true
            }
        }
    }
    return false
}

function redrawScore() {
    var ones = 0
    var twos = 0
    for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 8; column++) {
            var value = discs[row][column]
            if (value == 1) ones += 1
            else if (value == 2) twos += 1
        }
    }
    if (ones < 10) scoreBlackLabel.innerHTML = "0" + String(ones)
    else scoreBlackLabel.innerHTML = ones

    if (twos < 10) scoreWhiteLabel.innerHTML = "0" + String(twos)
    else scoreWhiteLabel.innerHTML = twos
}

function redrawTurn() {
    if (turn == 1) turnLabel.innerHTML = "Turn: Black"
    else turnLabel.innerHTML = "Turn: White"
}

function canClickSpot(id,row,column) {
    var affectedDiscs = getAffectedDiscs(id,row,column)
    if (affectedDiscs.length == 0 || discs[row][column] != 0) return false
    else return true
}

function getAffectedDiscs(id,row,column) {
    var affectedDiscs = []

    // to the right
    var couldBeAffected = []
    var columnIterator = column
    while (columnIterator < 7) {
        columnIterator += 1
        var valueAtSpot = discs[row][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:row, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }

    // to the left
    var couldBeAffected = []
    var columnIterator = column
    while (columnIterator > 0) {
        columnIterator -= 1
        var valueAtSpot = discs[row][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:row, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }

    // above
    var couldBeAffected = []
    var rowIterator = row
    while (rowIterator > 0) {
        rowIterator -= 1
        var valueAtSpot = discs[rowIterator][column]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:column}
            couldBeAffected.push(discLocation)
        }
    }

    // below
    var couldBeAffected = []
    var rowIterator = row
    while (rowIterator < 7) {
        rowIterator += 1
        var valueAtSpot = discs[rowIterator][column]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:column}
            couldBeAffected.push(discLocation)
        }
    }

    // down right
    var couldBeAffected = []
    var rowIterator = row
    var columnIterator = column
    while (rowIterator < 7 && columnIterator < 7) {
        rowIterator += 1
        columnIterator += 1
        var valueAtSpot = discs[rowIterator][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }

    // down left
    var couldBeAffected = []
    var rowIterator = row
    var columnIterator = column
    while (rowIterator < 7 && columnIterator > 0) {
        rowIterator += 1
        columnIterator -= 1
        var valueAtSpot = discs[rowIterator][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }

    // up left
    var couldBeAffected = []
    var rowIterator = row
    var columnIterator = column
    while (rowIterator > 0 && columnIterator > 0) {
        rowIterator -= 1
        columnIterator -= 1
        var valueAtSpot = discs[rowIterator][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }

    // up right
    var couldBeAffected = []
    var rowIterator = row
    var columnIterator = column
    while (rowIterator > 0 && columnIterator < 7) {
        rowIterator -= 1
        columnIterator += 1
        var valueAtSpot = discs[rowIterator][columnIterator]
        if (valueAtSpot == 0 || valueAtSpot == 3 || valueAtSpot == id) {
            if (valueAtSpot == id) {
                affectedDiscs = affectedDiscs.concat(couldBeAffected)
            }
            break
        }
        else {
            var discLocation = {row:rowIterator, column:columnIterator}
            couldBeAffected.push(discLocation)
        }
    }
    
    return affectedDiscs
}

function flipDiscs(affectedDiscs) {
    for (var i = 0; i < affectedDiscs.length; i++) {
        var spot = affectedDiscs[i]
        if (discs[spot.row][spot.column] == 1) {
            discs[spot.row][spot.column] = 2
        }
        else {
            discs[spot.row][spot.column] = 1
        }
    }
}
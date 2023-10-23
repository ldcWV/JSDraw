// Credit to https://dev.to/0shuvo0/lets-create-a-drawing-app-with-js-4ej3 for starter code
const canvas = document.getElementById("canvas")
canvas.height = 400
canvas.width = 600
const ctx = canvas.getContext("2d")
let rect = canvas.getBoundingClientRect()
ctx.lineWidth = 6

let maxDistancePerStroke = 100

// Pen state
let prevX = null
let prevY = null
let penDown = false
let distanceDrawn = 0

function isInCanvas(point) {
    return point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom
}

function drawPoint(coords) {
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, ctx.lineWidth/2, 0, 2 * Math.PI)
    ctx.fill()
}

function drawLine(start, end) {
    drawPoint(start)
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    drawPoint(end)
}

function mouseMoveHandler(e) {
    // Pen up if outside of canvas
    if (!isInCanvas({ x: e.clientX, y: e.clientY })) {
        penDown = false
        prevX = null
        prevY = null
        return
    }

    // Don't do anything if pen is not down
    if (!penDown) return

    let curX = e.clientX - rect.left
    let curY = e.clientY - rect.top

    // First point of line
    if(prevX == null || prevY == null){
        prevX = curX
        prevY = curY
        return
    }

    var deltaDistance = Math.sqrt(Math.pow(curX - prevX, 2) + Math.pow(curY - prevY, 2))
    if (distanceDrawn + deltaDistance <= maxDistancePerStroke) { // In this case, draw the whole line
        // Draw line
        drawLine({ x: prevX, y: prevY }, { x: curX, y: curY })
        // Update distance drawn
        distanceDrawn += deltaDistance
        // Update prevX and prevY
        prevX = curX
        prevY = curY
    } else { // Draw only up to maxDistancePerStroke
        var ratio = (maxDistancePerStroke - distanceDrawn) / deltaDistance
        nextX = prevX + (curX - prevX) * ratio
        nextY = prevY + (curY - prevY) * ratio
        drawLine({ x: prevX, y: prevY }, { x: nextX, y: nextY })
        mouseUpHandler()
    }
}

function mouseDownHandler(e) {
    penDown = true
    distanceDrawn = 0
    prevX = e.clientX - rect.left
    prevY = e.clientY - rect.top

    // Draw point at beginning of line
    drawPoint({ x: prevX, y: prevY })
}

function mouseUpHandler(e) {
    penDown = false
    prevX = null
    prevY = null
}

window.addEventListener("mousemove", mouseMoveHandler)
window.addEventListener("mousedown", mouseDownHandler)
window.addEventListener("mouseup", mouseUpHandler)

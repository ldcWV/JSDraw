const canvas = document.getElementById("canvas")
canvas.height = 400
canvas.width = 400
const ctx = canvas.getContext("2d")
ctx.fillStyle = 'white'
ctx.fillRect(0, 0, canvas.width, canvas.height)
let rect = canvas.getBoundingClientRect()

let maxDistancePerStroke = 100

// Pen state
let prevPressure = -1
let prevX = null
let prevY = null
let penDown = false
let distanceDrawn = 0
let currentTrajectory = []

trajectories = []

function isInCanvas(point) {
    return point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom
}

function updateTrajectoryCounter() {
    document.getElementById('trajectory_counter').innerText = `Trajectories: ${trajectories.length}`;
}
updateTrajectoryCounter();

function drawLine(start, end, pressure) {
    ctx.beginPath()
    ctx.lineWidth = pressure * 10
    ctx.lineCap = "round"
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
}

function mouseMoveHandler(e) {
    // Pen up if outside of canvas
    if (!isInCanvas({ x: e.clientX, y: e.clientY })) {
        mouseUpHandler()
        return
    }

    // Don't do anything if pen is not down
    if (!penDown) return

    // Pen is down and we are inside the canvas; we should draw
    let penX = e.clientX - rect.left
    let penY = e.clientY - rect.top

    let done = false
    let deltaDistance = Math.sqrt(Math.pow(penX - prevX, 2) + Math.pow(penY - prevY, 2))
    if (distanceDrawn + deltaDistance <= maxDistancePerStroke) {
        var nextX = penX
        var nextY = penY
    } else {
        let ratio = (maxDistancePerStroke - distanceDrawn) / deltaDistance
        var nextX = prevX + (penX - prevX) * ratio
        var nextY = prevY + (penY - prevY) * ratio
        done = true
    }

    // Draw line
    drawLine({ x: prevX, y: prevY }, { x: nextX, y: nextY }, e.pressure)
    // Update currentTrajectory
    currentTrajectory.push([nextX/canvas.width, nextY/canvas.height, e.pressure])
    distanceDrawn += deltaDistance
    prevX = nextX
    prevY = nextY

    // Out of ink, end the current stroke
    if (done) {
        mouseUpHandler()
    }
}

function mouseDownHandler(e) {
    if (!isInCanvas({ x: e.clientX, y: e.clientY })) return

    penDown = true
    distanceDrawn = 0
    prevX = e.clientX - rect.left
    prevY = e.clientY - rect.top

    // Update current trajectory
    currentTrajectory.push([prevX/canvas.width, prevY/canvas.height, e.pressure])
}

function mouseUpHandler(e) {
    penDown = false
    prevX = null
    prevY = null

    if (currentTrajectory.length >= 2) {
        trajectories.push(currentTrajectory)
        currentTrajectory = []
    }

    updateTrajectoryCounter();
}

function clear() {
    penDown = false
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    trajectories = []
    updateTrajectoryCounter();
}

// Pen status handlers
canvas.onpointermove = event => {
    if (event.pressure > 0) {
        if (prevPressure <= 0) {
            mouseDownHandler(event);
        }
        mouseMoveHandler(event);
    } else {
        if (prevPressure > 0) {
            mouseUpHandler(event);
        }
    }
    prevPressure = event.pressure
}

// Call clear function when button is pressed
document.getElementById("clear").addEventListener("click", clear)

// -------------------------- Download buttons --------------------------
// Download image button
document.getElementById("download_image").addEventListener("click", downloadImage)
function downloadImage() {
    // Download image of canvas as png
    var dataURL = canvas.toDataURL("image/png")

    // Create a link element
    var link = document.createElement("a")
    link.href = dataURL
    link.download = "canvas.png"

    // Trigger the download
    link.click()

    // Clean up
    URL.revokeObjectURL(dataURL)
}

// Download trajectories button
document.getElementById("download_trajectories").addEventListener("click", downloadTrajectories)
function downloadTrajectories() {
    // Download trajectories as json
    const json = JSON.stringify(trajectories, null, 4);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trajectories.json';
    link.click();
    URL.revokeObjectURL(url);
}

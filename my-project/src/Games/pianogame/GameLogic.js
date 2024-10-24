import data from './data'

const { config, tileRows } = data

const generateBlackIndices = () =>
   Math.random() < config.probability
      ? [Math.floor(Math.random() * config.cols)]
      : Array.from({ length: config.blackTiles }, () => Math.floor(Math.random() * config.cols))

const addRow = (canvas, stopGameLoop) => {
   const ctx = canvas.getContext('2d')

   const tile_width = config.width / config.cols
   const tile_height = config.height / config.rows
   const grayIndices = []
   const blackIndices = generateBlackIndices()
   let y = config.height

   if (tileRows.length > 0) {
      const lastRow = tileRows[tileRows.length - 1]
      y = lastRow.y - lastRow.height
   }

   const row = {
      x: 0,
      y,
      width: config.width,
      height: config.height / config.rows,
      tileWidth: tile_width,
      tileHeight: tile_height,
      color: '#FFFFFF',
      black: { indices: blackIndices, color: '#000000' },
      gray: { indices: grayIndices, color: '#AAAAAA' },
      increment: function () {
         if (this.y + this.height >= config.height) {
            if (!this.isValid) {
               stopGameLoop(canvas)
               this.y += config.speed
               displayWrongTile(ctx, this, this.black.indices)
               return
            }
         }
         this.y = this.y + config.speed
      },
      decrement: function () {
         this.y = this.y - config.speed
      },
      isValid: false,
   }

   tileRows.push(row)
}

const displayRow = (ctx, row) => {
   const { color, y, width, height, tileWidth, tileHeight, black, gray } = row
   ctx.fillStyle = color
   ctx.fillRect(0, y, width, height)

   for (let i = 0; i < config.cols; i++) {
      ctx.strokeRect(i * tileWidth, y, tileWidth, tileHeight)

      if (black.indices.includes(i)) {
         ctx.fillStyle = black.color
         ctx.fillRect(i * tileWidth, row.y, tileWidth, tileHeight)
      } else if (gray.indices.includes(i)) {
         ctx.fillStyle = gray.color
         ctx.fillRect(i * tileWidth, row.y, tileWidth, tileHeight)
      }
   }
   row.increment()
}

const handleGameUserInput = (
   e,
   canvas,
   setScore,
   isGameStarted,
   setIsGameStarted,
   stopGameLoop
) => {
   const ctx = canvas.getContext('2d')
   if (!isGameStarted) setIsGameStarted(true)

   config.speed = Math.min(config.speed + (tileRows.length < 30 ? 0.1 : 0.05), config.maxSpeed)
   console.log(config.speed)
   const tile_width = config.width / config.cols
   const tile_height = config.height / config.rows
   const x = e.clientX - canvas.offsetLeft
   const y = e.clientY - canvas.offsetTop
   const clicked_row = Math.ceil(y / tile_height) - 1
   const clicked_col = Math.ceil(x / tile_width) - 1

   for (let i = 0; i < tileRows.length; i++) {
      const row = tileRows[i]

      if (row.y < y && row.y + row.height > y) {
         if (row.black.indices.includes(clicked_col) || row.gray.indices.includes(clicked_col)) {
            if (!row.isValid) {
               row.gray.indices.push(clicked_col)
               row.black.indices = row.black.indices.filter((index) => index !== clicked_col)
               setScore((prev) => prev + 1)

               if (row.black.indices.length === 0) {
                  row.isValid = true
                  addRow(canvas, stopGameLoop)
               }
            }
         } else {
            console.log(1)
            stopGameLoop(canvas)
            displayWrongTile(ctx, row, clicked_col)
         }
         break
      }
   }
}

const displayWrongTile = (ctx, row, col_number) => {
   ctx.fillStyle = '#FF0000'
   row.decrement()
   ctx.fillRect(col_number * row.tileWidth, row.y, row.tileWidth, row.tileHeight)
}

const restartGame = (setShowWelcomeMessage, setScore, setIsGameStarted, setIsGameOver) => {
   config.speed = config.defaultSpeed
   setShowWelcomeMessage(false)
   setScore(0)
   setIsGameStarted(false)
   setIsGameOver(false)
}

export { addRow, displayRow, restartGame, handleGameUserInput }

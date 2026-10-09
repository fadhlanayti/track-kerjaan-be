import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  // Track online users per project
  const projectRooms = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join:project', ({ projectId, userId, userName }) => {
      socket.join(`project:${projectId}`)
      socket.data = { projectId, userId, userName }
    })

    socket.on('join:issue', ({ issueId }) => {
      socket.join(`issue:${issueId}`)
    })

    socket.on('message:send', (message) => {
      // Broadcast to project room
      io.to(`project:${message.projectId}`).emit('message:new', message)
    })

    socket.on('issue:typing', ({ issueId, userId, name }) => {
      socket.to(`issue:${issueId}`).emit('user:typing', { issueId, userId, name })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Make io accessible for API routes to emit events
  globalThis.__io = io

  const port = parseInt(process.env.PORT || '3000', 10)
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})

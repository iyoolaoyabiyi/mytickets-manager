import { createRouter, createWebHistory } from 'vue-router'
import Landing from './routes/Landing.vue'
import Login from './routes/Login.vue'
import Signup from './routes/Signup.vue'
import Dashboard from './routes/Dashboard.vue'
import Tickets from './routes/Tickets.vue'
import TicketEdit from './routes/TicketEdit.vue'
export default createRouter({ history: createWebHistory(), routes: [
  { path: '/', component: Landing },
  { path: '/auth/login', component: Login },
  { path: '/auth/signup', component: Signup },
  { path: '/dashboard', component: Dashboard },
  { path: '/tickets', component: Tickets },
  { path: '/tickets/:id/edit', component: TicketEdit }
] })

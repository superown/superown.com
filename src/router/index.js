import Vue from 'vue'
import Router from 'vue-router'
import SignIn from '../components/SignIn.vue'
import Welcome from '../components/Welcome.vue'

import { signedIn } from '../services/auth'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/signin', component: SignIn },
    { path: '/', component: Welcome, meta: { auth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !signedIn()) {
    next({
      path: '/signin',
      params: { redirect: to.path }
    })
  } else {
    // setTimeout to make sure the session listeners
    // have been executed first
    setTimeout(() => next(), 0)
  }
})

export default router

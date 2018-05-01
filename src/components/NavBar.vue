<template>
<nav class="navbar" role="navigation" aria-label="main navigation">
<div class="navbar-brand">
<a class="navbar-item" href="/">
<img src="https://s.natalian.org/2017-10-18/superown.png" alt="Superown logo" width="112" height="28">
</a>
</div>

<div class="navbar-menu">
<div class="navbar-end">

<a class="navbar-item is-hidden-desktop-only" href="https://twitter.com/kaihendry" target="_blank">
<span class="icon" style="color: #55acee;">
<i class="fa fa-lg fa-twitter"></i>
</span>
</a>

<p v-if="currentUser && currentUser.email" class="navbar-item">
<span class="icon">
<i class="fa fa-user"></i>
</span>
<span>{{ currentUser.email }}</span>
</p>

<p class="navbar-item control">
<a v-if="currentUser" class="button" :title="currentUser.id" @click="signOut">
<span class="icon">
<i class="fa fa-sign-out"></i>
</span>
<span>Sign out</span>
</a>
<a v-else class="button is-primary" @click="signInHandler">
<span class="icon">
<i class="fa fa-sign-in"></i>
</span>
<span>Sign in</span>
</a>
</p>
</div>
</div>

</nav>
</template>
<style>
</style>
<script>
import { signOut, signedIn, currentUserProfile, onSessionChange, signIn } from '../services/auth'

export default {
  name: 'Navbar',
  data: () => ({
    currentUser: { id: '', name: '', email: '' }
  }),
  created () {
    onSessionChange(this.handleSessionStatus)
    this.handleSessionStatus(signedIn())
  },
  methods: {
    signInHandler () {
      signIn()
        .then(this.success)
    },
    success () {
      this.$router.push(this.$route.params.redirect || '/')
    },
    signOut () {
      signOut()
      this.currentUser = null
    },
    handleSessionStatus (signedIn) {
      if (signedIn) {
        const user = currentUserProfile()
        this.currentUser = {
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail()
        }
      } else {
        this.currentUser = null
        this.$router.push('/signin')
      }
    }
  }
}
</script>

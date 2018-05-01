<template>
<div>

<section class="hero is-medium is-info is-bold">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">
        Export your Youtube videos to AWS S3
      </h1>
      <h2 class="subtitle">
<a @click="signInHandler" class="button is-primary is-large">Signin</a>
      </h2>
      <p><a href="http://www.bbc.com/news/technology-43868633">Why? Youtube deletes millions of videos</a>. Keep backups!</p>
    </div>
  </div>
</section>
<span v-if="error" class="bd-notification is-danger">{{error}}</span>
</div>
</template>

<script>
import { signIn } from '../services/auth'

export default {
  data: () => ({
    error: null
  }),
  methods: {
    signInHandler () {
      signIn()
        .then(this.success, this.failure)
    },
    success () {
      this.$router.push(this.$route.params.redirect || '/')
    },
    failure () {
      this.error = 'Not logged in'
    }
  }
}
</script>

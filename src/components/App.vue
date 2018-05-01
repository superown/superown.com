<template>
<div id="app" class='container'>
<nav-bar></nav-bar>
<router-view></router-view>
<footer class="footer">
<div class="container">
<div class="content has-text-centered">
<p>
<strong>Superown</strong> by <a href="https://hendry.iki.fi">Kai Hendry</a> is a SaaS product that comes under the <a href="https://webconverger.com/">Webconverger business</a>, based in Singapore.</p>
<p>Please email me at <a href="mailto:hendry@superown.com">hendry@superown.com</a> with any feedback!</p>
</div>
</div>
</footer>
</div>
</template>

<script>
import NavBar from './NavBar.vue'

export default {
  name: 'app',
  components: {
    NavBar
  },
  data () {
    return {}
  }
}
</script>

<style lang="sass">
// https://github.com/jgthms/bulma/blob/master/sass/utilities/initial-variables.sass
@import "~bulma/sass/utilities/initial-variables";

$blue: #72d0eb
// Add pink and its invert
$sored: #db0000
$sored-invert: #fff

// 3. Set the derived variables
// Use the new pink as the primary color
$primary: $sored
$primary-invert: $sored-invert
// Use the existing orange as the danger color
$info: #000000

@import '~bulma/bulma.sass';

$fa-font-path: "~font-awesome/fonts/";
@import "~font-awesome/scss/font-awesome";
</style>

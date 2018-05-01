<template>
<div>
<div v-if="roleWorking" class="field is-grouped">
<div class="control">
<button @click="roleWorking=false" class="button is-link is-warning">Re-configure working AWS s3://{{ bucket }}/{{ prefix}} credentials</button>
<p class="help"><a target="_blank" :href="`https://s3.console.aws.amazon.com/s3/buckets/${bucket}/${prefix}/?tab=overview`">S3 bucket on the AWS console</a></p>
</div>
</div>

<section class="section" v-if="!roleWorking">
<h1 class="title">Allow Superown to deliver the exported videos to your S3 bucket</h1>

<div class="field">
<label class="label">Bucket</label>
<div class="control">
<input class="input" type="text" v-model.trim=bucket>
</div>
</div>

<div class="field">
<label class="label">Prefix</label>
<div class="control">
<input class="input" type="text" v-model.trim=prefix>
</div>
</div>

<ol>
  <li>Create a <a href="https://aws.amazon.com/">AWS Account</a> if you don't have one, and create a <a href="https://s3.console.aws.amazon.com/s3/home?region=ap-southeast-1#">bucket</a> to store your content. Think of Prefix as the folder you want things to go in that bucket.</li>
<li>Create a cross-account role called <strong>Superown</strong> from the AWS console:
<a :href="`https://console.aws.amazon.com/iam/home?region=${region}#/roles$new?step=type&roleType=crossAccount`">Setup cross account trust</a>
</li>
<li>Account ID: <abbr title="Superown's AWS account id">606626980680</abbr></li>
<li>Create Policy</li>
<li>Create Your Own Policy - Superown write access
<pre>{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "s3:*",
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::{{bucket}}/{{prefix}}/*"
            ]
        }
    ]
}</pre>

</li>
<li>Attach permissions policies - Superown delivery</li>
</ol>
<div class="field">
<label class="label">Role</label>
<div class="control">
<input required class="input" type="text" v-model=role placeholder="arn:aws:iam::...">
</div>
</div>

<div class="field is-grouped">
<div class="control">
<button @click="checkRole" class="button is-link"
v-bind:class="{ 'is-success': roleWorking }">{{ roleMessage }}</button>
</div>
</div>
</section>

<section class="section">

<h1 class="title">Youtube Channel identifier (externalId)</h1>

<div class="field is-grouped">
<p class="control has-icons-left is-expanded">
<input class="input is-large" type="text" v-model.trim="channel"
@keyup.enter="listVideos" placeholder="Channel identification">
<span class="icon is-small is-left">
<i class="fa fa-youtube"></i>
</span>
</p>
<p class="control">
<a @click="listVideos" class="button is-large is-primary">
List videos
</a>
</p>
</div>

<h1 class="title" v-if="snippet.title">Channel name: {{ snippet.title }} ({{ statistics.videoCount }})</h1>

<div class="field is-grouped">
<div class="field-label is-left is-normal">
<label class="label">{{ quota }} call(s) left for the month</label>
</div>
<a @click="checkUsage" class="button is-primary">
Check API key usage
</a>
</div>

<section v-if="checkedVideos.length > quota"  class="hero is-info">
<div class="hero-body">
<div class="container">
<h1 class="title">
Fast &amp; scalable backups cost $$$
</h1>
<h2 class="subtitle">
Please contact <a :href="`mailto:hendry@superown.com?subject=Please raise quota on ${apikeyId}`">Kai Hendry</a>
about raising your quota from 5 free backup jobs a month.
</h2>
</div>
</div>
</section>

<div class="field is-grouped">
<div class="field-label is-large is-left is-normal">
<label class="label">Number of selected videos: {{ checkedVideos.length }}</label>
</div>
<a v-if="checkedVideos.length > 0 && checkedVideos.length <= quota" @click="superown" class="button is-large is-primary">
Superown
</a>
</div>

<label v-if="videos.length"><input type="checkbox" v-model="selectAll"> Select all</label>

<ol>
<li :key="video.snippet.resourceId.videoId" v-for="video in videos">

<div class="is-large is-grouped">
<label>
<input type="checkbox" :value="video.snippet.resourceId.videoId" v-model="checkedVideos">
<a target="_blank" :href="`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`">
📺
</a>
{{ video.snippet.title }}
</label>

<a v-if="status[video]" class="button is-info"><i class="fa fa-refresh" aria-hidden="true"></i></a>
<span v-if="status[video]" class="tag">{{ status[video] }}</span>
</div>

</li>
</ol>
</section>

<div class="container">

<h1 class="title">API documentation</h1>

<p v-for="videoId in checkedVideos"  :key="videoId">
<pre>
curl -X POST \
  https://yt.superown.com/ \
  -H 'x-api-key: {{ apikey }}' \
  -d '{
  "id": "{{ videoId }}",
  "bucket": "{{ bucket }}",
  "prefix": "{{ prefix }}",
  "role": "{{ role }}"
}'
</pre>
</p>

<p><a target="_blank" href="https://docs.superown.com/">Please view the API docs for details.</a></p>

</div>

</div>
</template>

<script>
import { currentUserProfile, getIdToken } from '../services/auth'
// import { Card, createToken } from 'vue-stripe-elements-plus'
const GAPI = window.gapi

export default {
  name: 'YoutubeOrder',
  data () {
    return {
      roleMessage: 'Check role is setup',
      roleWorking: localStorage['roleWorking'],
      role: localStorage['role'],
      region: localStorage['region'],
      bucket: localStorage['bucket'],
      prefix: localStorage['prefix'],
      channel: '',
      apikey: '',
      quota: '-',
      apikeyId: '',
      statistics: {},
      snippet: {},
      status: {},
      currentUser: {},
      token: '',
      complete: false,
      videos: [],
      // DEBUGGING
      //      videos: [{'kind': 'youtube#playlistItem', 'etag': '"ZG3FIn5B5vcHjQiQ9nDOCWdxwWo/y4aHNo_5lZcIhkZr8zqeXQhFi5k"', 'id': 'VVVFNUF1NExmY0JIeFRRUl95TGJuY3JRLk1iMHBZY2NMUHo0', 'snippet': {'publishedAt': '2016-07-17T01:40:24.000Z', 'channelId': 'UCE5Au4LfcBHxTQR_yLbncrQ', 'title': 'GOPR6799', 'description': '', 'thumbnails': {'default': {'url': 'https://i.ytimg.com/vi/Mb0pYccLPz4/default.jpg', 'width': 120, 'height': 90}, 'medium': {'url': 'https://i.ytimg.com/vi/Mb0pYccLPz4/mqdefault.jpg', 'width': 320, 'height': 180}, 'high': {'url': 'https://i.ytimg.com/vi/Mb0pYccLPz4/hqdefault.jpg', 'width': 480, 'height': 360}}, 'channelTitle': 'Not business related', 'playlistId': 'UUE5Au4LfcBHxTQR_yLbncrQ', 'position': 79, 'resourceId': {'kind': 'youtube#video', 'videoId': 'Mb0pYccLPz4'}}}],
      checkedVideos: []
    }
  },
  computed: {
    selected: function () {
      if (this.checkedVideos) {
        console.log(this.checkedVideos.filter((x, i, a) => a.indexOf(x) === i))
        return this.checkedVideos.filter((x, i, a) => a.indexOf(x) === i)
      }
      return []
    },
    selectAll: {
      get: function () {
        return this.videos ? this.checkedVideos.length === this.videos.length : false
      },
      set: function (value) {
        var checkedVideos = []
        if (value) {
          this.videos.forEach(function (item) {
            checkedVideos.push(item.snippet.resourceId.videoId)
          })
        }
        this.checkedVideos = checkedVideos
      }
    }
  },
  created: function () {
    const user = currentUserProfile()
    this.token = getIdToken()
    this.currentUser = {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail()
    }

    this.getApiKey()

    var vm = this
    GAPI.client.load('youtube', 'v3', function () {
      console.log('Youtube API loaded')
      GAPI.client.youtube.channels.list({ mine: 'true',
        part: 'snippet,contentDetails,statistics' }).execute((response) => {
        console.log('Youtube response', response)
        vm.channel = response.items[0].id
        if (!vm.prefix) { vm.prefix = vm.currentUser.id }
        if (!vm.bucket) { vm.bucket = `superown-${response.items[0].snippet.title.replace(/\s+/g, '-').toLowerCase()}` }
        // vm.listVideos()
      })
    })
  },
  methods: {
    async own (id) {
      const ownJob = await fetch('https://superown.com/own',
        { method: 'POST',
          headers: { 'x-api-key': this.apikey },
          credentials: 'same-origin',
          body: JSON.stringify({
            role: this.role,
            id: id,
            region: this.region,
            bucket: this.bucket,
            prefix: this.prefix }) })
        .then((result) => { return result.json() })
      console.log(ownJob)
      this.$set(this.status, id, 'Owning...')
    },
    async getInfo (id) {
      const jobInfo = await fetch('https://staging-api.superown.com/jobinfo', { method: 'POST',
        body: JSON.stringify({
          role: this.role,
          id: id,
          region: this.region,
          bucket: this.bucket,
          prefix: this.prefix }) })
        .then((result) => { return result.json() })
      console.log('STATUS:', jobInfo, jobInfo.Jobs[0].Status, id)
      this.$set(this.status, id, jobInfo.Jobs[0].Status)
    },
    async checkUsage () {
      const response = await fetch(`https://staging-api.superown.com/usage?keyid=${this.apikeyId}`)
      const usageInfo = await response.json()
      console.log('usageInfo', usageInfo)
      this.quota = usageInfo.Items[this.apikeyId].pop()[1]
    },
    async getApiKey () {
      const jobInfo = await fetch(`https://staging-api.superown.com/apirequest`, { method: 'post',
        body: JSON.stringify({ id: this.currentUser.id, token: this.token })
      })
        .then((result) => { return result.json() })
      this.apikey = jobInfo.Value
      this.apikeyId = jobInfo.Id
      this.checkUsage()
    },
    superown () {
      console.log('here', this.checkedVideos)
      this.checkedVideos.forEach((id) => { this.own(id) })
    },
    checkRole () {
      this.roleWorking = false
      const params = { role: this.role, bucket: this.bucket, prefix: this.prefix }
      const urlParams = new URLSearchParams(Object.entries(params))

      fetch('https://staging-api.superown.com/testrole/?' + urlParams)
        .then((r) => {
          if (r.ok) {
            this.roleWorking = true
            localStorage.setItem('role', this.role)
            localStorage.setItem('bucket', this.bucket)
            localStorage.setItem('prefix', this.prefix)
            localStorage.setItem('region', this.region)
            localStorage.setItem('roleWorking', this.roleWorking)
          }
          return r.text()
        },
        (err) => { this.roleMessage = err.message })
        .then((text) => { this.roleMessage = text })
    },
    listVideos () {
      var vm = this
      GAPI.client.youtube.channels.list({ id: vm.channel,
        part: 'snippet,contentDetails,statistics' }).execute((response) => {
        // console.log('Youtube response', response)
        if (response.items.length > 0) {
          // console.log(response.items[0].statistics)
          vm.statistics = response.items[0].statistics
          vm.snippet = response.items[0].snippet
          vm.playlistItems(response.items[0].contentDetails.relatedPlaylists.uploads)
        } else {
          vm.statistics = {}
          vm.snippet = {}
        }
      })
    },
    playlistItems (_playlistId, _maxResults, _pageToken) {
      var maxResults = _maxResults || 10
      var pageToken = _pageToken || ''
      var requestPlaylist = GAPI.client.youtube.playlistItems.list({
        part: 'snippet',
        playlistId: _playlistId,
        maxResults: maxResults,
        pageToken: pageToken
      })

      var vm = this

      requestPlaylist.execute(function (response) {
        // console.log(response)
        response.items.forEach((item) => { console.log(JSON.stringify(item)); vm.videos.unshift(item) })
        if (response.nextPageToken != null) {
          vm.playlistItems(_playlistId, _maxResults, response.nextPageToken)
        }
      })
    }
  }
}
</script>

<style>
.stripe-card.complete {
  border-color: green;
}
</style>

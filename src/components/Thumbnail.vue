<template>
  <ocs-data-loader :data-load-error="dataLoadError" :data-not-found="dataNotFound" :data-loaded="dataLoaded">
    <template #data-load-error>
      <div>Could not load thumbnail</div>
    </template>
    <template #not-found>
      <div>Could not load thumbnail</div>
    </template>
    <b-img :src="thumbnailSmallUrl" :alt="'Thumbnail for frame' + frameId" center thumbnail @click="showLargeThumb = true"></b-img>
    <b-modal v-if="thumbnailLargeUrl != ''" v-model="showLargeThumb" size="xl" centered hide-footer hide-header body-class="p-0" scrollable>
      <b-img :src="thumbnailLargeUrl" :alt="'Thumbnail for frame' + frameId" style="width: 100%; object-fit: contain;" />
    </b-modal>
  </ocs-data-loader>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

export default {
  name: 'Thumbnail',
  props: {
    frameId: {
      type: [String, Number],
      required: true
    }
  },
  data: function() {
    return {
      dataLoadError: false,
      dataLoaded: false,
      dataNotFound: false,
      thumbnailSmallUrl: '',
      thumbnailLargeUrl: '',
      showLargeThumb: false,
      archiveThumbnailEndpoint: `${this.$store.state.urls.archiveApiUrl}/frames/${this.frameId}/?include_thumbnails=true`,
      oldThumbnailEndpoint: `${this.$store.state.urls.thumbnailServiceUrl}/${this.frameId}/?width=300`
    };
  },
  created: function() {
    this.getThumbnailData();
  },
  methods: {
    clearLoadStates: function() {
      this.dataLoaded = false;
      this.dataLoadError = false;
      this.dataNotFound = false;
      this.thumbnailSmallUrl = '';
      this.thumbnailLargeUrl = '';
    },
    getThumbnailData: function() {
      this.clearLoadStates();
      let that = this;
      $.ajax({
        url: this.archiveThumbnailEndpoint
      })
        .done(function(response) {
          let data = response;
          if (_.isArray(data.thumbnails) && data.thumbnails.length > 0) {
            // This sorting works to put 'small' before 'large', should also work for 'medium',
            // but falls back to at least using a thumbnail if one exists for the frame in the archive.
            let thumbnails = _.orderBy(data.thumbnails, ['size'], ['desc']);
            that.thumbnailSmallUrl = thumbnails[0].url || '';
            that.thumbnailLargeUrl = thumbnails[1].url || '';
            that.dataLoaded = true;
          } else {
            that.getOldThumbnailData();
          }
        })
        .fail(function() {
          that.getOldThumbnailData();
        });
    },
    getOldThumbnailData: function() {
      let that = this;
      $.ajax({
        url: this.oldThumbnailEndpoint
      })
        .done(function(response) {
          that.thumbnailSmallUrl = response.url;
        })
        .fail(function(response) {
          if (response.status === 404 || response.status === 403) {
            that.dataNotFound = true;
          } else {
            that.dataLoadError = true;
          }
        })
        .always(function () {
          that.dataLoaded = true;
        });
    }
  }
};
</script>

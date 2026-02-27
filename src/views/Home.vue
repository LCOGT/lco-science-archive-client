<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template #data-load-error>
      <archive-data-table />
    </template>
    <template #not-found>
      <archive-data-table />
    </template>
    <archive-data-table :semesters="data.results" />
  </ocs-data-loader>
</template>

<script>
import moment from 'moment';
import { OCSMixin } from 'ocs-component-lib';
import ArchiveDataTable from '@/components/ArchiveDataTable.vue';

export default {
  name: 'Home',
  components: {
    ArchiveDataTable
  },
  mixins: [OCSMixin.getDataMixin],
  methods: {
    initializeDataEndpoint: function() {
      let now = moment.utc().format('YYYY-MM-DD HH:mm');
      return `${this.$store.state.urls.observationPortalApiUrl}/semesters/?start_lte=${now}`;
    }
  },
  created: function () {
    // if the route contains a public parameter, honor that
    if (this.$route.query.public == undefined) {
      let newQueryParams = {...this.$route.query};
      if (this.$store.state.userIsAuthenticated) {
        newQueryParams.public = "false";
      }
      else {
        // anonymous users should see public data and science data by default
        newQueryParams.public = "true";
      }
      this.$router.replace({
        path: this.$route.path,
        query: newQueryParams
      });
    }
  },
};
</script>

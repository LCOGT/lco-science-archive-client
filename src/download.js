import $ from 'jquery';
import { saveAs } from 'file-saver';
import store from './store';

export { downloadZip, downloadWget };

async function downloadZip(frameIds, uncompress, catalog, archiveRoot, archiveToken) {
  let postData = {};

  frameIds.forEach(function(value, i) {
    postData[`frame_ids[${i}]`] = value;
  });
  postData['auth_token'] = archiveToken;
  postData['uncompress'] = uncompress;
  postData['catalog_only'] = catalog;

  store.commit('setDownloadPending');
  await $.ajax({
    url: `${archiveRoot}/frames/zip/`,
    type: 'POST',
    data: postData,
    xhrFields: {
      responseType: 'blob' // Important for handling binary data
    },
    success: function(data) {
      const blob = new Blob([data], { type: 'application/zip' });
      saveAs(blob, 'download.zip');
      console.log('File downloaded successfully');
      store.commit('setDownloadStatic');
    },
    error: function(error) {
      console.error('Error downloading the file', error);
      store.commit('setDownloadError');
      setTimeout(() => {
        store.commit('setDownloadStatic');
      }, 3000);
    }
  });
}

function generateScript(frameIds, archiveToken, archiveRoot, callback) {
  $.get('scripts/download_script.sh', function(data) {
    var res = data.replace('FRAMELIST', frameIds.join(' '));
    if (archiveToken != null) {
      res = res.replace('AUTHTOKEN', archiveToken);
    }
    res = res.replace('ARCHIVEFRAMEURL', `${archiveRoot}/frames/`);
    callback(res);
  });
}

function downloadWget(frameIds, archiveToken, archiveRoot) {
  generateScript(frameIds, archiveToken, archiveRoot, function(data) {
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
    a.download = 'archivedownload.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

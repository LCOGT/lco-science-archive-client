import $ from 'jquery';
export { downloadWget };



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

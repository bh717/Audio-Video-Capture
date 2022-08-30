document.addEventListener('DOMContentLoaded', () => {
  var blob;
  const saveButton =  document.getElementById('saveCapture')
  const closeButton = document.getElementById('close');
  const status = document.getElementById('status');
  const removeslider= document.getElementById('removeslider');
  const audio=document.getElementById('play_audio');
  const start_text=document.getElementById('remove-start-text');
  const end_text=document.getElementById('remove-end-text');
  const flag =0;

  function initialRanges(value)
  {
    noUiSlider.create(removeslider, {
          start: [0, value],
          connect: true,
          range: {
              'min': 0,
              'max': value
          }
      });
      document.getElementById('remove-start-text').value=0;
      document.getElementById('remove-end-text').value=value;
      removeslider.noUiSlider.on('update', function (values, handle) {
          start_text.value=values[0];
          end_text.value=values[1];
      });
  }
  function updateRanges(value)
  {
    noUiSlider.create(removeslider, {
          start: [0, value],
          connect: true,
          range: {
              'min': 0,
              'max': value
          }
      });
      document.getElementById('remove-start-text').value=0;
      document.getElementById('remove-end-text').value=value;
      removeslider.noUiSlider.on('update', function (values, handle) {
          start_text.value=values[0];
          end_text.value=values[1];
      });
  }
  let format;
  let audioURL;
  let encoding = false;
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "createTab") {
      format=request.format;
      let startID = request.startID;
      closeButton.onclick = () => {
        chrome.runtime.sendMessage({cancelEncodeID: startID});
        chrome.tabs.getCurrent((tab) => {
          chrome.tabs.remove(tab.id);
          chrome.downloads.removeFile(tab.id);
        });
      }

      // alert(request.audioURL);
      //if the encoding completed before the page has loaded  
      if(request.audioURL) {
        blob = request.recordedBlob;
        audio.setAttribute('src', request.audioURL);
        generateSave(request.audioURL);
      } else {
        encoding = true;
      }
    }

  if(request.type === "encodingComplete" && encoding) {
    encoding = false;
    generateSave(request.audioURL);
    // chrome.downloads.download({url: request.audioURL, filename: `${currenttime}.${format}`, saveAs: false});
    blob = request.recordedBlob;
    audio.setAttribute('src', request.audioURL);
  }

  function generateSave(url) { //creates the save button
    const currentDate = new Date(Date.now()).toDateString();
    saveButton.onclick = () => {
      chrome.downloads.download({url: url, filename: `${currentDate}.${format}`, saveAs: true});
      audio.setAttribute('src', request.audioURL);  
    };
    saveButton.style.display = "inline-block";
  }
    
  audio.addEventListener('loadedmetadata', function(){
      var duration = audio.duration;
      initialRanges(duration); 
    },false);
  });
  function remove(a, b) {
    console.log(a,b);
      audio.currentTime(1);
  }
  document.getElementById('apply-remove').addEventListener('click', function(){
    remove(parseInt(removeslider.noUiSlider.get()[0]), parseInt(removeslider.noUiSlider.get()[1]));
  });
})

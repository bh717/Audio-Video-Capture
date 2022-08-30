let interval;
let timeLeft;
let count=1;
const displayStatus = function() { //function to handle the display of time and buttons
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    const note_text=document.getElementById('note_text');
    const markButton= document.getElementById('btn_mark');
    const audio_control= document.getElementById('audio_control');
    const currentDate=new Date();
    markButton.style.display="none";
    document.getElementById('title_date').value=currentDate.toJSON().slice(0,19);

    note_text.onchange = (event) =>{
      let id = event.target.value;
      audio_control.style.display="block";
      audio_control.setAttribute('src',localStorage.getItem('URL'));
      audio_control.play();
    }

    chrome.runtime.sendMessage({currentTab: tabs[0].id}, (response) => {
      if(response) {
        chrome.storage.sync.get({
          maxTime: 1200000,
          limitRemoved: false
        }, (options) => {
          if(options.maxTime > 1200000) {
            chrome.storage.sync.set({
              maxTime: 1200000
            });
            timeLeft =  (Date.now() - response)
          } else {
            timeLeft = (Date.now() - response)
          }
          myInterval=setInterval(mytimer,1000);
          function mytimer() 
          {
            const date = new Date();
            status.innerHTML = timestamp(date-response);
          }
          function timestamp(value)
          {
            const second = 1000;
            const minute = second * 60;
            const hour = minute * 60;

            // Divide Time with a year
            let minutes= parseInt(value /minute);
            value=value%minute;
            let seconds=parseInt(value/second);
            if(seconds<10)
              seconds="0"+seconds;
            if(minutes<10)
              minutes="0"+minutes;
            let during_time=minutes+":"+seconds;
            return during_time;
          }
          markButton.style.display="block";
          markButton.onclick= () =>{
            const date = new Date();
            let time=date-response;
            console.log(time);
            const string=timestamp(time);
            let content = string + " - " + document.getElementById("descrip_text").value + "\n";
            document.getElementById("descrip_text").value="";
            addnote(content,count);
          }
        });
        audio_control.style.display="block";
        
      } else {
        clearInterval(myInterval);
        audio_control.style.display="none";
      }
    });
  });
}

const parseTime = function(time) { //function to display time remaining or time elapsed
  let minutes = Math.floor((time/1000)/60);
  let seconds = Math.floor((time/1000) % 60);
  if (minutes < 10 && minutes >= 0) {
    minutes = '0' + minutes;
  } else if (minutes < 0) {
    minutes = '00';
  }
  if (seconds < 10 && seconds >= 0) {
    seconds = '0' + seconds;
  } else if (seconds < 0) {
    seconds = '00';
  }
  return `${minutes}:${seconds}`
}

let encoding=true;
let format;
//manipulation of the displayed buttons upon message from background
chrome.runtime.onMessage.addListener((request, sender) => {
  // console.log(sender);
  format=request.format;
  if(request.type === "encodingComplete" && encoding) {
    // encoding = false;
    // alert(2);
    alert(1234);
    generateSave(request);
    audio_control.style.display="block";
    blob = request.recordedBlob;
    status.innerHTML="Recording is finished";
    clearInterval(interval);
   }
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const buttons = document.getElementById("buttons");
    const startButton = document.getElementById('start');
    const markButton=document.getElementById('btn_mark')
    const audio_control=document.getElementById('audio_control');
    const note_text=document.getElementById('note_text');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    markButton.onclick= () =>{
      const date = new Date();
      let time=date-request.startTime;
      console.log(time);
      const string=parseTime(time);
      let content = string + " - " + document.getElementById("descrip_text").value + "\n";
      document.getElementById("descrip_text").value="";
      addnote(content,count);
    }
    if(request.captureStarted && request.captureStarted === tabs[0].id) {
      markButton.style.display="block";
      audio_control.style.display="none";
      // alert(1);
      chrome.storage.sync.get({
        maxTime: 1200000,
        limitRemoved: false
      }, (options) => {
        if(options.maxTime > 1200000) {
          chrome.storage.sync.set({
            maxTime: 1200000
          });
           timeLeft = Date.now()-request.startTime;
        } else {
          timeLeft = Date.now()-request.startTime;
        }
        status.innerHTML = "Tab is currently being captured";
        myInterval=setInterval(mytimer,1000);
        function mytimer() 
        {
          const date = new Date();
          status.innerHTML = timestamp(date-request.startTime);
        }
        function timestamp(value)
        {
          const second = 1000;
          const minute = second * 60;
          const hour = minute * 60;

          // Divide Time with a year
          let minutes= parseInt(value /minute);
          value=value%minute;
          let seconds=parseInt(value/second);
          if(seconds<10)
            seconds="0"+seconds;
          if(minutes<10)
            minutes="0"+minutes;
          let during_time=minutes+":"+seconds;
          return during_time;
        }
      });
    } else if(request.captureStopped && request.captureStopped === tabs[0].id) {
      // alert(123);
      status.innerHTML = "Your Recording Audio Capture is finished";
      clearInterval(myInterval);
      markButton.style.display="none";
      audio_control.style.display="block";
      // generateSave(request);
      note_text.onchange = (event) =>{
        let id = event.target.value;
        audio_control.setAttribute('src',localStorage.getItem('URL'));
        audio_control.play();
      }
    }

  });
  function generateSave(request) { //creates the save button
    const currentDate = new Date(Date.now()).toDateString();
    audio_control.setAttribute('src', request.audioURL);
    chrome.downloads.download({url: request.audioURL, filename: `${currentDate}.${format}`, saveAs: true});
  }
});
// chrome.runtime.connect({ name: "popup" });

//initial display for popup menu when opened
document.addEventListener('DOMContentLoaded', function() {
  displayStatus();
  const startButton = document.getElementById('start');
  const finishButton = document.getElementById('finish');
  const cancelButton = document.getElementById('cancel');
  startButton.onclick = () => {chrome.runtime.sendMessage("startCapture")};
  finishButton.onclick = () => {chrome.runtime.sendMessage("stopCapture")};
  cancelButton.onclick = () => {chrome.runtime.sendMessage("cancelCapture")};
  if(localStorage.getItem('URL'))
  {
    audio_control.style.display="block";
    audio_control.setAttribute('src', localStorage.getItem('URL'));
  }
  if(localStorage.getItem('mark'))
  {
    note_text.innerHTML = "<option value=" + count+ " style='font-size:12px;'>"+localStorage.getItem('mark')+"</option>";
  } 
});
function addnote(content, noteid) {
  note_text.innerHTML = (note_text.innerHTML + "<option value=" + noteid+ " style='font-size:12px;'>"+content+"</option>");
  count++;
  localStorage.setItem('mark',content);
}
var debug_mode = 0; // debug mode determines how long the blocks are, 5 sec in debug mode, 5 minutes in actual experiment
//var data_save_method = 'csv_server_py';
var data_save_method = 'csv_client';
var part2_sfa= NaN
let save_final_deter;
var direct_warning = 0
var short_warning = 0
var quickKP = 0;
var infKP = 0;
var timer = 0;
// Will be set to true when experiment is exiting fullscreen normally, to prevent above end experiment code
var normal_exit = false;
var window_height = window.screen.height;

// Save function references
function blockRefresh(event) {
  if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
    event.preventDefault();
    alert("Page refresh is disabled.");
  }
}

function blockUnload(event) {
  event.preventDefault();
  event.returnValue = ""; // Some browsers need this line
}

// Attach the listeners
document.addEventListener("keydown", blockRefresh);
window.addEventListener("beforeunload", blockUnload);


//this is to test if the user leave the webpage
var detectfocus=0
var isinfocus=1
document.addEventListener('mouseleave', e=>{
  detectfocus=detectfocus+1
  isinfocus=0
  //this is to see if user are focus or not
})
document.addEventListener('visibilitychange', e=>{
   if (document.visibilityState === 'visible') {
 //report that user is in focus
 isinfocus=1
  } else {
  detectfocus=detectfocus+1
  isinfocus=0
  //this is to see if user are focus or not
  }  
})

// Randomly generate an 8-character alphanumeric subject ID via jsPsych
var subject_id = jsPsych.randomization.randomID(8);

// Load PsiTurk
var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);
var condition = psiturk.taskdata.get('condition') + 1; // they do zero-indexing

var timeline = []
//welcome page
var welcome = {
  type: 'survey-html-form',
  html: "<label for='worker_id'>Enter your Prolific Worker ID. Please make sure this is correct! </label><br><input type='text' id='worker_id' name='worker_id' required><br><br>",
  on_finish: function (data) {
    data.sequence = sequence
    data.trial_type = "id_enter"
    window.useridtouse=data.responses
    window.useridtouse = useridtouse.split('"')[3];
    subject_id=useridtouse
    data.stimulus = "intro"
    data.cities = `${cityNameList.join("; ")}`;
    data.city_images = `${image_city_names.join("; ")}`
  }
}
//welcome page end

var too_quick={
  type: 'html-keyboard-response',
  stimulus: '<h1 style="color: red;font-size: 50px">Your response was too quick. Please take your time to carefully consider your answer before responding.</h1>' +
            '<p style="color: red;font-size: 50px">The experiment will continue in 10 seconds.</p>',
  choices: jsPsych.NO_KEYS, // Prevent responses
  trial_duration: 10000, // Stay on screen for 10 seconds
  on_finish: function(data) {
    data.trial_type='slowdown_page'
    data.stimulus='too_quick'
    quickKP +=1
  }
}


//Fullscreen start
var enterFullscreen = {
  type: 'html-button-response',
  stimulus: `
        <style>
            ul {
                list-style-type: disc;
                margin: 20px 0;
                padding-left: 100px;
                text-align: left;
            }
            li {
                margin-bottom: 15px;
                font-size: 18px;
                line-height: 1.6;
            }
            p {
                font-size: 18px;
                line-height: 1.6;
                margin: 10px 0;
                text-align: center;
            }
        </style>
        <h3 style='text-align: center'><strong>Thank you for your participation in this study. Please:</strong></h3>
        <br />
        <ul>
            <li>Follow the instructions for each task and try your best to perform well.</li>
            <li>Maximize your browser and focus completely on the task without any distractions.</li>
            <li><strong>DO NOT</strong> take notes during the experiment, as this interferes with our ability to accurately measure the learning process.</li>
            <li><strong>DO NOT</strong> participate if you feel you cannot fully commit to these requirements.</li>
        </ul> <br />
        <p>When you are ready to take the experiment, click 'Enter Fullscreen' to begin.</p> <br />
    `,
  choices: ['Enter Fullscreen'],
  on_finish: function(data) {
      // Trigger fullscreen mode when the button is clicked
      data.trial_type = "fullscreen"
      data.stimulus = "make_fullscreen"
      document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
  }
};
// Fullscreen end
learn_base64_left = []
learn_base64_right = []
direct_base64_up = []
direct_base64_left = []
direct_base64_mid = []
direct_base64_right = []
shortest_base64_up = []
shortest_base64_left = []
shortest_base64_right = []

let left_images = learn_left.map(path => path.replace("../static/images/", ""));
let right_images = learn_right.map(path => path.replace("../static/images/", ""));

//Instruction page
function create_instruct(instruct,instructnames,instruction_number,next_phase,a=''){
  var intro_learn={
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="padding: 12px 24px; font-size: 18px; border-radius: 10px; background-color: #4CAF50; color: white; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0 10px;">%choice%</button>',
    choices: ['Next'],
    stimulus: instruct[`instruct_`+a+`${instruction_number}`],
    on_finish: function (data) {
      data.trial_type = 'intro_'+instruction_number;
      data.stimulus='instruct';
      // Check which button was pressed
      if (instructnames.length==1){
        if (data.button_pressed == 0) {
          data.response = 'Start';
          jsPsych.addNodeToEndOfTimeline({
              timeline: [next_phase],
            }, jsPsych.resumeExperiment)
        }
      }else if (instruction_number>=instructnames.length){
        if (data.button_pressed == 0) {
          if (instruction_number==2){
            intro_learn.choices=['Next']
          }else{
            intro_learn.choices=['Previous','Next']
          }
          instruction_number-=1
          intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
          data.response = 'Previous';
          jsPsych.addNodeToEndOfTimeline({
              timeline: [intro_learn],
            }, jsPsych.resumeExperiment)
        } else if (data.button_pressed == 1) {
          data.response = 'Next';
          jsPsych.addNodeToEndOfTimeline({
              timeline: [next_phase],
            }, jsPsych.resumeExperiment)
        }
      }else if (instruction_number==1){
        instruction_number+=1
        intro_learn.choices=['Previous','Next']
        intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
        jsPsych.addNodeToEndOfTimeline({
          timeline: [intro_learn],
        }, jsPsych.resumeExperiment)
      }else if (instruction_number==instructnames.length-1){
        if (data.button_pressed == 0) {
          if (instruction_number==2){
            intro_learn.choices=['Next']
          }
          instruction_number-=1
          intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
          data.response = 'Previous';
          jsPsych.addNodeToEndOfTimeline({
              timeline: [intro_learn],
            }, jsPsych.resumeExperiment)
          } else if (data.button_pressed == 1) {
            intro_learn.choices=['Previous','Start']
            instruction_number+=1
            intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
            data.response = 'Next';
            jsPsych.addNodeToEndOfTimeline({
                timeline: [intro_learn],
              }, jsPsych.resumeExperiment)
          }
      }else{
      if (data.button_pressed == 0) {
        if (instruction_number==2){
          intro_learn.choices=['Next']
        }
        instruction_number-=1
        intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
        data.response = 'Previous';
        jsPsych.addNodeToEndOfTimeline({
            timeline: [intro_learn],
          }, jsPsych.resumeExperiment)
        } else if (data.button_pressed == 1) {
          instruction_number+=1
          intro_learn.stimulus=instruct[`instruct_`+a+`${instruction_number}`],
          data.response = 'Next';
          jsPsych.addNodeToEndOfTimeline({
              timeline: [intro_learn],
            }, jsPsych.resumeExperiment)
        }
      }
    }
  }
  return intro_learn
}

//Instruction page end

function waitUntilBase64Ready() {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (generated_stimuli.length === imageList.length) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
}

// learning phase
var curr_learning_trial=0
var colordetretime=colorStart()
var removecolor=colorStop(colordetretime)
var timetakenforpluswindow=removecolor

var warning_page={
  type: 'html-keyboard-response',
  choices: jsPsych.NO_KEYS,
  response_ends_trial: false,
  trial_duration:3000,
  stimulus: '<h1 style="color: red;">Please make sure to respond to the questions.</h1><br><h1 style="color: red;">Continued failure to respond will</h1><br><h1 style="color: red;">result in the task ending early</h1><br><h1 style="color: red;">The experiment will resume in 3 seconds</h1>',
  on_finish: function(data) {
    data.trial_type='warning_page'
    data.stimulus='warning'
    warning=warning+1
  }
}

var instruct_lastonebefore_practice={
  type: 'html-keyboard-response',
  choices: ['spacebar'],
  stimulus: `
  <div style='margin-left:200px ;margin-right: 200px ;text-justify: auto'><p style ='font-size: 30px;line-height:1.5'>
  Now we will begin showing you flights to study. Make sure to remember the two cities as a pair, and additionally respond '1' when the cross flashes blue,
  and '2' when it flashes yellow. Please respond as quickly and as accurately as possible.<p style= 'font-size:25px;margin-top:100px'>[press the spacebar to continue]</p>
   `,
  on_finish: function (data) {
    data.trial_type = 'last_instruct';
    data.stimulus='instruct'
  }
}

var thecrossant ={}
var thecrossant_black = {}
var learningcorrectness = []
var TaskFailed = {}
var thecrossant_break = {}
var learn_phase = {}
var learn_phase_color = {}

var ac_colorprepare=colorStart()
var ac_colorstop=colorStop(ac_colorprepare)
var ac_colorlist=['blue','yellow','yellow','blue','yellow','yellow','blue','yellow','blue','blue']
var ac_colornumber=0
var total_ac = 0
var correct_ac = 0
var ac_feedback = {}
var csfa = []
var prac_attentioncheck_blackplus = {}
var prac_attentioncheck_colorchange = {}
var prac_attentioncheck_thethird = {}
var helpofattentioncheck = {}
prac_attentioncheck_blackplus={
  type: 'html-keyboard-response',
  choices: jsPsych.NO_KEYS,
  stimulus_height: 100,
  stimulus_width: 100,
  stimulus_duration: ac_colorprepare,
  trial_duration: ac_colorprepare,
  response_ends_trial: false,
  stimulus:create_memory_ten(),
  prompt:parse("<br><br><style>body {background-color: #ffff;}</style>"),
  on_finish: function(data) {
    data.trial_type='prac_atten_color_black'
    data.stimulus='black_plus_sign'
    prac_attentioncheck_colorchange.stimulus=create_color_list(ac_colorlist[ac_colornumber])
    jsPsych.addNodeToEndOfTimeline({
      timeline: [prac_attentioncheck_colorchange],
    }, jsPsych.resumeExperiment)
  }
}
csfa=[]

//attention check color cross
function create_color_list(color) {
  return parse("<p style='position:absolute;top:50%;right:50%;transform:translate(50%, -50%);font-size:125px;color:" + color + ";text-shadow:\
  -2px -2px 0 #000, 0 -2px 0 #000, 2px -2px 0 #000,\
  -2px 0 0 #000, 2px 0 0 #000,\
  -2px 2px 0 #000, 0 2px 0 #000, 2px 2px 0 #000;'>+</p>");
}
prac_attentioncheck_colorchange={
  type: 'html-keyboard-responsefl',
  choices: ['1','2'],
  response_ends_trial: false,
  stimulus:create_color_list(ac_colorlist[ac_colornumber]),
  stimulus_duration:ac_colorstop,
  trial_duration:ac_colorstop,
  on_finish: function(data) {
    data.trial_type = 'prac_atten_color';
    data.stimulus = 'prac_stop_color'
    csfa=data.key_press
    jsPsych.addNodeToEndOfTimeline({
      timeline: [prac_attentioncheck_thethird],
    }, jsPsych.resumeExperiment)
  }
}

prac_attentioncheck_thethird={
  type: 'html-keyboard-response',
  choices: ['1','2'],
  stimulus_height: 100,
  stimulus_width: 100,
  stimulus_duration: 2000,
  trial_duration: 2000,
  response_ends_trial: false,
  stimulus:create_memory_ten(),
  prompt:parse("<br><br><style>body {background-color: #ffff;}</style>"),
  on_finish: function(data) {
    data.trial_type='prac_atten_color_black'
    data.stimulus='black_plus_sign'
    if(ac_colornumber<ac_colortotal){
      if (csfa==49&&ac_colorlist[ac_colornumber]=='blue'){
        correct_ac += 1
        jsPsych.addNodeToEndOfTimeline({
          timeline: [prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      }else if (csfa==50&&ac_colorlist[ac_colornumber]=='yellow'){
        correct_ac += 1
        jsPsych.addNodeToEndOfTimeline({
          timeline: [prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      }else if (data.key_press==49&&ac_colorlist[ac_colornumber]=='blue'){
        correct_ac += 1
        jsPsych.addNodeToEndOfTimeline({
          timeline: [prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      }else if (data.key_press==50&&ac_colorlist[ac_colornumber]=='yellow'){
        correct_ac += 1
        jsPsych.addNodeToEndOfTimeline({
          timeline: [prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      }else{
        jsPsych.addNodeToEndOfTimeline({
          timeline: [helpofattentioncheck,prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      }
    }else{
      if (csfa==49&&ac_colorlist[ac_colornumber]=='blue' || csfa==50&&ac_colorlist[ac_colornumber]=='yellow' || data.key_press==49&&ac_colorlist[ac_colornumber]=='blue' || data.key_press==49&&ac_colorlist[ac_colornumber]=='yellow') {
        correct_ac += 1
      }
      total_ac += 1
      getACvalues()
      if (kickout_record>kickout_total){
          jsPsych.addNodeToEndOfTimeline({
            timeline: [TaskEarlyFail],
          }, jsPsych.resumeExperiment)
      }else{
          jsPsych.addNodeToEndOfTimeline({
            timeline: [ac_feedback],
          }, jsPsych.resumeExperiment)
      }
  }
    ac_colornumber+=1
    total_ac +=1
    csfa=[]
    ac_colorprepare=colorStart()
    ac_colorstop=colorStop(ac_colorprepare)
    prac_attentioncheck_blackplus.stimulus_duration=ac_colorprepare
    prac_attentioncheck_blackplus.trial_duration=ac_colorprepare
    prac_attentioncheck_colorchange.stimulus_duration=ac_colorstop
    prac_attentioncheck_colorchange.trial_duration=ac_colorstop
  }
}

function getACvalues() {
  if (correct_ac/total_ac<0.7){
  kickout_record+=1
  ac_feedback = {
    type: 'html-button-response',
    stimulus: `<div style='margin-left:200px; margin-right: 200px; text-align: center;'>
                <p style='font-size: 30px; line-height:1.5'>
                  Thank you for completing the practice, your score is ${correct_ac}/${total_ac}. 
                  <br><br> 
                  Please try to respond to each color change as accurately as possible during the task. 
                  To continue this experiment, please make sure to get at least 7 of the 10 trials correct. When you are ready press 'Try Again'. 
                </p><br>
              </div>`,
    choices: ['Try Again'],
    button_html: [
      '<button id="retry-button" class ="custom-button" style="font-size: 20px; padding: 10px; margin: 10px;">%choice%</button>',
    ],
    response_ends_trial: true, 
    on_load: function() {
      document.getElementById("retry-button").addEventListener("click", function() {
        ac_colornumber = 0
        total_ac = 0
        correct_ac = 0
        jsPsych.addNodeToEndOfTimeline({
          timeline: [prac_attentioncheck_blackplus],
        }, jsPsych.resumeExperiment)
      });
    },
    on_finish: function(data) {
      data.trial_type = 'attentioncheck_feedback';
      data.stimulus = 'cross_check_feedback';
      data.failed_practice = kickout_record
    }
  };
}else{
  ac_feedback = {
    type: 'html-button-response',
    stimulus: `<div style='margin-left:200px; margin-right: 200px; text-align: center;'>
                <p style='font-size: 30px; line-height:1.5'>
                  Thank you for completing the practice, your score is ${correct_ac}/${total_ac}. 
                  <br><br> 
                  Please try to respond to each color change as accurately as possible during the task. 
                  If you are ready to continue to the next practice, press 'Continue'.
                </p><br>
              </div>`,
    choices: ['Continue'],
    button_html: [
      '<button id="continue-button" class="custom-button" style="font-size: 20px; padding: 10px; margin: 10px;">%choice%</button>'
    ],
    response_ends_trial: true, 
    on_load: function() {
      document.getElementById("continue-button").addEventListener("click", function() {
        jsPsych.addNodeToEndOfTimeline({
          timeline: [instruct_lastonebefore_practice,learn_phase,learn_phase_color,thecrossant,thecrossant_black,thecrossant_break],
        }, jsPsych.resumeExperiment)
      });
    },
    on_finish: function(data) {
      data.trial_type = 'attentioncheck_feedback';
      data.stimulus = 'cross_check_feedback';
    }
  };
}
}



helpofattentioncheck={
  type: 'html-keyboard-response',
  choices: ['spacebar'],
  stimulus: "<div style='margin-left:200px ;margin-right: 200px ;text-justify: auto'><p style ='font-size: 30px;line-height:1.5'>It seems you got one wrong. Remember, for the cross below:</p><img src= '../static/images/isi.png' width='150' height='150'><p style ='font-size: 30px;line-height:1.5'>If the cross flashes <span style='color: blue; text-shadow: -1px -1px 0 #000,1px -1px 0 #000,-1px  1px 0 #000,1px  1px 0 #000'>blue,</span> press the '1' key on your keyboard, if it flashes <span style='color: yellow;text-shadow: -1px -1px 0 #000,1px -1px 0 #000,-1px  1px 0 #000,1px  1px 0 #000'>yellow,</span> press '2'.<p style= 'font-size:25px;margin-top:100px'>[press the spacebar to continue]</p>",
  on_finish: function (data) {
    data.trial_type = 'attentioncheck_help';
    data.stimulus='instruct'
  }
}

// Learn prac 1
var prac1_num=1
var intro_prac1_learn=create_instruct(instructprac1,instructprac1names,prac1_num,learn_prac2_phase,a='prac_')
var prac2_num=1

var learn_prac1_phase = {
  type: 'html-keyboard-response',
  choices: jsPsych.NO_KEYS,
  response_ends_trial: false,
  stimulus:create_learning_trial(['../static/images/story_example_01.png'],['../static/images/story_example_02.png'],0),
  stimulus_duration:3000,
  trial_duration:3000,
  on_load: function(){
    timeline.push(intro_prac1_learn)  
  },
  on_finish: function(data) {
    data.trial_type = 'learn_prac_1';
    data.stimulus='lean_prac_1'
    attentioncheck(intro_prac1_learn,a=1,1,0,intro_prac1_learn)
  }
}

var learn_prac2_phase = {
  type: 'html-keyboard-response',
  choices: jsPsych.NO_KEYS,
  response_ends_trial: false,
  stimulus:create_learning_trial(['../static/images/LosAngeles.png'],['../static/images/story_example_04.png'],0),
  stimulus_duration:3000,
  trial_duration:3000,
  on_finish: function(data) {
    data.trial_type = 'learn_prac_2';
    data.stimulus='lean_prac_2'
    attentioncheck(intro_prac2_learn,a=1,1,0,intro_prac2_learn)
  }
}


function learnphaseone(){
  //practice attention check
  // 1: The black plus sign, the color change, the black plus sign for response
  thecrossant= {
    type: 'html-keyboard-response',
    choices: ['1','2'],
    stimulus_height: 100,
    stimulus_width: 100,
    stimulus_duration: 500,
    trial_duration: 500,
    response_ends_trial: false,
    stimulus:create_learningcolor_trial(curr_learning_trial,pluscolor[curr_learning_trial]),
    prompt:parse("<br><br><style>body {background-color: #ffff;}</style>"),
    on_finish: function(data) {
      data.stimulus=pluscolor[curr_learning_trial]
      data.stimulus_left=left_images[curr_learning_trial]
      data.stimulus_right=right_images[curr_learning_trial]
      data.trial_type='rt_plussign_withcolor'
      kp=data.key_press
    }
  }
  learningcorrectness = []
  thecrossant_black={
    type: 'html-keyboard-response',
    choices: ['1','2'],
    stimulus_height: 100,
    stimulus_width: 100,
    stimulus_duration: 2000-removecolor,
    trial_duration: 2000-removecolor,
    response_ends_trial: false,
    stimulus:create_memory_ten('black'),
    prompt:parse("<br><br><style>body {background-color: #ffff;}</style>"),
    on_finish: function(data) {
      data.trial_type ='rt_thecrossant_black'
      data.stimulus='black_plus_sign'
      op=data.key_press
      if (kp){
        data.rt=null
      if(kp!=pluscheck[curr_learning_trial]) {
        checkfail=checkfail+1
        data.accuracy = 0
        learningcorrectness.push(0)
        if(checkfail>=checkthreshold&&checkfail<4){
          jsPsych.endCurrentTimeline(),
          jsPsych.addNodeToEndOfTimeline({
            timeline: [warning_page,thecrossant_break],
          }, jsPsych.resumeExperiment)
        }else if(checkfail>4){
          jsPsych.endCurrentTimeline(),
          jsPsych.addNodeToEndOfTimeline({
          timeline:[TaskFailed],},jsPsych.resumeExperiment)
          //end experiment
        }
      }else{
        checkfail=0
        data.accuracy = 1
        learningcorrectness.push(1)
      }
    }else if(op){
      data.rt=data.rt+100+timetakenforpluswindow
      if(op!=pluscheck[curr_learning_trial]) {
        checkfail=checkfail+1
        data.accuracy = 0
        learningcorrectness.push(0)
        if(checkfail>=checkthreshold&&checkfail<4){
          jsPsych.endCurrentTimeline(),
          jsPsych.addNodeToEndOfTimeline({
            timeline: [warning_page,thecrossant_break],
          }, jsPsych.resumeExperiment)
        }else if(checkfail>4){
          jsPsych.endCurrentTimeline(),
          jsPsych.addNodeToEndOfTimeline({
          timeline:[TaskFailed],},jsPsych.resumeExperiment)
          //end experiment
        }
      }else{
        checkfail=0
        data.accuracy = 1
        learningcorrectness.push(1)
      }
    }else{
      checkfail=checkfail+1
      if(checkfail>=checkthreshold&&checkfail<4){
        jsPsych.endCurrentTimeline(),
        jsPsych.addNodeToEndOfTimeline({
          timeline: [warning_page,thecrossant_break],
          }, jsPsych.resumeExperiment)
      }else if(checkfail>4){
        jsPsych.endCurrentTimeline(),
        jsPsych.addNodeToEndOfTimeline({
        timeline:[TaskFailed],},jsPsych.resumeExperiment)
        //end experiment
      }
    }
    let learnsum = 0;
      learningcorrectness.forEach(function(value) {
        learnsum += value;
      });

      data.cumulative_accuracy = learnsum / learningcorrectness.length;
  }
  }

  TaskFailed = {
    type: 'html-keyboard-response',
    stimulus: '<p>Unfortunately, you do not qualify to continue this experiment.</p>' +
              '<p>Please press <strong>Escape</strong> to close the window. You will be paid for your time up to now.</p>',
    choices: ['Esc'],
    on_finish: function(data){
      window.close();
    }
  };

  thecrossant_break={
    type: 'html-keyboard-response',
    choices: jsPsych.NO_KEYS,
    stimulus_height: 100,
    stimulus_width: 100,
    stimulus_duration: 100,
    trial_duration: 100,
    response_ends_trial: false,
    stimulus:create_memory_ten('black'),
    prompt:parse("<br><br><style>body {background-color: #ffff;}</style>"),
    on_finish: function(data) {
      data.trial_type='color_black'
      data.stimulus='black_plus_sign'
      timetakenforpluswindow=removecolor
      colordetretime=colorStart()
      removecolor=colorStop(colordetretime)
      learn_phase_color.stimulus_duration= removecolor
      learn_phase_color.trial_duration=removecolor
      thecrossant_black.stimulus_duration= 2000-removecolor
      thecrossant_black.trial_duration=2000-removecolor
      curr_learning_trial=curr_learning_trial+1,
      learn_phase.stimulus=create_learning_trial(learn_base64_left,learn_base64_right,curr_learning_trial)
      learn_phase.trial_duration=3000
      learn_phase.stimulus_duration=3000
      thecrossant_black.stimulus=create_memory_ten('black')
      thecrossant.stimulus=create_learningcolor_trial(curr_learning_trial,pluscolor[curr_learning_trial])
      attentioncheck_learningphase(learn_phase,sfa,curr_learning_trial,n_learning_trial,intro_dir,thecrossant,thecrossant_black,thecrossant_break)
      
    }
  }

  learn_phase = {
    type: 'html-keyboard-responsefl',
    choices: jsPsych.NO_KEYS,
    response_ends_trial: false,
    stimulus:create_learning_trial(learn_base64_left,learn_base64_right,curr_learning_trial),
    stimulus_duration:3000,
    trial_duration:3000,
    on_finish: function(data) {
      data.trial_type = 'learn_phase(without_color)';
      data.stimulus='black_plus_sign'
      data.stimulus_left=left_images[curr_learning_trial],
      data.stimulus_right=right_images[curr_learning_trial],
      sfa=1
    }
  }

  learn_phase_color = {
    type: 'html-keyboard-responsefl',
    choices: jsPsych.NO_KEYS,
    response_ends_trial: false,
    stimulus:create_memory_ten(),
    stimulus_duration:removecolor,
    trial_duration:removecolor,
    on_finish: function(data) {
      data.stimulus=pluscolor[curr_learning_trial]
      data.stimulus_left=left_images[curr_learning_trial]
      data.stimulus_right=right_images[curr_learning_trial]
      data.trial_type = 'black_cross(without_color)';
      sfa=1
    }
  }
 
  learn_phase_break = {
    type: 'html-keyboard-response',
        stimulus:  `
          <div id="break-container" style="font-size: 24px; max-width: 800px; margin: auto; text-align: center;">
            <p><strong>Please take a short (up to 60 seconds) break.</strong></p>
            <p>Use this time to stretch and reset. After the break, you will continue to learn more flights.</p>
            <p>If you would like to resume without a break, press the <strong>spacebar</strong>.</p>
            <p>Otherwise, the screen will advance automatically after 60 seconds.</p><br><br><br>
            <p><strong>Time remaining: <span id="countdown">60</span> seconds</strong></p>
          </div>
        `,
        choices: ['spacebar'],
        trial_duration: 60000, // 60 seconds
        response_ends_trial: true,
    on_load: function() {
      let countdown = 60;
      const countdownEl = document.getElementById('countdown');
      const interval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;
        if (countdown <= 0) clearInterval(interval);
      }, 1000);
    },
    on_finish: function(data) {
      data.stimulus='learn_break'
      data.trial_type = 'learn_break';
    }
  }

  learn_phase_end_break = {
    type: 'html-keyboard-response',
        stimulus: `
          <div style="font-size: 24px; max-width: 800px; margin: auto; text-align: center;">
            <p><strong>Thank you for completing the first part of your job. Please take a short (up to 60 seconds) break.</strong></p>
            <p>Use this time to stretch and reset. After the break, you will continue to the next part of your job.</p>
            <p>If you would like to resume without a break, press the <strong>spacebar</strong>.</p>
            <p>Otherwise, the screen will advance automatically after 60 seconds.</p><br><br><br>
            <p><strong>Time remaining: <span id="countdown2">60</span> seconds</strong></p>
          </div>
        `,
        choices: ['spacebar'],
        trial_duration: 60000, // 60 seconds
        response_ends_trial: true,
    on_load: function() {
      let countdown = 60;
      const countdownEl = document.getElementById('countdown2');
      const interval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;
        if (countdown <= 0) clearInterval(interval);
      }, 1000);
    },
    on_finish: function(data) {
      data.stimulus='learn_break'
      data.trial_type = 'learn_break';
    }
  }

  // timeline.push(learn_phase)
  // timeline.push(learn_phase_color,thecrossant,thecrossant_black,thecrossant_break)
}
function createbreak(intro_dir,instructnames,directmemory_phase){
  let thebreak= {
    type: 'html-keyboard-response',
    choices:jsPsych.NO_KEYS,
    trial_duration: 100,
    stimulus:'<p></p>',
    on_finish: function(data) {
      data.trial_type='thebreak'
      timelinepresent(intro_dir,instructnames,directmemory_phase)
    }
  }
  return thebreak
}
// learning phase end
var directcorrectness = []
//Direct Memory test
var curr_direct_trial=0
var directmemory_phase = {
  type: 'html-keyboard-response',
  choices: ['1','2','3'],
  response_ends_trial: true,
  stimulus:create_direct_trial(direct_base64_up,direct_base64_left,direct_base64_mid,direct_base64_right,curr_direct_trial),
  stimulus_duration:6500,//6.5 buffer for now, we will discuss it 
  trial_duration:6500,//6.5 second for now 
  on_load: function() {
    // let directResp = false
    // document.addEventListener('keydown', function(event) {
    //   if (directResp) return;
    //   if (['1', '2', '3'].includes(event.key)) {
    //     directResp = true
    //     var selected_choice = event.key;
    //     var image_ids = ['img1', 'img2', 'img3'];
    //     image_ids.forEach(function(id) {
    //       var image = document.getElementById(id);
    //       if (image) {
    //         image.style.border = '';
    //       }
    //     });
    //     var selected_image = document.getElementById('img' + selected_choice);
    //     if (selected_image) {
    //       selected_image.style.border = '5px solid black';
    //     }
      
      
    //   }})
    // setTimeout(function() {
    //   for(let i = 0;i<document.getElementsByClassName('bottom').length;i++){
    //     document.getElementsByClassName('bottom')[i].style.visibility = 'visible';
    //   }
    // }, 500);
  },
  on_finish: function(data) {
    data.trial_type = 'directmemory_phase';
    data.stimulus=room_direct_up[curr_direct_trial];
    data.stimulus_down_left=room_direct_left[curr_direct_trial],
    data.stimulus_down_mid=room_direct_mid[curr_direct_trial]
    data.stimulus_down_right=room_direct_right[curr_direct_trial];
    data.stimulus_correct=room_direct_correct[curr_direct_trial];
    data.stimulus_short=room_direct_short[curr_direct_trial];
    data.stimulus_far=room_direct_far[curr_direct_trial];
    if ((data.key_press == 49 && data.stimulus_down_left == data.stimulus_correct)||
    (data.key_press == 50 && data.stimulus_down_mid == data.stimulus_correct) ||(data.key_press == 51 && data.stimulus_down_right == data.stimulus_correct)) {
      data.accuracy = 1
      directcorrectness.push(1)
      data.weighted_accuracy = 1
    } else {
      data.accuracy = 0
      directcorrectness.push(0)
      data.weighted_accuracy = 0
    }

    if ((data.key_press == 49 && data.stimulus_down_left == data.stimulus_short)||
    (data.key_press == 50 && data.stimulus_down_mid == data.stimulus_short) ||(data.key_press == 51 && data.stimulus_down_right == data.stimulus_short)) {
      data.missedtrial = 'closer'
      data.weighted_accuracy = 0.5
    } else if ((data.key_press == 49 && data.stimulus_down_left == data.stimulus_far)||
    (data.key_press == 50 && data.stimulus_down_mid == data.stimulus_far) ||(data.key_press == 51 && data.stimulus_down_right == data.stimulus_far)) {
      data.missedtrial = 'closer'
      data.weighted_accuracy = 0.5
    }

    infKP += 1
    if (infKP==1){
      // Start the timer
      timer = 0;
      infINT = setInterval(() => {
          timer++;;
      }, 1000);
    }
    if (infKP == 4 && timer < 4) {
      clearInterval(infINT)
      jsPsych.addNodeToEndOfTimeline({
      timeline: [too_quick],
      }, jsPsych.resumeExperiment)
      infKP = -1
      timer = 0;
      data.tooquick = 1
    } else if ((infKP <= 4 && timer >= 4)){
      infKP = 0
      clearInterval(infINT);
      timer = 0
    }

    if (data.rt < 300) {
      jsPsych.addNodeToEndOfTimeline({
        timeline: [too_quick],
        }, jsPsych.resumeExperiment)
    }
    
    let directsum = 0;
    directcorrectness.forEach(function(value) {
      directsum += value;
    });

    data.cumulative_accuracy = directsum / directcorrectness.length;
    part2_sfa=data.key_press

    if (!part2_sfa){
      direct_warning +=1
    }
    curr_direct_trial=curr_direct_trial+1
    directmemory_phase.stimulus=create_direct_trial(direct_base64_up,direct_base64_left,direct_base64_mid,direct_base64_right,curr_direct_trial)
    attentioncheck(directmemory_phase,part2_sfa,curr_direct_trial,n_direct_trial,intro_short,phase='direct')
  }
}

//Direct Memory test end

var directmem_break= {
  type: 'html-keyboard-response',
  choices:jsPsych.NO_KEYS,
  stimulus_duration: 1000,
  trial_duration: 1000,
  stimulus:'<p></p>',
  on_finish: function() {
    
  }
}

correctness = []
//Shortest Path memory test
var curr_shortest_trial=0
var shortestpath_phase = {
  type: 'html-keyboard-response',
  choices: ['1','2'],
  response_ends_trial: true,
  stimulus:create_shortestpath_trial(shortest_base64_up,shortest_base64_left,shortest_base64_right,curr_shortest_trial),
  stimulus_duration:7500, // 7.5 second 
  trial_duration:7500,
  on_load: function() {

    // setTimeout(function() {
    //   for(let i = 0;i<document.getElementsByClassName('bottomshortest').length;i++){
    //     document.getElementsByClassName('bottomshortest')[i].style.visibility = 'visible';
    //   }
    // }, 500);
  },
  on_finish: function(data) {
    data.trial_type = 'shortestpath_phase';
    data.stimulus=room_shortest_up[curr_shortest_trial];
    data.stimulus_left=room_shortest_left[curr_shortest_trial];
    data.stimulus_right=room_shortest_right[curr_shortest_trial]
    data.stimulus_correct=room_shortest_correct[curr_shortest_trial];
    if ((data.key_press == 49 && data.stimulus_left == data.stimulus_correct)||(data.key_press == 50 && data.stimulus_right == data.stimulus_correct)) {
      data.accuracy = 1
      correctness.push(1)
    } else {
      data.accuracy = 0
      correctness.push(0)
    }
  
    let onedifflength = 24
    let twodifflength = 24
    let threedifflength = 24
    let fourdifflength = 12

    if (cumulativearr[curr_shortest_trial] < onedifflength){
      data.condition = 'One Edge Diff'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength && cumulativearr[curr_shortest_trial] < onedifflength + twodifflength){
      data.condition = 'Two Edge Diff'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + twodifflength && cumulativearr[curr_shortest_trial] < onedifflength + twodifflength + threedifflength){
      data.condition = 'Three Edge Diff'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + twodifflength + threedifflength){
      data.condition = 'Four Edge Diff'
    }

    if (cumulativearr[curr_shortest_trial] < shuffled_twothree.length){
      data.specific_pairs = "Two Edge Three Edge"
    } else if (cumulativearr[curr_shortest_trial] >= shuffled_twothree.length && cumulativearr[curr_shortest_trial] < shuffled_twothree.length + shuffled_threefour.length){
      data.specific_pairs = 'Three Edge Four Edge'
    } else if (cumulativearr[curr_shortest_trial] >= shuffled_twothree.length + shuffled_threefour.length && cumulativearr[curr_shortest_trial] < shuffled_twothree.length + shuffled_threefour.length + shuffled_fourfive.length){
      data.specific_pairs = 'Four Edge Five Edge'
    } else if (cumulativearr[curr_shortest_trial] >= shuffled_twothree.length + shuffled_threefour.length + shuffled_fourfive.length && cumulativearr[curr_shortest_trial] < onedifflength){
      data.specific_pairs = 'Five Edge Six Edge'

    } else if (cumulativearr[curr_shortest_trial] >= onedifflength && cumulativearr[curr_shortest_trial] < onedifflength + shuffled_twofour.length){
      data.specific_pairs = 'Two Edge Four Edge'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + shuffled_twofour.length && cumulativearr[curr_shortest_trial] < onedifflength + shuffled_twofour.length + shuffled_threefive.length){
      data.specific_pairs = 'Three Edge Five Edge'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + shuffled_twofour.length + shuffled_threefive.length && cumulativearr[curr_shortest_trial] < onedifflength + twodifflength){
      data.specific_pairs = 'Four Edge Six Edge'

    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + twodifflength && cumulativearr[curr_shortest_trial] < onedifflength + twodifflength + shuffled_twofive.length){
      data.specific_pairs = 'Two Edge Five Edge'
    } else if (cumulativearr[curr_shortest_trial] >= onedifflength + twodifflength + shuffled_twofive.length && cumulativearr[curr_shortest_trial] < onedifflength + twodifflength + threedifflength){
      data.specific_pairs = 'Three Edge Six Edge'
    }

    else if (cumulativearr[curr_shortest_trial] >= onedifflength + twodifflength + threedifflength){
      data.specific_pairs = 'Two Edge Six Edge'
    }


    infKP += 1
    if (infKP==1){
      // Start the timer
      timer = 0;
      infINT = setInterval(() => {
          timer++;;
      }, 1000);
    }
    if (infKP == 4 && timer < 4) {
      clearInterval(infINT)
      jsPsych.addNodeToEndOfTimeline({
      timeline: [too_quick],
      }, jsPsych.resumeExperiment)
      infKP = -1
      timer = 0;
      data.tooquick = 1
    } else if ((infKP <= 4 && timer >= 4)){
      infKP = 0
      clearInterval(infINT);
      timer = 0
    }

    if (data.rt < 300) {
      jsPsych.addNodeToEndOfTimeline({
        timeline: [too_quick],
        }, jsPsych.resumeExperiment)
    }

    let sum = 0;
    correctness.forEach(function(value) {
      sum += value;
    });
    data.cumulative_accuracy = sum / correctness.length;

    part2_sfa=data.key_press
    if (!part2_sfa){
      short_warning +=1
    }
    curr_shortest_trial=curr_shortest_trial+1
    shortestpath_phase.stimulus=create_shortestpath_trial(shortest_base64_up,shortest_base64_left,shortest_base64_right,curr_shortest_trial)
    attentioncheck(shortestpath_phase,part2_sfa,curr_shortest_trial,n_shortest_trial,intro_mem,phase='short')
  }
}
//Shortest Path memory end

var phase3 = {}
//Goal directed planning
function createPhase3(numberoftrial){
  var phase3 = {}
  for (let i = 0; i < numberoftrial; i++){
    if (i==numberoftrial-1){
      phase3[i] = {
        type: 'html-keyboard-response',
        stimulus: phasethreeroom[0],
        choices: jsPsych.NO_KEYS, // Disable keyboard responses
        // on_load: function() {
        //   document.getElementById('nextButton').style.display = 'block'
        //   document.getElementById('nextButton').addEventListener('click', function() {
        //     jsPsych.finishTrial(); // End trial on button click
        //   });
        // },
        on_finish: function (data) {
          data.trial_type='Goal Directed Planning'
          data.stimulus = `GDP-${i}`
          data.imgL_ID = leftName
          data.imgR_ID = rightName
          data.linedress=''
          if (detourLocationMap[i]) {
            // Safely check and log for specificline_saved
            if (specificline_saved && Object.keys(specificline_saved).length > 0) {
              for (const key in specificline_saved) {
                data.linedressed += specificline_saved[key].name + 
                  ':[x1:' + specificline_saved[key].location.x1 + 
                  ' x2:' + specificline_saved[key].location.x2 + 
                  ' y1:' + specificline_saved[key].location.y1 + 
                  ' y2:' + specificline_saved[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline_saved is empty or undefined in trial ${i}`);
            }
          
            // Safely check and log for specificline
            if (specificline && Object.keys(specificline).length > 0) {
              for (const key in specificline) {
                data.linedressed_detor += specificline[key].name + 
                  ':[x1:' + specificline[key].location.x1 + 
                  ' x2:' + specificline[key].location.x2 + 
                  ' y1:' + specificline[key].location.y1 + 
                  ' y2:' + specificline[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline is empty or undefined in trial ${i}`);
            }
          
            data.detour_trial = true;
            console.log(`Trial ${i} is a detour trial`);
            
          } else {
            // Safely check and log for specificline
            if (specificline && Object.keys(specificline).length > 0) {
              for (const key in specificline) {
                data.linedressed += specificline[key].name + 
                  ':[x1:' + specificline[key].location.x1 + 
                  ' x2:' + specificline[key].location.x2 + 
                  ' y1:' + specificline[key].location.y1 + 
                  ' y2:' + specificline[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline is empty or undefined in trial ${i}`);
            }
          
            data.detour_trial = false;
          }
          if (goaldirIndex[numberoftrial] < twoEdgePair.length){
            data.condition = 'Three Edge Diff'
          } else if (goaldirIndex[numberoftrial] >= twoEdgePair.length && goaldirIndex[numberoftrial] < twoEdgePair.length + threeEdgePair.length){
            data.condition = 'Four Edge Diff'
          } else if (goaldirIndex[numberoftrial] >=twoEdgePair.length + threeEdgePair.length &&  goaldirIndex[numberoftrial] < twoEdgePair.length + threeEdgePair.length + fourEdgePair.length){
            data.condition = 'Five Edge Diff'
          }else if (goaldirIndex[numberoftrial] >= threeEdgePair.length + fourEdgePair.length + fiveEdgePair.length+twoEdgePair.length){
            data.condition = 'Six Edge Diff'
          }
          gdp_init(),
          jsPsych.addNodeToEndOfTimeline({
            timeline: [intro_graph],
          }, jsPsych.resumeExperiment)
          specificline_saved={};
          detourcity_name=[];
        }
      }
    }else{
      phase3[i] = {
        type: 'html-keyboard-response',
        stimulus: phasethreeroom[0],
        choices: jsPsych.NO_KEYS, // Disable keyboard responses
        // on_load: function() {
        //   document.getElementById('nextButton').addEventListener('click', function() {
        //     jsPsych.finishTrial(); // End trial on button click
        //   });
        // },
        on_finish: function (data) {
          data.trial_type='Goal Directed Planning'
          data.stimulus = `GDP-${i}`
          data.imgL_ID = leftName
          data.imgR_ID = rightName
          data.linedress=''
          if (detourLocationMap[i]) {
            // Safely check and log for specificline_saved
            if (specificline_saved && Object.keys(specificline_saved).length > 0) {
              for (const key in specificline_saved) {
                data.linedressed += specificline_saved[key].name + 
                  ':[x1:' + specificline_saved[key].location.x1 + 
                  ' x2:' + specificline_saved[key].location.x2 + 
                  ' y1:' + specificline_saved[key].location.y1 + 
                  ' y2:' + specificline_saved[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline_saved is empty or undefined in trial ${i}`);
            }
          
            // Safely check and log for specificline
            if (specificline && Object.keys(specificline).length > 0) {
              for (const key in specificline) {
                data.linedressed_detor += specificline[key].name + 
                  ':[x1:' + specificline[key].location.x1 + 
                  ' x2:' + specificline[key].location.x2 + 
                  ' y1:' + specificline[key].location.y1 + 
                  ' y2:' + specificline[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline is empty or undefined in trial ${i}`);
            }
          
            data.detour_trial = true;
            console.log(`Trial ${i} is a detour trial`);
            
          } else {
            // Safely check and log for specificline
            if (specificline && Object.keys(specificline).length > 0) {
              for (const key in specificline) {
                data.linedressed += specificline[key].name + 
                  ':[x1:' + specificline[key].location.x1 + 
                  ' x2:' + specificline[key].location.x2 + 
                  ' y1:' + specificline[key].location.y1 + 
                  ' y2:' + specificline[key].location.y2 + ']';
              }
            } else {
              console.log(`specificline is empty or undefined in trial ${i}`);
            }
          
            data.detour_trial = false;
          }
          
          if (goaldirIndex[numberoftrial] < twoEdgePair.length){
            data.condition = 'Three Edge Diff'
          } else if (goaldirIndex[numberoftrial] >= twoEdgePair.length && goaldirIndex[numberoftrial] < twoEdgePair.length + threeEdgePair.length){
            data.condition = 'Four Edge Diff'
          } else if (goaldirIndex[numberoftrial] >=twoEdgePair.length + threeEdgePair.length &&  goaldirIndex[numberoftrial] < twoEdgePair.length + threeEdgePair.length + fourEdgePair.length){
            data.condition = 'Five Edge Diff'
          }else if (goaldirIndex[numberoftrial] >= threeEdgePair.length + fourEdgePair.length + fiveEdgePair.length+twoEdgePair.length){
            data.condition = 'Six Edge Diff'
          }
          gdp_init(),
          phase3[i+1].stimulus = `<div id='displayhelp' style='display:none'><p>Click and drag the locations to the gray box to make your flight plans
          <br /> you can 'book' flights by clicking on the two cities in order <br> You can remove flights by clicking on a city and clicking the return arrow on the bottom right of the gray box <br> once you are finished, press the 'next client' button to book the next client</p></div><button id='batman' style='display: block;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;', onclick='initiatep3()'>Click to start</button><div id='spiderman' style='display: none;'><button id="nextButton" style="display: block; margin: 20px auto; padding: 10px 20px; background-color: #4CAF50; color: black; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Submit</button><div id='Phase3Body'><br><div id='div2'  style='width: 700px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa;'><img id='drag01' src='${generated_stimuli[0]['stimulus']}' alt='${generated_stimuli[0]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag02' src='${generated_stimuli[1]['stimulus']}' alt='${generated_stimuli[1]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag03' src='${generated_stimuli[2]['stimulus']}' alt='${generated_stimuli[2]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag04' src='${generated_stimuli[3]['stimulus']}' alt='${generated_stimuli[3]['label']}' alt='Custer' width='100' height='120' draggable='true' ondragstart='drag(event)'>
            <img id='drag05' src='${generated_stimuli[4]['stimulus']}' alt='${generated_stimuli[4]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag06' src='${generated_stimuli[5]['stimulus']}' alt='${generated_stimuli[5]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag07' src='${generated_stimuli[6]['stimulus']}' alt='${generated_stimuli[6]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag08' src='${generated_stimuli[7]['stimulus']}' alt='${generated_stimuli[7]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag09' src='${generated_stimuli[8]['stimulus']}' alt='${generated_stimuli[8]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag10' src='${generated_stimuli[9]['stimulus']}' alt='${generated_stimuli[9]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag11' src='${generated_stimuli[10]['stimulus']}' alt='${generated_stimuli[10]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag12' src='${generated_stimuli[11]['stimulus']}' alt='${generated_stimuli[11]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'>
             <img id='drag13' src='${generated_stimuli[12]['stimulus']}' alt='${generated_stimuli[12]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'></div><div id='div1' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa; background-color: lightgray;'ondrop='drop(event)' ondragover='allowDrop(event)'><div id='div3' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; '></div><img id='imgL' style='position:relative;right:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='imgR' style='position:relative;left:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='return' src='../static/images/return.png' style='position: relative;left: 450px;bottom: 100px ;border: 2px solid black' width='50'height='50'></div></div></div>`
          ,        
          jsPsych.addNodeToEndOfTimeline({
            timeline: [phase3[i+1]],
          }, jsPsych.resumeExperiment)
          specificline_saved={};
          detourcity_name=[];
        }
      }
    }
  }
  return phase3
}


phase3=createPhase3(n_goaldir_trial)
let dir_instruction_number=1
let intro_dir=create_instruct(dir_instruct,dir_instructnames,dir_instruction_number,directmemory_phase,a='dir_')

let short_instruction_number=1
let intro_short=create_instruct(short_instruct,short_instructnames,short_instruction_number,shortestpath_phase,a='short_')

let mem_instruction_number=1
let intro_mem=create_instruct(mem_instruct,mem_instructnames,mem_instruction_number,phase3[0],a='mem_')
//Goal directed planning end


//recon phase
function recon_createPhase3(numberoftrial){
  var recon_phase3 = {}
  for (let i = 0; i < numberoftrial; i++){
    if (i==numberoftrial-1){
      recon_phase3[i] = {
        type: 'html-keyboard-response',
        stimulus: recon_phasethreeroom[0],
        choices: jsPsych.NO_KEYS, // Disable keyboard responses
        // on_load: function() {
        //   document.getElementById('nextButton').style.display = 'block'
        //   document.getElementById('nextButton').addEventListener('click', function() {
        //     jsPsych.finishTrial(); // End trial on button click
        //   });
        // },
        on_finish: function (data) {
          data.trial_type='Graph Reconstruction'
          data.linedress=''
          for (const key in specificline) {
              data.linedressed += specificline[key].name+':[x1:'+specificline[key].location.x1+' x2:'+specificline[key].location.x2+' y1:'+specificline[key].location.y1+' y2:'+specificline[key].location.y2+']'
          }
          // if (goaldirIndex[numberoftrial] < threeEdgePair.length){
          //   data.condition = 'Three Edge Diff'
          // } else if (goaldirIndex[numberoftrial] >= threeEdgePair.length && goaldirIndex[numberoftrial] < threeEdgePair.length + fourEdgePair.length){
          //   data.condition = 'Four Edge Diff'
          // } else if (goaldirIndex[numberoftrial] >= threeEdgePair.length + fourEdgePair.length + fiveEdgePair.length){
          //   data.condition = 'Five Edge Diff'
          // }
          recon_init(),
          jsPsych.addNodeToEndOfTimeline({
            timeline: [end_questions,thank_you],
          }, jsPsych.resumeExperiment)
        }
      }
    }else{
      recon_phase3[i] = {
        type: 'html-keyboard-response',
        stimulus: recon_phasethreeroom[0],
        choices: jsPsych.NO_KEYS, // Disable keyboard responses
        // on_load: function() {
        //   document.getElementById('nextButton').addEventListener('click', function() {
        //     jsPsych.finishTrial(); // End trial on button click
        //   });
        // },
        on_finish: function (data) {
          data.trial_type='Goal Directed Planning'
          data.linedress=''
          for (const key in specificline) {
              data.linedressed += specificline[key].name+':[x1:'+specificline[key].location.x1+' x2:'+specificline[key].location.x2+' y1:'+specificline[key].location.y1+' y2:'+specificline[key].location.y2+']'
          }
          recon_init(),
          jsPsych.addNodeToEndOfTimeline({
            timeline: [recon_phase3[i+1]],
          }, jsPsych.resumeExperiment)
        }
      }
    }
  }
  return recon_phase3
}

var recon_phase3=recon_createPhase3(1)

//recon phase end



//Semantic US map
var semantic_instructions = {
  type: 'html-keyboard-response',
  choices: ['spacebar'],
  stimulus: "<div style='margin-left:200px ;margin-right: 200px ;text-justify: auto'><p style ='font-size: 30px;line-height:1.5'>You are almost done with the task! For this final task, we will ask you to place the city names you learned about on a map. Please do not look up the actual locations--we care about where YOU THINK the locations are, which may have guided your thought process during this task. <b>OPENING A SEPARATE WINDOW OR TAB MAY CAUSE THE EXPERIMENT TO CLOSE OUT</b>.<p style= 'font-size:25px;margin-top:100px'>[press the spacebar to continue]</p>",
  on_finish: function (data) {
    data.trial_type = 'semanticinstructions';
    data.stimulus='instruct-semantic'
}
}

var semantic_phase3 = {
  type: 'html-keyboard-response',
  stimulus: semanticHTML,
  choices: jsPsych.NO_KEYS,
  on_load: function () {
    initiatesemanticMap(); // start the UI
  },
  on_finish: function (data) {
    data.trial_type = 'Semantic_US_Map';
  
    // Convert position object to comma-separated string
    const parts = [];
    for (const key in semanticImagePositions) {
      const pos = semanticImagePositions[key];
      parts.push(`${key}:x=${pos.x.toFixed(2)},y=${pos.y.toFixed(2)}`);
    }
    data.image_position = parts.join("; ").replace(',',' ');
    data.unknowncity=unknowncity
  }  
};


var end_questions = {
  type: 'survey-html-form',
  preamble: "<br><br><h1>Post-Task Survey</h1><p style='font-size: 16px'>Thank you for completing the task! We would like you to answer the following questions before the experiment ends. <br>Note: <span style='color: red;'>*</span> = required</p><hr>",
  html: survey_questions + `
        <button id="submit_end_questions" class="custom-button">Submit Answers</button><br><br>`,
  on_load: function() {
    document.querySelector('.jspsych-btn').style.display = 'none';
    document.getElementById("submit_end_questions").addEventListener("click", function(event) {
      
      event.preventDefault();
      problems = []
      for (i=0;i<3;i++){
          var response1=document.getElementsByName("smooth")[i].checked
          if (response1){
              smooth = document.getElementsByName("smooth")[i].value
          }
          var response2=document.getElementsByName("problems")[i].checked
          if (response2){
              problems.push(document.getElementsByName("problems")[i].value)
          }
      }
      
      testedstates = []
      for (let i = 0;i<cityNameList.length;i++){
        testedstates.push(document.getElementById(`${cityNameList[i]}`).value)
      }
      currentstate = document.getElementById("currentstate").value
      otherstate = document.getElementById("otherstate").value
      distraction = document.getElementById("distraction").value
      strategies = document.getElementById("strategies").value
      easier = document.getElementById('easier').value
      similar = document.getElementById('similar').value
      comments = document.getElementById('comments').value
      jsPsych.finishTrial()
  });
  },
  on_finish: function(data) {
    data.trial_type = "survey"
    data.stimulus = "survey-questions"
    data.testedstates = (testedstates || "").join("; ")
    data.currentstate = (currentstate || "").replace(/,/g, ';');
    data.otherstate   = (otherstate   || "").replace(/,/g, ';');
    data.problems     = problems;
    data.smooth       = smooth;
    data.distraction  = (distraction  || "").replace(/,/g, ';');
    data.strategies   = (strategies   || "").replace(/,/g, ';');
    data.easier       = (easier       || "").replace(/,/g, ';');
    data.similar      = (similar      || "").replace(/,/g, ';');
    data.comments     = (comments     || "").replace(/,/g, ';');
  }
};

function validateForm() {
  const requiredFields = document.querySelectorAll("[required]");
  let allFilled = true;
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      allFilled = false;
      field.style.border = "2px solid red";
    } else {
      field.style.border = "";
    }
  });
  return true;
}
var problems = []
var smooth = 0 
var distraction = 0 
var strategies = 0 
var easier = 0 
var similar = 0 
var comments = 0 
var currentstate = 0
var otherstate = 0
var testedstates = []


//graph reconstruction instruction start
let graph_instruction_number=1
let intro_graph=create_instruct(graph_instruct,graph_instructnames,graph_instruction_number,recon_phase3[0],a='graph_')
//graph reconstruction instruction finish

//
// final thank you
var thank_you = {
  type: 'html-keyboard-response',
  choices: ['space'],
  stimulus: "<p> Congratulations, you are all done!</p><p>The secret code to enter at the beginning screen is: CIMBPENS</p><p> Please make sure to submit the HIT and email uciccnl@gmail.com if you had any issues! </p>",
  on_start:function(data){
    save_final_deter='final',
    save_data(),
    markVersion1AsFinished()
    // Remove the listeners
    document.removeEventListener("keydown", blockRefresh);
    window.removeEventListener("beforeunload", blockUnload);
  },
  on_finish: function (data) {
    data.trial_type = 'thank_you';
    data.detectfocus = detectfocus;
  }
}


//time line here
  var prac1_num=1
  var intro_prac1_learn=create_instruct(instructprac1,instructprac1names,prac1_num,learn_prac2_phase,a='prac_')
  var prac2_num=1
  var intro_prac2_learn=create_instruct(instructprac2,instructprac2names,prac2_num,prac_attentioncheck_blackplus,a='prac2_')


waitUntilBase64Ready().then(() => {

  // Learning
  learn_base64_left = learn_left.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });
  if (learn_base64_left.includes(null)) {
    console.error("Some filenames in learn_left were not found in generated_stimuli!");
  }

  learn_base64_right = learn_right.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });
  if (learn_base64_right.includes(null)) {
    console.error("Some filenames in learn_right were not found in generated_stimuli!");
  }
  //

  // Direct Memory
  direct_base64_up = room_direct_up.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  direct_base64_left = room_direct_left.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  direct_base64_mid = room_direct_mid.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  direct_base64_right = room_direct_right.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  // Relative Distance Judgement
  shortest_base64_up = room_shortest_up.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  shortest_base64_left = room_shortest_left.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });

  shortest_base64_right = room_shortest_right.map(filename => {
    let match = generated_stimuli.find(item => item.filename === filename);
    return match ? match.stimulus : null; 
  });


  learnphaseone()
  //instruction section
  var instruction_number=1
  var intro_learn=create_instruct(instruct,instructnames,instruction_number,learn_prac1_phase)

  //timeline
  timeline.push(welcome,enterFullscreen)
  timeline.push(intro_learn)
  //timeline end


  directmemory_phase.stimulus = create_direct_trial(direct_base64_up,direct_base64_left,direct_base64_mid,direct_base64_right,curr_direct_trial)

  shortestpath_phase.stimulus=create_shortestpath_trial(shortest_base64_up,shortest_base64_left,shortest_base64_right,curr_shortest_trial)
  phasethreeroom=[`<div id='displayhelp' style='display:none'><p>Click and drag the locations to the gray box to make your flight plans
  <br /> you can 'book' flights by clicking on the two cities in order <br> You can remove flights by clicking on a city and clicking the return arrow on the bottom right of the gray box <br> once you are finished, press the 'next client' button to book the next client</p></div><button id='batman' style='display: block;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;', onclick='initiatep3()'>Click to start</button><div id='spiderman' style='display: none;'><div id='Phase3Body'><button id="nextButton" style="display: block; margin: 20px auto; padding: 10px 20px; background-color: #4CAF50; color: black; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Submit</button><br><div id='div2'  style='width: 700px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa;'><img id='drag01' src='${generated_stimuli[0]['stimulus']}' alt='${generated_stimuli[0]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag02' src='${generated_stimuli[1]['stimulus']}' alt='${generated_stimuli[1]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag03' src='${generated_stimuli[2]['stimulus']}' alt='${generated_stimuli[2]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag04' src='${generated_stimuli[3]['stimulus']}' alt='${generated_stimuli[3]['label']}' alt='Custer' width='100' height='120' draggable='true' ondragstart='drag(event)'>
  <img id='drag05' src='${generated_stimuli[4]['stimulus']}' alt='${generated_stimuli[4]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag06' src='${generated_stimuli[5]['stimulus']}' alt='${generated_stimuli[5]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag07' src='${generated_stimuli[6]['stimulus']}' alt='${generated_stimuli[6]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag08' src='${generated_stimuli[7]['stimulus']}' alt='${generated_stimuli[7]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag09' src='${generated_stimuli[8]['stimulus']}' alt='${generated_stimuli[8]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag10' src='${generated_stimuli[9]['stimulus']}' alt='${generated_stimuli[9]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag11' src='${generated_stimuli[10]['stimulus']}' alt='${generated_stimuli[10]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag12' src='${generated_stimuli[11]['stimulus']}' alt='${generated_stimuli[11]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'>
  <img id='drag13' src='${generated_stimuli[12]['stimulus']}' alt='${generated_stimuli[12]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'></div><div id='div1' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa; background-color: lightgray;'ondrop='drop(event)' ondragover='allowDrop(event)'><div id='div3' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; '></div><img id='imgL' style='position:relative;right:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='imgR' style='position:relative;left:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='return' src='../static/images/return.png' style='position: relative;left: 450px;bottom: 100px ;border: 2px solid black' width='50'height='50'></div></div></div>`
  ]
  phase3[0].stimulus = `<div id='displayhelp' style='display:none'><p>Click and drag the locations to the gray box to make your flight plans
  <br /> you can 'book' flights by clicking on the two cities in order <br> You can remove flights by clicking on a city and clicking the return arrow on the bottom right of the gray box <br> once you are finished, press the 'next client' button to book the next client</p></div><button id='batman' style='display: block;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;', onclick='initiatep3()'>Click to start</button><div id='spiderman' style='display: none;'><div id='Phase3Body'><button id="nextButton" style="display: block; margin: 20px auto; padding: 10px 20px; background-color: #4CAF50; color: black; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">Submit</button><br><div id='div2'  style='width: 700px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa;'><img id='drag01' src='${generated_stimuli[0]['stimulus']}' alt='${generated_stimuli[0]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag02' src='${generated_stimuli[1]['stimulus']}' alt='${generated_stimuli[1]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag03' src='${generated_stimuli[2]['stimulus']}' alt='${generated_stimuli[2]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag04' src='${generated_stimuli[3]['stimulus']}' alt='${generated_stimuli[3]['label']}' alt='Custer' width='100' height='120' draggable='true' ondragstart='drag(event)'>
    <img id='drag05' src='${generated_stimuli[4]['stimulus']}' alt='${generated_stimuli[4]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag06' src='${generated_stimuli[5]['stimulus']}' alt='${generated_stimuli[5]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag07' src='${generated_stimuli[6]['stimulus']}' alt='${generated_stimuli[6]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag08' src='${generated_stimuli[7]['stimulus']}' alt='${generated_stimuli[7]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag09' src='${generated_stimuli[8]['stimulus']}' alt='${generated_stimuli[8]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag10' src='${generated_stimuli[9]['stimulus']}' alt='${generated_stimuli[9]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag11' src='${generated_stimuli[10]['stimulus']}' alt='${generated_stimuli[10]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'><img id='drag12' src='${generated_stimuli[11]['stimulus']}' alt='${generated_stimuli[11]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'>
     <img id='drag13' src='${generated_stimuli[12]['stimulus']}' alt='${generated_stimuli[12]['label']}' width='100' height='120' draggable='true' ondragstart='drag(event)'></div><div id='div1' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa; background-color: lightgray;'ondrop='drop(event)' ondragover='allowDrop(event)'><div id='div3' style='width: 1200px; height: 400px; margin: 0 auto; position: relative; '></div><img id='imgL' style='position:relative;right:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='imgR' style='position:relative;left:450px;bottom: 250px;border:2px solid blue' width='100' height='120'><img id='return' src='../static/images/return.png' style='position: relative;left: 450px;bottom: 100px ;border: 2px solid black' width='50'height='50'></div></div></div>`

  recon_phase3[0].stimulus=["<div id='displayhelp' style='display:none'><p>Click and drag the objects to the gray box"
  +"<br /> You can connect the images by clicking the two images in order <br> You can remove an object by clicking on it and then clicking the return arrow on the bottom right of the gray box <br> once all the objects are in the grey box and have <b>at least one line connecting them</b>, press the 'submit' button that will appear</p><button id='nextButton' style='display:none;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;'>Submit</button>"
  +`</div><button id='batman' style='display: block;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;', onclick='recon_initiatep3()'>Click to start</button><div id='spiderman' style='display: none;'><div id='Phase3Body'><br><div id='div2'  style='width: 700px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa;'><img id='drag01' src='${generated_stimuli[0]['stimulus']}' alt='Aliance' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag02' src='${generated_stimuli[1]['stimulus']}' alt='Boulder' width='100' height='100' draggable='true' ondragstart='drag(event)'>
  <img id='drag03' src='${generated_stimuli[2]['stimulus']}' alt='Cornwall' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag04' src='${generated_stimuli[3]['stimulus']}' alt='Custer' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag05' src='${generated_stimuli[4]['stimulus']}' alt='DelawareCity' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag06' src='${generated_stimuli[5]['stimulus']}' alt='Medora' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag07' src='${generated_stimuli[6]['stimulus']}' alt='Newport' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag08' src='${generated_stimuli[7]['stimulus']}' alt='ParkCity' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag09' src='${generated_stimuli[8]['stimulus']}' alt='Racine' width='100' height='100' draggable='true' ondragstart='drag(event)'>
  <img id='drag10' src='${generated_stimuli[9]['stimulus']}' alt='Sitka' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag11' src='${generated_stimuli[10]['stimulus']}' alt='WestPalmBeach' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag12' src='${generated_stimuli[11]['stimulus']}' alt='Yukon' width='100' height='100' draggable='true' ondragstart='drag(event)'><img id='drag13' src='${generated_stimuli[12]['stimulus']}' alt='img13' width='100' height='100' draggable='true' ondragstart='drag(event)'></div>`
                      +"<div id='div1' style='width: 1200px; height: 700px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa; background-color: lightgray;'ondrop='recon_drop(event)' ondragover='recon_allowDrop(event) '><div id='div3' style='width: 1200px; height: 700px; margin: 0 auto; position: relative; '></div><img id='return' src='../static/images/return.png' style='position: relative;left: 450px;bottom: 100px ;border: 2px solid black' width='50'height='50'></div></div></div>"]
  //jspsych-html-button-response-button-0
  
  jsPsych.init({
    timeline: timeline,
    preload_images: all_images,
    max_load_time: 600000,
    on_finish: function () {
      /* Retrieve the participant's data from jsPsych */
      // Determine and save participant bonus payment
      psiturk.recordUnstructuredData("subject_id", subject_id);
      save_data(true)
    },
  })
})

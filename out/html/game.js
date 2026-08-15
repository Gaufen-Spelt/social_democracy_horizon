(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // ORIGINAL BG SET FOR CUSTOM MFS

    var _originalSetBg = window.dendryUI.setBg.bind(window.dendryUI);
    window.dendryUI.setBg = function(img) {
      var customBg = localStorage.getItem(TITLE + '_custom_bg');
      if (customBg) {
        document.body.style.backgroundImage = 'url(' + customBg + ')';
      } else {
        _originalSetBg(img);
      }
    };

    // TAG LIMITATIONS PART STARTS -------------

    // Tag limits for hand
    var TAG_LIMITS = {
        party_affairs: 3,
        govt_affairs: 3
    };

    var originalDrawCard = dendryUI.dendryEngine.drawCard.bind(dendryUI.dendryEngine);
    dendryUI.dendryEngine.drawCard = function(deckId) {
    var engine = dendryUI.dendryEngine;
    var currentSceneId = engine.state.sceneId;
    var currentHand = engine.state.currentHands[currentSceneId] || [];

    var card = engine._drawFromDeck(deckId);
    if (!card) return {id: null, title: 'no_card_in_deck'};

    var difficulty = dendryUI.dendryEngine.state.qualities.difficulty;

    if (difficulty > -1) {
        for (var tag in TAG_LIMITS) {
            var taggedIds = game.tagLookup[tag];
            if (taggedIds && taggedIds[card.id]) {
                var count = currentHand.filter(function(c) {
                    return taggedIds[c.id];
                }).length;
                if (count >= TAG_LIMITS[tag]) {
                    return {id: null, title: 'no_space_for_tag'};
                }
            }
        }
    }

    return originalDrawCard(deckId);
};

    var originalDisplayHand = dendryUI.displayHand.bind(dendryUI);
    dendryUI.displayHand = function(hand, maxCards) {
    originalDisplayHand(hand, maxCards);
    
    var handItems = document.querySelectorAll('.card-in-hand');
    handItems.forEach(function(item) {
        var cardLink = item.querySelector('a.card');
        if (!cardLink) return;
        var cardId = cardLink.getAttribute('card-id');
        if (!cardId) return;
        
        var tags = game.tagLookup;
        item.classList.remove('tag-party_affairs', 'tag-govt_affairs', 'tag-other');
        if (tags.party_affairs && tags.party_affairs[cardId]) {
            item.classList.add('tag-party_affairs');
        } else if (tags.govt_affairs && tags.govt_affairs[cardId]) {
            item.classList.add('tag-govt_affairs');
        } else {
            item.classList.add('tag-other');
        }
    });
   };
  // TAG LIMITATIONS PART ENDED HERE.

    // Add your custom code here.
  };

  var TITLE = "Social Democracy: An Alternate Horizon" + '_' + "Gaufenspelt";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO; 
  window.loadMod = function(url) {
      ui.loadGame(url);
  };

  window.updateSandboxLink = function() {
    var sandboxLink = document.getElementById('sandbox-link');
    if (!sandboxLink) return;
    var sandbox = window.dendryUI.dendryEngine.state.qualities.sandbox;
    sandboxLink.style.display = (sandbox === 1) ? 'inline' : 'none';
  };

  window.showSandbox = function() {
      if (window.dendryUI.dendryEngine.state.sceneId.startsWith('sandbox')) {
          window.dendryUI.dendryEngine.goToScene('backSpecialScene');
      } else {
          window.dendryUI.dendryEngine.goToScene('sandbox');
      }
  };

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showCredits = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('credits')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('credits');
    }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };

  window.enableDarkMode = function() {
    window.dendryUI.dark_mode = true;
    document.body.classList.add('dark-mode');
    window.dendryUI.saveSettings();
  };


  window.getFocusModeEnabled = function() {
    var v = window.dendryUI.focus_mode_enabled;
    return v === undefined ? true : v;
  };

  window.enableFocusModeSetting = function() {
      window.dendryUI.focus_mode_enabled = true;
      window.dendryUI.saveSettings();
  };

  window.disableFocusModeSetting = function() {
      window.dendryUI.focus_mode_enabled = false;
      if (document.body.classList.contains('focus-mode')) {
          window.disableFocusMode();
      }
      window.dendryUI.saveSettings();
  };

  // Populates the checkboxes in the options view.
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
    if (window.getFocusModeEnabled()) {
        $('#focusmode_yes')[0].checked = true;
    } else {
        $('#focusmode_no')[0].checked = true;
    }
  };

  // This function allows you to modify the text before it's displayed.
  window.displayText = function(text) {

    var dsbp_name = window.dendryUI.dendryEngine.state.qualities.dsbp_name || 'DSBP';
if (dsbp_name !== 'DSBP') {
    text = text.replace(/\bDSBP\b/g, dsbp_name);
}
    
  var wordPhrases = {
    'Weimar Republic': ['#DCCA4A', '#E3000F'],   // Weimar=gold, Republic=red
    'German Reich':    ['#111111', '#C0392B'],    // German=black, Reich=red
    'Red Front':       ['#E3000F', '#8B0000'],
    'Black Reichswehr':['#111111', '#4B5320'],
    'Social Democracy':['#E3000F', '#D5AC27'],
    'National Socialism':['#954B00', '#954B00'],
};

function renderWordColors(phrase, colors) {
    var words = phrase.split(' ');
    return words.map(function(word, i) {
        var color = colors[i] || colors[colors.length - 1];
        return '<span style="color:' + color + ';font-weight:600;text-shadow:0 0 8px ' + color + '33;">' + word + '</span>';
    }).join(' ');
}

Object.keys(wordPhrases).forEach(function(phrase) {
    var colors = wordPhrases[phrase];
    var escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(?<![\\w-])(' + escaped + ')(?![\\w-])', 'g');
    text = text.replace(regex, function() {
        return renderWordColors(phrase, colors);
    });
});
    
    var keywords = {

        // ── German Reichstag parties ──────────────────────────────
        'KPD':   '#8B0000',
        'SPD':   '#E3000F',
        'DDP':   '#DCCA4A',
        'DVP':   '#D5AC27',
        'DNVP':  '#3F7BC1',
        'NSDAP': '#954B00',
        'SAPD':  '#C40000',
        'ASPD':  '#B22222',
        'SRPD':  '#FF6B6B',
        'WP':    '#808080',
        'CNBL':  '#5D4E37',
        'CSRP':  '#FFCCFF',
        'VRP':   '#69413C',
        'CSVD':  '#5E76FF',
        'BB':    '#36FF64',
        'DHP':   '#518A60',
        'HL':    '#2E8B57',
        'SL':    '#005B96',
        'VNR':   '#4B5320',
        'DVFP':  '#7A5C12',
        'KVP':   '#6699FF',
        'LB':    '#6B0000',
        'RDP':   '#B8B000',
        'CVP':   '#555555',
        'SLS':   '#4A7C59',
        'DTSP':  '#3B1A00',
        'KPO':   '#990000',
        'DBP':   '#03A331',
        'DSBP':  '#7A9DB5',
        'DLP':   '#F7FF05',
        'LMP':   '#B8860B',
        'DNF':   '#00008b',
        'FAUD':   '#1C1C1C',
        'KAPD':   '#5C0000',
        'RLB':   '#4A5D23',

      
        // Centre Party (Z) — avoid single-letter match, use full name below
        'Zentrum': '#333333',
        'BVP':   '#69A2BE',
        'Z': '#111111',

        // ── Austrian Nationalrat parties ──────────────────────────
        'SDAPÖ': '#C0392B',
        'SDAPO': '#C0392B',
        'KPÖ':   '#8B0000',
        'KPOE':  '#8B0000',
        'CS':    '#2E4F9E',
        'GDVP':  '#1A6B4A',
        'Landbund':   '#8B6914',
        'Heimatblock': '#7D3C98',
        'DNSAP': '#2C2C2C',

        // ── Ideology & movements ──────────────────────────────────
        // Socialism / left
        'socialism':     '#E3000F',
        'socialist':     '#E3000F',
        'socialists':    '#E3000F',
        'Socialism':     '#E3000F',
        'Socialist':     '#E3000F',
        'Socialists':    '#E3000F',
        'communism':     '#8B0000',
        'communist':     '#8B0000',
        'communists':    '#8B0000',
        'Communism':     '#8B0000',
        'Communist':     '#8B0000',
        'Communists':    '#8B0000',
        'Bolshevik':     '#8B0000',
        'Bolsheviks':    '#8B0000',
        'bolshevik':     '#8B0000',
        'Marxism':       '#C0392B',
        'Marxist':       '#C0392B',
        'marxism':       '#C0392B',
        'marxist':       '#C0392B',
        'proletariat':   '#E3000F',
        'Proletariat':   '#E3000F',
        'workers':       '#E3000F',
        'Workers':       '#E3000F',
        'labour':        '#E3000F',
        'Labour':        '#E3000F',
        'trade union':   '#E3000F',
        'Trade Union':   '#E3000F',

        // Nationalism / right
        'nationalism':   '#954B00',
        'nationalist':   '#954B00',
        'nationalists':  '#954B00',
        'Nationalism':   '#954B00',
        'Nationalist':   '#954B00',
        'Nationalists':  '#954B00',
        'fascism':       '#7A3B00',
        'fascist':       '#7A3B00',
        'fascists':      '#7A3B00',
        'Fascism':       '#7A3B00',
        'Fascist':       '#7A3B00',
        'Fascists':      '#7A3B00',
        'Nazi':          '#954B00',
        'Nazis':         '#954B00',
        'nazi':          '#954B00',
        'Putsch':        '#7A3B00',
        'putsch':        '#7A3B00',
        'coup':          '#7A3B00',
        'Coup':          '#7A3B00',
        'reactionary':   '#3F7BC1',
        'Reactionary':   '#3F7BC1',
        'conservative':  '#3F7BC1',
        'Conservative':  '#3F7BC1',

        // Liberalism / centre
        'liberal':       '#DCCA4A',
        'Liberal':       '#DCCA4A',
        'liberalism':    '#DCCA4A',
        'Liberalism':    '#DCCA4A',
        'democracy':     '#D5AC27',
        'Democracy':     '#D5AC27',
        'democratic':    '#D5AC27',
        'Democratic':    '#D5AC27',

        // Republic — German tricolor: black / red / gold
        // Three separate styled words via a chained trick isn't possible per-word,
        // so we color "Republic" in the gold of the Weimar flag and add a subtle glow
        'Republic':      '#DCCA4A',
        'republic':      '#DCCA4A',
        'Weimar':        '#DCCA4A',
        'weimar':        '#DCCA4A',
        'Reichstag':     '#D5AC27',
        'reichstag':     '#D5AC27',
        'Reich':         '#C0392B',
        'reich':         '#C0392B',

        // Government / institutions
        'Chancellor':    '#B8B000',
        'chancellor':    '#B8B000',
        'President':     '#B8B000',
        'president':     '#B8B000',
        'Reichswehr':    '#4B5320',
        'reichswehr':    '#4B5320',
        'Stormtroopers': '#954B00',
        'stormtroopers': '#954B00',
        'SA':            '#954B00',
        'SS':            '#1a1a1a',
        'Gestapo':       '#1a1a1a',
        'Freikorps':     '#3F7BC1',
        'freikorps':     '#3F7BC1',

        // Economics
        'inflation':     '#FF6B00',
        'Inflation':     '#FF6B00',
        'depression':    '#808080',
        'Depression':    '#808080',
        'unemployment':  '#808080',
        'Unemployment':  '#808080',
        'strike':        '#E3000F',
        'Strike':        '#E3000F',
        'capital':       '#D5AC27',
        'Capital':       '#D5AC27',
        'capitalism':    '#D5AC27',
        'Capitalism':    '#D5AC27',

        // War & revolution
        'revolution':    '#8B0000',
        'Revolution':    '#8B0000',
        'war':           '#4B5320',
        'War':           '#4B5320',
        'Armistice':     '#518A60',
        'armistice':     '#518A60',
        'Versailles':    '#808080',
    };

    // Sort by length descending so longer matches (e.g. "NSDAP") win over shorter ones
    var sorted = Object.keys(keywords).sort(function(a, b) {
        return b.length - a.length;
    });

    sorted.forEach(function(word) {
        var color = keywords[word];
        // Escape special regex chars in the keyword
        var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Word boundary — but allow spaces inside multi-word phrases
        var regex = new RegExp('(?<![\\w-])(' + escaped + ')(?![\\w-])', 'g');
        text = text.replace(regex,
            '<span style="color:' + color + ';font-weight:600;text-shadow:0 0 8px ' + color + '33;">' + '$1' + '</span>'
        );
    });

    return text;
};

  // Refreshes the bottom panel on scene change signals.
  window.handleSignal = function(signal, event, scene_id) {
      if (signal === 'scene-arrival') {
          window.updateBottomPanel();
      }
  };

  // Updates the main sidebar (#qualities) from the current statusTab scene.
  window.updateSidebar = function() {
    $('#qualities').empty();
    var scene = dendryUI.game.scenes[window.statusTab];
    dendryUI.dendryEngine._runActions(scene.onArrival);
    var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
    $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));

    if (scene.onDisplay) {
        dendryUI.dendryEngine._runActions(scene.onDisplay);
    }

    if (window.statusTab === 'status') {
        var Q = dendryUI.dendryEngine.state.qualities;
        var qualitiesEl = document.getElementById('qualities');
        var paragraphs = qualitiesEl.querySelectorAll('p');

        function attachPortrait(name, textPrefix, rowClass, imgClass) {
            if (!name) return;
            var para = Array.prototype.find.call(paragraphs, function(p) {
                return p.textContent.trim().indexOf(textPrefix) === 0;
            });
            if (!para) return;

            para.classList.add(rowClass);
            var slug = name.toString().toLowerCase().replace(/\s+/g, '_');
            var portrait = document.createElement('img');
            portrait.className = imgClass;
            portrait.onerror = function() { portrait.src = 'img/portraits/profile/default.png'; };
            portrait.src = 'img/portraits/profile/' + slug + '.png';
            para.appendChild(portrait);
        }

        attachPortrait(Q.president, 'President:', 'president-row', 'status-portrait');
        attachPortrait(Q.chancellor, 'Chancellor:', 'chancellor-row', 'chancellor-portrait');
    }
};

  // -----------------------------------------------------------------------
  // BOTTOM PANEL — linked to the 'news' scene (news.scene.dry)
  // -----------------------------------------------------------------------
  var BOTTOM_PANEL_SCENE = 'news';

  window.updateBottomPanel = function() {
      var panel = $('#bottom_panel');
      if (!panel.length) return;

      // Guard: scene must exist before we try to render it.
      var scene = dendryUI.game.scenes[BOTTOM_PANEL_SCENE];
      if (!scene) return;

      panel.empty();
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      panel.append(dendryUI.contentToHTML.convert(displayContent));
  };

  // Tab switching — still 2-arg so existing HTML onclick calls keep working.
  // The optional 3rd arg (target panel selector) is accepted but unused for
  // now since #qualities_2 is left empty.
  window.changeTab = function(newTab, tabId /*, targetPanel */) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementsByClassName('tab_button');
      for (var i = 0; i < tabButtons.length; i++) {
          tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  // Runs on every new page of content.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
    window.updateSandboxLink();
    window.updateBottomPanel();
  };

  // Runs whenever content is displayed.
  window.onDisplayContent = function() {
    window.updateSidebar();
    window.updateBottomPanel();
};

  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };

  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: false});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per x turns.";
    window.updateSandboxLink();
    var savedBg = localStorage.getItem(_BGKEY);
    if (savedBg) {
      $('#bg1').css('background-image', 'url("' + savedBg + '")');
      $('#bg2').css('background-image', 'url("' + savedBg + '")');
    }
    var savedMusic = localStorage.getItem(_MUSICKEY);
    // Legacy single-track custom music is now handled by MusicPlayer.
    // Restore custom styles
  (function() {
  var saved = window.csLoad ? window.csLoad() : {};
  var colorVars = ['--bg-color','--content-bg-color','--text-color',
                   '--link-color','--border-color','--tab-bg-color'];
  colorVars.forEach(function(v) {
    if (saved[v]) document.body.style.setProperty(v, saved[v]);
  });
  if (saved.fontSize)   document.body.style.fontSize   = saved.fontSize + '%';
  if (saved.fontFamily) document.body.style.fontFamily = saved.fontFamily;
  if (saved.maxWidth)   document.getElementById('page').style.maxWidth = saved.maxWidth + 'px';
  if (saved.overlayOpacity) window._csApplyOverlayOpacityRaw(saved.overlayOpacity);
  if (saved.rawCSS)     window._csInjectRaw(saved.rawCSS);
  })();
  };

 }());



/* =====================================================================
   SUPER EVENT — JS  v2.2
   Size tiers: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'
   Free-form:  maxWidth: '1400px' or '90vw' overrides size tier
   ===================================================================== */

const SuperEvent = (() => {

  /* ── Presets ─────────────────────────────────────────────────────────
     Named option bundles. trigger(opts, 'presetName') merges the preset
     as a base, with opts overriding any field. Add your own freely —
     either edit this table or do SuperEvent.presets.myName = {...}.
     ──────────────────────────────────────────────────────────────────── */
  const SUPER_EVENT_PRESETS = {
    crisis:  { size: 'lg', effect: 'glitch',    scanlines: true,  ambientColor: '#a00000' },
    victory: { size: 'xl', effect: 'cinematic', ambientColor: '#d4af37' },
    intel:   { size: 'md', layout: 'right-only', effect: 'static' },
    quiet:   { size: 'sm', layout: 'centered',   effect: 'none' },
  };

  /* ── Private state ──────────────────────────────────────────────── */
  let _overlay      = null;
  let _video        = null;
  let _leftPanel    = null;
  let _rightPanel   = null;
  let _videoWrap    = null;
  let _fieldsList   = null;
  let _endHandler   = null;
  let _staticCanvas = null;
  let _staticRAF    = null;
  let _active       = false;
  let _audio        = null;
  let _imageDurTimer = null;

  /* ── Queue state ────────────────────────────────────────────────── */
  let _queue        = [];
  let _queueRunning = false;

  /* ── DOM init ───────────────────────────────────────────────────── */
  function _init() {
    if (document.getElementById('super-event-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'super-event-overlay';

    // NOTE: blockquote is OUTSIDE #super-event-frame so the frame
    // (image/video + optional side panels) always takes full max-width.
    // The quote sits below the frame, also capped to --se-max-width.
    overlay.innerHTML = `
      <div id="super-event-title"></div>
      <div id="super-event-frame">
        <div class="super-event-left"></div>
        <div id="super-event-video-wrap">
          <video preload="auto" playsinline>
            <source src="" type="video/mp4">
          </video>
        </div>
        <div class="super-event-right">
          <dl class="super-event-fields"></dl>
          <div class="super-event-right-body"></div>
        </div>
      </div>
      <blockquote class="super-event-quote"></blockquote>
      <button id="super-event-skip">Skip</button>
    `;

    document.body.appendChild(overlay);

    _overlay    = overlay;
    _video      = overlay.querySelector('video');
    _leftPanel  = overlay.querySelector('.super-event-left');
    _rightPanel = overlay.querySelector('.super-event-right');
    _videoWrap  = overlay.querySelector('#super-event-video-wrap');
    _fieldsList = overlay.querySelector('.super-event-fields');
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  function _clearClasses(el, prefix) {
    [...el.classList].filter(c => c.startsWith(prefix)).forEach(c => el.classList.remove(c));
  }

  function _setOrHide(el, value, html = false) {
    if (value) {
      if (html) el.innerHTML = value;
      else el.textContent = value;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  }

  /* ── Static canvas effect ───────────────────────────────────────── */
  function _startStatic() {
    if (_staticCanvas) return;
    const c = document.createElement('canvas');
    c.id = 'se-static-canvas';
    c.width  = 320;
    c.height = 240;
    _videoWrap.appendChild(c);
    _staticCanvas = c;

    const ctx = c.getContext('2d');
    function draw() {
      const img = ctx.createImageData(c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() > 0.5 ? 255 : 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      _staticRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  function _stopStatic() {
    if (_staticRAF) { cancelAnimationFrame(_staticRAF); _staticRAF = null; }
    if (_staticCanvas) { _staticCanvas.remove(); _staticCanvas = null; }
  }

  /* ── Audio helpers ──────────────────────────────────────────────── */
  function _startAudio({ audioSrc, audioVolume = 1, audioLoop = false }) {
    _stopAudio();
    if (!audioSrc) return;
    _audio = new Audio(audioSrc);
    _audio.volume = Math.min(1, Math.max(0, audioVolume));
    _audio.loop   = audioLoop;
    _audio.play().catch(() => {
      console.warn('SuperEvent: audio autoplay blocked — waiting for gesture.');
      _overlay.addEventListener('click', () => _audio?.play(), { once: true });
    });
  }

  function _stopAudio() {
    if (_audio) {
      _audio.pause();
      _audio.currentTime = 0;
      _audio = null;
    }
  }

  /* ── Shatter effect ─────────────────────────────────────────────── */
  function _triggerShatter(cb) {
    const cols = 6, rows = 4;
    const grid = document.createElement('div');
    grid.id = 'se-shatter-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    _videoWrap.appendChild(grid);

    const tiles = [];
    for (let i = 0; i < cols * rows; i++) {
      const tile = document.createElement('div');
      tile.className = 'se-shatter-tile';
      tile.style.setProperty('--se-tile-rot', `${(Math.random() * 60 - 30).toFixed(1)}deg`);
      grid.appendChild(tile);
      tiles.push(tile);
    }

    tiles.forEach((t, i) => {
      setTimeout(() => t.classList.add('breaking'), i * 28 + Math.random() * 40);
    });

    setTimeout(() => {
      grid.remove();
      if (typeof cb === 'function') cb();
    }, 800);
  }

  /* ── Apply maxWidth ─────────────────────────────────────────────── */
  // size-* classes set --se-max-width in CSS.
  // If maxWidth is passed here it overrides inline (wins over class).
  function _applyMaxWidth(maxWidth) {
    if (maxWidth) {
      _overlay.style.setProperty('--se-max-width', maxWidth);
    } else {
      _overlay.style.removeProperty('--se-max-width');
    }
  }

  /* ── Close ──────────────────────────────────────────────────────── */
  function _close(effect) {
    if (!_overlay || !_active) return;
    _active = false;

    if (_endHandler) {
      _video.removeEventListener('ended', _endHandler);
      _endHandler = null;
    }

    if (_imageDurTimer) {
      clearTimeout(_imageDurTimer);
      _imageDurTimer = null;
    }

    _stopAudio();
    _video.pause();
    _video.currentTime = 0;

    if (effect === 'shatter') {
      _triggerShatter(() => {
        _overlay.classList.add('fading');
        setTimeout(() => {
          _overlay.classList.remove('active', 'fading');
          _stopStatic();
        }, 600);
      });
    } else {
      _overlay.classList.add('fading');
      setTimeout(() => {
        _overlay.classList.remove('active', 'fading');
        _stopStatic();
      }, 600);
    }
  }

  /* ── Trigger ────────────────────────────────────────────────────── */
  // presetName (optional): looks up SUPER_EVENT_PRESETS[presetName] and uses
  // it as the base config; anything in opts overrides the preset's fields.
  function trigger(opts = {}, presetName = null) {
    const preset = presetName ? (SUPER_EVENT_PRESETS[presetName] || {}) : {};
    if (presetName && !SUPER_EVENT_PRESETS[presetName]) {
      console.warn(`SuperEvent: unknown preset "${presetName}" — ignoring.`);
    }
    opts = { ...preset, ...opts };

    const {
      // Media
      videoSrc     = '',
      imageSrc     = null,
      imageCaption = null,
      posterSrc    = null,
      leftImage    = null,
      rightImage   = null,

      // Content
      title        = '',
      left         = '',
      right        = '',
      quote        = '',
      quoteCite    = '',
      fields       = null,      // {Label: value, ...} — rendered above right-panel body

      // Custom hook
      customClass  = '',        // space-separated class(es) added to the overlay for bespoke CSS

      // Layout
      size         = 'md',      // 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'
      maxWidth     = null,      // CSS string override, e.g. '1600px' or '92vw'
      layout       = 'default', // 'default' | 'video-only' | 'left-only' | 'right-only' | 'centered'
      videoRatio   = '16:9',    // '16:9' | '4:3' | '1:1' | '21:9'

      // Effects
      effect       = 'none',   // 'none' | 'glitch' | 'cinematic' | 'static' | 'shatter'
      scanlines    = false,
      vignette     = false,
      ambientColor = null,

      // Playback
      muted        = false,
      loop         = false,
      autoClose    = true,
      startAt      = 0,

      // Audio
      audioSrc     = null,
      audioVolume  = 1,
      audioLoop    = false,

      // Image duration
      duration     = null,  // ms — auto-close delay for imageSrc (null = stay open)

      // Visibility
      showSkip     = true,
      showTitle    = true,
      showQuote    = true,

      // Hooks
      onOpen       = null,
      onClose      = null,
      onSkip       = null,
    } = opts;

    return new Promise(resolve => {
      _init();

      if (_endHandler) {
        _video.removeEventListener('ended', _endHandler);
        _endHandler = null;
      }

      /* ── Reset overlay classes ──────────────────────────────────── */
      _clearClasses(_overlay, 'size-');
      _clearClasses(_overlay, 'layout-');
      _clearClasses(_overlay, 'effect-');
      _clearClasses(_overlay, 'ratio-');
      _overlay.classList.remove('scanlines', 'vignette', 'ambient-glow');
      if (_overlay.dataset.customClass) {
        _overlay.classList.remove(..._overlay.dataset.customClass.split(/\s+/).filter(Boolean));
        delete _overlay.dataset.customClass;
      }

      /* ── Apply config classes ───────────────────────────────────── */
      _overlay.classList.add(`size-${size}`);
      if (layout !== 'default') _overlay.classList.add(`layout-${layout}`);
      if (effect !== 'none')    _overlay.classList.add(`effect-${effect}`);
      if (scanlines)            _overlay.classList.add('scanlines');
      if (vignette)              _overlay.classList.add('vignette');
      if (customClass) {
        const classes = customClass.split(/\s+/).filter(Boolean);
        _overlay.classList.add(...classes);
        _overlay.dataset.customClass = classes.join(' ');
      }

      if (ambientColor) {
        _overlay.classList.add('ambient-glow');
        _overlay.style.setProperty('--se-ambient-color', ambientColor);
      }

      /* ── Size / maxWidth ────────────────────────────────────────── */
      _applyMaxWidth(maxWidth);

      /* ── Ratio ──────────────────────────────────────────────────── */
      _clearClasses(_videoWrap, 'ratio-');
      const ratioClass = 'ratio-' + videoRatio.replace(':', '-');
      _videoWrap.classList.add(ratioClass);

      /* ── Title ──────────────────────────────────────────────────── */
      const titleEl = document.getElementById('super-event-title');
      if (showTitle && title) {
        titleEl.textContent = title;
        titleEl.style.display = '';
      } else {
        titleEl.style.display = 'none';
      }

      /* ── Media: image or video ──────────────────────────────────── */
      const prevImg = _videoWrap.querySelector('img.se-hero-image');
      if (prevImg) prevImg.remove();
      const prevCap = _videoWrap.querySelector('.se-image-caption');
      if (prevCap) prevCap.remove();

      if (imageSrc) {
        _video.style.display = 'none';
        const img = document.createElement('img');
        img.className = 'se-hero-image';
        img.src = imageSrc;
        img.alt = title || '';
        _videoWrap.insertBefore(img, _videoWrap.firstChild);

        if (imageCaption) {
          const cap = document.createElement('div');
          cap.className = 'se-image-caption';
          cap.textContent = imageCaption;
          _videoWrap.appendChild(cap);
        }
      } else {
        _video.style.display = '';
        const src = _video.querySelector('source');
        src.src = videoSrc;
        if (posterSrc) _video.poster = posterSrc;
        _video.muted       = muted;
        _video.loop        = loop;
        _video.currentTime = 0;
        _video.load();

        if (startAt > 0) {
          _video.addEventListener('loadedmetadata', () => {
            _video.currentTime = startAt;
          }, { once: true });
        }
      }

      /* ── Left panel ─────────────────────────────────────────────── */
      let leftContent = left;
      if (leftImage) leftContent = `<img src="${leftImage}" style="width:100%;display:block;margin-bottom:0.5rem;" alt="">` + left;
      _setOrHide(_leftPanel, leftContent, true);

      /* ── Structured fields (Label: value pairs) ───────────────────── */
      if (fields && typeof fields === 'object' && Object.keys(fields).length) {
        _fieldsList.innerHTML = Object.entries(fields)
          .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
          .join('');
        _fieldsList.style.display = '';
      } else {
        _fieldsList.innerHTML = '';
        _fieldsList.style.display = 'none';
      }

      /* ── Right panel (sidebar content only — no quote) ──────────── */
      let rightContent = right;
      if (rightImage) rightContent = `<img src="${rightImage}" style="width:100%;display:block;margin-bottom:0.5rem;" alt="">` + right;
      _rightPanel.querySelector('.super-event-right-body').innerHTML = rightContent || '';
      // Hide the right panel when there is no sidebar content and no fields
      const hasFields = fields && typeof fields === 'object' && Object.keys(fields).length;
      _rightPanel.style.display = (right || rightImage || hasFields) ? '' : 'none';

      /* ── Quote — rendered BELOW the frame ──────────────────────── */
      const quoteEl = _overlay.querySelector('.super-event-quote');
      if (showQuote && quote) {
        quoteEl.innerHTML = `${quote}<cite>${quoteCite}</cite>`;
        quoteEl.style.display = '';
      } else {
        quoteEl.style.display = 'none';
      }

      /* ── Skip button ────────────────────────────────────────────── */
      const skipBtn = document.getElementById('super-event-skip');
      skipBtn.style.display = showSkip ? '' : 'none';
      skipBtn.onclick = () => {
        _close(effect);
        if (typeof onSkip === 'function') onSkip();
        setTimeout(() => {
          if (typeof onClose === 'function') onClose();
          resolve();
        }, 600);
      };

      /* ── Static effect ──────────────────────────────────────────── */
      _stopStatic();
      if (effect === 'static') _startStatic();

      /* ── Show overlay ───────────────────────────────────────────── */
      _overlay.classList.remove('fading');
      _overlay.classList.add('active');
      _active = true;

      if (typeof onOpen === 'function') onOpen();

      /* ── Audio ──────────────────────────────────────────────────── */
      _startAudio({ audioSrc, audioVolume, audioLoop });

      /* ── Autoplay ───────────────────────────────────────────────── */
      if (!imageSrc) {
        _video.play().catch(() => {
          console.warn('SuperEvent: autoplay blocked — waiting for gesture.');
          _overlay.addEventListener('click', () => _video.play(), { once: true });
        });
      }

      /* ── End handler ────────────────────────────────────────────── */
      if (!imageSrc && !loop) {
        _endHandler = () => {
          if (!autoClose) return;
          setTimeout(() => {
            _close(effect);
            setTimeout(() => {
              if (typeof onClose === 'function') onClose();
              resolve();
            }, 600);
          }, 1000);
        };
        _video.addEventListener('ended', _endHandler, { once: true });
      }

      // Image: auto-close after duration if set
      if (imageSrc && autoClose && duration != null) {
        _imageDurTimer = setTimeout(() => {
          _close(effect);
          setTimeout(() => {
            if (typeof onClose === 'function') onClose();
            resolve();
          }, 600);
        }, duration);
      }
    });
  }

  /* ── Queue ──────────────────────────────────────────────────────── */
  function queue(events = []) {
    _queue = [...events];
    if (!_queueRunning) _runQueue();
  }

  function _runQueue() {
    if (_queue.length === 0) { _queueRunning = false; return; }
    _queueRunning = true;
    const next = _queue.shift();
    const original = next.onClose;
    const presetName = next.preset || null;
    trigger({
      ...next,
      onClose: () => {
        if (typeof original === 'function') original();
        _runQueue();
      }
    }, presetName);
  }

  /* ── Skip (public) ──────────────────────────────────────────────── */
  function skip(onCloseCb = null) {
    const effect = _overlay
      ? [..._overlay.classList].find(c => c.startsWith('effect-'))?.replace('effect-', '') || 'none'
      : 'none';
    _close(effect);
    if (typeof onCloseCb === 'function') {
      setTimeout(onCloseCb, 600);
    }
  }

  /* ── Close (public) ─────────────────────────────────────────────── */
  function close(onCloseCb = null) {
    skip(onCloseCb);
  }

  /* ── isActive ───────────────────────────────────────────────────── */
  function isActive() {
    return _active;
  }

  return { trigger, skip, close, queue, isActive, presets: SUPER_EVENT_PRESETS };

})();


























var _BGKEY = 'Social Fascism: An Alternate Horizon_Gaufenspelt_custom_bg';

window.importCustomBg = function(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    localStorage.setItem(_BGKEY, e.target.result);
    $('#bg1').css('background-image', 'url("' + e.target.result + '")');
    $('#bg2').css('background-image', 'url("' + e.target.result + '")');
    window.dendryUI.disable_bg = false;
    window.dendryUI.saveSettings();
  };
  reader.readAsDataURL(file);
};

window.clearCustomBg = function() {
  localStorage.removeItem(_BGKEY);
  var currentBg = window.dendryUI.dendryEngine.state.bg;
  if (currentBg) {
    window.dendryUI.setBg(currentBg);
  } else {
    document.body.style.backgroundImage = 'none';
  }
  window.dendryUI.saveSettings();
};










var _MUSICKEY = 'Social Fascism: An Alternate Horizon_Gaufenspelt_custom_music';








// Wait for dendryUI to exist, then patch setBg at the prototype level
var _bgPatchInterval = setInterval(function() {
  if (!window.dendryUI || !window.dendryUI.dendryEngine) return;
  clearInterval(_bgPatchInterval);

  var _originalSetBg = window.dendryUI.setBg.bind(window.dendryUI);
  window.dendryUI.setBg = function(img) {
    var customBg = localStorage.getItem(_BGKEY);
    if (customBg) {
      $('#bg1').css('background-image', 'url("' + customBg + '")');
      $('#bg2').css('background-image', 'url("' + customBg + '")');
    } else {
      _originalSetBg(img);
    }
  };

  var _originalAudio = window.dendryUI.audio.bind(window.dendryUI);
  window.dendryUI.audio = function(audioStr) {
      // If MusicPlayer has user tracks AND scene audio is disabled, block game audio changes
      if (window.MusicPlayer && window.MusicPlayer.isUserControlled() && !window.MusicPlayer.sceneAudioEnabled()) return;
      _originalAudio(audioStr);
    };
}, 100);








var _CS_KEY = 'Social Fascism: An Alternate Horizon_Gaufenspelt_custom_style';

var _csDefaults = {
  '--bg-color':          null,
  '--content-bg-color':  null,
  '--text-color':        null,
  '--link-color':        null,
  '--border-color':      null,
  '--tab-bg-color':      null,
  fontSize:              null,
  fontFamily:            null,
  overlayOpacity:        null,
  maxWidth:              null,
  rawCSS:                null,
};

// Reads a CSS variable from the current body style
var _csGetVar = function(varName) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
};

window.showCustomStyle = function() {
  window.csPopulate();
  document.getElementById('custom-style').style.display = 'block';
  var el = document.getElementById('custom-style');
  if (!el.onclick) {
    el.onclick = function(evt) {
      if (evt.target === el) window.hideCustomStyle();
    };
  }
};

window.hideCustomStyle = function() {
  document.getElementById('custom-style').style.display = 'none';
};

window.csPopulate = function() {
  var saved = window.csLoad();
  // Color pickers — fall back to computed value if not saved
  var colorMap = {
    'cs_bg_color':      '--bg-color',
    'cs_content_bg':    '--content-bg-color',
    'cs_text_color':    '--text-color',
    'cs_link_color':    '--link-color',
    'cs_border_color':  '--border-color',
    'cs_tab_color':     '--tab-bg-color',
  };
  for (var id in colorMap) {
    var varName = colorMap[id];
    var el = document.getElementById(id);
    if (!el) continue;
    var val = saved[varName] || _csGetVar(varName);
    // color inputs need #rrggbb format
    if (val && !val.startsWith('#')) {
      // skip non-hex values (rgba etc) — leave picker at default
    } else if (val) {
      el.value = val;
    }
    el.onchange = (function(v) {
      return function(e) { window.csApplyVar(v, e.target.value); };
    })(varName);
  }
  // Font size
  if (saved.fontSize) {
    document.getElementById('cs_font_size').value = saved.fontSize;
    document.getElementById('cs_font_size_label').textContent = saved.fontSize + '%';
    document.body.style.fontSize = saved.fontSize + '%';
  }
  // Font family
  if (saved.fontFamily) {
    document.getElementById('cs_font').value = saved.fontFamily;
    document.body.style.fontFamily = saved.fontFamily;
  }
  // Overlay opacity
  if (saved.overlayOpacity) {
    document.getElementById('cs_overlay_opacity').value = saved.overlayOpacity;
    document.getElementById('cs_overlay_opacity_label').textContent = saved.overlayOpacity + '%';
    window._csApplyOverlayOpacityRaw(saved.overlayOpacity);
  }
  // Max width
  if (saved.maxWidth) {
    document.getElementById('cs_max_width').value = saved.maxWidth;
    document.getElementById('cs_max_width_label').textContent = saved.maxWidth + 'px';
    document.getElementById('page').style.maxWidth = saved.maxWidth + 'px';
  }
  // Raw CSS
  if (saved.rawCSS) {
    document.getElementById('cs_raw_css').value = saved.rawCSS;
    window._csInjectRaw(saved.rawCSS);
  }
};

window.csApplyVar = function(varName, value) {
  document.body.style.setProperty(varName, value);
  var saved = window.csLoad();
  saved[varName] = value;
  window.csSave(saved);
};

window.csReset = function(varName) {
  document.body.style.removeProperty(varName);
  var saved = window.csLoad();
  delete saved[varName];
  window.csSave(saved);
  window.csPopulate();
};

window.csApplyFontSize = function(val) {
  document.getElementById('cs_font_size_label').textContent = val + '%';
  document.body.style.fontSize = val + '%';
  var saved = window.csLoad();
  saved.fontSize = val;
  window.csSave(saved);
};

window.csResetFontSize = function() {
  document.body.style.fontSize = '';
  document.getElementById('cs_font_size').value = 100;
  document.getElementById('cs_font_size_label').textContent = '100%';
  var saved = window.csLoad();
  delete saved.fontSize;
  window.csSave(saved);
};

window.csApplyFont = function(val) {
  document.body.style.fontFamily = val || '';
  var saved = window.csLoad();
  saved.fontFamily = val;
  window.csSave(saved);
};

window.csResetFont = function() {
  document.body.style.fontFamily = '';
  document.getElementById('cs_font').value = '';
  var saved = window.csLoad();
  delete saved.fontFamily;
  window.csSave(saved);
};

window._csApplyOverlayOpacityRaw = function(val) {
  var opacity = val / 100;
  var style = document.getElementById('cs-overlay-opacity-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'cs-overlay-opacity-style';
    document.head.appendChild(style);
  }
  style.textContent = '.overlay { background: rgba(0,0,0,' + opacity + ') !important; }';
};

window.csApplyOverlayOpacity = function(val) {
  document.getElementById('cs_overlay_opacity_label').textContent = val + '%';
  window._csApplyOverlayOpacityRaw(val);
  var saved = window.csLoad();
  saved.overlayOpacity = val;
  window.csSave(saved);
};

window.csResetOverlayOpacity = function() {
  var style = document.getElementById('cs-overlay-opacity-style');
  if (style) style.textContent = '';
  document.getElementById('cs_overlay_opacity').value = 88;
  document.getElementById('cs_overlay_opacity_label').textContent = '88%';
  var saved = window.csLoad();
  delete saved.overlayOpacity;
  window.csSave(saved);
};

window.csApplyMaxWidth = function(val) {
  document.getElementById('cs_max_width_label').textContent = val + 'px';
  document.getElementById('page').style.maxWidth = val + 'px';
  var saved = window.csLoad();
  saved.maxWidth = val;
  window.csSave(saved);
};

window.csResetMaxWidth = function() {
  document.getElementById('page').style.maxWidth = '';
  document.getElementById('cs_max_width').value = 1150;
  document.getElementById('cs_max_width_label').textContent = '1150px';
  var saved = window.csLoad();
  delete saved.maxWidth;
  window.csSave(saved);
};

window._csInjectRaw = function(css) {
  var style = document.getElementById('cs-raw-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'cs-raw-style';
    document.head.appendChild(style);
  }
  style.textContent = css;
};

window.csApplyRaw = function() {
  var css = document.getElementById('cs_raw_css').value;
  window._csInjectRaw(css);
  var saved = window.csLoad();
  saved.rawCSS = css;
  window.csSave(saved);
};

window.csResetRaw = function() {
  window._csInjectRaw('');
  document.getElementById('cs_raw_css').value = '';
  var saved = window.csLoad();
  delete saved.rawCSS;
  window.csSave(saved);
};

window.csResetAll = function() {
  localStorage.removeItem(_CS_KEY);
  // Remove inline styles
  ['--bg-color','--content-bg-color','--text-color',
   '--link-color','--border-color','--tab-bg-color'].forEach(function(v) {
    document.body.style.removeProperty(v);
  });
  document.body.style.fontSize   = '';
  document.body.style.fontFamily = '';
  document.getElementById('page').style.maxWidth = '';
  var s1 = document.getElementById('cs-raw-style');
  if (s1) s1.textContent = '';
  var s2 = document.getElementById('cs-overlay-opacity-style');
  if (s2) s2.textContent = '';
  window.csPopulate();
};

window.csSave = function(data) {
  try { localStorage.setItem(_CS_KEY, JSON.stringify(data)); } catch(e) {}
};

window.csLoad = function() {
  try {
    var raw = localStorage.getItem(_CS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
};



window.enableFocusMode = function () {
  if (!window.getFocusModeEnabled()) return;
  
  var sidebar = document.getElementById('stats_sidebar');
  var bottomPanel = document.getElementById('bottom_panel');
  var content = document.getElementById('content');

  if (content) {
    // Pin current exact pixel width as the animation starting point
    content.style.width = content.offsetWidth + 'px';
  }

  // Instantly vanish panels and adapt body layout classes
  document.body.classList.add('focus-mode', 'focus-mode-expanded');
  if (sidebar) sidebar.style.display = 'none';
  if (bottomPanel) bottomPanel.style.display = 'none';

  // Trigger the slow horizontal expansion transition on the next layout paint
  requestAnimationFrame(function () {
    if (content) {
      // Force a minor reflow to register the starting width lock
      content.offsetHeight;
      // Let it transition smoothly to fill the area
      content.style.width = '100%';
    }
  });

  var link = document.getElementById('focus-link');
  if (link) link.textContent = 'Restore';
};

window.disableFocusMode = function () {
  var sidebar = document.getElementById('stats_sidebar');
  var bottomPanel = document.getElementById('bottom_panel');
  var content = document.getElementById('content');
  
  document.body.classList.remove('focus-mode', 'focus-mode-expanded');
  
  if (sidebar) sidebar.style.display = '';
  if (bottomPanel) bottomPanel.style.display = '';
  if (content) content.style.width = ''; // Clear inline tracking
  
  var link = document.getElementById('focus-link');
  if (link) link.textContent = 'Focus';
};

window.toggleFocusMode = function () {
  if (document.body.classList.contains('focus-mode')) {
    window.disableFocusMode();
  } else {
    window.enableFocusMode();
  }
};





/* =====================================================================
   MUSIC PLAYER  — v1.0
   Self-contained playlist system with UI overlay.
   Persists playlist metadata (names + durations) in localStorage.
   Audio blobs are kept in IndexedDB across sessions.
   ===================================================================== */

window.MusicPlayer = (function () {

  /* ── Storage keys ────────────────────────────────────────────────── */
  var _DB_NAME      = 'gaufenspelt_music_db';
  var _DB_VERSION   = 2;
  var _STORE        = 'tracks';
  var _META_KEY     = 'Social Fascism: An Alternate Horizon_Gaufenspelt_mp_meta';

  /* ── State ───────────────────────────────────────────────────────── */
  var _audio        = new Audio();
  var _playlist     = [];   // [{id, name, duration}]
  var _currentIdx   = -1;
  var _shuffle      = false;
  var _loop         = false;  // 'none' | 'one' | 'all'  — stored as bool for simplicity; one press = all
  var _loopMode     = 'none'; // 'none' | 'one' | 'all'
  var _volume       = 0.8;
  var _playing      = false;
  var _userControlled = false;   // true when user has loaded their own tracks
  var _sceneAudio   = true;      // allow scene-driven audio
  var _db           = null;
  var _seekRAF      = null;
  var _shuffleOrder = [];

  /* ── IndexedDB ───────────────────────────────────────────────────── */
  function _openDB(cb) {
    if (_db) { cb(_db); return; }
    var req = indexedDB.open(_DB_NAME, _DB_VERSION);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(_STORE)) {
        db.createObjectStore(_STORE);
      }
    };
    req.onsuccess = function (e) { _db = e.target.result; cb(_db); };
    req.onerror   = function ()  { console.error('MusicPlayer: IDB open failed'); };
  }

  function _dbPut(id, blob, cb) {
    _openDB(function (db) {
      var tx = db.transaction(_STORE, 'readwrite');
      tx.objectStore(_STORE).put(blob, id);
      tx.oncomplete = cb || function(){};
    });
  }

  function _dbGet(id, cb) {
    _openDB(function (db) {
      var tx  = db.transaction(_STORE, 'readonly');
      var req = tx.objectStore(_STORE).get(id);
      req.onsuccess = function () { cb(req.result); };
      req.onerror   = function () { cb(null); };
    });
  }

  function _dbDelete(id, cb) {
    _openDB(function (db) {
      var tx = db.transaction(_STORE, 'readwrite');
      tx.objectStore(_STORE).delete(id);
      tx.oncomplete = cb || function(){};
    });
  }

  function _dbClear(cb) {
    _openDB(function (db) {
      var tx = db.transaction(_STORE, 'readwrite');
      tx.objectStore(_STORE).clear();
      tx.oncomplete = cb || function(){};
    });
  }

  /* ── Persistence (metadata only) ────────────────────────────────── */
  function _saveMeta() {
    try {
      localStorage.setItem(_META_KEY, JSON.stringify({
        playlist:     _playlist,
        currentIdx:   _currentIdx,
        shuffle:      _shuffle,
        loopMode:     _loopMode,
        volume:       _volume,
        sceneAudio:   _sceneAudio,
      }));
    } catch(e) {}
  }

  function _loadMeta() {
    try {
      var raw = localStorage.getItem(_META_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      _playlist   = d.playlist   || [];
      _currentIdx = d.currentIdx != null ? d.currentIdx : -1;
      _shuffle    = !!d.shuffle;
      _loopMode   = d.loopMode  || 'none';
      _volume     = d.volume    != null ? d.volume : 0.8;
      _sceneAudio = d.sceneAudio != null ? d.sceneAudio : true;
      _userControlled = _playlist.length > 0;
      _audio.volume   = _volume;
    } catch(e) {}
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function _fmtTime(secs) {
    if (!isFinite(secs) || secs < 0) return '—';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function _trackId(name) {
    return 'track_' + name.replace(/[^a-z0-9]/gi, '_') + '_' + Date.now();
  }

  function _buildShuffleOrder() {
    _shuffleOrder = _playlist.map(function(_, i) { return i; });
    for (var i = _shuffleOrder.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = _shuffleOrder[i]; _shuffleOrder[i] = _shuffleOrder[j]; _shuffleOrder[j] = tmp;
    }
  }

  function _nextIdx() {
    if (_playlist.length === 0) return -1;
    if (_loopMode === 'one') return _currentIdx;
    if (_shuffle) {
      if (_shuffleOrder.length === 0) _buildShuffleOrder();
      var pos = _shuffleOrder.indexOf(_currentIdx);
      return _shuffleOrder[(pos + 1) % _shuffleOrder.length];
    }
    if (_loopMode === 'all') return (_currentIdx + 1) % _playlist.length;
    // no loop
    return _currentIdx + 1 < _playlist.length ? _currentIdx + 1 : -1;
  }

  function _prevIdx() {
    if (_playlist.length === 0) return -1;
    if (_shuffle) {
      if (_shuffleOrder.length === 0) _buildShuffleOrder();
      var pos2 = _shuffleOrder.indexOf(_currentIdx);
      return _shuffleOrder[(pos2 - 1 + _shuffleOrder.length) % _shuffleOrder.length];
    }
    if (_currentIdx <= 0) return _loopMode === 'all' ? _playlist.length - 1 : 0;
    return _currentIdx - 1;
  }

  /* ── Audio events ────────────────────────────────────────────────── */
  _audio.addEventListener('ended', function () {
    var ni = _nextIdx();
    if (ni === _currentIdx && _loopMode === 'one') {
      _audio.currentTime = 0; _audio.play(); return;
    }
    if (ni >= 0 && ni !== _currentIdx) {
      _playIdx(ni);
    } else {
      _playing = false; _refreshUI();
    }
  });

  _audio.addEventListener('timeupdate', function () { _updateProgress(); });
  _audio.addEventListener('loadedmetadata', function () {
    // Update stored duration if we didn't have it
    if (_currentIdx >= 0 && _playlist[_currentIdx]) {
      _playlist[_currentIdx].duration = _audio.duration;
      _saveMeta();
      _renderPlaylist();
    }
    _updateProgress();
  });

  /* ── Playback core ───────────────────────────────────────────────── */
  function _playIdx(idx) {
    if (idx < 0 || idx >= _playlist.length) return;
    var track = _playlist[idx];
    _currentIdx = idx;
    _dbGet(track.id, function (blob) {
      if (!blob) {
        console.warn('MusicPlayer: blob not found for', track.name);
        _refreshUI(); return;
      }
      var url = URL.createObjectURL(blob);
      var oldSrc = _audio.src;
      _audio.src = url;
      _audio.volume = _volume;
      _audio.play().then(function () {
        _playing = true;
        _userControlled = true;
        if (oldSrc) URL.revokeObjectURL(oldSrc);
        _saveMeta();
        _refreshUI();
        _renderPlaylist();
      }).catch(function (err) {
        console.warn('MusicPlayer: play blocked', err);
        _playing = false; _refreshUI();
      });
    });
  }

  /* ── Public API ──────────────────────────────────────────────────── */
  function importFiles(input) {
    var files = Array.prototype.slice.call(input.files);
    if (!files.length) return;
    var count = files.length;
    files.forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var data  = e.target.result;
        var id    = _trackId(file.name);
        var name  = file.name.replace(/\.[^.]+$/, '');
        // Measure duration
        var tmpAudio = new Audio(data);
        tmpAudio.addEventListener('loadedmetadata', function () {
          var dur = tmpAudio.duration;
          _playlist.push({ id: id, name: name, duration: dur });
          _userControlled = true;
          // Store blob in IDB
          fetch(data).then(function (r) { return r.blob(); }).then(function (blob) {
            _dbPut(id, blob, function () {
              count--;
              if (count === 0) {
                _saveMeta();
                _renderPlaylist();
                // Auto-start if nothing playing
                if (!_playing && _currentIdx < 0) {
                  _playIdx(0);
                }
              }
            });
          });
        });
      };
      reader.readAsDataURL(file);
    });
    // Reset file input so same files can be re-added
    input.value = '';
  }


  // FUNCTION LOAD FROM URL

    function loadFromUrl(url, name, opts) {
  opts = opts || {};
  var autoplay = opts.autoplay === true;
  var force    = opts.force === true; // NEW: force playback even if something else is playing

  var existingIdx = _playlist.findIndex(function (t) { return t.name === name; });
  if (existingIdx !== -1) {
    console.warn('MusicPlayer: "' + name + '" is already in the playlist.');
    if (autoplay) _playIdx(existingIdx); // force = play it regardless of current state
    return;
  }

  fetch(url)
    .then(function (r) { return r.blob(); })
    .then(function (blob) {
      var id = _trackId(name);
      var objUrl = URL.createObjectURL(blob);
      var tmpAudio = new Audio(objUrl);
      tmpAudio.addEventListener('loadedmetadata', function () {
        var dur = tmpAudio.duration;
        _playlist.push({ id: id, name: name, duration: dur });
        _userControlled = true;
        _dbPut(id, blob, function () {
          _saveMeta();
          _renderPlaylist();
          URL.revokeObjectURL(objUrl);

          if (autoplay && (force || !_playing)) {
            _playIdx(_playlist.length - 1);
          } else {
            _refreshUI();
          }
        });
      });
    })
    .catch(function (err) {
      console.error('MusicPlayer: loadFromUrl failed', err);
    });
    }

  function clearPlaylist() {
    _audio.pause();
    _audio.src = '';
    _playing = false;
    _currentIdx = -1;
    _playlist = [];
    _userControlled = false;
    _dbClear(function () {
      _saveMeta();
      _renderPlaylist();
      _refreshUI();
    });
  }

  function removeTrack(idx) {
    if (idx < 0 || idx >= _playlist.length) return;
    var track = _playlist[idx];
    var wasPlaying = idx === _currentIdx && _playing;
    _dbDelete(track.id);
    _playlist.splice(idx, 1);
    if (_currentIdx >= _playlist.length) _currentIdx = _playlist.length - 1;
    if (_playlist.length === 0) { _userControlled = false; _audio.pause(); _audio.src = ''; _playing = false; }
    else if (wasPlaying) { _playIdx(_currentIdx >= 0 ? _currentIdx : 0); }
    _saveMeta();
    _renderPlaylist();
    _refreshUI();
  }

  function togglePlay() {
    if (_playlist.length === 0) return;
    if (_playing) {
      _audio.pause(); _playing = false; _refreshUI();
    } else {
      if (_currentIdx < 0) _currentIdx = 0;
      if (!_audio.src || _audio.src === window.location.href) {
        _playIdx(_currentIdx);
      } else {
        _audio.play().then(function () { _playing = true; _refreshUI(); }).catch(function(){});
      }
    }
    _saveMeta();
  }

  function next() {
    var ni = _nextIdx();
    if (ni >= 0) _playIdx(ni); else { _audio.pause(); _playing = false; _refreshUI(); }
  }

  function prev() {
    if (_audio.currentTime > 3) { _audio.currentTime = 0; return; }
    _playIdx(_prevIdx());
  }

  function seek(val) {
    if (_audio.duration) _audio.currentTime = (val / 100) * _audio.duration;
  }

  function setVolume(val) {
    _volume = val / 100;
    _audio.volume = _volume;
    var lbl = document.getElementById('mp-vol-label');
    if (lbl) lbl.textContent = val + '%';
    _saveMeta();
  }

  function toggleShuffle() {
    _shuffle = !_shuffle;
    if (_shuffle) _buildShuffleOrder();
    _saveMeta();
    var btn = document.getElementById('mp-shuffle-btn');
    if (btn) btn.classList.toggle('active', _shuffle);
  }

  function toggleLoop() {
    var modes = ['none', 'all', 'one'];
    var idx   = modes.indexOf(_loopMode);
    _loopMode = modes[(idx + 1) % modes.length];
    _saveMeta();
    _refreshLoopBtn();
  }

  function toggleSceneAudio(val) {
    _sceneAudio = val;
    _saveMeta();
  }

  function isUserControlled() { return _userControlled && _playlist.length > 0; }

  /* ── UI ──────────────────────────────────────────────────────────── */
  function showUI() {
    var el = document.getElementById('music-overlay');
    if (!el) return;
    _renderPlaylist();
    _refreshUI();
    el.style.display = 'block';
    if (!el._mpClick) {
      el._mpClick = true;
      el.addEventListener('click', function (e) {
        if (e.target === el) hideUI();
      });
    }
  }

  function hideUI() {
    var el = document.getElementById('music-overlay');
    if (el) el.style.display = 'none';
  }

  function _updateProgress() {
    var seek = document.getElementById('mp-seek');
    var cur  = document.getElementById('mp-time-cur');
    var dur  = document.getElementById('mp-time-dur');
    if (!seek) return;
    if (_audio.duration) {
      seek.value = (_audio.currentTime / _audio.duration) * 100;
    } else {
      seek.value = 0;
    }
    if (cur) cur.textContent = _fmtTime(_audio.currentTime);
    if (dur) dur.textContent = _fmtTime(_audio.duration);
  }

  function _refreshUI() {
    // Play button
    var playBtn = document.getElementById('mp-play-btn');
    if (playBtn) playBtn.textContent = _playing ? '⏸' : '▶';

    // Track name + sub
    var nameEl = document.getElementById('mp-track-name');
    var subEl  = document.getElementById('mp-track-sub');
    if (nameEl) {
      if (_currentIdx >= 0 && _playlist[_currentIdx]) {
        nameEl.textContent = _playlist[_currentIdx].name;
        subEl.textContent  = (_currentIdx + 1) + ' / ' + _playlist.length;
      } else {
        nameEl.textContent = 'No track loaded';
        subEl.textContent  = '—';
      }
    }

    // Volume
    var volSlider = document.getElementById('mp-volume');
    var volLbl    = document.getElementById('mp-vol-label');
    if (volSlider) { volSlider.value = Math.round(_volume * 100); }
    if (volLbl)    { volLbl.textContent = Math.round(_volume * 100) + '%'; }

    // Shuffle
    var shuffleBtn = document.getElementById('mp-shuffle-btn');
    if (shuffleBtn) shuffleBtn.classList.toggle('active', _shuffle);

    // Loop
    _refreshLoopBtn();

    // Scene audio checkbox
    var sceneChk = document.getElementById('mp-scene-audio');
    if (sceneChk) sceneChk.checked = _sceneAudio;

    // Music link pulse
    var mlink = document.getElementById('music-link');
    if (mlink) mlink.style.color = _playing ? 'var(--link-color)' : '';
  }

  function _refreshLoopBtn() {
    var btn = document.getElementById('mp-loop-btn');
    if (!btn) return;
    var icons = { none: '↺', all: '↺', one: '↻¹' };
    btn.textContent = icons[_loopMode] || '↺';
    btn.classList.toggle('active', _loopMode !== 'none');
    btn.title = _loopMode === 'none' ? 'Loop: Off' : _loopMode === 'all' ? 'Loop: All' : 'Loop: One';
  }

  function _renderPlaylist() {
    var ul = document.getElementById('mp-playlist');
    if (!ul) return;
    ul.innerHTML = '';
    if (_playlist.length === 0) {
      var li = document.createElement('li');
      li.className = 'mp-playlist-empty';
      li.textContent = 'No tracks. Import audio files below.';
      ul.appendChild(li);
      return;
    }
    _playlist.forEach(function (track, idx) {
      var li = document.createElement('li');
      li.className = 'mp-playlist-item' + (idx === _currentIdx ? ' playing' : '');

      var nameSpan = document.createElement('span');
      nameSpan.className   = 'mp-playlist-track-name';
      nameSpan.textContent = track.name;
      nameSpan.title       = track.name;

      var durSpan = document.createElement('span');
      durSpan.className   = 'mp-playlist-dur';
      durSpan.textContent = _fmtTime(track.duration);

      var rmBtn = document.createElement('button');
      rmBtn.className   = 'mp-playlist-remove';
      rmBtn.textContent = '✕';
      rmBtn.title       = 'Remove';
      rmBtn.onclick = (function (i) { return function (e) { e.stopPropagation(); removeTrack(i); }; })(idx);

      li.appendChild(nameSpan);
      li.appendChild(durSpan);
      li.appendChild(rmBtn);
      li.onclick = (function (i) { return function () { _playIdx(i); }; })(idx);
      ul.appendChild(li);
    });
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  function _init() {
    _loadMeta();
    _audio.volume = _volume;
    // If there were tracks last session, restore playing state (but don't autoplay until user interacts)
    _refreshUI();
  }

  _init();

  return {
    showUI:           showUI,
    hideUI:           hideUI,
    importFiles:      importFiles,
    loadFromUrl:      loadFromUrl,
    clearPlaylist:    clearPlaylist,
    removeTrack:      removeTrack,
    togglePlay:       togglePlay,
    next:             next,
    prev:             prev,
    seek:             seek,
    setVolume:        setVolume,
    toggleShuffle:    toggleShuffle,
    toggleLoop:       toggleLoop,
    toggleSceneAudio: toggleSceneAudio,
    isUserControlled: isUserControlled,
    // Expose for dendryUI audio patch
    sceneAudioEnabled: function () { return _sceneAudio; },
  };

}());


























window.Achievements = (function () {

  // ── Registry: ─────────────────────────
  // key: id, value: {title, description, icon}
    var REGISTRY = {
    ruhrland: {
      title: 'Rheinland in Fire',
      description: 'French reoccupy the Rheinland following catastrophe of Young Plan.',
      icon: 'img/achievements/ruhrland.png'
    },
    tyrole_danubia: {
      title: 'Tyrol - Danubian Pact',
      description: 'Italy and Germany has signed non aggression treaty.',
      icon: 'img/achievements/tyrole_danubia.png'
    },
    revolution_own: {
      title: 'Revolution of Three Spears',
      description: 'SPD has launched the revolution.',
      icon: 'img/achievements/revolution_own.png'
    },
    popular_frontier: {
      title: 'Popular Front',
      description: 'Popular Front theses has been established.',
      icon: 'img/achievements/popular_frontier.png'
    },
    winterschwelen: {
      title: 'Winterschwelen',
      description: 'The cold and despairly winter envelops the landvolk...',
      icon: 'img/achievements/winterschwelen.png'
    },
    landlicher_zorn: {
      title: 'Ländlicher Zorn',
      description: 'Rural wrath engulfes the Germany...',
      icon: 'img/achievements/landlicher_zorn.png'
    },
    karl_hepp_rlb: {
      title: 'Landpopulistenurteil',
      description: 'Karl Hepp has been elected as the Reichslandbund (RLB) president.',
      icon: 'img/achievements/karlhepprlb.png'
    },
    gesamtlandliche_vertretung: {
      title: 'Gesamtlandliche Vertretung',
      description: 'Green Front encompasses maximal amount of members possible.',
      icon: 'img/achievements/gesamtlandliche_vertretung.png'
    },
    annahmeerklarung: {
      title: 'Annahmeerklärung',
      description: 'Republicans by the dishonority, not of the reason.',
      icon: 'img/achievements/annahmeerklarung.png'
    },
    herbstingwer: {
      title: 'Herbstingwer',
      description: 'Ernst Niekisch and his national socialists have survived the test of the time.',
      icon: 'img/achievements/herbstingwer.png'
    },
    im_staub_der_zeit: {
      title: 'Im Staub der Zeit',
      description: 'Ultimate failure of the fortunes.',
      icon: 'img/achievements/im_staub_der_zeit.png'
    },
    liberalismus: {
      title: 'United Liberalism',
      description: 'Liberal movement has been unified.',
      icon: 'img/achievements/liberalismus.png'
    },
    lambachreich: {
      title: 'Großer Korporatismus',
      description: 'Walther Lambach consolidates all power under himself.',
      icon: 'img/achievements/lambachreich.png'
    },
    jugendrevolution: {
      title: 'Jugendrevolution',
      description: 'Grandmaster Mahraun ascends the nationalist movement.',
      icon: 'img/achievements/jugendrevolution.png'
    },
    neue_generation: {
      title: 'Neue Generation',
      description: 'Passing the mantle.',
      icon: 'img/achievements/neue_generation.png'
    },
    volksgemeinschaft: {
      title: 'Volksgemeinschaft',
      description: 'All differences are none before Germany.',
      icon: 'img/achievements/volksgemeinschaft.png'
    },
    christian_revolution: {
      title: 'Kreuz und Arbeit',
      description: 'Overcoming the German odds.',
      icon: 'img/achievements/christian_revolution.png'
    },
    national_rejuvenation: {
      title: 'Nationale Erneuerung',
      description: 'Three pillars, two faiths, one nation - elevated above all differences.',
      icon: 'img/achievements/national_rejuvenation.png'
    },
    sanctuary: {
      title: 'Zuflucht',
      description: 'Come back, when you find the true meaning behind this...',
      icon: 'img/achievements/sanctuary.png'
    },
    noske_leader: {
      title: 'Gustav Noske\'s Comeback',
      description: 'Elect Noske in the presidential election.',
      icon: 'img/achievements/noske_leader.png'
    },
    shalhelm_coop: {
      title: 'Reichsbanner - Stahlelm',
      description: 'Two brothers, one separation, one unification.',
      icon: 'img/achievements/shalhelm_coop.png'
    },
    thalmann_died: {
      title: 'Better Dead than Red',
      description: 'Thalmann has been killed, what\'s next?...',
      icon: 'img/achievements/thalmann_died.png'
    },
    wels_comeback: {
      title: 'Wels\' Wild Way',
      description: 'Wels takes the mantle back.',
      icon: 'img/achievements/wels_comeback.png'
    },
    communist_crushed: {
      title: 'Second Spartakus',
      description: 'Communists repeat the fate of Spartakists.',
      icon: 'img/achievements/communist_crushed.png'
    },
    underboots: {
      title: 'Under Boots and Stomped',
      description: 'Reactionaries takes the helm.',
      icon: 'img/achievements/underboots.png'
    },
    communist_together: {
      title: 'Together Forever',
      description: 'United Left is Eternal Brotherhood.',
      icon: 'img/achievements/communist_together.png'
    },
    noske_leader_historical: {
      title: 'True ending - Social Fascism',
      description: 'Narrator must say it, but, by bringing reformism to capitalism, capitalism brings reformism to your socialism. Be aware.',
      icon: 'img/achievements/noske_leader_historical.png'
    },
    chud: {
      title: 'Nothing ever happens',
      description: 'Smallburger Thursday is not worth mentioning at all. Hilferchuding is supreme.',
      icon: 'img/achievements/chud.png'
    },
    reichswehr_ruhrland: {
      title: 'Reichsprotection',
      description: 'Protect the Rheinland from being reoccupied by the French.',
      icon: 'img/achievements/reichswehr_ruhrland.png'
    }
  };


  var _queue = [];
  var _showing = false;
  var _container = null;

  function _init() {
    if (_container) return;
    _container = document.createElement('div');
    _container.id = 'achievement-popup-container';
    document.body.appendChild(_container);
  }

  function _getUnlocked() {
    var engine = window.dendryUI && window.dendryUI.dendryEngine;
    if (!engine) return {};
    if (!engine.state.achievementsUnlocked) {
      engine.state.achievementsUnlocked = {};
    }
    return engine.state.achievementsUnlocked;
  }

  function isUnlocked(id) {
    return !!_getUnlocked()[id];
  }

  function getAll() {
    return REGISTRY;
  }

  function getUnlockedList() {
    var unlocked = _getUnlocked();
    return Object.keys(REGISTRY).filter(function (id) { return unlocked[id]; });
  }

  // ── Unlock + queue a popup ────────────────────────────────────────
  function unlock(id, opts) {
    opts = opts || {};
    var def = REGISTRY[id] || {};
    var title = opts.title || def.title || id;
    var description = opts.description || def.description || '';
    var icon = opts.icon || def.icon || null;
    var allowRepeat = opts.allowRepeat === true;
    var duration = opts.duration != null ? opts.duration : 5000;

    var unlocked = _getUnlocked();
    if (unlocked[id] && !allowRepeat) {
      return false; // already unlocked, don't re-notify
    }
    unlocked[id] = true;

    _queue.push({ title: title, description: description, icon: icon, duration: duration });
    _runQueue();
    return true;
  }

  function _runQueue() {
    if (_showing || _queue.length === 0) return;
    _showing = true;
    var item = _queue.shift();
    _show(item, function () {
      _showing = false;
      _runQueue();
    });
  }

  function _show(item, onDone) {
    _init();

    var el = document.createElement('div');
    el.className = 'achievement-popup';

    var iconHtml = item.icon
      ? '<img class="achievement-popup-icon" src="' + item.icon + '" alt="">'
      : '<div class="achievement-popup-icon achievement-popup-icon-default">&#9733;</div>';

    el.innerHTML =
      iconHtml +
      '<div class="achievement-popup-text">' +
        '<div class="achievement-popup-label">Achievement Unlocked</div>' +
        '<div class="achievement-popup-title"></div>' +
        (item.description ? '<div class="achievement-popup-desc"></div>' : '') +
      '</div>';

    // Set text via textContent to avoid injection issues from dynamic strings
    el.querySelector('.achievement-popup-title').textContent = item.title;
    if (item.description) {
      el.querySelector('.achievement-popup-desc').textContent = item.description;
    }

    _container.appendChild(el);

    // Force reflow then animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('active');
      });
    });

    var closeTimer = setTimeout(function () { _hide(el, onDone); }, item.duration);

    el.addEventListener('click', function () {
      clearTimeout(closeTimer);
      _hide(el, onDone);
    });
  }

  function _hide(el, onDone) {
    el.classList.remove('active');
    el.classList.add('leaving');
    setTimeout(function () {
      el.remove();
      if (onDone) onDone();
    }, 400);
  }

  return {
    unlock: unlock,
    isUnlocked: isUnlocked,
    getAll: getAll,
    getUnlockedList: getUnlockedList,
    registry: REGISTRY
  };

})();

var _achievePatchInterval = setInterval(function() {
  if (!window.dendryUI || !window.dendryUI.dendryEngine) return;
  clearInterval(_achievePatchInterval);

  var engine = window.dendryUI.dendryEngine;
  if (typeof engine.achieve !== 'function') {
    console.warn('Achievements: engine.achieve() not found — check dendry version.');
    return;
  }

  var _originalAchieve = engine.achieve.bind(engine);
  engine.achieve = function(name) {
    var alreadyHad = !!(this.state.achievements && this.state.achievements[name]);
    var result = _originalAchieve(name);

    if (!alreadyHad) {
      var def = Achievements.registry[name] || {};
      Achievements.unlock(name, {
        title: def.title || name,
        description: def.description || '',
        icon: def.icon || null
      });
    }
    return result;
  };
}, 100);

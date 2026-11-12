/*
 * PERSONALIZE YOUR WEBSITE HERE ♡
 * Replace the text below with your own messages. To add real memories,
 * replace assets/memory-1.svg ... memory-6.svg with your own images,
 * or update each image's src in index.html.
 */
const siteConfig = {
  question: 'Can you be my gf?',
  successMessage: 'Yay! You made my day!',
  letterGreeting: 'My favorite person,',
  senderName: 'Your secret admirer ♡',
  letterParagraphs: [
    'There is something about you that makes ordinary days feel a little magical. Every laugh, every message, and every tiny moment with you means more to me than you know.',
    "I don't need a perfect story. I just want more simple, happy memories, more silly conversations, and more reasons to smile with you.",
    'Whatever tomorrow brings, I hope you always remember how special you are. Thank you for being you. ♡',
  ],
  memoryCaptions: ['the little things ♡', 'favorite days', 'you & me', 'little adventures', 'always my favorite', 'more to come ♡'],
};

(() => {
  'use strict';
  const screens = ['question', 'gifts', 'memories', 'music', 'letter'];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const title = $('#questionTitle');
  const subtitle = $('#questionSubtitle');
  const yesButton = $('#yesButton');
  const noButton = $('#noButton');
  const audio = $('#loveAudio');
  const progress = $('#songProgress');
  const playPause = $('#playPause');
  const muteSong = $('#muteSong');
  let noCount = 0;
  let currentScreen = 'question';
  const submittedAnswers = new Set();
  const answerStatus = $('#answerStatus');
  let statusTimeout;

  const reactions = [
    'Wait... are you sure? 🥺',
    "Hmm... that's not right... 💔",
    'Try again, maybe? 😭',
    'Be serious... 🥹',
    "Okay, now you're just playing...",
    'Okay, last chance... 🥺',
    'No pressure. Your answer matters, too. ♡',
  ];

  function personalize() {
    title.innerHTML = `${escapeHTML(siteConfig.question)} <span>♥</span>`;
    $('#giftsTitle').innerHTML = `${escapeHTML(siteConfig.successMessage)} <span>💕</span>`;
    $('#letterSalutation').textContent = siteConfig.letterGreeting;
    $('#letterSender').textContent = siteConfig.senderName;
    const letterBody = $('#letterBody');
    letterBody.replaceChildren();
    siteConfig.letterParagraphs.forEach((part) => {
      const p = document.createElement('p');
      p.textContent = part;
      letterBody.appendChild(p);
    });
    $$('.polaroid span').forEach((label, i) => { label.textContent = siteConfig.memoryCaptions[i] || `memory ${i + 1}`; });
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
  }

  function resetQuestion() {
    noCount = 0;
    title.innerHTML = `${escapeHTML(siteConfig.question)} <span>♥</span>`;
    subtitle.textContent = "There's something special I've been wanting to ask you...";
    yesButton.style.setProperty('--yes-scale', '1');
    noButton.style.setProperty('--no-scale', '1');
    noButton.textContent = 'NO';
    yesButton.hidden = false;
  }

  function showScreen(screen, updateHash = true) {
    if (!screens.includes(screen)) screen = 'question';
    screens.forEach((id) => {
      const node = document.getElementById(id);
      node.hidden = id !== screen;
      node.classList.toggle('active', id === screen);
    });
    currentScreen = screen;
    if (screen !== 'music') audio.pause();
    if (screen === 'question') resetQuestion();
    if (updateHash && location.hash !== `#${screen}`) history.replaceState(null, '', `#${screen}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const activeHeading = document.querySelector(`#${screen} h1`);
    if (activeHeading) activeHeading.setAttribute('tabindex', '-1');
  }

  // Send only a YES or NO response. Credentials stay in the Vercel server function.
  async function sendAnswer(answer) {
    if (submittedAnswers.has(answer)) return;
    submittedAnswers.add(answer);
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      if (!response.ok) throw new Error('Notification failed');
      showAnswerStatus('Your answer was sent 💌');
    } catch {
      submittedAnswers.delete(answer); // a later click can retry
      showAnswerStatus('Could not send to Telegram. Please try again.', true);
    }
  }

  function showAnswerStatus(message, isError = false) {
    clearTimeout(statusTimeout);
    answerStatus.textContent = message;
    answerStatus.classList.toggle('error', isError);
    answerStatus.hidden = false;
    statusTimeout = setTimeout(() => { answerStatus.hidden = true; }, 5000);
  }

  noButton.addEventListener('click', () => {
    if (noCount === 0) void sendAnswer('no');
    if (noCount >= reactions.length) {
      resetQuestion();
      return;
    }
    noCount += 1;
    const reaction = reactions[Math.min(noCount - 1, reactions.length - 1)];
    title.textContent = reaction;
    subtitle.textContent = noCount >= 7 ? 'It is always okay to say no. 💗' : 'Maybe look at the green button one more time? ♡';
    yesButton.style.setProperty('--yes-scale', String(Math.min(1 + noCount * 0.12, 1.65)));
    noButton.style.setProperty('--no-scale', String(Math.max(1 - noCount * .09, .58)));
    if (noCount >= 7) {
      noButton.textContent = 'RESTART';
      noButton.style.setProperty('--no-scale', '1');
      yesButton.hidden = true;
    }
  });

  yesButton.addEventListener('click', () => {
    void sendAnswer('yes');
    burstHearts();
    showScreen('gifts');
  });
  $$('#brandLink, [data-open]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      showScreen(el.dataset.open || 'question');
    });
  });
  window.addEventListener('hashchange', () => {
    const target = location.hash.replace('#', '');
    if (screens.includes(target) && target !== currentScreen) showScreen(target, false);
  });

  function burstHearts() {
    const root = $('#heartBurst');
    root.replaceChildren();
    for (let i = 0; i < 23; i++) {
      const heart = document.createElement('span');
      heart.textContent = i % 3 === 0 ? '♡' : '♥';
      heart.className = 'burst-heart';
      heart.style.color = ['#de5280', '#efa6ba', '#ce385f', '#f79dbb'][i % 4];
      heart.style.setProperty('--dx', `${Math.cos(i * Math.PI * 2 / 23) * (130 + (i % 4) * 36)}px`);
      heart.style.setProperty('--dy', `${Math.sin(i * Math.PI * 2 / 23) * (130 + (i % 3) * 31)}px`);
      heart.style.setProperty('--rotate', `${i * 36}deg`);
      heart.style.animationDelay = `${(i % 4) * 0.045}s`;
      root.appendChild(heart);
    }
    window.setTimeout(() => root.replaceChildren(), 2100);
  }

  const photoDialog = $('#photoDialog');
  const captions = siteConfig.memoryCaptions;
  $$('.polaroid').forEach((item) => {
    item.addEventListener('click', () => {
      const number = Number(item.dataset.photo);
      $('#dialogImage').src = item.querySelector('img').src;
      $('#dialogImage').alt = item.querySelector('img').alt;
      $('#dialogCaption').textContent = captions[number] || 'A lovely little memory ♡';
      if (typeof photoDialog.showModal === 'function') photoDialog.showModal();
    });
  });
  $('#closePhoto').addEventListener('click', () => photoDialog.close());
  photoDialog.addEventListener('click', (event) => {
    if (event.target === photoDialog) photoDialog.close();
  });

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
  function updateAudioUI() {
    const playing = !audio.paused && !audio.ended;
    playPause.textContent = playing ? 'Ⅱ' : '▶';
    playPause.setAttribute('aria-label', playing ? 'Pause song' : 'Play song');
    $('#vinylRecord').classList.toggle('spinning', playing);
    const duration = Number.isFinite(audio.duration) ? audio.duration : 24;
    progress.value = String(Math.round((audio.currentTime / duration) * 1000) || 0);
    $('#currentTime').textContent = formatTime(audio.currentTime);
    $('#durationTime').textContent = formatTime(duration);
    muteSong.textContent = audio.muted ? '♪̸' : '♫';
    muteSong.setAttribute('aria-label', audio.muted ? 'Unmute song' : 'Mute song');
  }
  playPause.addEventListener('click', async () => {
    if (!audio.paused) audio.pause();
    else {
      try { await audio.play(); }
      catch { $('.track-description').textContent = 'Audio could not be played in this browser.'; }
    }
    updateAudioUI();
  });
  $('#restartSong').addEventListener('click', () => { audio.currentTime = 0; updateAudioUI(); });
  muteSong.addEventListener('click', () => { audio.muted = !audio.muted; updateAudioUI(); });
  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number(progress.value) / 1000 * audio.duration;
    updateAudioUI();
  });
  ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata', 'ended'].forEach((event) => audio.addEventListener(event, updateAudioUI));

  personalize();
  showScreen(screens.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'question', false);
  updateAudioUI();
})();

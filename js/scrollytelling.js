/* ============================================================
   SCROLLYTELLING (GSAP + ScrollTrigger)
   Steuert den Tür-Akt (via TCD.initDoorScene) und alle
   Scroll-Animationen der Sektionen.
   ============================================================ */
(function(){
  if(!TCD.reduced && window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    /* --- Fortschrittsbalken = Abspielkopf --- */
    gsap.to('#progressBar', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 }
    });

    /* --- AKT 1: Die 3D-Tür öffnet sich im Scrolltempo --- */
    const doorScene = TCD.initDoorScene();
    let creakPlayed = false;

    /* Hero-Einzug, gekoppelt an den Türfortschritt (sichtbar durch die Öffnung) */
    const heroTl = gsap.timeline({ paused: true });
    heroTl.from('.welcome [data-reveal]', {
      opacity: 0, y: 50, stagger: .12, duration: .8, ease: 'power2.out'
    });

    /* Scroll steuert den Tür-Fortschritt – die Hero ist dahinter gepinnt */
    const doorProxy = { p: 0 };
    gsap.to(doorProxy, {
      p: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.welcome',
        start: 'top top',
        end: '+=240%',
        scrub: .5,
        pin: true,
        anticipatePin: 1,
        onUpdate(self){
          if(doorScene) doorScene.p = doorProxy.p;
          if(TCD.isSoundOn() && !creakPlayed && self.progress > .03 && self.direction > 0){
            creakPlayed = true; TCD.playCreak(2.6);
          }
          /* Annäherung: Hero startet klein "in der Ferne" und wächst beim Durchgehen */
          const wp = Math.max(0, Math.min((doorProxy.p - .45) / .55, 1));
          const e = wp < .5 ? 2 * wp * wp : 1 - Math.pow(-2 * wp + 2, 2) / 2;
          gsap.set('#welcomeInner', { scale: .45 + .55 * e });
          /* Hero tritt ein, sobald die Tür weit genug offen ist */
          if(self.progress > .42) heroTl.play(); else heroTl.reverse();
          document.body.classList.toggle('entered', self.progress > .94);
        },
        onToggle(self){ if(doorScene) doorScene.active = self.isActive; }
      },
      onUpdate(){ if(doorScene) doorScene.p = doorProxy.p; }
    });

    /* --- generische Reveals --- */
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      if(el.closest('.welcome')) return; // hat eigene Animation
      gsap.from(el, {
        opacity: 0, y: 44, duration: .7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' }
      });
    });

    /* --- Anlage: Regler drehen sich beim Scrollen auf --- */
    gsap.to('#amp .knob', {
      rotation: (i) => 90 + i * 60, ease: 'none',
      scrollTrigger: { trigger: '#amp', start: 'top bottom', end: 'top 30%', scrub: true }
    });

    /* --- Band: Polaroids fliegen gestaffelt von unten ein, WÄHREND die Sektion reinscrollt (kein Pin) --- */
    const cards = gsap.utils.toArray('#bandGrid .polaroid');
    const endRot = [-3, 2, -1.5, 2.5];
    const cardStart = [92, 78, 64, 50]; // wann jede Karte losfliegt (Sektion-Top bei X % Viewport)
    const cardEnd = [34, 26, 18, 10];
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: () => window.innerHeight * .9, rotation: (i % 2 ? 16 : -16) },
        {
          y: 0, rotation: endRot[i], ease: 'power1.out', immediateRender: true,
          scrollTrigger: {
            trigger: '#band',
            start: 'top ' + cardStart[i] + '%',
            end: 'top ' + cardEnd[i] + '%',
            scrub: .4,
            invalidateOnRefresh: true
          }
        });
    });

    /* --- Story: Marker-Highlights ziehen sich durch --- */
    gsap.utils.toArray('.story__text .hl').forEach(hl => {
      gsap.to(hl, {
        backgroundSize: '100% 100%', ease: 'none',
        onStart: () => hl.classList.add('on'),
        onReverseComplete: () => hl.classList.remove('on'),
        scrollTrigger: { trigger: hl, start: 'top 78%', end: 'top 55%', scrub: true }
      });
    });

    /* --- Tourplakat: klatscht an die Wand --- */
    gsap.from('#poster', {
      scale: 1.7, rotation: 9, opacity: 0, ease: 'power3.in',
      scrollTrigger: { trigger: '#poster', start: 'top 95%', end: 'top 52%', scrub: true }
    });
    /* kleiner Nachwackler, sobald es „aufgeklatscht“ ist */
    gsap.to('#poster', {
      rotation: -.8, duration: .5, ease: 'elastic.out(1, .3)',
      scrollTrigger: { trigger: '#poster', start: 'top 52%', toggleActions: 'play none none reverse' }
    });

    /* --- News-Flyer: nacheinander angepinnt --- */
    gsap.from('#newsGrid .flyer', {
      y: 90, opacity: 0, rotation: (i) => (i % 2 ? 7 : -7), stagger: .15,
      duration: .7, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '#newsGrid', start: 'top 80%' }
    });
    gsap.set('#newsGrid .flyer', { rotation: (i) => [-1.6, 1.2, -.8][i] });

    /* --- TV: fährt rein und schaltet sich ein --- */
    gsap.from('#tvEl', {
      y: 110, opacity: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: '#tvEl', start: 'top 82%' }
    });
    gsap.to('#tvOn', {
      scaleY: .004, ease: 'power4.in',
      scrollTrigger: { trigger: '#tvEl', start: 'top 60%', end: 'top 35%', scrub: true }
    });
    gsap.to('#tvOn', {
      opacity: 0, duration: .25,
      scrollTrigger: { trigger: '#tvEl', start: 'top 35%', toggleActions: 'play none none reverse' }
    });

    /* --- Galerie: horizontale Fahrt entlang der Fotowand --- */
    const track = document.getElementById('galleryTrack');
    const horiz = () => -(track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: horiz, ease: 'none',
      scrollTrigger: {
        trigger: '#galleryPin', start: 'top 18%',
        end: () => '+=' + (track.scrollWidth - window.innerWidth),
        scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    /* --- Kühlschrank rollt rein --- */
    gsap.from('#fridge', {
      xPercent: -130, rotation: -14, ease: 'power2.out',
      scrollTrigger: { trigger: '#merch', start: 'top 75%', end: 'top 35%', scrub: true }
    });

    /* --- Sektions-Header: Mini-Parallax --- */
    gsap.utils.toArray('.sec-head h2').forEach(h => {
      gsap.from(h, {
        xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: h, start: 'top bottom', end: 'top 40%', scrub: true }
      });
    });

  }else{
    /* Reduced Motion / kein GSAP: alles sofort sichtbar, Tür-Akt ist per CSS versteckt */
    document.body.classList.add('entered');
  }
})();

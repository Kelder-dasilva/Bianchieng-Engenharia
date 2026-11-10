// Bianchi Engenharia: menu, carrossel do início, animações ao rolar, rodapé em cortina e visor de fotos.
// Sem dependências. As animações só rodam com a classe "anima" no <html> (posta no <head> quando a
// pessoa não pediu "reduzir movimento"); sem ela, tudo funciona e aparece parado.
(function () {
  window.bianchiPronto = true;
  var raiz = document.documentElement;
  var anima = raiz.classList.contains('anima');
  var suave = anima ? 'smooth' : 'auto';

  /* ---------- Menu no celular ---------- */
  var topo = document.querySelector('.topo');
  var botao = document.querySelector('.abrir-menu');
  if (topo && botao) {
    var fecharMenu = function () {
      topo.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.textContent = 'Menu';
    };
    botao.addEventListener('click', function () {
      var aberto = topo.classList.toggle('aberto');
      botao.setAttribute('aria-expanded', aberto);
      botao.textContent = aberto ? 'Fechar' : 'Menu';
      if (aberto) topo.classList.remove('escondido');
    });
    topo.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', fecharMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && topo.classList.contains('aberto')) { fecharMenu(); botao.focus(); }
    });
  }

  /* ---------- Entradas ao rolar ---------- */
  var ALVOS = '.secao-cab > *, .area, .projeto-texto, .bim > div > *, .bim figcaption, .servicos .grupo, .pessoa, ' +
    '.bio > div, .intro > *, .principios > *, .cab-projeto > *, .seguinte-texto, ' +
    '.projeto-foto, .galeria button, .seguinte-foto, .bim figure, .bio';
  var alvos = Array.prototype.slice.call(document.querySelectorAll(ALVOS));
  if (anima && 'IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      var n = 0;
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        // Itens que entram juntos aparecem em sequência curta
        en.target.style.setProperty('--i', Math.min(n++, 5));
        en.target.classList.add('visto');
        observador.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { observador.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('visto'); });
  }
  // Rolar por teclado até um item escondido o mostra na hora
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest(ALVOS);
    if (el) el.classList.add('visto');
  });

  /* ---------- Carrossel do início ---------- */
  var carrossel = document.querySelector('.hero-foto');
  if (carrossel) {
    var slides = Array.prototype.slice.call(carrossel.querySelectorAll('.slide'));
    var contagem = carrossel.querySelector('.hero-contagem');
    var barra = carrossel.querySelector('.hero-progresso i');
    var atualSlide = 0;
    var automatico = anima && slides.length > 1;
    var motivosPausa = {};
    var dois = function (n) { return (n < 10 ? '0' : '') + n; };

    var pausar = function (motivo, sim) {
      if (sim) motivosPausa[motivo] = true; else delete motivosPausa[motivo];
      carrossel.classList.toggle('pausado', Object.keys(motivosPausa).length > 0);
    };
    var recomecarBarra = function () {
      if (!automatico) return;
      carrossel.classList.remove('tocando');
      void barra.offsetWidth; // reinicia a animação da barra
      carrossel.classList.add('tocando');
    };
    var irPara = function (i, pelaPessoa) {
      atualSlide = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) {
        var ativo = j === atualSlide;
        s.classList.toggle('ativo', ativo);
        s.setAttribute('aria-hidden', ativo ? 'false' : 'true');
        var link = s.querySelector('a');
        if (link) link.tabIndex = ativo ? 0 : -1;
        if (ativo) {
          var img = s.querySelector('img');
          if (img.loading === 'lazy') img.loading = 'eager';
        }
      });
      // Só anuncia a troca quando a pessoa pediu; na troca automática fica em silêncio
      contagem.setAttribute('aria-live', pelaPessoa ? 'polite' : 'off');
      contagem.innerHTML = '<b>' + dois(atualSlide + 1) + '</b> / ' + dois(slides.length);
      recomecarBarra();
    };
    // A próxima foto já carrega em segundo plano
    window.addEventListener('load', function () {
      slides.forEach(function (s) { var img = s.querySelector('img'); if (img.loading === 'lazy') img.loading = 'eager'; });
    });

    carrossel.querySelector('.anterior').addEventListener('click', function () { irPara(atualSlide - 1, true); });
    carrossel.querySelector('.proxima').addEventListener('click', function () { irPara(atualSlide + 1, true); });
    carrossel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { irPara(atualSlide - 1, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { irPara(atualSlide + 1, true); e.preventDefault(); }
    });
    if (automatico) {
      barra.addEventListener('animationend', function () { irPara(atualSlide + 1, false); });
      carrossel.addEventListener('mouseenter', function () { pausar('mouse', true); });
      carrossel.addEventListener('mouseleave', function () { pausar('mouse', false); });
      carrossel.addEventListener('focusin', function () { pausar('foco', true); });
      carrossel.addEventListener('focusout', function (e) { if (!carrossel.contains(e.relatedTarget)) pausar('foco', false); });
      document.addEventListener('visibilitychange', function () { pausar('aba', document.hidden); });
    }
    deslizar(carrossel, function (lado) { irPara(atualSlide + lado, true); });
    irPara(0, false);
  }

  /* ---------- Rolagem: topo, linha de leitura, paralaxe e cortina ---------- */
  var progresso = null;
  if (topo) {
    progresso = document.createElement('span');
    progresso.className = 'topo-progresso';
    progresso.setAttribute('aria-hidden', 'true');
    topo.appendChild(progresso);
  }
  var paralaxe = anima ? Array.prototype.slice.call(document.querySelectorAll('.slide img, .projeto-foto img, .seguinte-foto img')) : [];
  var rodape = document.querySelector('footer.contato');
  var cortina = false;
  var alturaRodape = 0;
  var ultimoY = window.scrollY;
  var agendado = false;

  var limitar = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var aoRolar = function () {
    agendado = false;
    var y = window.scrollY;
    var alturaTela = window.innerHeight;
    var total = document.documentElement.scrollHeight - alturaTela;

    if (topo) {
      if (progresso) progresso.style.setProperty('--progresso', total > 0 ? (y / total).toFixed(4) : 0);
      var delta = y - ultimoY;
      var focoNoTopo = topo.contains(document.activeElement);
      if (y < 120 || topo.classList.contains('aberto') || focoNoTopo) topo.classList.remove('escondido');
      else if (delta > 6) topo.classList.add('escondido');
      else if (delta < -6) topo.classList.remove('escondido');
    }
    ultimoY = y;

    paralaxe.forEach(function (img) {
      var caixa = img.parentElement.getBoundingClientRect();
      if (caixa.bottom < -100 || caixa.top > alturaTela + 100) return;
      var meio = caixa.top + caixa.height / 2;
      var p = limitar((meio - alturaTela / 2) / (alturaTela / 2 + caixa.height / 2), -1, 1);
      img.style.setProperty('--py', p.toFixed(3));
    });

    if (rodape) {
      var falta = total - y;
      var revela = cortina ? limitar(1 - falta / alturaRodape, 0, 1) : limitar(1 - (rodape.getBoundingClientRect().top - alturaTela * .4) / (alturaTela * .6), 0, 1);
      rodape.style.setProperty('--revela', revela.toFixed(3));
    }
  };
  var pedirQuadro = function () {
    if (!agendado) { agendado = true; window.requestAnimationFrame(aoRolar); }
  };

  // O rodapé fica parado por baixo da página e aparece quando ela termina; só quando ele cabe na tela
  var medirRodape = function () {
    if (!rodape || !anima) return;
    alturaRodape = rodape.offsetHeight;
    var cabe = window.innerWidth > 760 && alturaRodape <= window.innerHeight * 0.96;
    if (cabe !== cortina) {
      cortina = cabe;
      document.body.classList.toggle('cortina', cortina);
      alturaRodape = rodape.offsetHeight;
    }
    document.body.style.setProperty('--rodape-altura', cortina ? alturaRodape + 'px' : '0px');
    pedirQuadro();
  };
  medirRodape();
  if (rodape && anima && 'ResizeObserver' in window) new ResizeObserver(medirRodape).observe(rodape);
  window.addEventListener('resize', medirRodape);
  window.addEventListener('scroll', pedirQuadro, { passive: true });
  aoRolar();

  // Links para o contato levam ao fim da página (o rodapé em cortina não é alcançado pela âncora)
  var irAoContato = function (comFoco) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: suave });
    if (comFoco && rodape) {
      var titulo = rodape.querySelector('h2');
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
    }
  };
  document.querySelectorAll('a[href="#contato"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!cortina) return;
      e.preventDefault();
      history.replaceState(null, '', '#contato');
      irAoContato(true);
    });
  });
  if (location.hash === '#contato') window.addEventListener('load', function () { if (cortina) irAoContato(false); });
  if (rodape) {
    rodape.addEventListener('focusin', function () {
      if (cortina && document.documentElement.scrollHeight - window.innerHeight - window.scrollY > 2) irAoContato(false);
    });
  }

  // "Voltar ao topo": sobe até o início e põe o foco no conteúdo
  var conteudo = document.getElementById('conteudo');
  document.querySelectorAll('.ao-topo').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: suave });
      if (conteudo) {
        conteudo.tabIndex = -1;
        conteudo.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Visor de fotos dos projetos ---------- */
  var galeria = document.querySelector('.galeria');
  var visor = document.querySelector('.visor');
  if (galeria && visor && typeof visor.showModal === 'function') {
    var fotos = Array.prototype.slice.call(galeria.querySelectorAll('button'));
    var img = visor.querySelector('.visor-conteudo img');
    img.classList.add('visor-foto');
    var contador = visor.querySelector('.contador');
    var atual = 0;

    // Miniaturas para pular direto para uma foto
    var tira = document.createElement('div');
    tira.className = 'visor-miniaturas';
    tira.setAttribute('role', 'group');
    tira.setAttribute('aria-label', 'Escolher foto');
    var miniaturas = fotos.map(function (b, i) {
      var m = document.createElement('button');
      m.type = 'button';
      m.setAttribute('aria-label', 'Foto ' + (i + 1) + ': ' + b.querySelector('img').alt);
      var mini = document.createElement('img');
      mini.src = b.querySelector('img').getAttribute('src');
      mini.alt = '';
      mini.loading = 'lazy';
      m.appendChild(mini);
      m.addEventListener('click', function () { mostrar(i); });
      tira.appendChild(m);
      return m;
    });
    visor.insertBefore(tira, contador);
    visor.classList.add('com-miniaturas');

    var mostrar = function (i, lado) {
      var anterior = atual;
      atual = (i + fotos.length) % fotos.length;
      if (lado === undefined) lado = atual >= anterior ? 1 : -1;
      var origem = fotos[atual].querySelector('img');
      img.src = fotos[atual].dataset.grande;
      img.alt = origem.alt;
      contador.textContent = 'Foto ' + (atual + 1) + ' de ' + fotos.length;
      miniaturas.forEach(function (m, j) { m.setAttribute('aria-current', j === atual ? 'true' : 'false'); });
      miniaturas[atual].scrollIntoView({ block: 'nearest', inline: 'center' });
      if (anima && img.animate && visor.open) {
        img.animate(
          [{ opacity: 0, transform: 'translateX(' + 48 * lado + 'px)' }, { opacity: 1, transform: 'none' }],
          { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
      }
    };

    fotos.forEach(function (b, i) {
      b.addEventListener('click', function () {
        mostrar(i);
        visor.showModal();
        if (anima && img.animate) {
          img.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      });
    });
    visor.querySelector('.anterior').addEventListener('click', function () { mostrar(atual - 1, -1); });
    visor.querySelector('.proxima').addEventListener('click', function () { mostrar(atual + 1, 1); });
    visor.querySelector('.fechar').addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (e) { if (e.target === visor || e.target.classList.contains('visor-conteudo')) visor.close(); });
    visor.addEventListener('close', function () { fotos[atual].focus(); });
    document.addEventListener('keydown', function (e) {
      if (!visor.open) return;
      if (e.key === 'ArrowLeft') mostrar(atual - 1, -1);
      if (e.key === 'ArrowRight') mostrar(atual + 1, 1);
    });
    deslizar(img, function (lado) { mostrar(atual + lado, lado); });
  }

  /** Arrastar o dedo para o lado chama fn(1) para a próxima e fn(-1) para a anterior. */
  function deslizar(el, fn) {
    var x0 = null, y0 = 0;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) fn(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
})();

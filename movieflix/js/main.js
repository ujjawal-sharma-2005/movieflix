/* main.js (Netflix-style carousel + movie tabs)
   Fixed for new IDs: #nowShowing, #trending, #upcoming
*/

jQuery(document).ready(function($) {
  'use strict';

  // ---------- Datepicker init ----------
  if ($('#form-submit .date').length) {
    try {
      $('#form-submit .date').datepicker({});
    } catch (e) {
      console.warn('Datepicker init skipped or failed:', e);
    }
  }

  // ---------- UNIVERSAL SCROLLER ----------
  function initNetflixScroller(wrapperSelector, opts) {
    opts = opts || {};
    var wrap = $(wrapperSelector);
    if (!wrap.length) return;

    wrap.each(function() {
      var $wrap = $(this);
      var $scroller = $wrap.find('.nf-scroller');
      var $prev = $wrap.find('.nf-prev');
      var $next = $wrap.find('.nf-next');

      if (!$scroller.length) return;

      // Horizontal layout fallback
      $scroller.css({
        display: 'flex',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        '-webkit-overflow-scrolling': 'touch'
      });
      $scroller.find('.nf-item').css({
        flex: '0 0 auto'
      });

      // Scroll by 90% of wrapper width
      var scrollFactor = opts.scrollFactor || 0.9;
      function scrollByDir(dir) {
        var w = $scroller[0].clientWidth;
        var amount = Math.round(w * scrollFactor) * (dir === 'next' ? 1 : -1);
        $scroller[0].scrollBy({ left: amount, behavior: 'smooth' });
      }

      $prev.off('click.nf').on('click.nf', function(e) {
        e.preventDefault();
        scrollByDir('prev');
      });
      $next.off('click.nf').on('click.nf', function(e) {
        e.preventDefault();
        scrollByDir('next');
      });

      // Drag-to-scroll
      var isDown = false, startX, scrollLeft;
      $scroller.on('mousedown touchstart', function(e) {
        isDown = true;
        $scroller.addClass('dragging');
        startX = (e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX)) - $scroller.offset().left;
        scrollLeft = $scroller[0].scrollLeft;
        e.preventDefault && e.preventDefault();
      });

      $(document).on('mouseup touchend', function() {
        isDown = false;
        $scroller.removeClass('dragging');
      });

      $scroller.on('mousemove touchmove', function(e) {
        if (!isDown) return;
        var x = (e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX)) - $scroller.offset().left;
        var walk = (x - startX) * 1.2;
        $scroller[0].scrollLeft = scrollLeft - walk;
      });

      // Keyboard navigation
      $wrap.attr('tabindex', 0).on('keydown', function(e) {
        if (e.key === 'ArrowLeft') scrollByDir('prev');
        if (e.key === 'ArrowRight') scrollByDir('next');
      });

      // Optional autoplay
      if (opts.autoplay) {
        var ms = opts.autoplayDelay || 6000;
        var id = setInterval(function() {
          var el = $scroller[0];
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollByDir('next');
          }
        }, ms);

        $wrap.on('mouseenter', function() { clearInterval(id); });
        $wrap.on('mouseleave', function() {
          id = setInterval(function() { scrollByDir('next'); }, ms);
        });
      }
    });
  }

  // ---------- FIXED INITIALIZERS ----------
  // THESE MATCH YOUR HTML NOW ✔
  initNetflixScroller('#nowShowing', { autoplay: false, scrollFactor: 0.9 });
  initNetflixScroller('#trending',   { autoplay: false, scrollFactor: 0.9 });
  initNetflixScroller('#upcoming',   { autoplay: false, scrollFactor: 0.9 });

  // ---------- Tabs ----------
  function wireTabs() {
    $('.moviegroup > div, .nowshowinggroup > div, .tabgroup > div').hide();
    $('.moviegroup, .nowshowinggroup, .tabgroup').each(function() {
      $(this).children('div:first-of-type').show();
    });

    $('.tabs a').off('click.tab').on('click.tab', function(e){
      e.preventDefault();
      var $this = $(this);
      var parentTabs = $this.parents('.tabs');

      var movieGroup = parentTabs.data('moviegroup');
      var nowGroup = parentTabs.data('nowshowinggroup');
      var tabgroup = parentTabs.data('tabgroup');

      var target = $this.attr('href');
      parentTabs.find('a').removeClass('active');
      $this.addClass('active');

      if (movieGroup) {
        $('#' + movieGroup).children('div').hide();
        $(target).show();
      } else if (nowGroup) {
        $('#' + nowGroup).children('div').hide();
        $(target).show();
      } else if (tabgroup) {
        $('#' + tabgroup).children('div').hide();
        $(target).show();
      }
    });
  }
  wireTabs();

  // ---------- Pop trailer ----------
  $(".pop-button").on("click", function () {
    $(".pop").fadeIn(300);
  });
  $(".pop > span").on("click", function () {
    $(".pop").fadeOut(300);
  });

  // ---------- Sticky Header ----------
  $(window).on("scroll", function() {
    if($(window).scrollTop() > 100){
      $(".header").addClass("active");
    } else {
      $(".header").removeClass("active");
    }
  });

  // ---------- MixItUp (keep for filtering) ----------
  if ($('.projects-holder').length && typeof $.fn.mixitup === 'function') {
    $('.projects-holder').mixitup({
      effects: ['fade','grayscale'],
      easing: 'snap',
      transitionSpeed: 400
    });
  }

});

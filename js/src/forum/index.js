import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';

app.initializers.add('ralkage/cap-captcha', () => {
  let capWidgetScriptLoaded = false;

  function loadCapScript() {
    if (capWidgetScriptLoaded) return;
    capWidgetScriptLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@cap.js/widget';
    script.async = true;
    document.head.appendChild(script);
  }

  function getEndpoint() {
    return app.forum.attribute('ralkage-cap-captcha.api_endpoint') || '';
  }

  function setupSolveListener(modal) {
    setTimeout(() => {
      const widget = modal.$('cap-widget')[0];
      if (widget) {
        widget.addEventListener('solve', (e) => {
          widget.setAttribute('data-cap-token', e.detail.token);
        });
      }
    }, 500);
  }

  function hasCapToken(modal) {
    const widget = modal.$('cap-widget')[0];
    return widget && widget.getAttribute('data-cap-token');
  }

  function showCaptchaError(modal) {
    modal.alertAttrs = {
      type: 'error',
      content: app.translator.trans('ralkage-cap-captcha.forum.captcha_required'),
    };
    modal.loading = false;
    m.redraw();
  }

  // --- Sign Up ---

  extend('flarum/forum/components/SignUpModal', 'fields', function (items) {
    if (!app.forum.attribute('ralkage-cap-captcha.protect_registration')) return;

    loadCapScript();
    const endpoint = getEndpoint();
    if (!endpoint) return;

    items.add(
      'capCaptcha',
      <div className="Form-group CapCaptcha-container">
        <cap-widget data-cap-api-endpoint={endpoint}></cap-widget>
      </div>,
      -10
    );
  });

  extend('flarum/forum/components/SignUpModal', 'oncreate', function () {
    if (app.forum.attribute('ralkage-cap-captcha.protect_registration')) {
      setupSolveListener(this);
    }
  });

  override('flarum/forum/components/SignUpModal', 'onsubmit', function (original, e) {
    if (app.forum.attribute('ralkage-cap-captcha.protect_registration')) {
      if (!hasCapToken(this)) {
        e.preventDefault();
        showCaptchaError(this);
        return;
      }
    }
    return original(e);
  });

  extend('flarum/forum/components/SignUpModal', 'submitData', function (data) {
    if (!app.forum.attribute('ralkage-cap-captcha.protect_registration')) return data;

    const widget = this.$('cap-widget')[0];
    if (widget) {
      data.capToken = widget.getAttribute('data-cap-token') || '';
    }
    return data;
  });

  // --- Log In ---

  extend('flarum/forum/components/LogInModal', 'fields', function (items) {
    if (!app.forum.attribute('ralkage-cap-captcha.protect_login')) return;

    loadCapScript();
    const endpoint = getEndpoint();
    if (!endpoint) return;

    items.add(
      'capCaptcha',
      <div className="Form-group CapCaptcha-container">
        <cap-widget data-cap-api-endpoint={endpoint}></cap-widget>
      </div>,
      -10
    );
  });

  extend('flarum/forum/components/LogInModal', 'oncreate', function () {
    if (app.forum.attribute('ralkage-cap-captcha.protect_login')) {
      setupSolveListener(this);
    }
  });

  override('flarum/forum/components/LogInModal', 'onsubmit', function (original, e) {
    if (app.forum.attribute('ralkage-cap-captcha.protect_login')) {
      if (!hasCapToken(this)) {
        e.preventDefault();
        showCaptchaError(this);
        return;
      }

      const widget = this.$('cap-widget')[0];
      const capToken = widget.getAttribute('data-cap-token') || '';

      // Monkey-patch app.request to inject capToken into the login body
      const originalRequest = app.request.bind(app);
      app.request = function (options) {
        if (options.body) {
          options.body.capToken = capToken;
        }
        const result = originalRequest(options);
        // Restore after this call
        app.request = originalRequest;
        return result;
      };
    }

    return original(e);
  });
});

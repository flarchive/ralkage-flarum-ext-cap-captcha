import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import LogInModal from 'flarum/forum/components/LogInModal';

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

  extend(SignUpModal.prototype, 'fields', function (items) {
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

  extend(SignUpModal.prototype, 'oncreate', function () {
    if (app.forum.attribute('ralkage-cap-captcha.protect_registration')) {
      setupSolveListener(this);
    }
  });

  const originalSignUpSubmit = SignUpModal.prototype.onsubmit;
  SignUpModal.prototype.onsubmit = function (e) {
    if (app.forum.attribute('ralkage-cap-captcha.protect_registration')) {
      if (!hasCapToken(this)) {
        e.preventDefault();
        showCaptchaError(this);
        return;
      }
    }
    return originalSignUpSubmit.call(this, e);
  };

  extend(SignUpModal.prototype, 'submitData', function (data) {
    if (!app.forum.attribute('ralkage-cap-captcha.protect_registration')) return data;

    const widget = this.$('cap-widget')[0];
    if (widget) {
      data.capToken = widget.getAttribute('data-cap-token') || '';
    }
    return data;
  });

  // --- Log In ---

  extend(LogInModal.prototype, 'fields', function (items) {
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

  extend(LogInModal.prototype, 'oncreate', function () {
    if (app.forum.attribute('ralkage-cap-captcha.protect_login')) {
      setupSolveListener(this);
    }
  });

  const originalLoginSubmit = LogInModal.prototype.onsubmit;
  LogInModal.prototype.onsubmit = function (e) {
    if (app.forum.attribute('ralkage-cap-captcha.protect_login')) {
      if (!hasCapToken(this)) {
        e.preventDefault();
        showCaptchaError(this);
        return;
      }

      const widget = this.$('cap-widget')[0];
      const capToken = widget.getAttribute('data-cap-token') || '';

      const originalRequest = app.request.bind(app);
      app.request = (options) => {
        if (options.url && options.url.includes('/login') && options.body) {
          options.body.capToken = capToken;
        }
        return originalRequest(options);
      };

      const result = originalLoginSubmit.call(this, e);
      app.request = originalRequest;
      return result;
    }

    return originalLoginSubmit.call(this, e);
  };
});

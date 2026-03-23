import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(() => ({
      setting: 'ralkage-cap-captcha.api_endpoint',
      type: 'text',
      label: app.translator.trans('ralkage-cap-captcha.admin.settings.api_endpoint_label'),
      help: app.translator.trans('ralkage-cap-captcha.admin.settings.api_endpoint_help'),
      placeholder: 'https://cap.example.com/your-site-key/',
    }))
    .setting(() => ({
      setting: 'ralkage-cap-captcha.secret_key',
      type: 'text',
      label: app.translator.trans('ralkage-cap-captcha.admin.settings.secret_key_label'),
      help: app.translator.trans('ralkage-cap-captcha.admin.settings.secret_key_help'),
    }))
    .setting(() => ({
      setting: 'ralkage-cap-captcha.protect_registration',
      type: 'boolean',
      label: app.translator.trans('ralkage-cap-captcha.admin.settings.protect_registration_label'),
      help: app.translator.trans('ralkage-cap-captcha.admin.settings.protect_registration_help'),
    }))
    .setting(() => ({
      setting: 'ralkage-cap-captcha.protect_login',
      type: 'boolean',
      label: app.translator.trans('ralkage-cap-captcha.admin.settings.protect_login_label'),
      help: app.translator.trans('ralkage-cap-captcha.admin.settings.protect_login_help'),
    })),
];

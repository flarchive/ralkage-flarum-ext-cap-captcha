<?php

use Flarum\Extend;
use Flarum\User\Event\Saving;
use Ralkage\CapCaptcha\Listener\ValidateCapToken;
use Ralkage\CapCaptcha\Middleware\ValidateLoginCaptcha;

return [
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Event())
        ->listen(Saving::class, ValidateCapToken::class),

    (new Extend\Middleware('forum'))
        ->add(ValidateLoginCaptcha::class),

    (new Extend\Settings())
        ->default('ralkage-cap-captcha.protect_registration', true)
        ->default('ralkage-cap-captcha.protect_login', false)
        ->serializeToForum('ralkage-cap-captcha.api_endpoint', 'ralkage-cap-captcha.api_endpoint')
        ->serializeToForum('ralkage-cap-captcha.protect_registration', 'ralkage-cap-captcha.protect_registration', 'boolval')
        ->serializeToForum('ralkage-cap-captcha.protect_login', 'ralkage-cap-captcha.protect_login', 'boolval'),
];

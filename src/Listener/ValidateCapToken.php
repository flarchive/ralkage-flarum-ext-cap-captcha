<?php

namespace Ralkage\CapCaptcha\Listener;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Flarum\User\Event\Saving;
use Ralkage\CapCaptcha\CapValidator;

class ValidateCapToken
{
    protected $validator;
    protected $translator;

    public function __construct(CapValidator $validator, Translator $translator)
    {
        $this->validator = $validator;
        $this->translator = $translator;
    }

    public function handle(Saving $event): void
    {
        // Only validate on new user registration
        if ($event->user->exists) {
            return;
        }

        if (! $this->validator->shouldProtect('registration')) {
            return;
        }

        // Admin creating users shouldn't need CAPTCHA
        if ($event->actor->isAdmin()) {
            return;
        }

        $token = $event->data['attributes']['capToken'] ?? '';

        if (! $this->validator->verify($token)) {
            throw new ValidationException([
                'capToken' => $this->translator->trans('ralkage-cap-captcha.api.invalid_captcha'),
            ]);
        }
    }
}
